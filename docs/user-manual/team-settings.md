---
sidebar_position: 8
title: Team & Settings
description: Managing your organization, team members, and API keys
---

# Team & Settings

## Organization Settings

View and update your organization's configuration:

```bash
# Get organization settings
curl -H "Authorization: Bearer $AEGL_API_KEY" \
  "https://api.aegl.io/v1/org"

# Update settings
curl -X PUT https://api.aegl.io/v1/org \
  -H "Authorization: Bearer $AEGL_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Acme Financial Corp",
    "settings": {
      "default_sla_hours": 4,
      "fail_open": false
    }
  }'
```

## Team Roles

| Role | Permissions |
|------|-------------|
| **OWNER** | Full access: billing, team management, all resources |
| **ADMIN** | All features except billing and ownership transfer |
| **POLICY_MANAGER** | Create/edit policies, view decisions, manage agents |
| **REVIEWER** | Resolve escalations, view audit logs, view decisions |
| **VIEWER** | Read-only access to dashboard, decisions, and audit logs |

### Managing Team Members

In the dashboard, navigate to **Settings > Team** to:
- Invite new users by email
- Assign and change roles
- Remove team members

## API Keys

API keys authenticate SDK and CLI requests.

### Key Properties

- **Permissions**: Scoped to specific operations (decisions:write, policies:read, etc.)
- **Expiration**: Optional expiration date
- **Revocation**: Instantly revocable

### Security

- API keys are **hashed with SHA-256** before storage — the plain-text key is never stored
- Keys include the organization context — they cannot access other tenants' data
- `lastUsedAt` is tracked for security monitoring

## Organization Metrics

View dashboard metrics:

```bash
curl -H "Authorization: Bearer $AEGL_API_KEY" \
  "https://api.aegl.io/v1/org/metrics"
```

Response:
```json
{
  "period": "24h",
  "decisions": {
    "total": 1247,
    "by_outcome": {
      "PERMITTED": 892,
      "DENIED": 287,
      "ESCALATED": 68
    }
  },
  "latency": {
    "avg_ms": 4,
    "max_ms": 12
  },
  "escalations_pending": 7,
  "active_agents": 4,
  "active_policies": 6
}
```

## Usage

View usage for the current billing period:

```bash
curl -H "Authorization: Bearer $AEGL_API_KEY" \
  "https://api.aegl.io/v1/org/usage"
```
