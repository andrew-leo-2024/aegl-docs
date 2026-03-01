---
sidebar_position: 1
title: Feature Catalog
description: Complete feature inventory of the E-AEGL platform
---

# Feature Catalog

Complete inventory of all features, capabilities, and automations in the E-AEGL platform.

## Core Governance Features

### F-001: Real-Time Decision Governance
**Module:** Decision Pipeline | **Source:** `apps/api/src/routes/decisions.ts`

Evaluates AI actions against deterministic policies in &lt;10ms. Every decision is governed, logged, and traceable.

- SDK calls `aegl.decide()` with action type and payload
- Policy engine evaluates all active policies
- Action gate produces PERMITTED, DENIED, or ESCALATED
- Entire decision atomically recorded with hash-chained audit entry
- Fail-closed: any error results in DENIED

### F-002: Deterministic Policy Engine
**Module:** Policy Engine | **Source:** `apps/api/src/engine/policy-engine.ts`, `apps/api/src/engine/rule-evaluator.ts`

No ML in the critical path. Rules evaluate in microseconds.

- 10 comparison operators: eq, neq, gt, gte, lt, lte, in, not_in, contains, matches
- Three policy types: STATIC (always evaluate), DYNAMIC (conditional), THRESHOLD (numeric limits)
- Priority-based evaluation ordering
- Scope filtering by action_type and agent_id
- Immutable versioning — updates create new versions, old preserved for audit

### F-003: Action Gate
**Module:** Action Gate | **Source:** `apps/api/src/engine/action-gate.ts`

Final decision point combining policy outcome with agent risk context.

- DENY > ESCALATE > PERMIT outcome hierarchy
- Agent risk level (LOW, MEDIUM, HIGH, CRITICAL) modifies marginal decisions
- HIGH-risk agents escalate borderline permits
- Fail-closed by default, configurable per-policy for low-risk scenarios

### F-004: Tamper-Evident Audit Trail
**Module:** Audit Logger | **Source:** `apps/api/src/audit/hash-chain.ts`, `apps/api/src/audit/logger.ts`

Append-only, SHA-256 hash-chained records. Legally defensible in discovery proceedings.

- Each record includes SHA-256(contents + previous_hash)
- Monotonic sequence numbers prevent insertion/deletion
- On-demand integrity verification: `GET /v1/audit/integrity`
- CSV export with hash chain data included
- Standalone library design (@aegl/hash-chain) for future reuse

### F-005: Human-in-the-Loop Escalation
**Module:** Escalation System | **Source:** `apps/api/src/routes/escalations.ts`, `apps/api/src/workers/escalation-sla.ts`

When policies require human judgment, decisions are escalated with 24h SLA.

- Escalation queue with priority-based ordering
- SLA countdown timer (default 24 hours)
- Reviewer submits APPROVED/DENIED with mandatory written rationale
- SLA timeout enforces fail-closed: unreviewed = DENIED
- Webhook notifications on escalation and resolution

## Integration Features

### F-006: TypeScript SDK
**Module:** SDK | **Source:** `packages/sdk/src/`

5-line integration for Node.js/TypeScript applications.

- `AEGL` client with `decide()` method
- Local policy cache for offline resilience
- Pluggable transport (HTTP, gRPC-ready)
- OpenAI function call middleware
- Anthropic tool_use middleware
- LangChain AgentAction middleware
- Generic GovernanceGuard for any framework

### F-007: Python SDK
**Module:** SDK-Python | **Source:** `packages/sdk-python/aegl/`

Python-native SDK for the 70%+ of enterprise AI workloads running Python.

- `AEGLClient` with `decide()` method
- Async support
- Local policy cache
- OpenAI function call wrapper
- LangChain AgentAction integration
- CrewAI task governance integration

### F-008: CLI Tool
**Module:** CLI | **Source:** `packages/cli/src/`

Policy-as-code workflow and operational management from the terminal.

- `aegl auth login` — Configure API credentials
- `aegl policies apply -f policy.yaml` — Deploy policies from YAML
- `aegl policies list/inspect/test/delete` — Full policy management
- `aegl audit query/integrity/export` — Audit trail operations
- `aegl agents list/inspect` — Agent registry management
- `aegl models list/register/inspect/update` — Model registry
- `aegl escalations list/inspect/decide` — Escalation management
- `aegl decisions list/submit/trace` — Decision history and testing
- `aegl health check` — System health verification

### F-009: Webhook Event System
**Module:** Webhooks | **Source:** `apps/api/src/workers/webhook-dispatcher.ts`

Real-time event notifications for governance events.

- 8 event types: decision.permitted/denied/escalated/timeout, escalation.resolved, policy.created/updated/deactivated
- HMAC-SHA256 payload signing for verification
- Idempotency keys for deduplication
- Exponential backoff retry (3 attempts: 5s, 25s, 125s)
- BullMQ queue-based delivery (non-blocking)

## Platform Features

### F-010: Next.js Dashboard
**Module:** Dashboard | **Source:** `apps/dashboard/src/`

Web UI for compliance officers, risk managers, and administrators.

- Overview metrics (24h decisions, permit/deny/escalation rates, latency)
- Policy editor with visual rule builder
- Audit log viewer with hash chain verification button + CSV export
- Escalation queue with SLA countdown and approve/deny workflow
- Agent registry with risk levels and decision history
- Model registry with risk ratings and approval status
- Organization settings, team management, webhook configuration, billing

### F-011: Multi-Tenancy
**Module:** Tenant Isolation | **Source:** `apps/api/src/middleware/tenant-isolation.ts`, `apps/api/src/lib/tenant-encryption.ts`

Enterprise-grade tenant isolation for shared infrastructure.

- Row-level security on every database query (organizationId filter)
- Per-tenant encryption keys for sensitive data
- Data residency configuration (US, EU, APAC)
- Tenant-scoped API keys and RBAC
- Complete data isolation in error conditions

### F-012: Observability
**Module:** Telemetry | **Source:** `apps/api/src/telemetry/`

Production monitoring from day one.

- OpenTelemetry tracing on decision pipeline
- Prometheus metrics endpoint (`/metrics`)
- Structured JSON logging (no console.log)
- Decision throughput, latency histograms, error rates
- Escalation pending counts, SLA compliance
- Usage metering counters

### F-013: Compliance Reporting
**Module:** Compliance | **Source:** `apps/api/src/compliance/evidence-collector.ts`

Automated evidence collection for SOC 2 and regulatory audits.

- SOC 2 evidence report across 4 Trust Service Criteria domains
- Compliance posture summary with recommendations
- Automated findings detection (chain integrity, SLA compliance, policy gaps)
- Exportable reports (JSON, CSV)

### F-014: Billing & Metering
**Module:** Billing | **Source:** `apps/api/src/billing/stripe-client.ts`, `apps/api/src/telemetry/metering.ts`

Usage-based pricing with Stripe integration.

- Per-decision metering
- Plan limits (Trial: 1K, Starter: 100K, Enterprise: 10M, Self-Hosted: unlimited)
- Overage pricing at $0.001/decision
- Usage history API for trend analysis
- Billing estimate endpoint for current period
