---
sidebar_position: 4
title: Stakeholder Map
description: Who uses E-AEGL and how they interact with it
---

# Stakeholder Map

## Personas

### 1. AI/ML Engineer (Builder)
**Goal:** Integrate governance into AI applications with minimal friction.

| Touchpoint | Feature |
|-----------|---------|
| SDK installation | `npm install @aegl/sdk` / `pip install aegl` |
| Code integration | `aegl.decide()` — 5 lines of code |
| Framework wrappers | OpenAI, Anthropic, LangChain, CrewAI middleware |
| Policy testing | CLI `aegl policies test` with mock payloads |
| Local development | Docker Compose for full stack locally |

**Key metric:** Time to first governed decision &lt; 15 minutes.

### 2. Compliance Officer (Governance)
**Goal:** Ensure all AI decisions are auditable, compliant, and explainable.

| Touchpoint | Feature |
|-----------|---------|
| Dashboard overview | Real-time decision metrics and governance rates |
| Audit log viewer | Searchable, filterable, hash-chain verified |
| Compliance reports | SOC 2 evidence, regulatory exports (CSV/PDF) |
| Policy review | Visual policy editor, version history |
| Regulatory export | `aegl audit export --format pdf --regulation occ-sr-11-7` |

**Key metric:** Audit preparation time reduced by 80%.

### 3. Risk Manager / MRM (Oversight)
**Goal:** Validate that AI models operate within risk boundaries.

| Touchpoint | Feature |
|-----------|---------|
| Policy creation | Define risk thresholds, escalation triggers |
| Model registry | Track approved models, risk ratings |
| Decision analytics | Outcome distributions, denial patterns |
| Escalation review | Approve/deny escalated high-risk decisions |
| Agent monitoring | Per-agent decision history and risk profiles |

**Key metric:** 100% of AI decisions governed by policy.

### 4. Security Engineer (Protection)
**Goal:** Ensure data isolation, access control, and system integrity.

| Touchpoint | Feature |
|-----------|---------|
| API key management | Create, rotate, revoke API keys |
| RBAC configuration | Role-based access for team members |
| Tenant isolation | Per-tenant encryption, row-level security |
| Audit verification | Hash chain integrity checks |
| Self-hosted deployment | On-premises deployment, no data egress |

**Key metric:** Zero unauthorized data access incidents.

### 5. Platform Engineer / DevOps (Operations)
**Goal:** Deploy, monitor, and maintain the E-AEGL platform.

| Touchpoint | Feature |
|-----------|---------|
| Docker Compose | Self-hosted deployment |
| Terraform | AWS infrastructure provisioning |
| Kubernetes | Production orchestration |
| Monitoring | Prometheus metrics, OpenTelemetry traces |
| Disaster recovery | Backup scripts, restore procedures, runbooks |

**Key metric:** 99.95% uptime SLA.

### 6. Executive / CRO (Strategy)
**Goal:** Demonstrate AI governance to regulators and board.

| Touchpoint | Feature |
|-----------|---------|
| Compliance dashboard | High-level governance posture |
| SOC 2 reports | Automated evidence collection |
| Cost analytics | Per-decision cost, ROI calculations |
| Board reporting | Exportable governance metrics |

**Key metric:** Regulatory examination passed with zero findings.

## Interaction Map

```
                         ┌─────────────┐
                         │  Regulator  │
                         │  (External) │
                         └──────┬──────┘
                                │ Audit request
                                ▼
┌───────────┐  Policy    ┌─────────────┐  Review    ┌──────────────┐
│   Risk    │──────────→│  Compliance │←──────────│   Executive  │
│  Manager  │  creation  │   Officer   │  reports   │    / CRO     │
└─────┬─────┘            └──────┬──────┘            └──────────────┘
      │                         │
      │ Escalation review       │ Dashboard + Export
      ▼                         ▼
┌─────────────────────────────────────────────────────────────┐
│                      E-AEGL Platform                         │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Policy   │  │ Decision │  │  Audit   │  │Escalation│   │
│  │ Engine   │  │ Pipeline │  │  Trail   │  │  Queue   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                                                              │
└─────────────────┬───────────────────────────┬────────────────┘
                  │                           │
                  │ SDK / API                 │ Deploy / Monitor
                  ▼                           ▼
          ┌───────────┐              ┌──────────────┐
          │  AI / ML  │              │   Platform   │
          │ Engineer  │              │  Engineer    │
          └─────┬─────┘              └──────┬───────┘
                │ Integration                │ Infrastructure
                ▼                            ▼
          ┌───────────┐              ┌──────────────┐
          │  Security │              │   Security   │
          │ Engineer  │              │  Engineer    │
          └───────────┘              └──────────────┘
               Access control           Audit verification
```

## Workflow by Persona

### Day-in-the-Life: AI Engineer
1. Installs SDK in their project
2. Wraps AI decision points with `aegl.decide()`
3. Writes policy-as-code YAML for their use case
4. Runs `aegl policies apply` to deploy policy
5. Tests with mock payloads to verify governance behavior
6. Monitors decisions in dashboard during deployment

### Day-in-the-Life: Compliance Officer
1. Opens dashboard overview — checks governance rates
2. Reviews escalation queue — resolves pending items
3. Filters audit log by date range and regulation
4. Exports compliance report for quarterly review
5. Verifies hash chain integrity
6. Shares SOC 2 evidence with auditors

### Day-in-the-Life: Platform Engineer
1. Checks Prometheus dashboard for latency and throughput
2. Reviews alerting rules — adjusts thresholds
3. Runs backup verification script
4. Deploys new API version via CI/CD pipeline
5. Reviews security scan results
6. Updates Terraform infrastructure as needed
