import { v4 as uuidv4 } from 'uuid';
import { Logger } from './logger';

/**
 * Telemetry options for SDK metrics
 */
export interface TelemetryOptions {
  /**
   * Whether telemetry is enabled
   */
  enabled?: boolean;

  /**
   * Custom handler for telemetry events
   */
  handler?: TelemetryHandler;

  /**
   * Sample rate for telemetry (0-1)
   * 1 = track every request, 0.1 = track 10% of requests
   */
  sampleRate?: number;
}

/**
 * Metrics data collected for each request
 */
export interface RequestMetrics {
  /**
   * Unique ID for the request
   */
  requestId: string;

  /**
   * Request method (GET, POST, etc)
   */
  method: string;

  /**
   * Normalized request path
   */
  path: string;

  /**
   * Timestamp when request started
   */
  startTime: number;

  /**
   * Timestamp when request ended
   */
  endTime?: number;

  /**
   * Duration of the request in milliseconds
   */
  duration?: number;

  /**
   * HTTP status code
   */
  statusCode?: number;

  /**
   * Whether the request was successful
   */
  success?: boolean;

  /**
   * Error message if request failed
   */
  errorMessage?: string;

  /**
   * Error type if request failed
   */
  errorType?: string;

  /**
   * Number of retry attempts
   */
  retryCount?: number;
}

/**
 * Telemetry handler function type
 */
export type TelemetryHandler = (metrics: RequestMetrics) => void;

/**
 * Default telemetry handler just logs to the console
 */
export const defaultTelemetryHandler: TelemetryHandler = (metrics) => {
  console.log(
    `[TELEMETRY] ${metrics.method} ${metrics.path} - ${metrics.duration}ms (${metrics.success ? 'SUCCESS' : 'FAILED'})`,
  );
};

/**
 * SDK Telemetry class for tracking performance metrics
 */
export class Telemetry {
  private readonly enabled: boolean;
  private readonly sampleRate: number;
  private readonly handler: TelemetryHandler;
  private readonly logger: Logger;
  private activeRequests: Map<string, RequestMetrics> = new Map();

  // Metrics aggregation
  private requestCount: number = 0;
  private successCount: number = 0;
  private errorCount: number = 0;
  private totalDuration: number = 0;

  // Error tracking (errorType -> count)
  private errorTypes: Map<string, number> = new Map();

  /**
   * Create a new telemetry instance
   * @param options - Telemetry configuration options
   * @param logger - Logger instance
   */
  constructor(options?: TelemetryOptions, logger?: Logger) {
    this.enabled = options?.enabled ?? false;
    this.sampleRate = options?.sampleRate ?? 1;
    this.handler = options?.handler ?? defaultTelemetryHandler;
    this.logger = logger || new Logger();
  }

  /**
   * Check if telemetry should be collected for this request
   * @returns Whether to collect telemetry
   */
  private shouldCollect(): boolean {
    if (!this.enabled) return false;
    return Math.random() <= this.sampleRate;
  }

  /**
   * Generate a request ID
   * @returns Unique request ID
   */
  public generateRequestId(): string {
    return uuidv4();
  }

  /**
   * Normalize API path to remove specific IDs
   * @param path - Raw API path
   * @returns Normalized path
   */
  public normalizePath(path: string): string {
    if (!path) return '';

    // Ensure path starts with /
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;

    // Replace UUID patterns with :id
    return (
      normalizedPath
        // Replace UUIDs
        .replace(/\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '/:id')
        // Replace numeric IDs
        .replace(/\/\d+(?=\/|$)/g, '/:id')
    );
  }

  /**
   * Start tracking a request
   * @param method - HTTP method
   * @param path - Request path
   * @param requestId - Optional request ID (generated if not provided)
   * @returns Request ID and whether telemetry is being collected
   */
  public startRequest(method: string, path: string, requestId?: string): { requestId: string; isTracked: boolean } {
    const shouldTrack = this.shouldCollect();
    const id = requestId || this.generateRequestId();

    if (shouldTrack) {
      const normalizedPath = this.normalizePath(path);

      const metrics: RequestMetrics = {
        requestId: id,
        method: method.toUpperCase(),
        path: normalizedPath,
        startTime: Date.now(),
      };

      this.activeRequests.set(id, metrics);
      this.logger.debug(`Started tracking request ${id}: ${method} ${normalizedPath}`);
    }

    return { requestId: id, isTracked: shouldTrack };
  }

  /**
   * End tracking a request
   * @param requestId - Request ID
   * @param statusCode - HTTP status code
   * @param error - Error object if request failed
   * @param retryCount - Number of retry attempts
   */
  public endRequest(requestId: string, statusCode?: number, error?: Error, retryCount?: number): void {
    const metrics = this.activeRequests.get(requestId);
    if (!metrics) return;

    // Calculate metrics
    metrics.endTime = Date.now();
    metrics.duration = metrics.endTime - metrics.startTime;
    metrics.statusCode = statusCode;
    metrics.success = !error && (statusCode ? statusCode < 400 : true);
    metrics.retryCount = retryCount || 0;

    if (error) {
      metrics.errorMessage = error.message;
      metrics.errorType = error.name || 'UnknownError';

      // Track error types
      const currentCount = this.errorTypes.get(metrics.errorType) || 0;
      this.errorTypes.set(metrics.errorType, currentCount + 1);
      this.errorCount++;
    } else {
      this.successCount++;
    }

    this.requestCount++;
    this.totalDuration += metrics.duration;

    // Call the telemetry handler
    this.handler(metrics);

    // Remove from active requests
    this.activeRequests.delete(requestId);

    this.logger.debug(`Completed tracking request ${requestId}: ${metrics.duration}ms, success: ${metrics.success}`);
  }

  /**
   * Get current telemetry statistics
   * @returns Aggregated metrics
   */
  public getStats(): {
    requestCount: number;
    successCount: number;
    errorCount: number;
    successRate: number;
    averageDuration: number;
    errorBreakdown: Record<string, number>;
  } {
    const successRate = this.requestCount > 0 ? this.successCount / this.requestCount : 1;
    const averageDuration = this.requestCount > 0 ? this.totalDuration / this.requestCount : 0;

    // Convert error types map to object
    const errorBreakdown: Record<string, number> = {};
    this.errorTypes.forEach((count, type) => {
      errorBreakdown[type] = count;
    });

    return {
      requestCount: this.requestCount,
      successCount: this.successCount,
      errorCount: this.errorCount,
      successRate,
      averageDuration,
      errorBreakdown,
    };
  }

  /**
   * Reset all metrics
   */
  public resetStats(): void {
    this.requestCount = 0;
    this.successCount = 0;
    this.errorCount = 0;
    this.totalDuration = 0;
    this.errorTypes.clear();
    this.logger.debug('Telemetry stats reset');
  }
}
