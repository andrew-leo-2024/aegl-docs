---
sidebar_position: 13
title: Errors
description: Error codes, formats, and handling
---

# Errors

All errors return a structured JSON response with an `error` message and `trace_id`.

## Error Format

```json
{
  "error": "Human-readable error message",
  "trace_id": "trace_abc123"
}
```

## HTTP Status Codes

| Code | Meaning | Common Causes |
|------|---------|---------------|
| `400` | Bad Request | Invalid request body, missing required fields |
| `401` | Unauthorized | Missing, invalid, expired, or revoked API key |
| `403` | Forbidden | Insufficient permissions for the requested operation |
| `404` | Not Found | Resource does not exist or belongs to another organization |
| `409` | Conflict | Resource already exists (e.g., duplicate agent name) |
| `422` | Unprocessable Entity | Request body fails Zod validation |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Internal Server Error | Unexpected server error |

## Validation Errors (422)

When request validation fails, the error includes details about which fields are invalid:

```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "action_type",
      "message": "Required"
    },
    {
      "field": "rules",
      "message": "Array must contain at least 1 element(s)"
    }
  ],
  "trace_id": "trace_abc123"
}
```

## SDK Error Types

### TypeScript

```typescript
import { AEGLError, AEGLTimeoutError, AEGLAuthError } from '@aegl/sdk';

try {
  const decision = await aegl.decide({ ... });
} catch (error) {
  if (error instanceof AEGLAuthError) {
    // 401 — API key is invalid
  } else if (error instanceof AEGLTimeoutError) {
    // Request timed out
  } else if (error instanceof AEGLError) {
    console.log(error.statusCode);  // HTTP status code
    console.log(error.traceId);     // Trace ID for debugging
  }
}
```

### Python

```python
from aegl.types import AEGLError, AEGLTimeoutError, AEGLAuthError

try:
    decision = aegl.decide(...)
except AEGLAuthError:
    # 401 — API key is invalid
    pass
except AEGLTimeoutError as e:
    # Request timed out after e.timeout seconds
    pass
except AEGLError as e:
    print(e.status_code)  # HTTP status code
    print(e.message)      # Error message
```

## Fail-Closed Behavior

When the SDK cannot reach the API (network error, timeout, 5xx), the default behavior is **fail-closed**:

```typescript
// Default: fail-closed — decision is DENIED on error
const decision = await aegl.decide({ ... });
// decision.outcome === "DENIED"
// decision.outcomeReason === "AEGL SDK error (fail-closed): ..."
```

To enable fail-open (use with caution):

```typescript
const aegl = new AEGL({
  apiKey: '...',
  agentId: '...',
  failOpen: true,  // ⚠️ Actions proceed on error
});
```
