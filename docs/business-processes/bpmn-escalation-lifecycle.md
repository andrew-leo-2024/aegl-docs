---
sidebar_position: 3
title: "BP-002: Escalation Lifecycle"
description: "BPMN — Human-in-the-loop escalation from creation to resolution"
---

# BP-002: Escalation Lifecycle

**Process ID:** BP-002
**Type:** Asynchronous with human-in-the-loop
**SLA:** 24 hours from creation to resolution
**Trigger:** Decision outcome = ESCALATED
**Owner:** Escalation subsystem (API + BullMQ workers)
**Source:** `apps/api/src/routes/escalations.ts`, `apps/api/src/workers/escalation-sla.ts`

## BPMN Diagram

```mermaid
flowchart TD
    subgraph PIPELINE["Pool: Decision Pipeline"]
        P_START(["O"]) --> P1["Decision outcome = ESCALATED"]
        P1 --> P2["Create Escalation\nstatus: PENDING\nsla: now + 24h"]
        P2 --> P3["Queue webhook\nevent: decision.escalated"]
    end

    P3 --> R_START

    subgraph REVIEW["Pool: Human Review"]
        R_START["GET /v1/escalations\n?status=PENDING\nSorted: priority desc, sla_deadline"] --> R2["Review escalation details\naction, payload, policies, SLA countdown"]
        R2 --> R3["Review original decision context\npolicy evals, agent info"]
        R3 --> GW{"Decision Gateway"}
        GW -->|"APPROVE"| RESOLVE["POST /v1/escalations/id/decide\noutcome, rationale, reviewer_id"]
        GW -->|"DENY"| RESOLVE
    end

    RESOLVE --> TX_START

    subgraph RESOLUTION["Pool: Resolution Processing"]
        subgraph TX["Atomic Resolution (Prisma Transaction)"]
            TX_START["BEGIN TRANSACTION"] --> TX1["Create EscalationDecision\nreviewer, rationale"]
            TX_START --> TX2["Update Escalation\nstatus = APPROVED/DENIED\nresolvedAt"]
            TX_START --> TX3["Update Decision\noutcome = PERMITTED/DENIED"]
            TX1 --> COMMIT["COMMIT TRANSACTION"]
            TX2 --> COMMIT
            TX3 --> COMMIT
        end
        COMMIT --> POST1["Queue webhook:\nescalation.resolved"]
        POST1 --> POST2["Structured log:\nescalationId, outcome, reviewer"]
        POST2 --> R_END(["END"])
    end

    subgraph SLA["Pool: SLA Timeout Worker (BullMQ — every 5 min)"]
        SLA_START(["Timer 5min"]) --> SLA1["Query: status IN PENDING, IN_REVIEW\nAND sla < now"]
        SLA1 --> SLA_GW{"Any found?"}
        SLA_GW -->|"None"| SLA_END(["END"])
        SLA_GW -->|"Found"| SLA_TX["BEGIN TRANSACTION\nUpdate Escalation status = TIMEOUT\nUpdate Decision outcome = TIMEOUT_DENIED\nCOMMIT"]
        SLA_TX --> SLA_WH["Queue webhook:\ndecision.timeout"]
        SLA_WH --> SLA_END2(["END"])
    end
```

## State Machine

```mermaid
stateDiagram-v2
    [*] --> PENDING: create
    PENDING --> IN_REVIEW: reviewer starts
    PENDING --> TIMEOUT: SLA expires
    IN_REVIEW --> APPROVED: reviewer approves
    IN_REVIEW --> DENIED: reviewer denies
    TIMEOUT --> [*]: outcome = DENIED
    APPROVED --> [*]: outcome = PERMITTED
    DENIED --> [*]: outcome = DENIED
```

## Process Steps

### Phase A: Escalation Creation (Automatic)
| Step | Actor | Action | Source |
|------|-------|--------|--------|
| A1 | Decision Pipeline | Decision outcome evaluated as ESCALATED | `routes/decisions.ts` |
| A2 | Prisma Transaction | Create Escalation record (status=PENDING, sla=now+24h) | `routes/decisions.ts` |
| A3 | Webhook Dispatcher | Queue `decision.escalated` event | `workers/webhook-dispatcher.ts` |

### Phase B: Human Review (Manual)
| Step | Actor | Action | Source |
|------|-------|--------|--------|
| B1 | Reviewer | List pending escalations (sorted by priority + SLA) | `routes/escalations.ts` |
| B2 | Reviewer | Inspect escalation detail (original decision, policies, context) | `routes/escalations.ts` |
| B3 | Reviewer | Submit decision (APPROVED/DENIED + written rationale) | `routes/escalations.ts` |

### Phase C: Resolution (Automatic)
| Step | Actor | Action | Source |
|------|-------|--------|--------|
| C1 | API | Validate reviewer exists in organization | `routes/escalations.ts` |
| C2 | API | Verify escalation is PENDING or IN_REVIEW (not already resolved) | `routes/escalations.ts` |
| C3 | Prisma Transaction | Create EscalationDecision + Update Escalation status + Update Decision outcome | `routes/escalations.ts` |
| C4 | Webhook Dispatcher | Queue `escalation.resolved` event | `workers/webhook-dispatcher.ts` |

### Phase D: SLA Timeout (Automatic — Fail-Closed)
| Step | Actor | Action | Source |
|------|-------|--------|--------|
| D1 | BullMQ Worker | Run every 5 minutes | `workers/escalation-sla.ts` |
| D2 | Worker | Query escalations where status IN (PENDING, IN_REVIEW) AND slaDeadline &lt; now | `workers/escalation-sla.ts` |
| D3 | Prisma Transaction | Set escalation status=TIMEOUT, decision outcome=TIMEOUT_DENIED | `workers/escalation-sla.ts` |
| D4 | Webhook Dispatcher | Queue `decision.timeout` event | `workers/escalation-sla.ts` |

## Business Rules

1. **SLA Duration**: 24 hours from escalation creation (configurable)
2. **Fail-Closed**: If SLA expires without review, decision is DENIED
3. **Single Resolution**: An escalation can only be resolved once (409 if already resolved)
4. **Reviewer Validation**: Reviewer must belong to same organization as escalation
5. **Rationale Required**: Written rationale is mandatory (1-5000 characters)
6. **Priority Ordering**: Escalations sorted by priority (desc) then SLA deadline (asc — oldest first)
7. **Webhook Events**: `decision.escalated`, `escalation.resolved`, `decision.timeout`
