---
sidebar_position: 3
title: Policy Lifecycle
description: Creating, versioning, simulating, and retiring policies
---

# Policy Lifecycle

Policies are the rules that govern AI decisions. They follow a strict lifecycle that ensures auditability and traceability.

## Lifecycle Stages

```
CREATE → ACTIVE → UPDATE (new version) → DEACTIVATE
                                            │
                                            ▼
                                     PRESERVED (audit trail)
```

### 1. Creation

A new policy is created via API, CLI, or dashboard:
- Assigned a unique ID
- Version starts at 1
- Immediately active upon creation
- Rules are validated (at least 1 required)

### 2. Active Enforcement

While active, the policy is evaluated against every matching decision:
- Scope filtering: only applies to matching action_types and agent_ids
- Priority ordering: evaluated before lower-priority policies
- Results recorded in PolicyEvaluation records

### 3. Update (Versioning)

**Policies are immutable once active.** Updating a policy:
1. Creates a new record with the same name but incremented version
2. Deactivates the previous version
3. The new version becomes immediately active

This ensures that every historical decision traces to the exact policy version that governed it.

```
Policy "Loan Limits" v1 → deactivated
Policy "Loan Limits" v2 → active (current)
Policy "Loan Limits" v3 → active (after next update)
```

### 4. Deactivation

Deleting a policy performs a **soft delete** — the policy is deactivated but preserved:
- `active` set to `false`
- No longer evaluated against new decisions
- Remains in the database for audit trail integrity
- Historical PolicyEvaluation records still reference it

### 5. Preservation

Deactivated policies are never deleted from the database. They serve as:
- Audit evidence for historical decisions
- Reference for compliance reviews
- Basis for version history display

## Simulation

Before activating a new policy or updating an existing one, use simulation:

### Single-Context
Test one specific action against the policy:
```
"If this loan application came in right now, would this policy trigger?"
```

### Historical Batch
Re-evaluate the policy against historical decisions:
```
"If this policy had been active last month, how many decisions would have changed?"
```

This prevents unintended consequences when deploying policy changes.

## Policy-as-Code

Policies can be managed as YAML files in version control:

```yaml
name: Loan Amount Limits
type: THRESHOLD
priority: 10
description: Escalate high-value loans
rules:
  - field: action_payload.amount
    operator: gt
    value: 200000
    action: ESCALATE
    reason: Loans over $200K require approval
```

Deploy with the CLI:
```bash
aegl policies apply -f policies/loan-limits.yaml
```

This enables:
- Git-based change tracking
- Pull request reviews for policy changes
- CI/CD integration for policy deployment
- Rollback via git revert
