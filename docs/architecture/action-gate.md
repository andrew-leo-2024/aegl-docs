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

```
┌─────────────────────────────────────────────┐
│             Policy Results                   │
│                                              │
│  Any policy DENIED?                          │
│  ├── YES → Outcome: DENIED                  │
│  └── NO ↓                                   │
│                                              │
│  Any policy ESCALATED?                       │
│  ├── YES → Outcome: ESCALATED               │
│  └── NO ↓                                   │
│                                              │
│  Agent risk CRITICAL?                        │
│  ├── YES → Outcome: ESCALATED (override)    │
│  └── NO ↓                                   │
│                                              │
│  Agent risk HIGH?                            │
│  ├── YES → Outcome: ESCALATED (override)    │
│  └── NO ↓                                   │
│                                              │
│  Outcome: PERMITTED                          │
└─────────────────────────────────────────────┘
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
