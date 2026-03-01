---
sidebar_position: 100
title: Glossary
description: Terms, abbreviations, and definitions used throughout E-AEGL
---

# Glossary

| Term | Definition |
|------|-----------|
| **Action Gate** | Layer 3 of the pipeline. Combines policy evaluation results with agent risk level to produce a final outcome (PERMITTED, DENIED, or ESCALATED). |
| **Action Payload** | The parameters of the action an AI agent wants to execute (e.g., `{ amount: 250000, recommendation: "approve" }`). |
| **Action Type** | A string identifier for the kind of action (e.g., `approve_loan`, `send_email`, `execute_trade`). |
| **AEGL** | Adaptive Enterprise Governance Layer. The product name and TypeScript client class. |
| **Agent** | An AI system registered in E-AEGL that submits decision requests. Each agent has a risk level (LOW, MEDIUM, HIGH, CRITICAL). |
| **AIDCP** | AI Decision Control Protocol. Future open standard for AI governance (Horizon 3). |
| **Audit Log** | An append-only, SHA-256 hash-chained record of every decision. Tamper-evident and legally defensible. |
| **BullMQ** | Redis-based job queue used for webhook delivery and SLA timeout processing. |
| **Decision** | A single governance evaluation: an AI action proposal is assessed against policies and given an outcome. |
| **Decision Boundary** | The exact point where AI output becomes a real-world action. E-AEGL governs at this boundary — not at the token or prompt level. |
| **DENIED** | Decision outcome indicating the action is blocked by policy. |
| **ESCALATED** | Decision outcome indicating the action requires human review before proceeding. |
| **Escalation** | A decision that has been escalated for human review, with a 24-hour SLA by default. |
| **Fail-Closed** | Design principle: if any error occurs during governance evaluation, the action is denied by default. |
| **Genesis Block** | The first audit log entry for an organization. Its `previousHash` is null. |
| **GovernanceGuard** | Framework-agnostic TypeScript wrapper that governs any async action. |
| **Hash Chain** | A linked sequence of SHA-256 hashes where each record includes the hash of the previous record, creating a tamper-evident chain. |
| **Immutable Versioning** | Policy management approach where updates create new versions. Old versions are never modified or deleted. |
| **Latency Budget** | The 10ms total budget for a decision: ~0.5ms auth, ~1ms policy fetch, ~3ms evaluation, ~3ms DB write, ~2ms overhead. |
| **Organization** | The top-level tenant entity. All data (decisions, policies, agents) belongs to an organization. |
| **PERMITTED** | Decision outcome indicating the action may proceed. |
| **Policy** | A set of deterministic rules that govern AI actions. Policies have types (STATIC, DYNAMIC, THRESHOLD), priorities, and scopes. |
| **Policy Engine** | Layer 2 of the pipeline. Evaluates all active policies against the action payload using deterministic rules only (no ML). |
| **RBAC** | Role-Based Access Control. Five roles: OWNER, ADMIN, POLICY_MANAGER, REVIEWER, VIEWER. |
| **Rule** | A single condition within a policy (e.g., "if amount > 200000 then ESCALATE"). |
| **SLA** | Service Level Agreement. For escalations, the default SLA is 24 hours — after which the action is DENIED (fail-closed). |
| **SDK** | Software Development Kit. Available in TypeScript (`@aegl/sdk`) and Python (`aegl`). |
| **SOC 2** | Service Organization Control Type 2. An auditing framework for service organizations covering security, availability, processing integrity, confidentiality, and privacy. |
| **Tenant** | Synonym for Organization. Each tenant's data is isolated via row-level security and per-tenant encryption. |
| **TIMEOUT_DENIED** | Decision outcome indicating the escalation SLA expired without human review. The action is denied (fail-closed). |
| **Trace ID** | A unique identifier assigned to each decision request, used to correlate all records (decision, evaluations, audit log, escalation) for a single governance event. |
| **Webhook** | HTTP callback that notifies external systems of governance events (decisions, escalations, policy changes). Signed with HMAC-SHA256. |
