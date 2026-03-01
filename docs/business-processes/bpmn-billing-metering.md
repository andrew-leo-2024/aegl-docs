---
sidebar_position: 11
title: "BP-011: Billing & Metering"
description: "BPMN — Usage-based billing, plan limits, and Stripe integration"
---

# BP-011: Billing & Metering

**Process ID:** BP-011
**Type:** Continuous metering with monthly billing cycle
**Trigger:** Every decision increments usage counter
**Owner:** Billing subsystem
**Source:** `apps/api/src/billing/stripe-client.ts`, `apps/api/src/telemetry/metering.ts`

## BPMN Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Pool: Usage Metering (per decision)                                          │
│                                                                              │
│  (O)──→[Decision processed ]──→[Increment in-memory]──→(X) Flush         │
│        [successfully       ]   [counter for org     ]   threshold?          │
│                                                          │          │       │
│                                                    [Not yet]   [Threshold] │
│                                                          │     [reached  ] │
│                                                          ▼          │       │
│                                                    (O) END         ▼       │
│                                                            [Flush to DB:  ]│
│                                                            [Update usage  ]│
│                                                            [record for    ]│
│                                                            [billing period]│
│                                                            (O) END         │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ Pool: Billing Cycle (monthly)                                                │
│                                                                              │
│  ⏰──→[Period end trigger  ]──→[Calculate usage     ]──→(X) Plan type     │
│  1st  [1st of month        ]   [for completed period]    │              │   │
│  of                                                 [SelfHosted]   [Cloud] │
│  month                                                   │          │      │
│                                                          ▼          ▼      │
│                                                    [Skip billing] [Lookup ]│
│                                                    [(license-   ] [Stripe ]│
│                                                    [based)      ] [sub    ]│
│                                                    (O) END            │    │
│                                                                       ▼    │
│                                                              (X) Over limit?│
│                                                               │          │  │
│                                                          [Within]   [Over] │
│                                                          [plan  ]   [limit]│
│                                                               │          │  │
│                                                               ▼          ▼  │
│                                                        [No overage ] [Calc] │
│                                                        [charge     ] [over:]│
│                                                        (O) END      [usage]│
│                                                                      [  - ]│
│                                                                      [plan]│
│                                                                      [lim ]│
│                                                                        │   │
│                                                                        ▼   │
│                                                              [Report to ]  │
│                                                              [Stripe:   ]  │
│                                                              [overage × ]  │
│                                                              [$0.001    ]  │
│                                                              [per       ]  │
│                                                              [decision  ]  │
│                                                                   │        │
│                                                                   ▼        │
│                                                              [Stripe auto]│
│                                                              [charges on ]│
│                                                              [next cycle ]│
│                                                              (O) END      │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Plan Limits

| Plan | Monthly Decisions | Overage Price | Target Customer |
|------|------------------|---------------|-----------------|
| **TRIAL** | 1,000 | — | Evaluation |
| **STARTER** | 100,000 | $0.001/decision | Small teams |
| **ENTERPRISE** | 10,000,000 | $0.001/decision | Large organizations |
| **SELF_HOSTED** | Unlimited | License fee | Banks, defense |

## Billing Estimate Response

`GET /v1/org/usage`:

```json
{
  "period_start": "2026-03-01T00:00:00Z",
  "period_end": "2026-03-31T23:59:59Z",
  "decisions_total": 142857,
  "decisions_permitted": 128571,
  "decisions_denied": 10000,
  "decisions_escalated": 4286,
  "escalations_created": 4286,
  "escalations_resolved": 4100,
  "avg_latency_ms": 5,
  "billing_estimate": {
    "plan": "STARTER",
    "plan_limit": 100000,
    "current_usage": 142857,
    "overage_decisions": 42857,
    "overage_cost_usd": 42.86
  }
}
```

## Usage History

`GET /v1/org/usage/history?months=6` returns monthly breakdowns for trend analysis and capacity planning.
