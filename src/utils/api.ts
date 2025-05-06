import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { AuthMethod, ClientOptions } from '../types';
import { parseApiError } from './errors';
import { Logger } from './logger';
import { Telemetry } from './telemetry';

// Add a custom request config that includes metadata
interface CustomRequestConfig extends AxiosRequestConfig {
  metadata?: {
    requestId?: string;
    telemetryTracked?: boolean;
    retryCount?: number;
    [key: string]: any;
  };
}

/**
 * Default API client options
 */
const DEFAULT_OPTIONS: Partial<ClientOptions> = {
  baseURL: 'https://api.revmax.com/v1/sdk',
  timeout: 30000,
  retries: 0,
  retryDelay: 300,
};

/**
 * Calculate exponential backoff time
 * @param retryCount - Number of retries attempted so far
 * @param initialDelay - Initial delay in milliseconds
 * @returns Delay in milliseconds
 */
function calculateBackoff(retryCount: number, initialDelay: number): number {
  return initialDelay * Math.pow(2, retryCount);
}

/**
 * Sleep for a specified time
 * @param ms - Time in milliseconds
 * @returns Promise that resolves after the delay
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Check if a request should be retried
 * @param error - Error from request
 * @returns Whether the request should be retried
 */
function isRetryable(error: any): boolean {
  // Don't retry if it's a client error (except for rate limiting)
  if (error.response) {
    const status = error.response.status;
    // Retry on rate limiting or server errors
    return status === 429 || (status >= 500 && status < 600);
  }

  // Retry on network errors
  return !error.response;
}

/**
 * Normalize a URL path
 * @param url - URL path
 * @returns Normalized path
 */
function normalizePath(url: string): string {
  // Remove leading slash if present
  const path = url.startsWith('/') ? url.substring(1) : url;

  // Remove query parameters
  const pathWithoutQuery = path.split('?')[0];

  // Add leading slash
  return `/${pathWithoutQuery}`;
}

/**
 * API client for making HTTP requests with retry logic
 */
export class ApiClient {
  private readonly axios: AxiosInstance;
  private readonly retries: number;
  private readonly retryDelay: number;
  private readonly logger: Logger;
  private readonly telemetry: Telemetry;

  /**
   * Create a new API client
   * @param auth - Authentication method
   * @param options - Client options
   * @param logger - Logger instance
   */
  constructor(auth: AuthMethod, options: Partial<ClientOptions> = {}, logger: Logger) {
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
    this.retries = mergedOptions.retries || 0;
    this.retryDelay = mergedOptions.retryDelay || 0;
    this.logger = logger;
    this.telemetry = new Telemetry(mergedOptions.telemetry, logger);

    // Create axios instance with auth headers from auth method
    this.axios = axios.create({
      baseURL: mergedOptions.baseURL,
      timeout: mergedOptions.timeout,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'User-Agent': 'revmax-node/1.0.0',
        ...mergedOptions.headers,
        ...auth.getHeaders(), // This now only includes the 'revx-api-key' header
      },
    });

    // Log requests
    this.axios.interceptors.request.use((config) => {
      // Generate request ID and add to headers
      const requestId = this.telemetry.generateRequestId();
      config.headers = config.headers || {};
      config.headers['X-Request-ID'] = requestId;

      // Store tracking info on config for later use
      const customConfig = config as CustomRequestConfig;
      customConfig.metadata = customConfig.metadata || {};
      customConfig.metadata.requestId = requestId;

      // Start telemetry tracking
      if (config.method && config.url) {
        const { isTracked } = this.telemetry.startRequest(config.method, config.url, requestId);
        customConfig.metadata.telemetryTracked = isTracked;
      }

      this.logger.debug(`Request: ${config.method?.toUpperCase()} ${config.url}`, { requestId });
      return config;
    });

    // Log responses
    this.axios.interceptors.response.use(
      (response) => {
        const customConfig = response.config as CustomRequestConfig;
        const requestId = response.config.headers?.['X-Request-ID'] as string;
        const isTracked = customConfig.metadata?.telemetryTracked;

        // End telemetry tracking for successful requests
        if (isTracked && requestId) {
          this.telemetry.endRequest(requestId, response.status);
        }

        this.logger.debug(`Response: ${response.status} ${response.config.url}`, { requestId });
        return response;
      },
      (error) => {
        // Extract request ID from the failed request
        const customConfig = error.config as CustomRequestConfig;
        const requestId = error.config?.headers?.['X-Request-ID'] as string;
        const isTracked = customConfig?.metadata?.telemetryTracked;
        const retryCount = customConfig?.metadata?.retryCount || 0;

        // End telemetry tracking for failed requests
        if (isTracked && requestId) {
          this.telemetry.endRequest(requestId, error.response?.status, error, retryCount);
        }

        this.logger.error(`Error: ${error.message}`, {
          requestId,
          status: error.response?.status,
          data: error.response?.data,
        });

        return Promise.reject(error);
      },
    );
  }

  /**
   * Make a request with retry logic
   * @param config - Request configuration
   * @returns API response
   */
  async request<T = any>(config: CustomRequestConfig): Promise<AxiosResponse<T>> {
    let lastError;

    // Ensure metadata object exists
    config.metadata = config.metadata || {};

    for (let retry = 0; retry <= this.retries; retry++) {
      try {
        // Track retry count for telemetry
        config.metadata.retryCount = retry;

        if (retry > 0) {
          const requestId = config.headers?.['X-Request-ID'] as string;
          this.logger.info(`Retry attempt ${retry}/${this.retries}`, { requestId });
        }

        return await this.axios.request<T>(config);
      } catch (error: any) {
        lastError = error;

        // Check if we should retry
        if (retry < this.retries && isRetryable(error)) {
          // Calculate backoff time
          const backoff = calculateBackoff(retry, this.retryDelay);

          // Use retry-after header if available
          if (error.response?.headers?.['retry-after']) {
            const retryAfter = parseInt(error.response.headers['retry-after'], 10) * 1000;
            await sleep(retryAfter);
          } else {
            await sleep(backoff);
          }

          continue;
        }

        break;
      }
    }

    // If we get here, all retries failed or we didn't retry
    throw parseApiError(lastError);
  }

  /**
   * Make a GET request
   * @param url - Endpoint URL
   * @param params - Query parameters
   * @param config - Additional request configuration
   * @returns API response
   */
  async get<T = any>(url: string, params?: any, config?: CustomRequestConfig): Promise<T> {
    url = this.ensureURLPrefix(url);
    const response = await this.request<T>({
      method: 'GET',
      url,
      params,
      ...config,
    });

    return response.data;
  }

  /**
   * Make a POST request
   * @param url - Endpoint URL
   * @param data - Request body
   * @param config - Additional request configuration
   * @returns API response
   */
  async post<T = any>(url: string, data?: any, config?: CustomRequestConfig): Promise<T> {
    url = this.ensureURLPrefix(url);
    const response = await this.request<T>({
      method: 'POST',
      url,
      data,
      ...config,
    });

    return response.data;
  }

  /**
   * Make a PUT request
   * @param url - Endpoint URL
   * @param data - Request body
   * @param config - Additional request configuration
   * @returns API response
   */
  async put<T = any>(url: string, data?: any, config?: CustomRequestConfig): Promise<T> {
    url = this.ensureURLPrefix(url);
    const response = await this.request<T>({
      method: 'PUT',
      url,
      data,
      ...config,
    });

    return response.data;
  }

  /**
   * Make a PATCH request
   * @param url - Endpoint URL
   * @param data - Request body
   * @param config - Additional request configuration
   * @returns API response
   */
  async patch<T = any>(url: string, data?: any, config?: CustomRequestConfig): Promise<T> {
    url = this.ensureURLPrefix(url);
    const response = await this.request<T>({
      method: 'PATCH',
      url,
      data,
      ...config,
    });

    return response.data;
  }

  /**
   * Make a DELETE request
   * @param url - Endpoint URL
   * @param config - Additional request configuration
   * @returns API response
   */
  async delete<T = any>(url: string, config?: CustomRequestConfig): Promise<T> {
    url = this.ensureURLPrefix(url);
    const response = await this.request<T>({
      method: 'DELETE',
      url,
      ...config,
    });

    return response.data;
  }

  /**
   * Ensure URL has proper prefix (leading slash)
   * @param url - URL to normalize
   * @returns Normalized URL
   */
  private ensureURLPrefix(url: string): string {
    return url.startsWith('/') ? url : `/${url}`;
  }

  /**
   * Get telemetry statistics
   * @returns Current telemetry stats
   */
  public getTelemetryStats() {
    return this.telemetry.getStats();
  }

  /**
   * Reset telemetry statistics
   */
  public resetTelemetryStats() {
    this.telemetry.resetStats();
  }
}
