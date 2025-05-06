/**
 * Usage record interface matching the API response
 */
export interface UsageRecord {
  id: string;
  customerExternalId: string;
  organizationId: string;
  agentId: string;
  signalId?: string;
  signalName: string;
  usageDate: string;
  quantity: number;
  metadata?: Record<string, any>;
  createdAt: string;
}

/**
 * Parameters for recording usage
 */
export interface RecordUsageParams {
  customerExternalId: string;
  agentId: string;
  signalName: string;
  quantity: number;
  usageDate?: string | Date;
  metadata?: Record<string, any>;
}

/**
 * Response for recording usage
 */
export interface RecordUsageResponse {
  success: boolean;
  usageRecord: UsageRecord;
}
