import { Customers, Usage } from '../src/resources';
import { ApiClient } from '../src/utils/api';
import { Logger } from '../src/utils/logger';

// Mock ApiClient
const mockApiClient = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
} as unknown as ApiClient;

// Mock Logger
const mockLogger = {
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
} as unknown as Logger;

describe('Resources', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Customers', () => {
    let customers: Customers;

    beforeEach(() => {
      customers = new Customers(mockApiClient, mockLogger);
    });

    describe('create', () => {
      it('should create a customer', async () => {
        const customerData = {
          name: 'Test Customer',
          email: 'test@example.com',
          externalId: 'cust-123',
        };

        const mockResponse = {
          id: 'customer_123',
          ...customerData,
          createdAt: '2023-01-01T00:00:00Z',
          updatedAt: '2023-01-01T00:00:00Z',
        };

        mockApiClient.post.mockResolvedValueOnce(mockResponse);

        const result = await customers.create(customerData);

        expect(result).toEqual(mockResponse);
        expect(mockApiClient.post).toHaveBeenCalledWith('/customers', customerData);
        expect(mockLogger.info).toHaveBeenCalled();
      });
    });

    describe('get', () => {
      it('should get a customer by ID', async () => {
        const customerId = 'customer_123';
        const mockResponse = {
          id: customerId,
          name: 'Test Customer',
          email: 'test@example.com',
          externalId: 'cust-123',
          createdAt: '2023-01-01T00:00:00Z',
          updatedAt: '2023-01-01T00:00:00Z',
        };

        mockApiClient.get.mockResolvedValueOnce(mockResponse);

        const result = await customers.get(customerId);

        expect(result).toEqual(mockResponse);
        expect(mockApiClient.get).toHaveBeenCalledWith(`/customers/${customerId}`);
      });
    });

    describe('list', () => {
      it('should list customers with default parameters', async () => {
        const mockResponse = {
          data: [
            {
              id: 'customer_123',
              name: 'Test Customer',
              email: 'test@example.com',
              externalId: 'cust-123',
            },
          ],
          pagination: {
            totalResults: 1,
            page: 1,
            limit: 10,
          },
        };

        mockApiClient.get.mockResolvedValueOnce(mockResponse);

        const result = await customers.list();

        expect(result).toEqual({
          ...mockResponse,
          totalResults: 1,
        });
        expect(mockApiClient.get).toHaveBeenCalledWith('/customers', { params: {} });
      });

      it('should list customers with provided parameters', async () => {
        const params = {
          limit: 5,
          page: 2,
          query: 'test',
        };

        const mockResponse = {
          data: [
            {
              id: 'customer_123',
              name: 'Test Customer',
              email: 'test@example.com',
              externalId: 'cust-123',
            },
          ],
          pagination: {
            totalResults: 20,
            page: 2,
            limit: 5,
          },
        };

        mockApiClient.get.mockResolvedValueOnce(mockResponse);

        const result = await customers.list(params);

        expect(result).toEqual({
          ...mockResponse,
          totalResults: 20,
        });
        expect(mockApiClient.get).toHaveBeenCalledWith('/customers', { params });
      });
    });

    describe('update', () => {
      it('should update a customer', async () => {
        const customerId = 'customer_123';
        const updateData = {
          name: 'Updated Customer',
        };

        const mockResponse = {
          id: customerId,
          name: 'Updated Customer',
          email: 'test@example.com',
          externalId: 'cust-123',
          updatedAt: '2023-01-02T00:00:00Z',
        };

        mockApiClient.put.mockResolvedValueOnce(mockResponse);

        const result = await customers.update(customerId, updateData);

        expect(result).toEqual(mockResponse);
        expect(mockApiClient.put).toHaveBeenCalledWith(`/customers/${customerId}`, updateData);
      });
    });

    describe('delete', () => {
      it('should delete a customer', async () => {
        const customerId = 'customer_123';
        const mockResponse = { success: true };

        mockApiClient.delete.mockResolvedValueOnce(mockResponse);

        const result = await customers.delete(customerId);

        expect(result).toEqual(mockResponse);
        expect(mockApiClient.delete).toHaveBeenCalledWith(`/customers/${customerId}`);
      });
    });
  });

  describe('Usage', () => {
    let usage: Usage;

    beforeEach(() => {
      usage = new Usage(mockApiClient, mockLogger);
    });

    describe('trackEvent', () => {
      it('should track a single event', async () => {
        const eventData = {
          customerExternalId: 'cust-123',
          agentId: 'agent-456',
          signalName: 'api_call',
          quantity: 1,
        };

        const mockResponse = {
          success: true,
          id: 'event_123',
        };

        mockApiClient.post.mockResolvedValueOnce(mockResponse);

        const result = await usage.trackEvent(eventData);

        expect(result).toEqual(mockResponse);
        expect(mockApiClient.post).toHaveBeenCalledWith('/usage/track', eventData);
      });

      it('should track multiple events as a batch', async () => {
        const batchData = {
          records: [
            {
              customerExternalId: 'cust-123',
              agentId: 'agent-456',
              signalName: 'api_call',
              quantity: 1,
            },
            {
              customerExternalId: 'cust-789',
              agentId: 'agent-456',
              signalName: 'storage',
              quantity: 100,
            },
          ],
        };

        const mockResponse = {
          success: true,
          trackingId: 'batch_123',
          successCount: 2,
          errorCount: 0,
        };

        mockApiClient.post.mockResolvedValueOnce(mockResponse);

        const result = await usage.trackEvent(batchData);

        expect(result).toEqual(mockResponse);
        expect(mockApiClient.post).toHaveBeenCalledWith('/usage/track', batchData);
      });
    });
  });
});
