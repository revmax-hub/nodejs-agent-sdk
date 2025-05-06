import { AuthMethod } from '../types';
import { ApiKeyAuth } from './apiKey';

/**
 * Create an appropriate authentication method based on input
 * @param auth - Authentication credentials
 * @returns Appropriate authentication method
 */
export function createAuth(auth: string): AuthMethod {
  // Currently only API key auth is supported
  // In the future, this could be expanded to support OAuth, etc.
  return new ApiKeyAuth(auth);
}

export { ApiKeyAuth };
