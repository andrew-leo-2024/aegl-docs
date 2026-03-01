---
sidebar_position: 1
title: Decision Flow
description: End-to-end business process for AI decision governance
---

# Decision Flow

This document describes the complete business process from action proposal to governed outcome.

## Process Overview

```
┌────────────────────────────────────────────────────────────┐
│ 1. AI Agent generates recommendation                       │
│    (e.g., "approve loan for $250K")                        │
└──────────────────┬─────────────────────────────────────────┘
                   ▼
┌────────────────────────────────────────────────────────────┐
│ 2. Application calls aegl.decide()                         │
│    Passes: actionType, actionPayload, context              │
└──────────────────┬─────────────────────────────────────────┘
                   ▼
┌────────────────────────────────────────────────────────────┐
│ 3. E-AEGL API receives DecisionRequest                     │
│    - Validates request (Zod schema)                        │
│    - Authenticates API key (SHA-256 lookup)                 │
│    - Verifies agent is active                              │
│    - Starts precision timer                                │
└──────────────────┬─────────────────────────────────────────┘
                   ▼
┌────────────────────────────────────────────────────────────┐
│ 4. Policy Engine evaluates all active policies              │
│    - Sorted by priority (lower = higher priority)          │
│    - Each rule evaluated against action payload            │
│    - Results: PASS, FAIL, or ESCALATE per policy           │
└──────────────────┬─────────────────────────────────────────┘
                   ▼
┌────────────────────────────────────────────────────────────┐
│ 5. Action Gate determines final outcome                     │
│    - DENY > ESCALATE > PERMIT hierarchy                    │
│    - Agent risk level may override to ESCALATE             │
└──────────────────┬─────────────────────────────────────────┘
                   ▼
┌────────────────────────────────────────────────────────────┐
│ 6. Atomic write (single Prisma transaction)                 │
│    - Decision record                                       │
│    - PolicyEvaluation records                              │
│    - Escalation record (if ESCALATED)                      │
│    - AuditLog entry (hash-chained)                         │
└──────────────────┬─────────────────────────────────────────┘
                   ▼
┌────────────────────────────────────────────────────────────┐
│ 7. Response returned to SDK                                │
│    - outcome, evaluations, latencyMs                       │
│    - escalationId + slaDeadline (if escalated)             │
└──────────────────┬─────────────────────────────────────────┘
                   ▼
┌────────────────────────────────────────────────────────────┐
│ 8. Application acts on outcome                              │
│    - PERMITTED: execute the action                         │
│    - DENIED: block the action, log reason                  │
│    - ESCALATED: queue for human review                     │
└──────────────────┬─────────────────────────────────────────┘
                   ▼
┌────────────────────────────────────────────────────────────┐
│ 9. Webhooks dispatched (non-blocking)                       │
│    - decision.permitted / denied / escalated               │
│    - Slack, PagerDuty, email, custom integrations          │
└────────────────────────────────────────────────────────────┘
```

## Error Handling

At every step, failures result in fail-closed behavior:

| Failure Point | Behavior |
|--------------|----------|
| API unreachable | SDK returns DENIED (fail-closed) or uses local cache |
| Invalid API key | 401 error thrown (not caught by fail-closed) |
| Agent not found | Decision rejected with error |
| Policy evaluation error | DENIED (fail-closed) |
| Database write fails | Transaction rolls back, DENIED |
| Webhook dispatch fails | Non-blocking, retried 3 times |

## Latency Budget

| Step | Target | Typical |
|------|--------|---------|
| Request validation | < 0.5ms | 0.1ms |
| API key auth | < 1ms | 0.5ms |
| Policy fetch | < 1ms | 0.3ms |
| Policy evaluation | < 5ms | 1-3ms |
| Action gate | < 0.5ms | 0.1ms |
| Database write | < 3ms | 1-2ms |
| **Total** | **< 10ms** | **3-5ms** |
