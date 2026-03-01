---
sidebar_position: 1
title: SOP Catalog
description: Standard Operating Procedures for E-AEGL platform operations
---

# Standard Operating Procedures (SOPs)

All operational procedures for the E-AEGL platform. Each SOP includes purpose, scope, prerequisites, step-by-step instructions, verification, and rollback procedures.

## SOP Index

| SOP ID | Title | Category | Frequency | Criticality |
|--------|-------|----------|-----------|-------------|
| [SOP-001](./sop-001-incident-response) | Incident Response | Security | On incident | Critical |
| [SOP-002](./sop-002-secrets-rotation) | Secrets Rotation | Security | Quarterly | High |
| [SOP-003](./sop-003-database-backup) | Database Backup & Restore | Operations | Every 6h (auto) | Critical |
| [SOP-004](./sop-004-deployment) | Production Deployment | Operations | Per release | High |
| [SOP-005](./sop-005-audit-chain-repair) | Audit Chain Repair | Compliance | On detection | Critical |
| [SOP-006](./sop-006-tenant-onboarding) | Tenant Onboarding | Customer | Per customer | Medium |
| [SOP-007](./sop-007-escalation-sla-breach) | Escalation SLA Breach | Governance | On breach | High |
| [SOP-008](./sop-008-capacity-planning) | Capacity Planning | Operations | Monthly | Medium |
| [SOP-009](./sop-009-compliance-audit) | Compliance Audit Preparation | Compliance | Quarterly | High |

## SOP Template

Every SOP follows this structure:

1. **Purpose** — Why this procedure exists
2. **Scope** — What systems/components are affected
3. **Prerequisites** — What must be true before starting
4. **Procedure** — Step-by-step numbered instructions
5. **Verification** — How to confirm the procedure succeeded
6. **Rollback** — How to undo if something goes wrong
7. **Escalation** — Who to contact if the procedure fails

## Ownership

| Role | Responsibility |
|------|---------------|
| **On-call Engineer** | Execute SOPs 001, 003, 005, 007 |
| **Platform Lead** | Approve SOPs 004, 008; review all SOPs quarterly |
| **Security Team** | Execute SOPs 001, 002; review security SOPs |
| **Compliance Officer** | Execute SOP 009; review compliance SOPs |
| **Customer Success** | Execute SOP 006 |
