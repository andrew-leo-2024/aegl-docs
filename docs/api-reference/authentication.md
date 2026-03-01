---
sidebar_position: 2
title: Authentication
description: API key authentication, RBAC permissions, and security
---

# Authentication

All API requests require authentication via an API key passed as a Bearer token.

## API Key Format

```
Authorization: Bearer aegl_key_abc123def456...
```

## How API Keys Work

1. When an API key is created, it is **SHA-256 hashed** before storage
2. The plain-text key is returned once at creation and never stored
3. On each request, the provided key is hashed and matched against stored hashes
4. Invalid, expired, or revoked keys return `401 Unauthorized`

## Security Properties

- **Hashed storage**: Plain-text keys are never stored in the database
- **Organization scoping**: Each key is bound to one organization
- **Permission scoping**: Keys can be restricted to specific operations
- **Expiration**: Optional expiration date
- **Revocation**: Instant revocation — revoked keys are immediately rejected
- **Usage tracking**: `lastUsedAt` is updated on every request (fire-and-forget)

## Permissions

API keys are scoped to specific permissions:

| Permission | Description |
|-----------|-------------|
| `decisions:read` | Read decisions and audit logs |
| `decisions:write` | Submit new decisions |
| `policies:read` | Read policies |
| `policies:write` | Create/update/delete policies |
| `agents:read` | Read agents |
| `agents:write` | Create/update agents |
| `models:read` | Read models |
| `models:write` | Create/update models |
| `escalations:read` | Read escalations |
| `escalations:write` | Resolve escalations |
| `webhooks:read` | Read webhooks |
| `webhooks:write` | Create/delete webhooks |
| `audit:read` | Read audit logs and compliance reports |
| `org:read` | Read organization settings |
| `org:write` | Update organization settings |

## Error Responses

```json
// 401 — Invalid or missing API key
{
  "error": "Invalid or expired API key",
  "trace_id": "trace_abc123"
}
```

Authentication errors are intentionally vague (not found, revoked, and expired all return the same message) to prevent information leakage.

## Request Properties

After authentication, the following properties are attached to each request:
- `organizationId` — The organization owning the API key
- `apiKeyId` — The specific API key used
- `permissions` — Array of granted permissions

## RBAC

Role-based access control is enforced via the `requirePermission()` middleware. Each endpoint requires specific permissions:

```
POST /v1/decisions   → requires decisions:write
GET  /v1/policies    → requires policies:read
POST /v1/policies    → requires policies:write
```
