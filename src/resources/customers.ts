import { ApiClient } from '../utils/api';
import { Logger } from '../utils/logger';
import { Customer, CustomerCreateParams, CustomerUpdateParams, CustomerListParams, CustomerListResponse } from '../types';

/**
 * Customer resource for managing customers
 */
export class Customers {
  private readonly client: ApiClient;
  private readonly logger: Logger;
  private readonly basePath: string = '/customers';

  /**
   * Create a new customer resource
   * @param client - API client
   * @param logger - Logger instance
   */
  constructor(client: ApiClient, logger: Logger) {
    this.client = client;
    this.logger = logger;
  }

  /**
   * Create a new customer
   * @param params - Customer creation parameters
   * @returns Created customer
   */
  async create(params: CustomerCreateParams): Promise<Customer> {
    this.logger.info('Creating customer', params);
    return this.client.post<Customer>(this.basePath, params);
  }

  /**
   * Get a specific customer by ID
   * @param id - Customer ID
   * @returns Customer data
   */
  async get(id: string): Promise<Customer> {
    this.logger.info(`Retrieving customer: ${id}`);
    return this.client.get<Customer>(`${this.basePath}/${id}`);
  }

  /**
   * Update a customer
   * @param id - Customer ID
   * @param params - Customer update parameters
   * @returns Updated customer
   */
  async update(id: string, params: CustomerUpdateParams): Promise<Customer> {
    this.logger.info(`Updating customer: ${id}`, params);
    return this.client.patch<Customer>(`${this.basePath}/${id}`, params);
  }

  /**
   * Delete a customer
   * @param id - Customer ID
   * @returns Void
   */
  async delete(id: string): Promise<void> {
    this.logger.info(`Deleting customer: ${id}`);
    return this.client.delete(`${this.basePath}/${id}`);
  }

  /**
   * List customers with pagination and filtering
   * @param params - List parameters
   * @returns Paginated list of customers
   */
  async list(params: CustomerListParams = {}): Promise<CustomerListResponse> {
    this.logger.info('Listing customers', params);
    return this.client.get<CustomerListResponse>(this.basePath, params);
  }
}
