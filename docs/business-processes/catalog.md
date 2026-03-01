---
sidebar_position: 1
title: Process Catalog
description: Master index of all E-AEGL business processes, workflows, and automations
---

# Business Process Catalog

This catalog documents every business process, workflow, and automation in the E-AEGL platform. Each process includes a BPMN diagram, step-by-step description, actors, inputs/outputs, error handling, and SLA targets.

## Process Index

### Core Governance Processes

| ID | Process | Type | SLA | BPMN |
|----|---------|------|-----|------|
| BP-001 | [Decision Pipeline](./bpmn-decision-pipeline) | Real-time | &lt; 10ms end-to-end | Yes |
| BP-002 | [Escalation Lifecycle](./bpmn-escalation-lifecycle) | Async + Human | 24h SLA | Yes |
| BP-003 | [Policy Lifecycle](./bpmn-policy-lifecycle) | CRUD + Versioned | Immediate | Yes |
| BP-004 | [Audit Verification](./bpmn-audit-verification) | On-demand | &lt; 30s | Yes |

### Security & Access Processes

| ID | Process | Type | SLA | BPMN |
|----|---------|------|-----|------|
| BP-005 | [Authentication Flow](./bpmn-authentication) | Per-request | &lt; 2ms | Yes |
| BP-006 | [RBAC Authorization](./bpmn-authentication#bpmn-diagram--rbac-authorization) | Per-request | &lt; 1ms | Yes |

### Integration Processes

| ID | Process | Type | SLA | BPMN |
|----|---------|------|-----|------|
| BP-007 | [Webhook Dispatch](./bpmn-webhook-dispatch) | Async queue | 3 retries, 5s/25s/125s backoff | Yes |
| BP-008 | [SLA Timeout Enforcement](./bpmn-sla-timeout) | Scheduled (5min) | Within 10min of deadline | Yes |

### Operational Processes

| ID | Process | Type | SLA | BPMN |
|----|---------|------|-----|------|
| BP-009 | [Tenant Onboarding](./bpmn-onboarding) | Manual + Automated | &lt; 1 business day | Yes |
| BP-010 | [Compliance Reporting](./bpmn-compliance-reporting) | On-demand | &lt; 60s generation | Yes |
| BP-011 | [Billing & Metering](./bpmn-billing-metering) | Monthly cycle | Monthly billing | Yes |
| BP-012 | [Backup & Restore](./bpmn-backup-restore) | Scheduled (6h) | RPO &lt; 6h, RTO &lt; 15min | Yes |

## Automation Summary

| Automation | Trigger | Frequency | Technology |
|-----------|---------|-----------|------------|
| SLA timeout worker | BullMQ scheduler | Every 5 minutes | Node.js + BullMQ |
| Webhook dispatch | Decision event | Per decision | BullMQ queue |
| Database backup | Cron | Every 6 hours | bash + pg_dump |
| Usage metering | Decision count | Per decision | In-memory counter + DB flush |
| Hash chain append | Decision created | Per decision | SHA-256 in Prisma transaction |
| Policy cache refresh | TTL expiry | Configurable (default 60s) | SDK-side |

## BPMN Notation Guide

All process diagrams use standard BPMN 2.0 notation rendered in ASCII:

```
(O)     Start Event          — Process begins here
(X)     Exclusive Gateway    — One path based on condition
(+)     Parallel Gateway     — All paths execute simultaneously
[Task]  Activity/Task        — A unit of work
(O)-->  End Event            — Process terminates
~~>     Message Flow         — Communication between pools
-->     Sequence Flow        — Normal flow progression
- - >   Conditional Flow     — Flow with a condition
```

### Swim Lane Convention

```
┌─────────────────────────────────────┐
│ Pool: System/Actor Name              │
│                                      │
│ ┌─────────────────────────────────┐ │
│ │ Lane: Sub-component/Role         │ │
│ │                                  │ │
│ │  (O)──→[Task]──→(X)──→[Task]   │ │
│ │                                  │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```
