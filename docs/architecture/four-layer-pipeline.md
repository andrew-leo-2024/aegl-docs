---
sidebar_position: 2
title: Four-Layer Pipeline
description: The decision processing pipeline — from request to audit entry
---

# Four-Layer Pipeline

Every decision request passes through four layers in sequence. The entire pipeline completes in under 10ms.

## Layer 1: Decision Boundary Interceptor

**Latency budget**: < 2ms

The interceptor captures the action proposal with full context:

```json
{
  "action_type": "approve_loan",
  "action_payload": { "amount": 250000, "credit_score": 720 },
  "context": { "department": "mortgage" },
  "agent_id": "agent_abc123",
  "user_id": "analyst-42",
  "model_id": "model_gpt4o"
}
```

This layer:
1. Validates the request body with Zod schema
2. Starts a high-precision timer (`process.hrtime.bigint()`)
3. Looks up the agent and verifies it is active
4. Passes the validated request to Layer 2

## Layer 2: Policy Engine

**Latency budget**: < 5ms

The policy engine evaluates all active policies in priority order:

```mermaid
flowchart TD
    A["Fetch active policies\n(sorted by priority ASC)"] --> B{"Check scope\naction_type, agent_id match?"}
    B -->|"Out of scope"| SKIP["Skip policy"]
    B -->|"In scope"| C["Evaluate each rule"]
    C --> D["Resolve field (dot-notation path)"]
    D --> E["Apply operator (gt, lt, eq, in, etc.)"]
    E --> F{"Rule result"}
    F -->|"STATIC FAIL"| DENY["DENY (stop)"]
    F -->|"DYNAMIC FAIL"| DENY
    F -->|"THRESHOLD trigger"| ESC["Mark ESCALATE (continue)"]
    F -->|"All rules PASS"| PASS["PASS (continue)"]
```

Key properties:
- **Deterministic**: Same input always produces same output
- **No ML classifiers**: Rules evaluate in microseconds
- **Fail-closed**: If evaluation throws, return DENY
- **Priority ordering**: Lower priority number evaluates first

## Layer 3: Action Gate

**Latency budget**: < 1ms

The action gate combines policy results with agent risk assessment:

```mermaid
flowchart TD
    IN["Policy Engine Result +\nAgent Risk Level"] --> D1{"Any policy DENIED?"}
    D1 -->|"YES"| DENIED["DENIED"]
    D1 -->|"NO"| D2{"Any policy ESCALATED?"}
    D2 -->|"YES"| ESCALATED["ESCALATED"]
    D2 -->|"NO"| D3{"Agent risk CRITICAL?"}
    D3 -->|"YES"| ESCALATED
    D3 -->|"NO"| D4{"Agent risk HIGH?"}
    D4 -->|"YES"| ESCALATED
    D4 -->|"NO"| PERMITTED["PERMITTED"]
```

The gate enforces a strict hierarchy: DENIED > ESCALATED > PERMITTED.

## Layer 4: Audit Logger

**Latency budget**: < 2ms

Every decision is recorded in the append-only, hash-chained audit log:

```mermaid
flowchart TD
    S1["1. Get previous block hash\n(or genesis hash)"] --> S2["2. Serialize decision data\n(deterministic JSON, sorted keys)"]
    S2 --> S3["3. Compute SHA-256\n(data + previousHash + sequenceNumber)"]
    S3 --> S4["4. Write atomically\n(Prisma transaction)"]
    S4 --> R1["Decision record"]
    S4 --> R2["PolicyEvaluation records"]
    S4 --> R3["Escalation record\n(if ESCALATED)"]
    S4 --> R4["AuditLog entry\n(hash-chained)"]
```

The transaction uses **serializable isolation** to prevent race conditions under concurrent writes.

## Atomicity

All four layers complete in a single Prisma `$transaction`. If any layer fails, the entire operation rolls back. No partial writes. No orphaned records.

```typescript
await db.$transaction(async (tx) => {
  // Create Decision
  // Create PolicyEvaluation records
  // Create Escalation (if needed)
  // Create AuditLog entry (hash-chained)
}, {
  isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
});
```

## Latency Measurements

Measured with `process.hrtime.bigint()` for sub-millisecond precision:

| Metric | Target | Typical |
|--------|--------|---------|
| Full pipeline | < 10ms | 3–5ms |
| Policy evaluation | < 5ms | 1–3ms |
| Database write | < 3ms | 1–2ms |
| Network overhead | < 2ms | < 1ms |

Benchmark results (1000 decisions, 5 policies):
- **p50**: 3ms
- **p95**: 7ms
- **p99**: 11ms
