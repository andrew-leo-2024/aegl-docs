---
sidebar_position: 10
title: Organization
description: Organization settings, metrics, and usage endpoints
---

# Organization API

Manage organization settings and view operational metrics.

## GET /v1/org

Get organization settings and resource counts.

**Permission required**: `org:read`

### Response

```json
{
  "id": "org_abc123",
  "name": "Acme Financial Corp",
  "slug": "acme-financial",
  "plan": "ENTERPRISE",
  "settings": {},
  "created_at": "2026-01-01T00:00:00Z",
  "updated_at": "2026-03-01T12:00:00Z",
  "counts": {
    "users": 12,
    "agents": 4,
    "policies": 8,
    "api_keys": 6
  }
}
```

---

## PUT /v1/org

Update organization settings.

**Permission required**: `org:write`

### Request

```json
{
  "name": "Acme Financial Corporation",
  "settings": {
    "default_sla_hours": 4,
    "fail_open": false
  }
}
```

---

## GET /v1/org/metrics

Get dashboard metrics for the last 24 hours.

**Permission required**: `org:read`

### Response

```json
{
  "period": "24h",
  "since": "2026-02-28T12:00:00Z",
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

---

## GET /v1/org/usage

Get usage statistics for the current billing period (calendar month).

**Permission required**: `org:read`

### Response

```json
{
  "period_start": "2026-03-01T00:00:00Z",
  "period_end": "2026-03-31T23:59:59Z",
  "decisions_total": 47832,
  "decisions_permitted": 35421,
  "decisions_denied": 9847,
  "decisions_escalated": 2564,
  "decisions_timeout": 0,
  "escalations_created": 2564,
  "escalations_resolved": 2102,
  "avg_latency_ms": 4,
  "billing_estimate": {
    "plan": "ENTERPRISE",
    "plan_limit": 10000000,
    "current_usage": 47832,
    "overage": 0,
    "estimated_cost_cents": 0
  }
}
```
