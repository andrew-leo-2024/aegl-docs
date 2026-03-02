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

```mermaid
flowchart TD
    subgraph Pool1["Pool: Event Source"]
        A([Start]) --> B["Governance event occurs\n(decision created,\nescalation resolved, timeout)"]
        B --> C["Call dispatchWebhookEvent()\nwith event type and payload"]
        C --> D1([End: non-blocking])
    end

    C -.-> E

    subgraph Pool2["Pool: Webhook Dispatcher"]
        subgraph Lane1["Lane: Event Routing"]
            E["Query Webhook table\nWHERE org_id = org\nAND active = true\nAND events includes type"] --> F{Any active\nsubscribers?}
            F -- None subscribed --> G([End: no-op])
            F -- Subscribers found --> H["Generate metadata:\nidempotency_key = UUID\ntimestamp = now()"]
            H --> I["FOR EACH webhook:\nQueue BullMQ job\nattempts: 3\nbackoff: exponential\n5s / 25s / 125s"]
        end

        I --> J

        subgraph Lane2["Lane: Delivery Worker - BullMQ"]
            J["Dequeue job from queue"] --> K["Lookup webhook by webhookId"]
            K --> L{Still active?}
            L -- Inactive --> M["Skip delivery\nreturn: false"]
            M --> N1([End])
            L -- Active --> O["Sign payload:\nHMAC-SHA256 with secret"]
            O --> P["HTTP POST to webhook.url\nHeaders: X-AEGL-Signature,\nX-AEGL-Event, X-AEGL-Delivery\nTimeout: 10s"]
            P --> Q{Response?}
            Q -- "2xx: OK" --> R["Log: delivered\nreturn: true"]
            R --> S1([End])
            Q -- "Error / timeout" --> T["Throw error\n--> BullMQ retries"]
        end
    end
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
