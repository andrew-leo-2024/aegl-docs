---
sidebar_position: 4
title: Policies
description: CRUD operations for governance policies
---

# Policies API

Policies define the deterministic rules that govern AI decisions.

## POST /v1/policies

Create a new policy.

**Permission required**: `policies:write`

### Request

```json
{
  "name": "Loan Amount Limits",
  "description": "Escalate high-value loans for senior review",
  "type": "THRESHOLD",
  "priority": 10,
  "rules": [
    {
      "field": "action_payload.amount",
      "operator": "gt",
      "value": 200000,
      "action": "ESCALATE",
      "reason": "Loans over $200K require senior reviewer approval"
    }
  ],
  "scope": {
    "action_types": ["approve_loan"],
    "agent_ids": ["agent_loan_proc"]
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Policy name (1-255 chars) |
| `description` | string | No | Policy description |
| `type` | string | Yes | `STATIC`, `DYNAMIC`, or `THRESHOLD` |
| `priority` | number | Yes | 0–10000 (lower = higher priority) |
| `rules` | array | Yes | At least one rule required |
| `scope` | object | No | Restrict to specific action types or agents |

### Rule Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `field` | string | Yes | Dot-notation field path (e.g., `action_payload.amount`) |
| `operator` | string | Yes | Comparison operator |
| `value` | any | Yes | Value to compare against |
| `action` | string | No | `DENY` or `ESCALATE` (default: DENY) |
| `reason` | string | No | Human-readable reason for the rule |

### Response

```json
{
  "id": "pol_abc123",
  "name": "Loan Amount Limits",
  "type": "THRESHOLD",
  "priority": 10,
  "version": 1,
  "active": true,
  "rules": [...],
  "created_at": "2026-03-01T12:00:00Z"
}
```

---

## GET /v1/policies

List active policies with pagination.

**Permission required**: `policies:read`

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `active` | boolean | Filter by active status (default: true) |
| `type` | string | Filter by type |
| `page` | number | Page number |
| `limit` | number | Results per page |

---

## GET /v1/policies/:id

Get policy detail including version history.

**Permission required**: `policies:read`

### Response

```json
{
  "id": "pol_abc123",
  "name": "Loan Amount Limits",
  "type": "THRESHOLD",
  "priority": 10,
  "version": 3,
  "active": true,
  "rules": [...],
  "versions": [
    { "version": 1, "created_at": "2026-01-15T10:00:00Z" },
    { "version": 2, "created_at": "2026-02-01T14:00:00Z" },
    { "version": 3, "created_at": "2026-03-01T09:00:00Z" }
  ]
}
```

---

## PUT /v1/policies/:id

Update a policy. This creates a **new version** — the previous version is deactivated and preserved in the audit trail.

**Permission required**: `policies:write`

### Request

```json
{
  "name": "Loan Amount Limits (Updated)",
  "rules": [
    {
      "field": "action_payload.amount",
      "operator": "gt",
      "value": 150000,
      "action": "ESCALATE",
      "reason": "Threshold lowered — loans over $150K now require approval"
    }
  ]
}
```

---

## DELETE /v1/policies/:id

Soft-delete (deactivate) a policy. The policy is preserved for audit trail integrity.

**Permission required**: `policies:write`

---

## POST /v1/policies/:id/simulate

Simulate a policy against a single context or batch of historical decisions.

**Permission required**: `policies:read`

### Single-Context Simulation

```json
{
  "action_type": "approve_loan",
  "context": {
    "action_payload": {
      "amount": 350000,
      "credit_score": 720
    }
  }
}
```

Response:
```json
{
  "outcome": "ESCALATED",
  "triggered_rules": [
    { "field": "action_payload.amount", "operator": "gt", "value": 200000 }
  ]
}
```

### Historical Batch Simulation

```json
{
  "date_range": {
    "from": "2026-01-01",
    "to": "2026-02-28"
  },
  "sample_size": 1000
}
```

Response:
```json
{
  "total_evaluated": 847,
  "would_have_permitted": 612,
  "would_have_denied": 180,
  "would_have_escalated": 55,
  "top_trigger_rules": [
    { "rule_index": 0, "trigger_count": 235 }
  ],
  "impacted_agents": [
    { "agent_id": "agent_abc", "count": 142 }
  ]
}
```
