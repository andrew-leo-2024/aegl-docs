---
sidebar_position: 7
title: Multi-Tenancy
description: Tenant isolation, per-tenant encryption, and data residency
---

# Multi-Tenancy

E-AEGL provides **provable data isolation** between tenants. A bank must never see another tenant's data, even in error conditions.

## Tenant Isolation Middleware

Every authenticated request passes through tenant isolation middleware:

```typescript
// Attached to all /v1/* routes
app.use('/v1/decisions', apiKeyAuth, tenantIsolationMiddleware, decisionsRouter);
app.use('/v1/policies', apiKeyAuth, tenantIsolationMiddleware, policiesRouter);
```

The middleware:
1. Validates `organizationId` from the authenticated API key
2. Looks up organization metadata (with 5-minute cache)
3. Attaches tenant context: `dataRegion`, `plan`, `encryptionKeyId`
4. Ensures all downstream queries are scoped to the organization

## Query Scoping

Every database query includes the organization filter:

```typescript
// Always scoped — no cross-tenant data leakage
const policies = await db.policy.findMany({
  where: {
    organizationId: req.organizationId,
    active: true,
  },
});
```

## Per-Tenant Encryption

Organizations can have dedicated encryption keys:

| Field | Description |
|-------|-------------|
| `encryptionKeyId` | AWS KMS key ID for envelope encryption |
| `keyRotatedAt` | Last key rotation timestamp |
| `algorithm` | Encryption algorithm (default: AES-256-GCM) |

Sensitive fields in action payloads can be encrypted at rest with tenant-specific keys.

## Data Residency

Each organization has a `dataRegion` property that can be used for:
- Routing requests to region-specific database instances
- Ensuring compliance with GDPR, data sovereignty laws
- Audit evidence for data residency requirements

## Cache Isolation

The organization metadata cache is keyed by `organizationId`:
- 5-minute TTL
- `invalidateOrgCache()` function for immediate cache clearing
- Cache includes: plan, data region, encryption key ID

## Plan Enforcement

The tenant context includes the organization's plan, enabling:
- Decision volume limits per billing period
- Feature gating based on plan tier
- Usage metering for Stripe billing
