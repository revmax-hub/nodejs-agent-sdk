import { ClientOptions, TrackEventParams, TrackEventResponse } from './types';
import { ApiClient } from './utils/api';
import { Logger } from './utils/logger';
import { createAuth } from './auth';
import { Customers, Usage } from './resources';
import { RevMaxAuthenticationError, RevMaxInitializationError } from './utils/errors';
import { AuthMethod } from './types';

/**
 * Interface for organization information
 */
export interface OrganizationInfo {
  id: string;
  name: string;
  [key: string]: any; // Allow for additional properties
}

/**
 * Main RevMax client class
 */
export class RevMaxClient {
  /**
   * API client for making requests
   */
  private readonly apiClient: ApiClient;

  /**
   * Logger instance
   */
  private readonly logger: Logger;

  /**
   * Authentication method
   */
  private readonly auth: AuthMethod;

  /**
   * Customer resource
   */
  public readonly customers: Customers;

  /**
   * Usage resource
   */
  public readonly usage: Usage;

  /**
   * Organization information from API key verification
   */
  private _orgInfo: OrganizationInfo | null = null;

  /**
   * Creates a new RevMax client instance without connecting
   * You must call connect() before using any API methods
   *
   * @param apiKey - API key for authentication
   * @param options - Client options
   */
  constructor(apiKey: string, options: ClientOptions = {}) {
    this.logger = new Logger(options.logging);
    this.logger.info('Creating RevMaxClient...');

    // Create authentication method
    this.auth = createAuth(apiKey);

    // Create API client
    this.apiClient = new ApiClient(this.auth, options, this.logger);

    // Initialize resources (they won't work until connect is called)
    this.customers = new Customers(this.apiClient, this.logger);
    this.usage = new Usage(this.apiClient, this.logger);
  }

  /**
   * Connect to the RevMax API and verify credentials
   * This must be called once before using any API methods
   *
   * @returns Promise resolving to the client instance for chaining
   * @throws RevMaxAuthenticationError if API key is invalid
   * @throws RevMaxInitializationError for other initialization errors
   */
  public async connect(): Promise<RevMaxClient> {
    try {
      this.logger.info('Connecting to RevMax API and verifying API key...');
      const result = await this.apiClient.get('/verify');

      if (!result || !result.organization || !result.organization.id) {
        throw new RevMaxInitializationError('Unexpected response format from API key verification');
      }

      // Set organization info
      this._orgInfo = result.organization as OrganizationInfo;

      // Set auth as verified if the method exists
      if (this.auth.setVerified) {
        this.auth.setVerified(true);
      }

      this.logger.info('Successfully connected to RevMax API', {
        organizationId: this._orgInfo.id,
        organizationName: this._orgInfo.name,
      });

      return this;
    } catch (error: any) {
      // Handle API key verification errors
      const statusCode = error.statusCode || (error.response && error.response.status);
      const errorMessage = error.message || 'Unknown error';
      const requestId = error.requestId || 'unknown';

      this.logger.error(`Connection failed: ${errorMessage}`, {
        statusCode,
        requestId,
        error,
      });

      if (statusCode === 401) {
        throw new RevMaxAuthenticationError(
          'Invalid API key. Please check your API key and try again.',
          { requestId }
        );
      }

      throw new RevMaxInitializationError(`Connection failed: ${errorMessage}`, {
        requestId,
      });
    }
  }

  /**
   * Get organization information
   * @returns Organization information from API key verification
   * @throws Error if organization info is not available
   */
  public getOrganization(): OrganizationInfo {
    if (!this._orgInfo) {
      throw new Error(
        'Organization information is not available. Make sure the API key is valid and you have called connect()'
      );
    }

    return { ...this._orgInfo }; // Return a copy to prevent mutation
  }

  /**
   * Track event for a customer (shorthand method)
   * @param params - Event tracking parameters
   * @returns Tracked event data
   */
  async trackEvent(params: TrackEventParams): Promise<TrackEventResponse> {
    return this.usage.trackEvent(params);
  }

  /**
   * Re-verify the API key
   * Useful if you suspect the API key status might have changed
   *
   * @returns Updated organization information
   */
  async verifyApiKey(): Promise<OrganizationInfo> {
    try {
      this.logger.info('Re-verifying API key');
      const result = await this.apiClient.get('/verify');

      if (!result || !result.organization || !result.organization.id) {
        throw new RevMaxInitializationError('Unexpected response format from API key verification');
      }

      // Update stored organization info with proper type checking
      this._orgInfo = result.organization as OrganizationInfo;

      this.logger.info('API key verification successful', {
        organization: result.organization,
      });

      return { ...this._orgInfo };
    } catch (error: any) {
      // Handle API key verification errors
      const statusCode = error.statusCode || (error.response && error.response.status);
      const errorMessage = error.message || 'Unknown error';
      const requestId = error.requestId || 'unknown';

      this.logger.error(`API key verification failed: ${errorMessage}`, {
        statusCode,
        requestId,
        error,
      });

      if (statusCode === 401) {
        throw new RevMaxAuthenticationError(
          'Invalid API key. Please check your API key and try again.',
          { requestId }
        );
      }

      throw error;
    }
  }

  /**
   * Get current telemetry statistics
   * @returns Telemetry statistics
   */
  public getTelemetryStats() {
    return this.apiClient.getTelemetryStats();
  }

  /**
   * Reset telemetry statistics
   */
  public resetTelemetryStats() {
    return this.apiClient.resetTelemetryStats();
  }
}
