---
sidebar_position: 7
title: Escalations
description: Human-in-the-loop review endpoints
---

# Escalations API

Manage escalated decisions that require human review.

## GET /v1/escalations

List escalations with filtering.

**Permission required**: `escalations:read`

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | `PENDING`, `APPROVED`, `DENIED`, `EXPIRED` |
| `priority` | string | `CRITICAL`, `HIGH`, `MEDIUM`, `LOW` |
| `page` | number | Page number |
| `limit` | number | Results per page |

### Response

```json
{
  "data": [
    {
      "id": "esc_abc123",
      "decision_id": "dec_xyz789",
      "reason": "Loans over $200K require senior reviewer approval",
      "status": "PENDING",
      "priority": "HIGH",
      "sla_deadline": "2026-03-01T16:00:00Z",
      "created_at": "2026-03-01T12:00:00Z"
    }
  ],
  "total": 7,
  "page": 1,
  "limit": 50
}
```

---

## GET /v1/escalations/:id

Get escalation detail with original decision and reviewer decisions.

**Permission required**: `escalations:read`

### Response

```json
{
  "id": "esc_abc123",
  "decision_id": "dec_xyz789",
  "reason": "Loans over $200K require senior reviewer approval",
  "status": "PENDING",
  "priority": "HIGH",
  "sla_deadline": "2026-03-01T16:00:00Z",
  "original_decision": {
    "id": "dec_xyz789",
    "action_type": "approve_loan",
    "action_payload": { "amount": 350000 },
    "outcome": "ESCALATED"
  },
  "reviewer_decisions": [],
  "created_at": "2026-03-01T12:00:00Z"
}
```

---

## POST /v1/escalations/:id/decide

Submit a human reviewer's decision on an escalation.

**Permission required**: `escalations:write`

### Request

```json
{
  "decision": "APPROVED",
  "rationale": "Verified borrower income supports this loan amount"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `decision` | string | Yes | `APPROVED` or `DENIED` |
| `rationale` | string | Yes | Explanation for the decision |

### Response

```json
{
  "id": "esc_abc123",
  "status": "APPROVED",
  "resolved_by": "user_reviewer1",
  "resolved_at": "2026-03-01T14:30:00Z",
  "original_decision": {
    "id": "dec_xyz789",
    "outcome": "PERMITTED"
  }
}
```

### Side Effects

When an escalation is resolved:
1. The original decision's outcome is updated (ESCALATED → PERMITTED or DENIED)
2. An audit log entry records the reviewer's decision
3. Webhooks with `escalation.resolved` subscription are triggered
