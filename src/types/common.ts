/**
 * Configuration options for the SDK
 */
export interface ClientOptions {
  /**
   * Base URL for API requests
   */
  baseURL?: string;

  /**
   * Request timeout in milliseconds
   */
  timeout?: number;

  /**
   * Number of retry attempts for failed requests
   */
  retries?: number;

  /**
   * Delay between retry attempts in milliseconds
   */
  retryDelay?: number;

  /**
   * Logging configuration
   */
  logging?: LoggingOptions;

  /**
   * Additional headers to include with every request
   */
  headers?: Record<string, string>;
}

/**
 * Logging level options
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Logging handler function type
 */
export type LogHandler = (level: LogLevel, message: string, data?: any) => void;

/**
 * Logging configuration options
 */
export interface LoggingOptions {
  /**
   * Whether logging is enabled
   */
  enabled?: boolean;

  /**
   * Minimum log level to output
   */
  level?: LogLevel;

  /**
   * Custom log handler function
   */
  handler?: LogHandler;
}

/**
 * Authentication method interface
 */
export interface AuthMethod {
  /**
   * Get headers for authentication
   */
  getHeaders(): Record<string, string>;

  /**
   * Get authentication details for request
   */
  getAuthDetails(): any;

  /**
   * Verify if authentication is valid
   */
  verify(): Promise<boolean>;
}

/**
 * API response with pagination
 */
export interface PaginatedResponse<T> {
  results: T[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
