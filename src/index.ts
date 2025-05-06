/**
 * @file RevMax SDK for Node.js
 *
 * This SDK provides a convenient way to interact with the RevMax API.
 *
 * Basic usage:
 * ```typescript
 * import { RevMaxClient } from '@revmax/sdk';
 *
 * // Create the client
 * const client = new RevMaxClient('your_api_key', {
 *   // Optional configuration
 *   baseURL: 'https://api.revmax.com/v1',
 *   timeout: 5000,
 *   telemetry: {
 *     enabled: true,
 *     handler: (metrics) => console.log(metrics),
 *   }
 * });
 *
 * // Connect to the API (required before using any methods)
 * try {
 *   await client.connect();
 *   console.log('Connected to RevMax API');
 *
 *   // Now you can use the client
 *   const customer = await client.customers.create({
 *     name: 'Example Customer',
 *     email: 'customer@example.com',
 *     externalId: 'cust-123'
 *   });
 * } catch (error) {
 *   console.error('Failed to connect:', error);
 * }
 * ```
 */

// Export main client
export { RevMaxClient } from './client';

// Export types
export * from './types';

// Export errors
export {
  RevMaxError,
  RevMaxApiError,
  RevMaxAuthenticationError,
  RevMaxRateLimitError,
  RevMaxValidationError,
  RevMaxNotFoundError,
  RevMaxInitializationError,
} from './utils/errors';

// Legacy export for backward compatibility
