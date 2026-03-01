---
sidebar_position: 7
title: "BP-007: Webhook Dispatch"
description: "BPMN — Asynchronous webhook delivery with HMAC signing and retry"
---

# BP-007: Webhook Dispatch

**Process ID:** BP-007
**Type:** Asynchronous queue-based delivery
**SLA:** Best-effort with 3 retries (5s, 25s, 125s backoff)
**Trigger:** Governance events (decisions, escalations, timeouts)
**Owner:** Webhook dispatcher worker
**Source:** `apps/api/src/workers/webhook-dispatcher.ts`

## BPMN Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Pool: Event Source (Decision route / Escalation route / SLA worker)           │
│                                                                              │
│  (O)──→[Governance event    ]──→[Call dispatch       ]──→(O) END            │
│        [occurs (decision    ]   [WebhookEvent()      ]   (non-blocking)     │
│        [created, escalation ]   [with event type     ]                       │
│        [resolved, timeout)  ]   [and payload data    ]                       │
│                                                                              │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ Pool: Webhook Dispatcher                                                     │
│                                                                              │
│ ┌─ Lane: Event Routing ─────────────────────────────────────────────────┐  │
│ │                                                                         │  │
│ │  [Query Webhook table    ]──→(X) Any active subscribers?               │  │
│ │  [WHERE org_id = org     ]    │                      │                 │  │
│ │  [AND active = true      ]    │                      │                 │  │
│ │  [AND events includes    ] [None subscribed]   [Subscribers found]     │  │
│ │  [current event type     ]    │                      │                 │  │
│ │                               ▼                      ▼                 │  │
│ │                          (O) END              [Generate metadata:]     │  │
│ │                          (no-op)              [idempotency_key = UUID] │  │
│ │                                               [timestamp = now()    ] │  │
│ │                                                      │                 │  │
│ │                                                      ▼                 │  │
│ │                                               [FOR EACH webhook:    ] │  │
│ │                                               [Queue BullMQ job     ] │  │
│ │                                               [attempts: 3          ] │  │
│ │                                               [backoff: exponential ] │  │
│ │                                               [(5s, 25s, 125s)      ] │  │
│ │                                                                         │  │
│ └─────────────────────────────────────────────────────────────────────────┘  │
│                                       │                                      │
│                                       ▼                                      │
│ ┌─ Lane: Delivery Worker (BullMQ) ──────────────────────────────────────┐  │
│ │                                                                         │  │
│ │  [Dequeue job           ]──→[Lookup webhook    ]──→(X) Still active?  │  │
│ │  [from queue            ]   [by webhookId      ]    │              │   │  │
│ │                                                [Inactive]    [Active]  │  │
│ │                                                     │            │     │  │
│ │                                                     ▼            ▼     │  │
│ │                                              [Skip delivery] [Sign   ] │  │
│ │                                              [return: false] [payload:] │  │
│ │                                              (O) END        [HMAC-   ] │  │
│ │                                                             [SHA256  ] │  │
│ │                                                             [with    ] │  │
│ │                                                             [secret  ] │  │
│ │                                                                  │     │  │
│ │                                                                  ▼     │  │
│ │                                                      [HTTP POST to   ] │  │
│ │                                                      [webhook.url    ] │  │
│ │                                                      [Headers:       ] │  │
│ │                                                      [ X-AEGL-       ] │  │
│ │                                                      [  Signature    ] │  │
│ │                                                      [ X-AEGL-Event  ] │  │
│ │                                                      [ X-AEGL-       ] │  │
│ │                                                      [  Delivery     ] │  │
│ │                                                      [Timeout: 10s   ] │  │
│ │                                                           │            │  │
│ │                                                           ▼            │  │
│ │                                                  (X) Response?         │  │
│ │                                                   │            │       │  │
│ │                                              [2xx: OK]   [Error/      │  │
│ │                                                   │       timeout]     │  │
│ │                                                   ▼            │       │  │
│ │                                            [Log: delivered]    ▼       │  │
│ │                                            [return: true  ] [Throw   ]│  │
│ │                                            (O) END         [error →  ]│  │
│ │                                                            [BullMQ   ]│  │
│ │                                                            [retries  ]│  │
│ │                                                                         │  │
│ └─────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Event Types

| Event | Trigger | Payload Fields |
|-------|---------|---------------|
| `decision.permitted` | Decision outcome = PERMITTED | decision_id, trace_id, action_type, agent_id |
| `decision.denied` | Decision outcome = DENIED | decision_id, trace_id, action_type, reason |
| `decision.escalated` | Decision outcome = ESCALATED | decision_id, trace_id, action_type, escalation_id, sla_deadline |
| `decision.timeout` | SLA worker times out escalation | decision_id, trace_id, escalation_id, sla_deadline |
| `escalation.resolved` | Reviewer submits decision | escalation_id, decision_id, reviewer_id, outcome, rationale |
| `policy.created` | New policy created | policy_id, name, version |
| `policy.updated` | Policy version updated | policy_id, name, old_version, new_version |
| `policy.deactivated` | Policy deactivated | policy_id, name |

## Payload Structure

```json
{
  "organizationId": "org_abc123",
  "event": "decision.denied",
  "data": {
    "decision_id": "dec_xyz789",
    "trace_id": "tr_abc123def456",
    "action_type": "approve_loan",
    "outcome": "DENIED",
    "outcome_reason": "Loan amount exceeds $500K maximum",
    "agent_id": "agent_loan_bot",
    "latency_ms": 4
  },
  "timestamp": "2026-03-01T12:00:00.000Z",
  "idempotency_key": "550e8400-e29b-41d4-a716-446655440000"
}
```

## Webhook Signature Verification (Client-Side)

```python
import hmac, hashlib

def verify_webhook(body: bytes, signature: str, secret: str) -> bool:
    expected = hmac.new(
        secret.encode(), body, hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(f"sha256={expected}", signature)

# Usage:
signature = request.headers["X-AEGL-Signature"]
is_valid = verify_webhook(request.body, signature, WEBHOOK_SECRET)
```

## Retry Strategy

| Attempt | Delay | Cumulative Wait |
|---------|-------|----------------|
| 1 (initial) | 0s | 0s |
| 2 (retry 1) | 5s | 5s |
| 3 (retry 2) | 25s | 30s |
| 4 (retry 3) | 125s | ~2.5 min |
| **Failed** | — | Permanently failed, logged |
