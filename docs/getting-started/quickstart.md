---
sidebar_position: 1
title: Quickstart
description: Get up and running with E-AEGL in under 5 minutes
---

# Quickstart

E-AEGL governs AI decisions at the **decision boundary** — the moment where an AI recommendation becomes a real-world action. Add 5 lines of code to enforce policies, log every decision, and control what your AI agents can do.

## 1. Install the SDK

```bash npm2yarn
npm install @aegl/sdk
```

```bash
# Python
pip install aegl
```

## 2. Initialize the Client

```typescript title="TypeScript"
import { AEGL } from '@aegl/sdk';

const aegl = new AEGL({
  apiKey: process.env.AEGL_API_KEY,
  agentId: 'loan-processor-v1',
});
```

```python title="Python"
from aegl import AEGL

aegl = AEGL(
    api_key=os.environ["AEGL_API_KEY"],
    agent_id="loan-processor-v1",
)
```

## 3. Govern a Decision

```typescript title="TypeScript"
const decision = await aegl.decide({
  actionType: 'approve_loan',
  actionPayload: {
    amount: 250000,
    borrower_credit_score: 720,
    recommendation: 'approve',
  },
  userId: 'analyst-42',
});

if (decision.permitted) {
  executeLoan();
} else if (decision.escalated) {
  console.log(`Escalated: ${decision.outcomeReason}`);
  // Human reviewer will decide via dashboard
} else {
  console.log(`Denied: ${decision.outcomeReason}`);
}
```

```python title="Python"
decision = aegl.decide(
    action_type="approve_loan",
    action_payload={
        "amount": 250000,
        "borrower_credit_score": 720,
        "recommendation": "approve",
    },
    user_id="analyst-42",
)

if decision.permitted:
    execute_loan()
elif decision.escalated:
    print(f"Escalated: {decision.outcome_reason}")
else:
    print(f"Denied: {decision.outcome_reason}")
```

## 4. Create a Policy

Policies define the rules that govern AI decisions. Create one via the API or CLI:

```bash title="CLI"
aegl policies apply -f policies/loan-limits.yaml
```

```yaml title="policies/loan-limits.yaml"
name: Loan Amount Limits
type: THRESHOLD
priority: 10
description: Escalate high-value loans for senior review
rules:
  - field: action_payload.amount
    operator: gt
    value: 200000
    action: ESCALATE
    reason: "Loans over $200K require senior reviewer approval"
```

## 5. View the Audit Trail

Every decision is logged with a cryptographically verified, tamper-evident audit trail:

```bash
# Query audit logs
aegl audit query --from 2026-01-01 --outcome ESCALATED

# Verify hash chain integrity
curl -H "Authorization: Bearer $AEGL_API_KEY" \
  https://api.aegl.io/v1/audit/integrity
```

## What Just Happened?

1. **Decision Boundary Interceptor** captured the loan approval action with full context
2. **Policy Engine** evaluated the action against your deterministic rules in < 5ms
3. **Action Gate** determined the outcome: PERMITTED, DENIED, or ESCALATED
4. **Audit Logger** recorded the decision with SHA-256 hash-chained integrity

The entire pipeline completes in **under 10ms**.

## Next Steps

- [Installation Guide](./installation) — Full setup for cloud or self-hosted
- [Core Concepts](./concepts) — Understand the 4-layer architecture
- [Your First Decision](./first-decision) — Detailed walkthrough with policies
