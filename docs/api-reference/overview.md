---
sidebar_position: 1
title: API Overview
description: E-AEGL REST API overview — base URL, authentication, versioning, and conventions
---

# API Overview

The E-AEGL API is a RESTful JSON API for governing AI decisions.

## Base URL

| Environment | URL |
|-------------|-----|
| Cloud (Production) | `https://api.aegl.io` |
| Self-Hosted | `http://localhost:4000` (configurable) |

All endpoints are versioned under `/v1/`.

> **OpenAPI Spec:** Download the full [OpenAPI 3.1 specification](/openapi/aegl-api.yaml) for use with Swagger UI, Postman, or code generators.

## Authentication

All API requests (except `/health`) require a Bearer token:

```
Authorization: Bearer aegl_key_abc123...
```

See [Authentication](./authentication) for details.

## Request Format

- Content-Type: `application/json`
- All request bodies are JSON
- Timestamps are ISO 8601 format (UTC)

## Response Format

Successful responses return JSON with appropriate HTTP status codes:

```json
{
  "id": "resource_id",
  "field": "value",
  "created_at": "2026-03-01T12:00:00Z"
}
```

List endpoints return paginated results:
```json
{
  "data": [...],
  "total": 247,
  "page": 1,
  "limit": 50
}
```

## Error Format

Errors return a structured JSON response:

```json
{
  "error": "Human-readable error message",
  "trace_id": "trace_abc123"
}
```

See [Errors](./errors) for status codes and error types.

## Rate Limiting

| Scope | Limit |
|-------|-------|
| Global (authenticated) | 1,000 requests/minute |
| Public endpoints | 60 requests/minute |

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 997
X-RateLimit-Reset: 1709294400
```

## Trace IDs

Every request receives a trace ID (returned in the `X-Trace-ID` response header and in error bodies). Include this ID when reporting issues.

You can pass your own trace ID via the `X-Trace-ID` request header for distributed tracing correlation.

## Endpoints Summary

| Method | Path | Description |
|--------|------|-------------|
| POST | `/v1/decisions` | Submit a decision request |
| GET | `/v1/decisions` | List decisions |
| GET | `/v1/decisions/:id` | Get decision detail |
| POST | `/v1/decisions/:id/replay` | Replay decision |
| GET | `/v1/policies` | List policies |
| POST | `/v1/policies` | Create policy |
| GET | `/v1/policies/:id` | Get policy detail |
| PUT | `/v1/policies/:id` | Update policy |
| DELETE | `/v1/policies/:id` | Delete policy |
| POST | `/v1/policies/:id/simulate` | Simulate policy |
| GET | `/v1/agents` | List agents |
| POST | `/v1/agents` | Register agent |
| GET | `/v1/agents/:id` | Get agent detail |
| PUT | `/v1/agents/:id` | Update agent |
| GET | `/v1/agents/:id/decisions` | Agent decision history |
| GET | `/v1/models` | List models |
| POST | `/v1/models` | Register model |
| GET | `/v1/models/:id` | Get model detail |
| PUT | `/v1/models/:id` | Update model |
| GET | `/v1/escalations` | List escalations |
| GET | `/v1/escalations/:id` | Get escalation detail |
| POST | `/v1/escalations/:id/decide` | Resolve escalation |
| GET | `/v1/audit` | Query audit logs |
| GET | `/v1/audit/integrity` | Verify hash chain |
| GET | `/v1/audit/:traceId` | Get decision trace |
| GET | `/v1/webhooks` | List webhooks |
| POST | `/v1/webhooks` | Create webhook |
| GET | `/v1/webhooks/:id` | Get webhook detail |
| DELETE | `/v1/webhooks/:id` | Delete webhook |
| GET | `/v1/org` | Get organization |
| PUT | `/v1/org` | Update organization |
| GET | `/v1/org/metrics` | Dashboard metrics |
| GET | `/v1/org/usage` | Billing usage |
| GET | `/v1/compliance/soc2-evidence` | SOC 2 report |
| GET | `/health` | Health check |
| GET | `/health/ready` | Readiness probe |
| GET | `/health/live` | Liveness probe |
