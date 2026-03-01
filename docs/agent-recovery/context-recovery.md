---
sidebar_position: 1
title: Agent Context Recovery
description: Master document for any AI agent to recover full project understanding
---

# Agent Context Recovery Prompt

:::info
**This document is the architectural memory of the E-AEGL project.** If you are an AI agent resuming work on this project, read this document first. It contains everything you need to understand the project, its architecture, codebase structure, decisions made, and current state.
:::

## What Is E-AEGL?

E-AEGL is **AI Decision Control Infrastructure** — the governance firewall between enterprises and AI decisions. It enforces policy, logs cognition, and controls downstream actions at the moment where AI output becomes real-world action. Think of it as a firewall, but instead of governing network packets, it governs AI decisions.

## Architecture (4 Layers)

The system has exactly 4 layers. Not 8 (the adversarial analysis killed the other 4).

```
Layer 1: Decision Boundary Interceptor — Captures action proposal (<2ms)
Layer 2: Policy Engine — Deterministic rules only, NO ML classifiers (<5ms)
Layer 3: Action Gate — PERMIT / DENY / ESCALATE. Fail-closed default (<1ms)
Layer 4: Audit Logger — Append-only, SHA-256 hash-chained, tamper-evident (<2ms)

Total: <10ms end-to-end
```

## Non-Negotiable Principles

These came from 4 rounds of adversarial analysis. They are NOT suggestions:

1. **No ML in the critical path** — Deterministic rules ONLY during enforcement
2. **SDK-first, not proxy** — No TLS interception, no network proxy
3. **Decision boundary only** — NOT token-level inspection (100-1000x fewer evaluations)
4. **Append-only audit with hash chains** — SHA-256, legally defensible
5. **Fail-closed by default** — Any error = DENIED
6. **Immutable policy versions** — Updates create new versions; old preserved
7. **Self-hosted first-class** — `docker compose up` = production deployment
8. **Multi-tenancy with provable isolation** — Row-level security, per-tenant encryption
9. **Observability from day one** — OpenTelemetry, Prometheus, structured JSON logs
10. **Python SDK is not optional** — 70%+ of enterprise AI is Python

## Tech Stack

| Component | Technology | Path |
|-----------|-----------|------|
| Monorepo | Turborepo | `turbo.json` |
| API | Express + TypeScript | `apps/api/` |
| Database | PostgreSQL 16 + Prisma | `apps/api/prisma/schema.prisma` |
| Cache/Queue | Redis 7 + BullMQ | `apps/api/src/workers/` |
| Dashboard | Next.js 14 + NextAuth | `apps/dashboard/` |
| Marketing site | Next.js | `apps/web/` |
| Docs site | Docusaurus | `apps/docs-site/` |
| TypeScript SDK | `@aegl/sdk` | `packages/sdk/` |
| Python SDK | `aegl` | `packages/sdk-python/` |
| CLI | Commander.js | `packages/cli/` |
| Infrastructure | Docker + Terraform | `deploy/` |
| CI/CD | GitHub Actions | `.github/workflows/` |

## Codebase Map

```
aegl/
├── apps/
│   ├── api/                         # Express API server
│   │   ├── prisma/schema.prisma     # 16 Prisma models (source of truth for data model)
│   │   ├── src/
│   │   │   ├── index.ts             # Server entrypoint
│   │   │   ├── routes/              # All API routes
│   │   │   │   ├── decisions.ts     # POST /v1/decisions (CRITICAL PATH)
│   │   │   │   ├── policies.ts      # CRUD + immutable versioning
│   │   │   │   ├── escalations.ts   # Escalation queue + reviewer decisions
│   │   │   │   ├── audit.ts         # Query, integrity verify, CSV export
│   │   │   │   ├── agents.ts        # Agent registry CRUD
│   │   │   │   ├── models.ts        # Model registry CRUD
│   │   │   │   ├── organization.ts  # Org settings + metrics + usage + usage/history
│   │   │   │   ├── compliance.ts    # SOC 2 evidence + compliance summary
│   │   │   │   ├── webhooks.ts      # Webhook CRUD
│   │   │   │   ├── billing.ts       # Stripe billing endpoints
│   │   │   │   └── health.ts        # /health and /health/ready
│   │   │   ├── engine/              # Core governance engine
│   │   │   │   ├── policy-engine.ts # Rule evaluation (deterministic, NO ML)
│   │   │   │   ├── rule-evaluator.ts# 10 operators: gt, gte, lt, lte, eq, neq, in, not_in, contains, matches
│   │   │   │   └── action-gate.ts   # Final outcome: PERMIT/DENY/ESCALATE
│   │   │   ├── audit/               # Hash chain implementation
│   │   │   │   ├── hash-chain.ts    # SHA-256 hash computation
│   │   │   │   └── logger.ts        # Append to chain + verify integrity
│   │   │   ├── auth/                # Authentication + authorization
│   │   │   │   ├── api-key.ts       # SHA-256 key lookup middleware
│   │   │   │   └── rbac.ts          # 5-role permission model
│   │   │   ├── workers/             # Background jobs
│   │   │   │   ├── escalation-sla.ts# 5-min check for expired SLAs → TIMEOUT_DENIED
│   │   │   │   └── webhook-dispatcher.ts # HMAC-signed delivery with 3x retry
│   │   │   ├── compliance/          # SOC 2 evidence collection
│   │   │   ├── billing/             # Stripe metering + overage
│   │   │   ├── telemetry/           # OpenTelemetry, Prometheus, structured logger
│   │   │   ├── middleware/          # Request validation, tenant isolation, trace ID
│   │   │   └── lib/                 # DB client, tenant encryption
│   │   └── src/__tests__/           # 109 API tests
│   │
│   ├── dashboard/                   # Next.js governance dashboard
│   │   └── src/app/(dashboard)/     # Pages: overview, policies, audit, escalations, agents, models, settings
│   │
│   ├── web/                         # Marketing website (landing, pricing, contact)
│   │
│   └── docs-site/                   # THIS Docusaurus documentation site
│
├── packages/
│   ├── sdk/                         # TypeScript SDK
│   │   └── src/
│   │       ├── client.ts            # AEGL client with decide()
│   │       ├── middleware/           # OpenAI, Anthropic, LangChain, Generic integrations
│   │       ├── policy-cache.ts      # Local policy cache for offline resilience
│   │       └── __tests__/           # 31 SDK tests
│   │
│   ├── sdk-python/                  # Python SDK
│   │   └── aegl/
│   │       ├── client.py            # AEGLClient with decide()
│   │       ├── integrations/        # OpenAI, LangChain, CrewAI wrappers
│   │       └── policy_cache.py      # Python policy cache
│   │
│   └── cli/                         # CLI tool
│       └── src/
│           ├── index.ts             # Entry point, registers all commands
│           ├── commands/            # auth, policies, audit, agents, models, escalations, decisions, health
│           └── __tests__/           # 25 CLI tests
│
├── deploy/
│   ├── docker/                      # Dockerfiles (api, dashboard, web)
│   ├── aws/terraform/               # VPC, Aurora, ElastiCache, ECS, ALB, IAM
│   ├── k8s/                         # Kubernetes manifests
│   └── jenkins/                     # Jenkins pipeline config
│
├── docker/
│   ├── docker-compose.yml           # Dev (postgres + redis + api)
│   ├── docker-compose.selfhosted.yml# Self-hosted (postgres + redis + api + dashboard + web)
│   └── docker-compose.ha.yml        # HA (primary + replica + sentinel + traefik)
│
├── e2e/                             # E2E tests (Playwright + API)
├── scripts/                         # Automation (backup, build, k8s, seed)
├── .github/workflows/               # CI (ci.yml) + Deploy (deploy.yml)
└── CLAUDE.md                        # Build instructions for AI agents
```

## Database Schema (16 Models)

Read `apps/api/prisma/schema.prisma` for the full schema. Key models:

| Model | Purpose |
|-------|---------|
| Organization | Top-level tenant |
| User | Team members (login, roles) |
| ApiKey | Hashed API credentials (SHA-256) |
| Agent | Registered AI agents with risk levels |
| ApprovedModel | Registered AI models |
| Policy | Governance rules (immutable versions) |
| Decision | Every governed decision |
| PolicyEvaluation | Per-policy results for each decision |
| Escalation | Human review queue (PENDING → APPROVED/DENIED/TIMEOUT) |
| EscalationDecision | Reviewer's decision + rationale |
| AuditLog | Hash-chained tamper-evident records |
| Webhook | Event notification subscriptions |
| TenantEncryptionKey | Per-tenant encryption |
| BillingRecord | Usage billing records |

## API Endpoints

All routes under `/v1/`. Key endpoints:

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/v1/decisions` | **Core endpoint** — submit decision for governance |
| GET | `/v1/decisions` | List historical decisions |
| GET/POST/PUT/DELETE | `/v1/policies[/:id]` | Policy CRUD with immutable versioning |
| GET | `/v1/audit` | Query audit logs |
| GET | `/v1/audit/integrity` | Verify hash chain |
| GET | `/v1/audit/export` | CSV export of audit trail |
| GET | `/v1/audit/:traceId` | Full decision trace |
| GET/POST | `/v1/escalations[/:id]` | Escalation queue |
| POST | `/v1/escalations/:id/decide` | Submit reviewer decision |
| GET/POST | `/v1/agents[/:id]` | Agent registry |
| GET/POST | `/v1/models[/:id]` | Model registry |
| GET/PUT | `/v1/org` | Organization settings |
| GET | `/v1/org/metrics` | Dashboard metrics (24h) |
| GET | `/v1/org/usage` | Current billing period usage |
| GET | `/v1/org/usage/history` | Historical usage by month |
| GET | `/v1/compliance/soc2-evidence` | SOC 2 evidence report |
| GET | `/v1/compliance/summary` | Compliance posture summary |
| GET/POST/DELETE | `/v1/webhooks[/:id]` | Webhook management |
| GET | `/health`, `/health/ready` | Health checks |

## RBAC Roles

| Role | Key Permissions |
|------|----------------|
| OWNER | `admin` (everything) |
| ADMIN | All read/write except owner-only |
| POLICY_MANAGER | Policies, audit, webhooks read/write |
| REVIEWER | Escalations write, audit read |
| VIEWER | Read-only on decisions, agents, models, audit |

## Build & Test

```bash
# Install dependencies
npm install

# Run all tests (165 pass: 109 API + 31 SDK + 25 CLI)
npm test

# Run specific workspace tests
npm test --workspace=@aegl/api
npm test --workspace=@aegl/sdk
npm test --workspace=@aegl/cli

# Type-check
npx tsc --noEmit --project apps/api/tsconfig.json
npx tsc --noEmit --project packages/sdk/tsconfig.json

# Build docs site
cd apps/docs-site && npm run build

# Start development
docker compose -f docker/docker-compose.yml up -d  # Start postgres + redis
cd apps/api && npx prisma migrate deploy            # Run migrations
npm run dev                                          # Start all services
```

## What NOT To Build

These were explicitly killed by the adversarial analysis:
- Token-level inspection (economics don't work)
- Network proxy (breaks zero-trust)
- ML classifiers in policy evaluation (can't be audited)
- Multimodal media preprocessing (deferred)
- Agent runtime / AgentOS (Year 2-3 pivot)
- Decision Exchange (Year 3-4 pivot)
- AIDCP trust protocol (Year 4-5 pivot)

## Current State (as of Phase 8 completion)

- All 8 build phases complete
- 165 tests passing
- Docs site with 90+ pages covering: project charter, BPMNs, SOPs, features, API reference, SDK guides, architecture, operations, troubleshooting
- GitHub: `frankmax-com/aegl` (private, main codebase)
- GitHub: docs site to be deployed publicly under `andrew-leo-2024` org

## Key Files to Read First

If resuming work, read these files in this order:
1. This document (you're reading it)
2. `CLAUDE.md` — Build instructions and engineering principles
3. `apps/api/prisma/schema.prisma` — Data model (source of truth)
4. `apps/api/src/routes/decisions.ts` — Core decision pipeline
5. `apps/api/src/engine/policy-engine.ts` — Policy evaluation logic
6. `apps/api/src/audit/hash-chain.ts` — Hash chain implementation
7. `apps/docs-site/docs/business-processes/catalog.md` — All business processes

## Document Update Protocol

This documentation site is the **architectural memory** of the project. It must be kept in sync:

1. **When architecture changes**: Update the relevant architecture doc and this recovery document
2. **When new features are added**: Add to the feature catalog
3. **When new processes are introduced**: Create a BPMN document
4. **When operational procedures change**: Update the relevant SOP
5. **When approaching changes**: Update the product roadmap
6. **After every significant session**: Review this document for accuracy

This is a **closed-loop feedback system** — the code and documentation must always be aligned.
