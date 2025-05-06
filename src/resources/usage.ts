import { ApiClient } from "../utils/api";
import { Logger } from "../utils/logger";
import {
  BatchEventResponse,
  TrackEventParams,
  TrackEventResponse,
  SingleEventResponse,
  UsageRecord,
} from "../types";

/**
 * Usage resource for tracking usage
 */
export class Usage {
  private readonly client: ApiClient;
  private readonly logger: Logger;
  private readonly basePath: string = "/usage";

  /**
   * Create a new usage resource
   * @param client - API client
   * @param logger - Logger instance
   */
  constructor(client: ApiClient, logger: Logger) {
    this.client = client;
    this.logger = logger;
  }

  /**
   * Track events for a customer - supports both single record and batch operations
   * @param params - Event tracking parameters (single record or batch)
   * @returns Tracked event data
   */
  async trackEvent(params: TrackEventParams): Promise<TrackEventResponse> {
    // Check if this is a single record or a batch operation
    if ("records" in params) {
      // This is a batch operation
      this.logger.info(
        `Recording batch usage for ${params.records.length} records`
      );

      // Format any Date objects in the records to ISO strings
      const formattedRecords = params.records.map((record) =>
        this.formatRecord(record)
      );

      return this.client.post<BatchEventResponse>(`${this.basePath}/record`, {
        records: formattedRecords,
      });
    } else {
      // This is a single record - convert it to the batch format
      this.logger.info("Recording usage", {
        agent: params.agentId,
        customer: params.customerExternalId,
        signal: params.signalName,
        quantity: params.quantity,
      });

      // Format the record
      const formattedRecord = this.formatRecord(params);

      // Submit as a batch with one record
      const response = await this.client.post<BatchEventResponse>(
        `${this.basePath}/record`,
        {
          records: [formattedRecord],
        }
      );

      // If it's a batch response but only contains one record, extract and return the single result for backward compatibility
      if (
        response.results &&
        response.results.length === 1 &&
        response.results[0].success &&
        response.results[0].responseData
      ) {
        return response.results[0].responseData as SingleEventResponse;
      }

      return response;
    }
  }

  /**
   * Format a usage record, converting Date objects to ISO strings
   * @param record - The usage record to format
   * @returns The formatted record
   */
  private formatRecord(record: UsageRecord): UsageRecord {
    const formattedRecord = { ...record };
    if (formattedRecord.usageDate instanceof Date) {
      formattedRecord.usageDate = formattedRecord.usageDate.toISOString();
    }
    return formattedRecord;
  }
}
