---
sidebar_position: 6
title: Security Model
description: Authentication, authorization, and security hardening
---

# Security Model

E-AEGL is designed for regulated industries where security failures have legal consequences.

## Authentication

### API Key Authentication
- Keys are **SHA-256 hashed** before storage — plain-text never persisted
- Each key is scoped to one organization
- Keys support permission scoping and expiration
- Revoked/expired keys are immediately rejected
- Error messages are intentionally vague to prevent information leakage

### Dashboard Authentication
- NextAuth with session management
- Role-based access control (RBAC)

## Authorization (RBAC)

Every API endpoint requires specific permissions:

```
POST /v1/decisions    → decisions:write
GET  /v1/policies     → policies:read
POST /v1/policies     → policies:write
POST /v1/escalations/:id/decide → escalations:write
GET  /v1/audit        → audit:read
```

Roles map to permission sets:

| Role | Permissions |
|------|-------------|
| OWNER | All |
| ADMIN | All except billing |
| POLICY_MANAGER | policies:*, decisions:read, agents:*, models:* |
| REVIEWER | escalations:*, decisions:read, audit:read |
| VIEWER | *:read only |

## Multi-Tenancy Isolation

### Row-Level Security
Every database query is scoped to the authenticated organization:

```typescript
// Tenant isolation middleware
app.use('/v1/*', tenantIsolationMiddleware);

// All queries include organizationId
const decisions = await db.decision.findMany({
  where: { organizationId: req.organizationId },
});
```

### Per-Tenant Encryption
Each organization can have dedicated encryption keys for sensitive data fields.

### Data Residency
Organization metadata includes `dataRegion` for compliance with data residency requirements (GDPR, etc.).

## Rate Limiting

| Scope | Limit | Purpose |
|-------|-------|---------|
| Global (authenticated) | 1,000 req/min | Prevent abuse |
| Public endpoints | 60 req/min | Brute-force protection |

Rate limiting is disabled in test environments.

## Network Security

### SSRF Protection
Webhook URLs are validated against blocked hosts:
- Private IP ranges (10.x, 172.16-31.x, 192.168.x)
- Localhost and loopback (127.0.0.1, ::1)
- Link-local (169.254.x)
- Cloud metadata services (169.254.169.254)

### CORS
Restricted to configured origins:
```
CORS_ALLOWED_ORIGINS=https://dashboard.aegl.io,https://app.aegl.io
```

### TLS
All production traffic uses TLS 1.2+. The SDK-first architecture means no TLS termination or man-in-the-middle — the application makes direct HTTPS calls.

## Input Validation

### Zod Schema Validation
Every API endpoint validates input with Zod schemas:
```typescript
const DecisionRequestSchema = z.object({
  action_type: z.string().min(1).max(255),
  action_payload: z.record(z.unknown()),
  context: z.record(z.unknown()).optional(),
  agent_id: z.string(),
});
```

### ReDoS Mitigation
Regex patterns in policy rules are limited:
- Pattern length: max 200 characters
- Input string length: max 10,000 characters
- Invalid regex returns FAIL (not exception)

## Cryptographic Security

### Hash Chain
- SHA-256 for audit log hash chain
- Deterministic serialization (sorted keys) for reproducibility
- Serializable transaction isolation for atomicity

### API Keys
- SHA-256 hashing with configurable salt
- Keys are never logged or exposed in responses

### Webhook Signatures
- HMAC-SHA256 signing of webhook payloads
- Secrets are looked up at delivery time (not stored in queue)
- Timing-safe comparison for signature verification

## Graceful Shutdown

The API server handles SIGTERM/SIGINT:
1. Stop accepting new connections
2. Wait for in-flight requests to complete
3. Stop background workers
4. Disconnect database
5. Exit cleanly

This prevents data loss during deployments and restarts.
