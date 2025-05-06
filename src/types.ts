import { TelemetryOptions } from "./utils/telemetry";

/**
 * Client configuration options
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
   * Custom headers to include in all requests
   */
  headers?: Record<string, string>;

  /**
   * Logging configuration
   */
  logging?: LoggingOptions;

  /**
   * Telemetry configuration for performance tracking
   */
  telemetry?: TelemetryOptions;
}

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
 * Supported log levels
 */
export type LogLevel = "debug" | "info" | "warn" | "error";

/**
 * Log handler function type
 */
export type LogHandler = (level: LogLevel, message: string, data?: any) => void;

/**
 * Authentication method interface
 */
export interface AuthMethod {
  /**
   * Get headers for authentication
   */
  getHeaders(): Record<string, string>;

  /**
   * Set verification status
   */
  setVerified?(status: boolean): void;

  /**
   * Get verification status
   */
  isVerified?(): boolean;
}

/**
 * Single usage record parameters
 */
export interface UsageRecord {
  /**
   * External ID of the customer
   */
  customerExternalId: string;

  /**
   * ID of the agent
   */
  agentId: string;

  /**
   * Name of the signal being recorded
   */
  signalName: string;

  /**
   * Quantity of usage to record
   */
  quantity: number;

  /**
   * Date when usage occurred (defaults to current time)
   */
  usageDate?: string | Date;

  /**
   * Additional metadata for the usage record
   */
  metadata?: Record<string, any>;
}

/**
 * Usage recording parameters - supports both single record and batch format
 */
export type TrackEventParams = UsageRecord | { records: UsageRecord[] };

/**
 * Response for a single usage record
 */
export interface SingleEventResponse {
  /**
   * ID of the recorded usage
   */
  id: string;

  /**
   * Whether the recording was successful
   */
  success: boolean;

  /**
   * Additional response data
   */
  [key: string]: any;
}

/**
 * Response for batch usage recording
 */
export interface BatchEventResponse {
  /**
   * Whether the batch operation was successful
   */
  success: boolean;

  /**
   * Total number of records processed
   */
  totalRecords: number;

  /**
   * Number of records successfully processed
   */
  successCount: number;

  /**
   * Number of records that failed to process
   */
  failureCount: number;

  /**
   * Results for each record
   */
  results: Array<{
    /**
     * Whether this record was successfully processed
     */
    success: boolean;

    /**
     * The data for the record, if successful
     */
    responseData?: SingleEventResponse;

    /**
     * Error message if the record failed
     */
    error?: string;

    /**
     * The original data that was submitted
     */
    originalData?: Record<string, any>;
  }>;
}

/**
 * Response from usage recording - can be single or batch
 */
export type TrackEventResponse = SingleEventResponse | BatchEventResponse;

/**
 * Customer object
 */
export interface Customer {
  /**
   * Unique ID of the customer
   */
  id: string;

  /**
   * Name of the customer
   */
  name: string;

  /**
   * Email address of the customer
   */
  email?: string;

  /**
   * External ID for referencing the customer in your system
   */
  externalId?: string;

  /**
   * When the customer was created
   */
  createdAt: string;

  /**
   * When the customer was last updated
   */
  updatedAt: string;

  /**
   * Additional customer metadata
   */
  [key: string]: any;
}

/**
 * Parameters for creating a customer
 */
export interface CustomerCreateParams {
  /**
   * Name of the customer
   */
  name: string;

  /**
   * Email address of the customer
   */
  email?: string;

  /**
   * External ID for referencing the customer in your system
   */
  externalId?: string;

  /**
   * Additional customer metadata
   */
  metadata?: Record<string, any>;
}

/**
 * Parameters for updating a customer
 */
export interface CustomerUpdateParams {
  /**
   * Name of the customer
   */
  name?: string;

  /**
   * Email address of the customer
   */
  email?: string;

  /**
   * External ID for referencing the customer in your system
   */
  externalId?: string;

  /**
   * Additional customer metadata
   */
  metadata?: Record<string, any> | null;
}

/**
 * Parameters for listing customers
 */
export interface CustomerListParams {
  /**
   * Page number for pagination
   */
  page?: number;

  /**
   * Number of items per page
   */
  limit?: number;

  /**
   * Filter by external ID
   */
  externalId?: string;

  /**
   * Filter by email
   */
  email?: string;

  /**
   * Search query string
   */
  query?: string;
}

/**
 * Response for customer listing
 */
export interface CustomerListResponse {
  /**
   * Array of customers
   */
  data: Customer[];

  /**
   * Total number of results
   */
  totalResults: number;

  /**
   * Current page number
   */
  page: number;

  /**
   * Number of items per page
   */
  limit: number;

  /**
   * Whether there's a next page
   */
  hasMore: boolean;
}
