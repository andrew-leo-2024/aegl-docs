---
sidebar_position: 4
title: Action Gate
description: The final decision gate — combining policy results with risk assessment
---

# Action Gate

The Action Gate is Layer 3 of the pipeline. It combines policy evaluation results with agent risk assessment to produce the final decision outcome.

## Decision Hierarchy

The gate enforces a strict outcome hierarchy:

```
DENIED > ESCALATED > PERMITTED
```

This means:
- A DENY from any policy cannot be overridden
- An ESCALATE can only be overridden by a DENY
- PERMITTED is the default only when nothing else triggers

## Gate Logic

```mermaid
flowchart TD
    PR["Policy Results"] --> Q1{"Any policy DENIED?"}
    Q1 -->|"YES"| DENIED["Outcome: DENIED"]
    Q1 -->|"NO"| Q2{"Any policy ESCALATED?"}
    Q2 -->|"YES"| ESC["Outcome: ESCALATED"]
    Q2 -->|"NO"| Q3{"Agent risk CRITICAL?"}
    Q3 -->|"YES"| ESC2["Outcome: ESCALATED (override)"]
    Q3 -->|"NO"| Q4{"Agent risk HIGH?"}
    Q4 -->|"YES"| ESC2
    Q4 -->|"NO"| PERMIT["Outcome: PERMITTED"]
```

## Risk Level Overrides

Even when all policies pass, the agent's risk level can trigger escalation:

| Risk Level | Behavior |
|-----------|----------|
| LOW | No override — policies determine outcome |
| MEDIUM | No override — policies determine outcome |
| HIGH | PERMITTED → ESCALATED |
| CRITICAL | All outcomes → ESCALATED (except DENIED) |

This ensures that high-risk agents always have human oversight, regardless of policy rules.

## Fail-Closed Default

If the gate encounters any unexpected condition:
- Missing policy results → DENIED
- Unknown risk level → DENIED
- Exception during evaluation → DENIED

The gate never produces PERMITTED under uncertainty.
