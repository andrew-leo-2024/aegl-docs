---
sidebar_position: 3
title: Decisions
description: POST /v1/decisions — The core governance endpoint
---

# Decisions API

The Decisions API is the core of E-AEGL — submit an action proposal, receive a governed decision.

## POST /v1/decisions

Submit a decision request for policy evaluation and governance.

**Permission required**: `decisions:write`

### Request

```json
{
  "action_type": "approve_loan",
  "action_payload": {
    "amount": 250000,
    "borrower_credit_score": 720,
    "recommendation": "approve"
  },
  "context": {
    "department": "mortgage",
    "region": "US-WEST"
  },
  "agent_id": "agent_abc123",
  "user_id": "analyst-42",
  "model_id": "model_gpt4o"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `action_type` | string | Yes | The type of action being proposed |
| `action_payload` | object | Yes | The action data to evaluate against policies |
| `context` | object | No | Additional context for policy evaluation |
| `agent_id` | string | Yes | Registered agent performing the action |
| `user_id` | string | No | User who triggered the action |
| `model_id` | string | No | AI model that produced the recommendation |

### Response

```json
{
  "decision_id": "dec_abc123",
  "trace_id": "trace_abc123",
  "outcome": "PERMITTED",
  "outcome_reason": "All policies passed",
  "latency_ms": 4,
  "evaluations": [
    {
      "policy": "Credit Score Floor",
      "result": "PASS",
      "details": "credit_score 720 >= 580"
    },
    {
      "policy": "Loan Amount Limits",
      "result": "PASS",
      "details": "amount 250000 <= 500000"
    }
  ]
}
```

| Field | Type | Description |
|-------|------|-------------|
| `decision_id` | string | Unique decision identifier |
| `trace_id` | string | Trace ID for audit trail lookup |
| `outcome` | string | `PERMITTED`, `DENIED`, `ESCALATED`, or `TIMEOUT_DENIED` |
| `outcome_reason` | string | Human-readable explanation |
| `latency_ms` | number | Decision processing time in milliseconds |
| `evaluations` | array | Per-policy evaluation results |
| `escalation_id` | string | Present if outcome is ESCALATED |
| `sla_deadline` | string | Present if escalated — ISO 8601 deadline |

### Decision Pipeline

The request passes through the 4-layer pipeline:

1. **Validate** — Zod schema validation of request body
2. **Fetch policies** — Active policies for the organization, sorted by priority
3. **Evaluate** — Each policy evaluated against action payload:
   - STATIC/DYNAMIC FAIL → immediate DENY
   - THRESHOLD trigger → ESCALATE
   - All pass → PERMITTED
4. **Action Gate** — Combines policy results with agent risk level
5. **Write atomically** — Single Prisma transaction:
   - Decision record
   - PolicyEvaluation records (one per policy)
   - Escalation record (if ESCALATED)
   - AuditLog record (hash-chained)
6. **Return** — Response with latencyMs from high-precision timer

### Latency Target

The decision pipeline targets **< 10ms** end-to-end:
- Policy evaluation: < 5ms
- Database write: < 3ms
- Network overhead: < 2ms

---

## GET /v1/decisions

List decisions with filtering and pagination.

**Permission required**: `decisions:read`

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `outcome` | string | Filter by outcome |
| `action_type` | string | Filter by action type |
| `agent_id` | string | Filter by agent |
| `model_id` | string | Filter by model |
| `from` | string | Start date (ISO 8601) |
| `to` | string | End date (ISO 8601) |
| `page` | number | Page number (default: 1) |
| `limit` | number | Results per page (default: 50, max: 100) |

### Response

```json
{
  "data": [
    {
      "id": "dec_abc123",
      "trace_id": "trace_abc123",
      "action_type": "approve_loan",
      "outcome": "PERMITTED",
      "latency_ms": 4,
      "agent_id": "agent_abc123",
      "received_at": "2026-03-01T12:00:00Z"
    }
  ],
  "total": 1247,
  "page": 1,
  "limit": 50
}
```

---

## GET /v1/decisions/:id

Get a single decision with full details, including policy evaluations and escalation info.

**Permission required**: `decisions:read`

---

## POST /v1/decisions/:id/replay

Re-evaluate a historical decision against current policies without modifying the original record.

**Permission required**: `decisions:write`

### Response

Returns the same format as a regular decision response, showing what outcome the decision would receive under current policies.
