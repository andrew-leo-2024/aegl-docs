---
sidebar_position: 3
title: decide()
description: The core method — submit a decision request
---

# decide()

The `decide()` method is the core of the SDK. It submits an action proposal to E-AEGL for governance and returns the decision outcome.

## Signature

```typescript
async decide(request: DecisionRequest): Promise<DecisionResponse>
```

## Request

```typescript
interface DecisionRequest {
  actionType: string;        // What action is being proposed
  actionPayload: Record<string, unknown>;  // Action data
  context?: Record<string, unknown>;       // Additional context
  userId?: string;           // User who triggered the action
  modelId?: string;          // AI model that produced the recommendation
}
```

## Response

```typescript
interface DecisionResponse {
  decisionId: string;        // Unique decision ID
  traceId: string;           // Trace ID for audit lookup
  outcome: DecisionOutcome;  // PERMITTED | DENIED | ESCALATED | TIMEOUT_DENIED
  outcomeReason?: string;    // Human-readable explanation
  latencyMs: number;         // Processing time in milliseconds
  permitted: boolean;        // Convenience: outcome === 'PERMITTED'
  escalated: boolean;        // Convenience: outcome === 'ESCALATED'
  escalationId?: string;     // Present if escalated
  slaDeadline?: string;      // Present if escalated (ISO 8601)
  evaluations: PolicyEvaluation[];  // Per-policy results
}
```

## Usage Examples

### Basic Decision

```typescript
const decision = await aegl.decide({
  actionType: 'approve_loan',
  actionPayload: {
    amount: 50000,
    credit_score: 720,
    recommendation: 'approve',
  },
});

if (decision.permitted) {
  executeLoan();
}
```

### With Context and User ID

```typescript
const decision = await aegl.decide({
  actionType: 'execute_trade',
  actionPayload: {
    symbol: 'AAPL',
    quantity: 1000,
    price: 185.50,
    side: 'BUY',
  },
  context: {
    department: 'equities',
    market_hours: true,
  },
  userId: 'trader-12',
  modelId: 'model_trading_v3',
});
```

### Handling All Outcomes

```typescript
const decision = await aegl.decide({
  actionType: 'approve_claim',
  actionPayload: { amount: 75000, type: 'auto' },
});

switch (decision.outcome) {
  case 'PERMITTED':
    await processClaim();
    break;
  case 'DENIED':
    console.log(`Blocked: ${decision.outcomeReason}`);
    await notifyAgent(decision.outcomeReason);
    break;
  case 'ESCALATED':
    console.log(`Escalated: ${decision.escalationId}`);
    console.log(`Deadline: ${decision.slaDeadline}`);
    await queueForReview(decision.escalationId);
    break;
}
```

### Inspecting Policy Evaluations

```typescript
const decision = await aegl.decide({...});

for (const eval of decision.evaluations) {
  console.log(`Policy: ${eval.policy}`);
  console.log(`Result: ${eval.result}`);  // PASS, FAIL, ESCALATE
  console.log(`Details: ${eval.details}`);
}
```

## Error Handling

### Fail-Closed (Default)

When the API is unreachable, `decide()` does NOT throw. Instead, it returns a DENIED decision:

```typescript
const decision = await aegl.decide({...});
// If API is down:
// decision.outcome === "DENIED"
// decision.outcomeReason === "AEGL SDK error (fail-closed): ..."
// decision.permitted === false
```

### Fail-Open

With `failOpen: true`, API errors result in PERMITTED:

```typescript
const aegl = new AEGL({ ..., failOpen: true });
const decision = await aegl.decide({...});
// If API is down:
// decision.outcome === "PERMITTED"
// decision.permitted === true
```

### Auth Errors

Authentication errors (401) are always thrown, even with fail-open:

```typescript
try {
  const decision = await aegl.decide({...});
} catch (error) {
  if (error instanceof AEGLAuthError) {
    // API key is invalid — fix credentials
  }
}
```
