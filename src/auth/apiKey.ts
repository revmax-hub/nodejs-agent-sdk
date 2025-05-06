import { AuthMethod } from '../types';
import { RevMaxAuthenticationError } from '../utils/errors';

// API key prefix that all valid keys must start with
const REVX_API_KEY_PREFIX = 'revx_pk_';

/**
 * API Key authentication method
 */
export class ApiKeyAuth implements AuthMethod {
  private readonly apiKey: string;
  private verified: boolean = false;

  /**
   * Create a new API Key authentication method
   * @param apiKey - API Key for authentication
   * @throws RevMaxAuthenticationError if the API key is invalid
   */
  constructor(apiKey: string) {
    // Check if the API key is provided
    if (!apiKey) {
      throw new RevMaxAuthenticationError('REVX_API_KEY is required');
    }

    // Check if the API key is a string
    if (typeof apiKey !== 'string') {
      throw new RevMaxAuthenticationError('REVX_API_KEY must be a string');
    }

    // Check if the API key has the correct format
    if (!apiKey.startsWith(REVX_API_KEY_PREFIX)) {
      throw new RevMaxAuthenticationError(
        `REVX_API_KEY format not valid: it should start with "${REVX_API_KEY_PREFIX}" followed by a unique identifier`
      );
    }

    // Check if the API key has sufficient length (prefix + at least 16 chars)
    if (apiKey.length < REVX_API_KEY_PREFIX.length + 16) {
      throw new RevMaxAuthenticationError('REVX_API_KEY format not valid: key is too short');
    }

    this.apiKey = apiKey;
  }

  /**
   * Get headers for authentication
   * @returns Headers for API requests
   */
  getHeaders(): Record<string, string> {
    // Only use the header format that works with the API server
    return {
      'revx-api-key': this.apiKey,
    };
  }

  /**
   * Set verification status
   * @param status - Verification status
   */
  setVerified(status: boolean): void {
    this.verified = status;
  }

  /**
   * Check if the API key has been verified
   * @returns Verification status
   */
  isVerified(): boolean {
    return this.verified;
  }
}
