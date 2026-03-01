---
sidebar_position: 2
title: Client
description: AEGL client class — methods and properties
---

# AEGL Client

The `AEGL` class is the main entry point for the TypeScript SDK.

## Constructor

```typescript
import { AEGL } from '@aegl/sdk';

const aegl = new AEGL({
  apiKey: process.env.AEGL_API_KEY!,
  agentId: 'my-agent-v1',
});
```

Throws `AEGLError` if `apiKey` or `agentId` is missing.

## Methods

### `decide(request: DecisionRequest): Promise<DecisionResponse>`

Submit a decision request. See [Decide](./decide) for detailed usage.

### `syncPolicies(): Promise<void>`

Manually sync policies from the API to the local cache. Only relevant when `policyCache.enabled` is true.

```typescript
await aegl.syncPolicies();
```

### `get(path: string): Promise<Record<string, unknown>>`

HTTP GET helper for read operations. Used internally but available for custom API calls.

```typescript
const data = await aegl.get('/v1/org/metrics');
```

### `destroy(): void`

Stop background sync timers. Call this before process exit when using policy cache.

```typescript
process.on('SIGTERM', () => {
  aegl.destroy();
  process.exit(0);
});
```

## Retry Logic

The client automatically retries failed requests with exponential backoff:

| Attempt | Delay |
|---------|-------|
| 1 | 100ms |
| 2 | 200ms |
| 3 | 400ms |

Retries occur on:
- Network errors (connection refused, DNS failure)
- Timeout errors
- 5xx server errors

Retries do NOT occur on:
- 401 Unauthorized (immediately thrown)
- 4xx client errors (immediately thrown)

## Error Types

```typescript
import { AEGLError, AEGLTimeoutError, AEGLAuthError } from '@aegl/sdk';
```

| Class | When Thrown |
|-------|------------|
| `AEGLError` | API returns a non-2xx response |
| `AEGLTimeoutError` | Request exceeds timeout |
| `AEGLAuthError` | API returns 401 (invalid API key) |

All errors extend `AEGLError`:
```typescript
error.message     // Error message
error.statusCode  // HTTP status code (if applicable)
error.traceId     // API trace ID (if available)
```
