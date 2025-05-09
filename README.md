# @revmax/agent-sdk

[![npm version](https://badge.fury.io/js/%40revmax%2Fagent-sdk.svg)](https://badge.fury.io/js/%40revmax%2Fagent-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Official Node.js SDK for the RevMax API. Simplify integration with RevMax's billing, customer management, and usage tracking services.

## Installation

```bash
npm install @revmax/agent-sdk
# or
yarn add @revmax/agent-sdk
```

## Quick Start

```typescript
import { RevMaxClient } from '@revmax/agent-sdk';

const client = new RevMaxClient('revx_pk_your_api_key');

// Track an event
await client.trackEvent({
  agentId: 'agent_123',
  customerExternalId: 'customer_456',
  metricName: 'meeting_booked',
  metadata: {
    usageCost: [
      {
        serviceName: 'SST-DeepGram', // Service name
        units: 10, // Units consumed
      },
      {
        serviceName: 'TTS-ElevanLabs', // Service name
        units: 10, // Units consumed
      },
    ],
  },
});
```

## Documentation

- [Configuration Options](#configuration)
- [Event Tracking Examples](#event-tracking)
- [Usage Cost Tracking](#usage-cost-tracking)
- [Customer Management](#customer-management)
- [Error Handling](#error-handling)
- [Advanced Features](#advanced-features)
- [API Reference](https://docs.userevmax.com)

## Configuration

```typescript
const client = new RevMaxClient('revx_pk_your_api_key', {
  baseURL: 'https://api.custom-domain.com/v1',
  timeout: 10000,
  retries: 3,
  retryDelay: 300,
  logging: {
    enabled: true,
    level: 'info',
  },
  telemetry: {
    enabled: true,
    sampleRate: 1,
  },
});

await client.connect();
```

## Usage Examples

### Event Tracking

```typescript
// Simple event tracking
await client.trackEvent({
  agentId: 'agent_123',
  customerExternalId: 'customer_456',
  signalName: 'api_call',
  quantity: 1,
});

// Event with metadata and usage cost tracking
await client.trackEvent({
  agentId: 'agent_123',
  customerExternalId: 'customer_456',
  signalName: 'email_sent',
  quantity: 1,
  metadata: {
    eventId: 'email_sent',
    usageCost: [
      {
        serviceName: 'LLM',
        units: 7,
      },
      {
        serviceName: 'Intuit',
        units: 1,
      },
    ],
  },
});

// Batch tracking
await client.trackEvent({
  records: [
    {
      customerExternalId: 'customer_456',
      agentId: 'agent_123',
      signalName: 'api_call',
      quantity: 10,
      metadata: {
        endpoint: '/api/v1/search',
      },
    },
    {
      customerExternalId: 'customer_789',
      agentId: 'agent_123',
      signalName: 'storage',
      quantity: 100,
      usageDate: new Date('2023-08-15'),
      metadata: {
        storageType: 'object',
      },
    },
  ],
});
```

### Usage Cost Tracking

Track detailed cost breakdown through the `usageCost` field in metadata:

```typescript
await client.trackEvent({
  agentId: 'agent_123',
  customerExternalId: 'customer_456',
  signalName: 'lead_generated',
  quantity: 1,
  metadata: {
    eventId: 'lead_generated',
    usageCost: [
      {
        serviceName: 'wfloengine', // Service name
        units: 1, // Units consumed
      },
    ],
  },
});
```

The `usageCost` field structure:

| Field       | Type   | Description                              |
| ----------- | ------ | ---------------------------------------- |
| serviceName | string | Name of the service (e.g., 'LLM', 'TTS') |
| units       | number | Number of units consumed                 |

### Customer Management

```typescript
// Create a customer
const customer = await client.customers.create({
  name: 'Acme Corp',
  email: 'billing@acmecorp.com',
  externalId: 'acme-123',
});

// List customers
const customers = await client.customers.list({
  limit: 10,
  page: 1,
});

// Get, update and delete customers
const customer = await client.customers.get('customer_id');
await client.customers.update('customer_id', { name: 'Updated Name' });
await client.customers.delete('customer_id');
```

## Error Handling

```typescript
import {
  RevMaxClient,
  RevMaxApiError,
  RevMaxAuthenticationError,
  RevMaxRateLimitError,
  RevMaxValidationError,
} from '@revmax/agent-sdk';

try {
  await client.connect();
  await client.trackEvent({
    /* ... */
  });
} catch (error) {
  if (error instanceof RevMaxAuthenticationError) {
    console.error(`Authentication failed. Request ID: ${error.requestId}`);
  } else if (error instanceof RevMaxRateLimitError) {
    console.error(`Rate limit exceeded. Retry after ${error.retryAfter}s`);
  } else if (error instanceof RevMaxValidationError) {
    console.error(`Validation error: ${error.message}`);
  } else if (error instanceof RevMaxApiError) {
    console.error(`API Error (${error.statusCode}): ${error.message}`);
  }
}
```

## Advanced Features

### Request Retries

```typescript
const client = new RevMaxClient('revx_pk_your_api_key', {
  retries: 3,
  retryDelay: 300,
});
```

### Logging & Telemetry

The SDK includes a telemetry system that tracks API request performance and usage patterns:

```typescript
const client = new RevMaxClient('revx_pk_your_api_key', {
  logging: {
    enabled: true,
    level: 'debug',
    handler: (level, message, data) => {
      myLoggingSystem.log(level, message, data);
    },
  },
  telemetry: {
    enabled: true,
    sampleRate: 0.5, // Track 50% of requests
    handler: (metrics) => {
      myMonitoringSystem.trackApiRequest(metrics);
    },
  },
});
```

You can access telemetry statistics programmatically:

```typescript
// Get current statistics
const stats = client.getTelemetryStats();
console.log(`Total Requests: ${stats.requestCount}`);
console.log(`Success Rate: ${(stats.successRate * 100).toFixed(2)}%`);
```

For detailed telemetry configuration including integration with monitoring systems,
see [Telemetry Documentation](./docs/telemetry.md).

## API Reference

Complete documentation available at [docs.userevmax.com](https://docs.userevmax.com).

## License

MIT License. See [LICENSE](./LICENSE) for details.
