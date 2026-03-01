---
sidebar_position: 3
title: Core Concepts
description: Understand E-AEGL's architecture, entities, and decision model
---

# Core Concepts

E-AEGL is **AI Decision Control Infrastructure** — a governance layer that sits between your AI agents and the real-world actions they take.

## The Decision Boundary

Every AI system reaches a point where a model's recommendation becomes a real-world action — approving a loan, executing a trade, sending a message, authorizing a refund. This is the **decision boundary**.

E-AEGL intercepts at this boundary. Not before (we don't inspect model input/output tokens). Not after (too late to prevent harm). Exactly at the moment of action.

```
AI Model Output → [Decision Boundary] → Real-World Action
                        ↑
                    E-AEGL governs
                    this moment
```

## Four-Layer Pipeline

Every decision passes through four layers, completing in under 10ms:

### 1. Decision Boundary Interceptor
Captures the **action proposal** with full context: what action, what payload, which agent, which user. This is a structured `DecisionRequest` submitted via the SDK.

### 2. Policy Engine
Evaluates the action against **deterministic rules**. No ML classifiers — rules evaluate in microseconds with guaranteed reproducibility. Policies can be STATIC (hard rules), DYNAMIC (conditional), or THRESHOLD (escalation triggers).

### 3. Action Gate
Combines policy results with agent risk assessment to produce a final outcome:
- **PERMITTED** — Action may proceed
- **DENIED** — Action is blocked
- **ESCALATED** — Action requires human review

### 4. Audit Logger
Records every decision in an **append-only, SHA-256 hash-chained** log. Each entry includes the hash of the previous entry, creating a tamper-evident chain that is legally defensible in regulatory proceedings.

## Key Entities

### Organization
The top-level tenant. All resources (agents, policies, decisions, users) belong to one organization. Full data isolation between tenants.

### Agent
An AI system or service that makes decisions. Each agent has:
- **Risk Level**: LOW, MEDIUM, HIGH, or CRITICAL
- **Allowed Actions**: List of action types the agent can perform
- **Budget Limits**: Maximum expenditure per time window

### Policy
A set of deterministic rules that govern decisions. Policies have:
- **Type**: STATIC (always enforced), DYNAMIC (conditional), THRESHOLD (triggers escalation)
- **Priority**: Lower number = higher priority (evaluated first)
- **Rules**: Conditions that match on action payload fields
- **Scope**: Which action types and agents the policy applies to

### Decision
A single evaluation of an action proposal. Contains:
- The original request (action type, payload, context)
- The outcome (PERMITTED, DENIED, ESCALATED)
- Policy evaluation results
- Latency measurement
- Trace ID for full audit trail

### Escalation
When a decision is ESCALATED, it creates an escalation record requiring human review. Escalations have:
- **SLA Deadline**: Time by which a human must decide
- **Priority**: CRITICAL, HIGH, MEDIUM, LOW
- **Status**: PENDING, APPROVED, DENIED, EXPIRED

### Audit Log
An append-only, hash-chained record of every decision. Each entry includes:
- Full decision data
- SHA-256 hash (current record + previous hash)
- Sequence number
- Organization-scoped chain

## Fail-Closed by Default

If the policy engine errors, times out, or cannot reach a determination, the action is **DENIED**. This is the safe default for regulated industries. You can configure fail-open behavior per-policy for explicitly low-risk scenarios.

## SDK-First Architecture

E-AEGL uses SDK instrumentation, not network proxying. This means:
- No TLS termination or man-in-the-middle
- Works with any AI framework (OpenAI, Anthropic, LangChain, CrewAI)
- Sub-millisecond overhead at the instrumentation point
- Compatible with zero-trust network architectures

## Next Steps

- [Your First Decision](./first-decision) — Build a complete governance flow
- [Policy Engine Deep Dive](../architecture/policy-engine) — How rules are evaluated
- [Audit System](../architecture/audit-system) — Hash-chain verification
