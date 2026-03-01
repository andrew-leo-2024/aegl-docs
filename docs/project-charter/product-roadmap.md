---
sidebar_position: 5
title: Product Roadmap
description: Build phases, pivot architecture, and timeline
---

# Product Roadmap

## Build Phases (v2 — Current)

### Phase 1: Foundation (Complete)
- Turborepo monorepo with apps/api, packages/sdk, packages/cli
- Prisma schema (16 models) with PostgreSQL
- Policy engine core: rule evaluation, operator set (gt, gte, lt, lte, eq, neq, in, not_in, contains, matches)
- Hash-chain audit logger (@aegl/hash-chain)
- POST /v1/decisions endpoint
- Benchmark: &lt; 10ms latency confirmed

### Phase 2: API Complete (Complete)
- All CRUD routes: policies, agents, models, escalations, webhooks, organization
- API key authentication with SHA-256 hashing
- RBAC middleware (5 roles: OWNER, ADMIN, POLICY_MANAGER, REVIEWER, VIEWER)
- Escalation worker (BullMQ) with SLA timeout enforcement
- Webhook dispatcher with HMAC-SHA256 signing and exponential backoff
- Integration tests for all endpoints
- Docker Compose (dev + self-hosted)

### Phase 2.5: Observability + Multi-tenancy (Complete)
- OpenTelemetry tracing on decision pipeline
- Prometheus metrics endpoint (/metrics)
- Structured JSON logger (no console.log)
- Tenant isolation middleware (row-level security on every query)
- Per-tenant encryption keys
- Data residency routing
- Usage metering for billing

### Phase 3: SDKs + CLI (Complete)
- TypeScript SDK (@aegl/sdk) with decide(), policy cache, transport abstraction
- Python SDK (aegl) with decide(), policy_cache, async support
- OpenAI integration (TS + Python): govern function calls
- Anthropic integration (TS): govern tool_use
- LangChain integration (TS + Python): AgentAction governance
- CrewAI integration (Python): task governance
- Generic GovernanceGuard (TS): framework-agnostic wrapper
- CLI: auth, policies (apply, list, inspect, delete, test), audit (query, integrity, export), agents (list, inspect), models (list, register, inspect, update), escalations (list, inspect, decide), decisions (list, submit, trace), health

### Phase 4: Dashboard (Complete)
- Next.js 14 + NextAuth (credentials provider)
- Overview metrics (24h decisions, permit/deny/escalate rates, avg latency)
- Policy editor with visual rule builder + version history
- Audit log viewer with hash chain integrity verification + CSV export
- Escalation queue with SLA countdown + approve/deny workflow
- Agent registry with risk levels and decision history
- Model registry with risk ratings and approval status
- Organization settings, team management, webhook config, billing

### Phase 5: Marketing Website (Complete)
- Landing page with value proposition and architecture diagram
- Pricing page (Starter, Pro, Enterprise, Self-Hosted)
- Docs page (links to Docusaurus site)
- Contact/demo form

### Phase 6: Deployment (Complete)
- Dockerfiles: API, Dashboard, Web (multi-stage, non-root user, health checks)
- Docker Compose: dev, self-hosted (API + Dashboard + Web + Postgres + Redis), HA
- Kubernetes manifests: deployments, services, HPA, ingress, network policies, PDBs
- AWS Terraform: VPC, Aurora PostgreSQL Serverless, ElastiCache Redis, ECS Fargate, ALB, auto-scaling, IAM, Secrets Manager
- GitHub Actions CI/CD: lint, typecheck, test, build, deploy
- Jenkins pipeline (alternative)

### Phase 7: Polish (Complete)
- E2E tests (Playwright): dashboard smoke tests
- E2E API tests: decisions, policies, escalations, audit chain
- Load testing (k6): 1K req/s target with &lt; 10ms p95
- Seed data script for demo environments
- 165 tests passing (109 API + 31 SDK + 25 CLI)

### Phase 7.5: Compliance + DR (Complete)
- SOC 2 evidence collector (4 domains: access control, change management, monitoring, data protection)
- Compliance report generator with recommendations
- PostgreSQL backup script with S3 upload and KMS encryption
- Disaster recovery runbook (6 scenarios)
- Stripe billing integration with usage-based overage pricing

### Phase 8: Gap Closure (Complete)
- SDK integrations: Anthropic handler, generic GovernanceGuard, Python OpenAI wrapper
- GitHub Actions CI/CD: ci.yml (multi-job) + deploy.yml (ECS)
- AWS Terraform: complete infrastructure
- Missing API endpoints: /v1/org/usage/history, /v1/compliance/summary, /v1/audit/export
- Missing CLI commands: models, escalations, decisions
- Dashboard audit CSV export
- Self-hosted Docker Compose with dashboard + web containers
- Docusaurus documentation site (59 pages)

## Pivot Architecture

The v2 wedge product is architecturally designed to enable three future pivots without rewriting:

### Pivot 1: Agent Runtime (AgentOS) — Year 2-3

```
Current:  App → SDK → HTTP → API → PolicyEngine → DB
Future:   App → AgentOS Runtime → In-process PolicyEngine → DB
```

**Preparation in v2:**
- Policy engine accepts ruleset as input (not coupled to database)
- SDK transport layer is pluggable (HTTP → gRPC → in-process)
- Policy cache enables offline evaluation

### Pivot 2: Decision Exchange — Year 3-4

```
Current:  Org A → E-AEGL → Audit logs (private)
Future:   Org A → E-AEGL → Anonymized → Decision Exchange → Benchmarks
```

**Preparation in v2:**
- Audit log schema includes aggregatable fields (actionType categories, outcome enums, latencyMs)
- Decisions are not stored as unstructured JSON
- Organization isolation allows per-org opt-in to anonymized sharing

### Pivot 3: AI Decision Control Protocol (AIDCP) — Year 4-5

```
Current:  Proprietary SDK → Proprietary API
Future:   Open AIDCP SDK → Any AIDCP-compatible governance provider
```

**Preparation in v2:**
- Hash chain is a standalone library (@aegl/hash-chain), not inline code
- Policy language is generic (not banking-specific)
- Protocol-buffer-ready data structures

## Architecture Decision Records (ADRs)

| ADR | Decision | Rationale |
|-----|----------|-----------|
| ADR-001 | SDK-first, not proxy | TLS interception breaks zero-trust; proxy adds 50-100ms latency |
| ADR-002 | No ML in critical path | Deterministic rules evaluate in microseconds; ML classifiers add 50-500ms and can't be legally audited |
| ADR-003 | Decision boundary only | 100-1000x fewer evaluations than token inspection; economics require 75%+ gross margins |
| ADR-004 | PostgreSQL over DynamoDB | Need transactions across Decision + PolicyEvaluation + AuditLog; DynamoDB can't do this |
| ADR-005 | Hash chain audit | Regulatory discovery requires tamper-evident records; database-level audit isn't legally sufficient |
| ADR-006 | Fail-closed default | Safety over availability; configurable per-policy for explicitly low-risk scenarios |
| ADR-007 | Immutable policy versions | Every historical decision must trace to exact policy version; enables audit reconstruction |
| ADR-008 | BullMQ over SQS | Self-hosted requirement; SQS requires AWS; BullMQ uses Redis which is already in stack |
| ADR-009 | Prisma over raw SQL | Type safety, migration management, transaction support; acceptable performance tradeoff |
| ADR-010 | Turborepo monorepo | Shared types between API/SDK/CLI; atomic deploys; simplified CI/CD |
