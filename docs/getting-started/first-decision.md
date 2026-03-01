---
sidebar_position: 4
title: Your First Decision
description: Step-by-step walkthrough of creating policies and governing AI decisions
---

# Your First Decision

This guide walks through a complete governance flow: registering an agent, creating a policy, submitting a decision, and reviewing the audit trail.

## Prerequisites

- E-AEGL API running (cloud or self-hosted)
- An API key with `decisions:write`, `policies:write`, `agents:write` permissions

## Step 1: Register an Agent

```bash
curl -X POST https://api.aegl.io/v1/agents \
  -H "Authorization: Bearer $AEGL_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "loan-processor-v1",
    "description": "Automated loan approval system",
    "risk_level": "MEDIUM",
    "allowed_actions": ["approve_loan", "reject_loan", "request_docs"],
    "max_budget": 1000000,
    "budget_window_hours": 24
  }'
```

Response:
```json
{
  "id": "agent_abc123",
  "name": "loan-processor-v1",
  "risk_level": "MEDIUM",
  "active": true
}
```

## Step 2: Create a Policy

```bash
curl -X POST https://api.aegl.io/v1/policies \
  -H "Authorization: Bearer $AEGL_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Loan Amount Limits",
    "description": "Escalate high-value loans for senior review",
    "type": "THRESHOLD",
    "priority": 10,
    "rules": [
      {
        "field": "action_payload.amount",
        "operator": "gt",
        "value": 200000,
        "action": "ESCALATE",
        "reason": "Loans over $200K require senior reviewer approval"
      }
    ]
  }'
```

## Step 3: Submit a Decision

### Decision That Gets Permitted

```typescript
const decision = await aegl.decide({
  actionType: 'approve_loan',
  actionPayload: { amount: 50000, recommendation: 'approve' },
});

console.log(decision.outcome);    // "PERMITTED"
console.log(decision.permitted);  // true
console.log(decision.latencyMs);  // 3 (milliseconds)
```

### Decision That Gets Escalated

```typescript
const decision = await aegl.decide({
  actionType: 'approve_loan',
  actionPayload: { amount: 350000, recommendation: 'approve' },
});

console.log(decision.outcome);       // "ESCALATED"
console.log(decision.escalated);     // true
console.log(decision.escalationId);  // "esc_xyz789"
console.log(decision.slaDeadline);   // "2026-03-01T18:00:00Z"
console.log(decision.outcomeReason); // "Loans over $200K require senior reviewer approval"
```

The escalation appears in the dashboard for human review. A reviewer can approve or deny the action within the SLA deadline.

### Decision That Gets Denied

Add a STATIC deny policy:

```bash
curl -X POST https://api.aegl.io/v1/policies \
  -H "Authorization: Bearer $AEGL_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Credit Score Floor",
    "type": "STATIC",
    "priority": 5,
    "rules": [
      {
        "field": "action_payload.credit_score",
        "operator": "lt",
        "value": 580,
        "action": "DENY",
        "reason": "Borrower credit score below regulatory minimum"
      }
    ]
  }'
```

```typescript
const decision = await aegl.decide({
  actionType: 'approve_loan',
  actionPayload: {
    amount: 50000,
    credit_score: 520,
    recommendation: 'approve',
  },
});

console.log(decision.outcome);       // "DENIED"
console.log(decision.permitted);     // false
console.log(decision.outcomeReason); // "Borrower credit score below regulatory minimum"
```

## Step 4: Review the Audit Trail

Every decision is automatically logged with hash-chain integrity:

```bash
# Get full decision trace
curl -H "Authorization: Bearer $AEGL_API_KEY" \
  https://api.aegl.io/v1/audit/trace_abc123

# Verify chain integrity
curl -H "Authorization: Bearer $AEGL_API_KEY" \
  https://api.aegl.io/v1/audit/integrity
```

```json
{
  "valid": true,
  "total_blocks": 3,
  "checked_at": "2026-03-01T12:00:00Z"
}
```

## Step 5: Resolve an Escalation

In the dashboard, or via API:

```bash
curl -X POST https://api.aegl.io/v1/escalations/esc_xyz789/decide \
  -H "Authorization: Bearer $AEGL_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "decision": "APPROVED",
    "rationale": "Verified borrower income supports this loan amount"
  }'
```

The original decision is updated to PERMITTED, and a new audit log entry records the human review.

## What's Next?

- [Policy Management](../user-manual/policy-management) — Advanced policy configuration
- [TypeScript SDK](../sdks/typescript/installation) — Full SDK reference
- [Python SDK](../sdks/python/installation) — Python SDK reference
- [Dashboard Guide](../user-manual/dashboard) — Using the web dashboard
