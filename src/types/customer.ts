/**
 * Customer status options
 */
export type CustomerStatus = 'active' | 'inactive' | 'suspended';

/**
 * Customer interface matching the API response
 */
export interface Customer {
  id: string;
  externalId?: string;
  name: string;
  email?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  organizationId: string;
  status: CustomerStatus;
  billingContactName?: string;
  billingContactEmail?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

/**
 * Parameters for creating a customer
 */
export interface CustomerCreateParams {
  name: string;
  externalId?: string;
  email?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  status?: CustomerStatus;
  billingContactName?: string;
  billingContactEmail?: string;
  metadata?: Record<string, any>;
}

/**
 * Parameters for updating a customer
 */
export interface CustomerUpdateParams {
  name?: string;
  externalId?: string;
  email?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  status?: CustomerStatus;
  billingContactName?: string;
  billingContactEmail?: string;
  metadata?: Record<string, any>;
}

/**
 * Parameters for listing customers
 */
export interface CustomerListParams {
  page?: number;
  limit?: number;
  name?: string;
  email?: string;
  status?: CustomerStatus;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Response for listing customers
 */
export interface CustomerListResponse {
  results: Customer[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}
