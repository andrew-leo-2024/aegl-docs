---
sidebar_position: 8
title: Audit
description: Hash-chained audit log endpoints
---

# Audit API

Query and verify the tamper-evident audit trail.

## GET /v1/audit

Query audit logs with filtering.

**Permission required**: `audit:read`

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `outcome` | string | Filter by decision outcome |
| `action_type` | string | Filter by action type |
| `from` | string | Start date (ISO 8601) |
| `to` | string | End date (ISO 8601) |
| `page` | number | Page number |
| `limit` | number | Results per page (max: 100) |

### Response

```json
{
  "data": [
    {
      "id": "audit_abc123",
      "trace_id": "trace_abc123",
      "action_type": "approve_loan",
      "outcome": "PERMITTED",
      "latency_ms": 4,
      "sequence_number": 1547,
      "hash": "a1b2c3d4...",
      "created_at": "2026-03-01T12:00:00Z"
    }
  ],
  "total": 15847,
  "page": 1,
  "limit": 50
}
```

---

## GET /v1/audit/integrity

Verify the integrity of the hash chain. Checks every block from genesis to the latest entry.

**Permission required**: `audit:read`

### Response (valid chain)

```json
{
  "valid": true,
  "total_blocks": 15847,
  "checked_at": "2026-03-01T12:00:00Z"
}
```

### Response (broken chain)

```json
{
  "valid": false,
  "total_blocks": 15847,
  "broken_at": 12453,
  "checked_at": "2026-03-01T12:00:00Z"
}
```

If `valid` is `false`, the chain was tampered with at the indicated block. This is a critical security event that should be investigated immediately.

---

## GET /v1/audit/:traceId

Get the full decision trace by trace ID. Includes the decision, all policy evaluations, and escalation details (if any).

**Permission required**: `audit:read`

### Response

```json
{
  "trace_id": "trace_abc123",
  "decision": {
    "id": "dec_abc123",
    "action_type": "approve_loan",
    "action_payload": { "amount": 350000 },
    "outcome": "ESCALATED",
    "latency_ms": 4,
    "received_at": "2026-03-01T12:00:00Z"
  },
  "policy_evaluations": [
    {
      "policy": "Credit Score Floor",
      "result": "PASS",
      "details": "credit_score 720 >= 580"
    },
    {
      "policy": "Loan Amount Limits",
      "result": "ESCALATE",
      "details": "amount 350000 > 200000"
    }
  ],
  "escalation": {
    "id": "esc_xyz789",
    "status": "PENDING",
    "priority": "HIGH",
    "sla_deadline": "2026-03-01T16:00:00Z"
  },
  "audit_log": {
    "sequence_number": 1547,
    "hash": "a1b2c3d4...",
    "previous_hash": "e5f6g7h8..."
  }
}
```
