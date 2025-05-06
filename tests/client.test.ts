import { RevMaxClient } from '../src/client';
import { RevMaxAuthenticationError, RevMaxInitializationError } from '../src/utils/errors';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('RevMaxClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create a new instance with default options', () => {
      const client = new RevMaxClient('test_api_key');
      expect(client).toBeInstanceOf(RevMaxClient);
    });

    it('should create a new instance with custom options', () => {
      const client = new RevMaxClient('test_api_key', {
        baseURL: 'https://custom-api.test',
        timeout: 5000,
        retries: 2,
      });
      expect(client).toBeInstanceOf(RevMaxClient);
    });

    it('should throw if API key is missing', () => {
      // @ts-ignore - Testing invalid input
      expect(() => new RevMaxClient()).toThrow();
      // @ts-ignore - Testing empty string
      expect(() => new RevMaxClient('')).toThrow();
    });
  });

  describe('connect', () => {
    it('should connect successfully and return client instance', async () => {
      // Mock successful verification response
      mockedAxios.request.mockResolvedValueOnce({
        data: {
          organization: {
            id: 'org_123',
            name: 'Test Organization',
          },
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      });

      const client = new RevMaxClient('test_api_key');
      const result = await client.connect();

      expect(result).toBe(client); // Returns itself for chaining
      expect(mockedAxios.request).toHaveBeenCalledTimes(1);
      expect(mockedAxios.request).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expect.stringContaining('/verify'),
          method: 'GET',
        })
      );
    });

    it('should throw RevMaxAuthenticationError for invalid API key', async () => {
      // Mock 401 response for invalid API key
      mockedAxios.request.mockRejectedValueOnce({
        response: {
          status: 401,
          data: {
            message: 'Invalid API key',
          },
        },
      });

      const client = new RevMaxClient('invalid_api_key');
      await expect(client.connect()).rejects.toThrow(RevMaxAuthenticationError);
    });

    it('should throw RevMaxInitializationError for unexpected response format', async () => {
      // Mock response with missing organization data
      mockedAxios.request.mockResolvedValueOnce({
        data: {}, // Missing organization data
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      });

      const client = new RevMaxClient('test_api_key');
      await expect(client.connect()).rejects.toThrow(RevMaxInitializationError);
    });

    it('should throw RevMaxInitializationError for server errors', async () => {
      // Mock 500 response
      mockedAxios.request.mockRejectedValueOnce({
        response: {
          status: 500,
          data: {
            message: 'Internal server error',
          },
        },
      });

      const client = new RevMaxClient('test_api_key');
      await expect(client.connect()).rejects.toThrow(RevMaxInitializationError);
    });
  });

  describe('getOrganization', () => {
    it('should return organization info after successful connection', async () => {
      const orgInfo = {
        id: 'org_123',
        name: 'Test Organization',
      };

      // Mock successful verification response
      mockedAxios.request.mockResolvedValueOnce({
        data: {
          organization: orgInfo,
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      });

      const client = new RevMaxClient('test_api_key');
      await client.connect();

      const returnedOrgInfo = client.getOrganization();
      expect(returnedOrgInfo).toEqual(orgInfo);
    });

    it('should throw error if client is not connected', () => {
      const client = new RevMaxClient('test_api_key');
      expect(() => client.getOrganization()).toThrow();
    });
  });


});
