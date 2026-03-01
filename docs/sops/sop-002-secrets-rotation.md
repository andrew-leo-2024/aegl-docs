---
sidebar_position: 3
title: "SOP-002: Secrets Rotation"
description: "Rotating API keys, JWT secrets, and encryption keys"
---

# SOP-002: Secrets Rotation

## Purpose
Regularly rotate cryptographic secrets to limit exposure from potential key compromise.

## Scope
All secrets used by E-AEGL: JWT_SECRET, API_KEY_SALT, ENCRYPTION_KEY, NEXTAUTH_SECRET, database credentials.

## Schedule

| Secret | Rotation Frequency | Downtime Required |
|--------|-------------------|-------------------|
| JWT_SECRET | Quarterly | Zero-downtime (dual-key) |
| API_KEY_SALT | Annual (breaks existing keys) | Coordinated |
| ENCRYPTION_KEY | Annual | Coordinated |
| Database password | Quarterly | Zero-downtime (create new user) |
| Webhook secrets | Per customer request | None |

## Prerequisites
- Access to secrets manager (AWS Secrets Manager or `.env` on self-hosted)
- Maintenance window communicated (for breaking rotations)
- Backup of current secrets

## Procedure

### Rotate JWT_SECRET (Zero-Downtime)

1. **Generate new secret**:
   ```bash
   openssl rand -hex 32
   ```
2. **Update in secrets manager** — Set new value
3. **Deploy API with new secret** — Rolling deployment
4. **Existing tokens** — Will expire naturally (short-lived)
5. **Dashboard sessions** — Users will need to re-login

### Rotate API_KEY_SALT (Breaking Change)

:::caution
Changing API_KEY_SALT invalidates ALL existing API keys. Coordinate with customers.
:::

1. **Notify all customers** — 7 days advance notice
2. **Generate new salt**: `openssl rand -hex 16`
3. **Schedule maintenance window**
4. **Update salt in secrets manager**
5. **Regenerate API keys** for all organizations
6. **Distribute new keys** to customers
7. **Deploy with new salt**
8. **Verify** customers can authenticate with new keys

### Rotate ENCRYPTION_KEY

:::caution
Changing ENCRYPTION_KEY requires re-encrypting tenant data.
:::

1. **Generate new key**: `openssl rand -hex 32`
2. **Run re-encryption migration** (offline)
3. **Update key in secrets manager**
4. **Deploy with new key**
5. **Verify** — Test tenant data access

### Rotate Database Password

1. **Create new PostgreSQL user** with same permissions
2. **Update connection string** in secrets manager
3. **Deploy API** — Connections switch to new credentials
4. **Verify** — Check database connectivity
5. **Drop old user** after confirming no connections remain

## Verification
- API health check passes: `curl /health/ready`
- Test API key authentication works
- Test decision submission returns valid response
- Dashboard login works
- Audit chain integrity verified

## Rollback
- Revert to previous secret value in secrets manager
- Redeploy API service
- If API_KEY_SALT was rotated: restore old salt and old key hashes from backup
