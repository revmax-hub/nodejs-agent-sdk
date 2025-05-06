# SDK Telemetry System

The @revmax/agent-sdk includes a powerful telemetry system that collects performance metrics and provides insights into API usage patterns. This guide explains how to use and configure telemetry to monitor your API interactions.

## Overview

The telemetry system tracks:

- Request latency (duration)
- Success and error rates
- Request paths and methods
- Retry attempts
- Error types and patterns

All with minimal performance impact.

## Basic Usage

Telemetry is disabled by default. To enable it:

```typescript
import { RevMaxClient } from '@revmax/agent-sdk';

const client = new RevMaxClient('your_api_key', {
  telemetry: {
    enabled: true,
  },
});

await client.connect();
```

### Viewing Telemetry Stats

You can access telemetry statistics at any time:

```typescript
// Get current statistics
const stats = client.getTelemetryStats();

console.log(`Total Requests: ${stats.requestCount}`);
console.log(`Success Rate: ${(stats.successRate * 100).toFixed(2)}%`);
console.log(`Average Duration: ${stats.averageDuration.toFixed(2)}ms`);

// Error breakdown
if (Object.keys(stats.errorBreakdown).length > 0) {
  console.log('Error Distribution:');
  Object.entries(stats.errorBreakdown).forEach(([type, count]) => {
    console.log(`  ${type}: ${count} (${((count / stats.errorCount) * 100).toFixed(2)}%)`);
  });
}
```

### Resetting Stats

For long-running applications, you may want to reset stats periodically:

```typescript
// Reset all telemetry statistics
client.resetTelemetryStats();
```

## Advanced Configuration

### Sample Rate

For high-volume applications, you can use sampling to reduce overhead while still getting representative metrics:

```typescript
const client = new RevMaxClient('your_api_key', {
  telemetry: {
    enabled: true,
    sampleRate: 0.1, // Only track 10% of requests
  },
});

await client.connect();
```

### Custom Telemetry Handler

You can provide a custom handler function to process telemetry data:

```typescript
const client = new RevMaxClient('your_api_key', {
  telemetry: {
    enabled: true,
    handler: (metrics) => {
      // Send to your monitoring system
      myMonitoringSystem.trackApiRequest({
        path: metrics.path,
        method: metrics.method,
        duration: metrics.duration,
        success: metrics.success,
        statusCode: metrics.statusCode,
        requestId: metrics.requestId,
        timestamp: new Date(metrics.startTime).toISOString(),
      });

      // Log slow requests
      if (metrics.duration > 1000) {
        console.warn(`Slow request: ${metrics.method} ${metrics.path} - ${metrics.duration}ms`);
      }
    },
  },
});

await client.connect();
```

## Metrics Reference

Each telemetry event includes:

| Property       | Type    | Description                         |
| -------------- | ------- | ----------------------------------- |
| `requestId`    | string  | Unique ID for the request           |
| `method`       | string  | HTTP method (GET, POST, etc.)       |
| `path`         | string  | Normalized API endpoint path        |
| `startTime`    | number  | Timestamp when request started (ms) |
| `endTime`      | number  | Timestamp when request ended (ms)   |
| `duration`     | number  | Request duration in milliseconds    |
| `statusCode`   | number  | HTTP status code                    |
| `success`      | boolean | Whether the request succeeded       |
| `errorType`    | string  | Error type if request failed        |
| `errorMessage` | string  | Error message if request failed     |
| `retryCount`   | number  | Number of retry attempts            |

## Integration with Monitoring Systems

The telemetry system is designed to integrate easily with popular monitoring systems:

### Datadog Example

```typescript
const client = new RevMaxClient('your_api_key', {
  telemetry: {
    enabled: true,
    handler: (metrics) => {
      const tags = [
        `method:${metrics.method}`,
        `path:${metrics.path}`,
        `status:${metrics.statusCode || 'unknown'}`,
        `success:${metrics.success}`,
      ];

      // Send metrics to Datadog
      dogstatsd.timing('revmax.api.request_duration', metrics.duration, tags);
      dogstatsd.increment('revmax.api.requests_total', 1, tags);

      if (!metrics.success) {
        dogstatsd.increment('revmax.api.errors_total', 1, [
          ...tags,
          `error_type:${metrics.errorType || 'unknown'}`,
        ]);
      }
    },
  },
});

await client.connect();
```

### New Relic Example

```typescript
const newrelic = require('newrelic');

const client = new RevMaxClient('your_api_key', {
  telemetry: {
    enabled: true,
    handler: (metrics) => {
      // Record custom metrics
      newrelic.recordMetric('Custom/RevMax/RequestDuration', metrics.duration);

      // Record custom event
      newrelic.recordCustomEvent('RevMaxApiRequest', {
        path: metrics.path,
        method: metrics.method,
        duration: metrics.duration,
        statusCode: metrics.statusCode,
        success: metrics.success,
        errorType: metrics.errorType,
        retryCount: metrics.retryCount,
      });
    },
  },
});

await client.connect();
```

## Best Practices

1. **Use sampling for high-volume applications**: Start with a small sample rate (e.g., 0.1) and adjust as needed.
2. **Reset stats periodically**: For long-running applications, consider resetting stats daily or hourly.
3. **Track key business metrics**: Focus on the API endpoints most critical to your business.
4. **Set up alerts**: Configure alerts for abnormal error rates or latency spikes.
5. **Correlate with request IDs**: Use the request ID for end-to-end tracking in complex systems.

## Privacy Considerations

The telemetry system is designed to avoid collecting sensitive data:

- No request payloads or response bodies are tracked
- Authentication tokens and sensitive headers are redacted
- Metrics are kept in memory and not persisted automatically
- You have full control over what metrics are collected and where they're sent

## Performance Impact

The telemetry system is designed to have minimal performance impact:

- Most operations are performed asynchronously
- Sampling can be used to further reduce overhead
- Memory usage is kept minimal by storing only aggregated statistics
