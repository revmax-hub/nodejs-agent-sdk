/**
 * Base error class for RevMax SDK errors
 */
export class RevMaxError extends Error {
  /**
   * Additional error metadata
   */
  public readonly metadata: Record<string, any>;

  /**
   * Request ID associated with the error
   */
  public readonly requestId?: string;

  constructor(message: string, metadata: Record<string, any> = {}) {
    super(message);
    this.name = 'RevMaxError';
    this.metadata = metadata;
    this.requestId = metadata.requestId;

    // Fix for correct instanceof checks in TypeScript
    Object.setPrototypeOf(this, RevMaxError.prototype);
  }
}

/**
 * Error thrown when there's an API-related issue
 */
export class RevMaxApiError extends RevMaxError {
  /**
   * HTTP status code if available
   */
  public readonly statusCode?: number;

  /**
   * API error code if available
   */
  public readonly errorCode?: string;

  constructor(
    message: string = 'API request failed',
    statusCode?: number,
    errorCode?: string,
    metadata: Record<string, any> = {}
  ) {
    super(message, metadata);
    this.name = 'RevMaxApiError';
    this.statusCode = statusCode;
    this.errorCode = errorCode;

    // Fix for correct instanceof checks in TypeScript
    Object.setPrototypeOf(this, RevMaxApiError.prototype);
  }
}

/**
 * Error thrown when authentication fails
 */
export class RevMaxAuthenticationError extends RevMaxError {
  constructor(message: string = 'Authentication failed', metadata: Record<string, any> = {}) {
    super(message, metadata);
    this.name = 'RevMaxAuthenticationError';

    // Fix for correct instanceof checks in TypeScript
    Object.setPrototypeOf(this, RevMaxAuthenticationError.prototype);
  }
}

/**
 * Error thrown when rate limits are exceeded
 */
export class RevMaxRateLimitError extends RevMaxApiError {
  /**
   * Time to wait before retrying in seconds
   */
  public readonly retryAfter?: number;

  constructor(
    message: string = 'Rate limit exceeded',
    retryAfter?: number,
    metadata: Record<string, any> = {}
  ) {
    super(message, 429, 'rate_limit_exceeded', metadata);
    this.name = 'RevMaxRateLimitError';
    this.retryAfter = retryAfter;

    // Fix for correct instanceof checks in TypeScript
    Object.setPrototypeOf(this, RevMaxRateLimitError.prototype);
  }
}

/**
 * Error thrown when a validation error occurs
 */
export class RevMaxValidationError extends RevMaxError {
  /**
   * Validation errors by field
   */
  public readonly validationErrors: Record<string, string[]>;

  constructor(
    message: string = 'Validation failed',
    validationErrors: Record<string, string[]> = {},
    metadata: Record<string, any> = {}
  ) {
    super(message, metadata);
    this.name = 'RevMaxValidationError';
    this.validationErrors = validationErrors;

    // Fix for correct instanceof checks in TypeScript
    Object.setPrototypeOf(this, RevMaxValidationError.prototype);
  }
}

/**
 * Error thrown when a resource is not found
 */
export class RevMaxNotFoundError extends RevMaxApiError {
  constructor(message: string = 'Resource not found', statusCode: number = 404) {
    super(message, statusCode, 'not_found');
    this.name = 'RevMaxNotFoundError';

    // Fix for correct instanceof checks in TypeScript
    Object.setPrototypeOf(this, RevMaxNotFoundError.prototype);
  }
}

/**
 * Error thrown when initialization fails
 */
export class RevMaxInitializationError extends RevMaxError {
  constructor(
    message: string = 'Failed to initialize the SDK',
    metadata: Record<string, any> = {}
  ) {
    super(message, metadata);
    this.name = 'RevMaxInitializationError';

    // Fix for correct instanceof checks in TypeScript
    Object.setPrototypeOf(this, RevMaxInitializationError.prototype);
  }
}

/**
 * Parse API error response into appropriate error object
 * @param error - Error from API request
 * @returns Appropriate RevMaxError instance
 */
export function parseApiError(error: any): RevMaxError {
  // Extract basic information
  const message = error.message || 'Unknown error';
  const statusCode = error.response?.status;
  const responseData = error.response?.data || {};
  const requestId = error.config?.headers?.['X-Request-ID'] || responseData.requestId || 'unknown';

  // Build metadata
  const metadata = {
    requestId,
    url: error.config?.url,
    method: error.config?.method,
    responseData,
  };

  // Handle specific error types
  if (statusCode === 401) {
    return new RevMaxAuthenticationError(responseData.message || 'Authentication failed', metadata);
  }

  if (statusCode === 429) {
    const retryAfter = parseInt(error.response?.headers?.['retry-after'] || '0', 10);
    return new RevMaxRateLimitError(
      responseData.message || 'Rate limit exceeded',
      retryAfter,
      metadata
    );
  }

  if (statusCode === 422 && responseData.errors) {
    return new RevMaxValidationError(
      responseData.message || 'Validation failed',
      responseData.errors,
      metadata
    );
  }

  // Default to API error for any API response
  if (statusCode) {
    return new RevMaxApiError(
      responseData.message || message,
      statusCode,
      responseData.code,
      metadata
    );
  }

  // Default generic error for network/timeout issues
  return new RevMaxError(message, metadata);
}
