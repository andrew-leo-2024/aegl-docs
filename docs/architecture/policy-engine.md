---
sidebar_position: 3
title: Policy Engine
description: Deterministic rule evaluation engine internals
---

# Policy Engine

The policy engine is the core of E-AEGL's governance. It evaluates deterministic rules against action payloads to produce PASS, FAIL, or ESCALATE results.

## Design Constraints

1. **No ML in the critical path** — Rules are deterministic. Same input = same output, always.
2. **Microsecond evaluation** — Individual rules evaluate in microseconds.
3. **Fail-closed** — If evaluation throws an exception, the result is DENY.
4. **Policy language is generic** — Not hardcoded to any domain (banking, healthcare, etc.).

## Components

### Rule Evaluator (`rule-evaluator.ts`)

Evaluates a single rule against a context:

```typescript
interface RuleEvaluation {
  result: 'PASS' | 'FAIL' | 'ESCALATE';
  reason: string;
  latencyMs: number;
}
```

**Field resolution**: Uses dot-notation to access nested fields:
```
"action_payload.borrower.address.state"
→ context.action_payload.borrower.address.state
```

**Operators**: 10 comparison operators:

| Operator | Type | Description |
|----------|------|-------------|
| `gt` | Numeric | Greater than |
| `gte` | Numeric | Greater than or equal |
| `lt` | Numeric | Less than |
| `lte` | Numeric | Less than or equal |
| `eq` | Any | Strict equality |
| `neq` | Any | Not equal |
| `in` | Any/Array | Value exists in array |
| `not_in` | Any/Array | Value not in array |
| `contains` | String/Array | String contains substring, or array contains value |
| `matches` | String | Regex pattern match |

**Security protections**:
- Regex patterns limited to 200 characters (ReDoS mitigation)
- Input strings limited to 10,000 characters
- Invalid regex returns FAIL (not exception)
- Undefined fields return FAIL (fail-closed)

### Policy Engine (`policy-engine.ts`)

Evaluates all rules in a policy and aggregates results:

```typescript
interface PolicyEvaluationResult {
  policyId: string;
  policyName: string;
  result: 'PASS' | 'FAIL' | 'ESCALATE' | 'SKIP';
  failedRules: RuleEvaluation[];
  latencyMs: number;
}
```

**Evaluation logic**:
1. Check policy scope — skip if action_type or agent_id doesn't match
2. Evaluate each rule against the context
3. Aggregate:
   - Any rule FAIL → policy result is FAIL
   - Any rule ESCALATE (or policy type is THRESHOLD) → policy result is ESCALATE
   - All rules PASS → policy result is PASS

**Decision aggregation** (`evaluateAllPolicies`):
1. Sort policies by priority (ascending)
2. For each policy:
   - STATIC/DYNAMIC FAIL → immediate DENY (short-circuit)
   - THRESHOLD trigger → mark ESCALATE (continue evaluating)
   - PASS → continue
3. After all policies: ESCALATE > PERMIT

### Action Gate (`action-gate.ts`)

Combines policy results with agent risk level:

```typescript
interface GateResult {
  outcome: 'PERMITTED' | 'DENIED' | 'ESCALATED';
  reason: string;
  policyResults: PolicyEvaluationResult[];
}
```

**Gate logic priority**:
1. Any policy DENIED → DENIED (highest priority)
2. Any policy ESCALATED → ESCALATED
3. Agent risk CRITICAL → ESCALATED (override)
4. Agent risk HIGH + all policies passed → ESCALATED (override)
5. All clear → PERMITTED

## Evaluation Context

The policy engine receives a flat evaluation context constructed from the decision request:

```typescript
const evalContext = {
  action_type: "approve_loan",
  action_payload: { amount: 250000, credit_score: 720 },
  context: { department: "mortgage" },
  // Flattened for dot-notation access:
  "action_payload.amount": 250000,
  "action_payload.credit_score": 720,
};
```

## Separation of Concerns

The policy engine is **separated from storage**:
- It accepts policy rulesets as input
- It does NOT query the database during evaluation
- This enables future distributed evaluation and local cache fallback
