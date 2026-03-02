---
sidebar_position: 2
title: "BP-001: Decision Pipeline"
description: "BPMN — End-to-end AI decision governance pipeline (<10ms)"
---

# BP-001: Decision Pipeline

**Process ID:** BP-001
**Type:** Real-time, synchronous
**SLA:** &lt; 10ms end-to-end
**Trigger:** SDK calls `POST /v1/decisions`
**Owner:** API Server
**Source:** `apps/api/src/routes/decisions.ts`

## BPMN Diagram

```mermaid
flowchart TD
    subgraph APP["Pool: AI Application"]
        A1([Start]) --> A2["AI Model generates recommendation"]
        A2 --> A3["App calls aegl.decide()"]
        A3 -->|HTTP POST| A4["Handle response"]
    end

    subgraph API["Pool: E-AEGL API"]
        subgraph L1["Lane: Request Handling — Layer 1: Interceptor"]
            B1["Parse & validate request body via Zod"] --> B2{"Valid?"}
            B2 -->|INVALID| B3["Return 400 validation error"]
            B2 -->|VALID| B4["Extract API key from Bearer token"]
            B4 --> B5{"Authenticated?"}
            B5 -->|AUTH FAIL| B6["Return 401 unauthorized"]
        end

        B5 -->|VALID + AUTHED| C1

        subgraph L2["Lane: Policy Evaluation — Layer 2: Policy Engine"]
            C1["Fetch active policies for organization"]
            C1 --> C2["Sort by priority — lower = first"]
            C2 --> C3["Build evaluation context from action_payload"]
            C3 --> C4["FOR EACH policy: evaluate rules against context, record result + latency_ms"]
            C4 --> C5["Combine results: DENY > ESCALATE > PERMIT"]
        end

        C5 --> D1

        subgraph L3["Lane: Gating — Layer 3: Action Gate"]
            D1["Fetch agent risk level if agent_id present"]
            D1 --> D2{"Agent Risk Level?"}
            D2 -->|HIGH| D3["Escalate marginals"]
            D2 -->|MEDIUM| D4["Use policy outcome"]
            D2 -->|LOW| D5["Permissive threshold"]
            D3 --> D6["Final outcome: PERMITTED | DENIED | ESCALATED"]
            D4 --> D6
            D5 --> D6
        end

        D6 --> E1

        subgraph L4["Lane: Persistence — Layer 4: Audit Logger"]
            E1["BEGIN TRANSACTION"]
            E1 --> E2["Create Decision record"]
            E1 --> E3["Create Policy Evaluations"]
            E1 --> E4["Create Escalation if ESCALATED"]
            E2 --> E5["Append AuditLog entry: SHA-256 contents + previous_hash, sequence_number++"]
            E3 --> E5
            E4 --> E5
            E5 --> E6["COMMIT TRANSACTION"]
        end

        E6 --> F1

        subgraph L5["Lane: Response"]
            F1["Build response JSON: decision_id, trace_id, outcome, evaluations, latency_ms"]
            F1 --> F2["Return HTTP 200"]
            F2 --> F3([End])
        end

        subgraph L6["Lane: Async Post-Processing — non-blocking"]
            G1["Queue webhook dispatch event to BullMQ"]
            G1 --> G2["Log structured decision entry"]
            G2 --> G3([End])
        end
    end

    A3 --> B1
    E6 --> G1
```

## Process Steps

| Step | Component | Action | Latency Budget | Fail Behavior |
|------|-----------|--------|---------------|---------------|
| 1 | Express middleware | Parse JSON body, validate with Zod schema | &lt; 0.5ms | 400 Bad Request |
| 2 | Auth middleware | Extract Bearer token, SHA-256 hash, DB lookup | &lt; 1ms | 401 Unauthorized |
| 3 | RBAC middleware | Check `decisions:write` permission | &lt; 0.5ms | 403 Forbidden |
| 4 | Route handler | Fetch active policies for organization | &lt; 1ms | 500 + fail-closed |
| 5 | Policy engine | Evaluate all rules against action_payload | &lt; 5ms | DENIED (fail-closed) |
| 6 | Action gate | Combine policy outcome + agent risk level | &lt; 0.5ms | DENIED (fail-closed) |
| 7 | Prisma transaction | Atomically write Decision + Evaluations + Escalation + AuditLog | &lt; 3ms | Transaction rollback |
| 8 | Response | Return JSON with outcome, evaluations, latency_ms | &lt; 0.5ms | — |
| 9 | Async | Queue webhook + structured log | Non-blocking | Retry via BullMQ |

## Inputs

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `actionType` | string | Yes | What the AI wants to do (e.g., `approve_loan`) |
| `actionPayload` | object | Yes | Parameters of the action (e.g., `{ amount: 250000 }`) |
| `context` | object | No | Additional context (user info, session, etc.) |
| `agentId` | string | No | ID of the AI agent making the request |
| `modelId` | string | No | ID of the AI model used |
| `userId` | string | No | End user associated with the action |

## Outputs

| Field | Type | Description |
|-------|------|-------------|
| `decision_id` | string | Unique decision identifier |
| `trace_id` | string | Trace ID for audit trail correlation |
| `outcome` | enum | `PERMITTED`, `DENIED`, or `ESCALATED` |
| `outcome_reason` | string | Human-readable explanation |
| `evaluations` | array | Per-policy evaluation results |
| `latency_ms` | number | Total processing time |
| `escalation_id` | string? | If escalated, the escalation ID |
| `sla_deadline` | string? | If escalated, the SLA deadline (24h from now) |

## Error Handling

| Error | HTTP Code | Behavior | Recovery |
|-------|-----------|----------|----------|
| Invalid request body | 400 | Return validation errors | Fix request |
| Missing/invalid API key | 401 | Reject immediately | Check credentials |
| Insufficient permissions | 403 | Reject immediately | Request access |
| Policy engine exception | 500 | DENIED (fail-closed) | Investigate logs |
| Database write failure | 500 | Transaction rollback, DENIED | Check DB health |
| Timeout (&gt; 30s) | 504 | Request canceled, DENIED | Investigate load |

## Policy Evaluation Logic

```
for each policy in activePolices (sorted by priority):
    for each rule in policy.rules:
        evaluate rule.field against rule.operator and rule.value
        using context[rule.field] from flattened action_payload + context

    if ANY rule evaluates to DENY  → policy result = DENY
    if ANY rule evaluates to ESCALATE → policy result = ESCALATE
    if ALL rules evaluate to PASS  → policy result = PERMIT
    if NO rules match              → policy result = SKIP

final outcome = first non-SKIP result in priority order
    DENY takes precedence over ESCALATE
    ESCALATE takes precedence over PERMIT
    if all SKIP → PERMITTED (no applicable policy)
```

## Latency Budget Allocation

```
Total budget: 10ms
├── Request parsing + validation:  0.5ms  (5%)
├── Authentication:                1.0ms  (10%)
├── Policy fetch:                  1.0ms  (10%)
├── Policy evaluation:             3.0ms  (30%) ← deterministic, no ML
├── Action gate:                   0.5ms  (5%)
├── Database transaction:          3.0ms  (30%)
├── Response serialization:        0.5ms  (5%)
└── Buffer:                        0.5ms  (5%)
```
