import {
  RevMaxError,
  RevMaxApiError,
  RevMaxAuthenticationError,
  RevMaxRateLimitError,
  RevMaxValidationError,
  RevMaxNotFoundError,
  RevMaxInitializationError,
} from '../src/utils/errors';

describe('Error Classes', () => {
  describe('RevMaxError', () => {
    it('should create a base error with name and message', () => {
      const error = new RevMaxError('Test error message');
      expect(error.name).toBe('RevMaxError');
      expect(error.message).toBe('Test error message');
      expect(error instanceof Error).toBe(true);
    });

    it('should include metadata', () => {
      const error = new RevMaxError('Test error message', { foo: 'bar' });
      expect(error.metadata).toEqual({ foo: 'bar' });
    });
  });

  describe('RevMaxApiError', () => {
    it('should create an API error with default message', () => {
      const error = new RevMaxApiError();
      expect(error.name).toBe('RevMaxApiError');
      expect(error.message).toBe('API request failed');
      expect(error instanceof RevMaxError).toBe(true);
    });

    it('should create an API error with status code and error code', () => {
      const error = new RevMaxApiError('Custom API error', {
        statusCode: 400,
        errorCode: 'INVALID_PARAM',
        requestId: 'req_123',
      });
      expect(error.message).toBe('Custom API error');
      expect(error.statusCode).toBe(400);
      expect(error.errorCode).toBe('INVALID_PARAM');
      expect(error.requestId).toBe('req_123');
    });
  });

  describe('RevMaxAuthenticationError', () => {
    it('should create an authentication error', () => {
      const error = new RevMaxAuthenticationError('Invalid API key');
      expect(error.name).toBe('RevMaxAuthenticationError');
      expect(error.message).toBe('Invalid API key');
      expect(error.statusCode).toBe(401);
      expect(error instanceof RevMaxApiError).toBe(true);
    });
  });

  describe('RevMaxRateLimitError', () => {
    it('should create a rate limit error with retry info', () => {
      const error = new RevMaxRateLimitError('Rate limit exceeded', {
        retryAfter: 30,
        requestId: 'req_123',
      });
      expect(error.name).toBe('RevMaxRateLimitError');
      expect(error.message).toBe('Rate limit exceeded');
      expect(error.statusCode).toBe(429);
      expect(error.retryAfter).toBe(30);
      expect(error.requestId).toBe('req_123');
      expect(error instanceof RevMaxApiError).toBe(true);
    });
  });

  describe('RevMaxValidationError', () => {
    it('should create a validation error with validation errors', () => {
      const validationErrors = [
        { field: 'email', message: 'Invalid email format' },
        { field: 'name', message: 'Name is required' },
      ];
      const error = new RevMaxValidationError('Validation failed', {
        validationErrors,
        requestId: 'req_123',
      });
      expect(error.name).toBe('RevMaxValidationError');
      expect(error.message).toBe('Validation failed');
      expect(error.statusCode).toBe(400);
      expect(error.validationErrors).toEqual(validationErrors);
      expect(error.requestId).toBe('req_123');
      expect(error instanceof RevMaxApiError).toBe(true);
    });
  });

  describe('RevMaxNotFoundError', () => {
    it('should create a not found error', () => {
      const error = new RevMaxNotFoundError('Customer not found', {
        resourceType: 'customer',
        resourceId: 'cust_123',
        requestId: 'req_123',
      });
      expect(error.name).toBe('RevMaxNotFoundError');
      expect(error.message).toBe('Customer not found');
      expect(error.statusCode).toBe(404);
      expect(error.resourceType).toBe('customer');
      expect(error.resourceId).toBe('cust_123');
      expect(error.requestId).toBe('req_123');
      expect(error instanceof RevMaxApiError).toBe(true);
    });
  });

  describe('RevMaxInitializationError', () => {
    it('should create an initialization error', () => {
      const error = new RevMaxInitializationError('Failed to initialize SDK');
      expect(error.name).toBe('RevMaxInitializationError');
      expect(error.message).toBe('Failed to initialize SDK');
      expect(error instanceof RevMaxError).toBe(true);
    });
  });
});
