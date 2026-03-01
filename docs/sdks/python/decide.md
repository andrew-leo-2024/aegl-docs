---
sidebar_position: 3
title: decide()
description: Submit a decision request with the Python SDK
---

# decide()

The `decide()` method submits an action proposal to E-AEGL for governance.

## Signature

```python
def decide(
    self,
    action_type: str,
    action_payload: Dict[str, Any],
    context: Optional[Dict[str, Any]] = None,
    user_id: Optional[str] = None,
    model_id: Optional[str] = None,
) -> DecisionResponse:
```

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `action_type` | str | Yes | Action being proposed |
| `action_payload` | dict | Yes | Action data for policy evaluation |
| `context` | dict | No | Additional context |
| `user_id` | str | No | User who triggered the action |
| `model_id` | str | No | AI model that produced the recommendation |

## Response

```python
@dataclass
class DecisionResponse:
    decision_id: str        # Unique decision ID
    trace_id: str           # Trace ID for audit lookup
    outcome: str            # PERMITTED | DENIED | ESCALATED
    outcome_reason: str     # Human-readable explanation
    latency_ms: int         # Processing time in ms
    permitted: bool         # True if outcome is PERMITTED
    escalated: bool         # True if outcome is ESCALATED
    evaluations: List[PolicyEvaluation]
    escalation_id: Optional[str]
    sla_deadline: Optional[str]
```

## Usage Examples

### Basic

```python
decision = aegl.decide(
    action_type="approve_loan",
    action_payload={"amount": 50000, "credit_score": 720},
)

if decision.permitted:
    execute_loan()
elif decision.escalated:
    print(f"Needs review: {decision.escalation_id}")
else:
    print(f"Denied: {decision.outcome_reason}")
```

### With Full Context

```python
decision = aegl.decide(
    action_type="execute_trade",
    action_payload={
        "symbol": "AAPL",
        "quantity": 1000,
        "price": 185.50,
        "side": "BUY",
    },
    context={
        "department": "equities",
        "market_hours": True,
    },
    user_id="trader-12",
    model_id="model_trading_v3",
)
```

### Inspecting Evaluations

```python
decision = aegl.decide(...)

for evaluation in decision.evaluations:
    print(f"Policy: {evaluation.policy}")
    print(f"Result: {evaluation.result}")
    print(f"Details: {evaluation.details}")
```

## Error Behavior

### Fail-Closed (Default)

```python
# If API is unreachable, returns DENIED — does NOT raise
decision = aegl.decide(...)
# decision.outcome == "DENIED"
# decision.outcome_reason == "AEGL SDK error (fail-closed): ..."
```

### Fail-Open

```python
aegl = AEGL(..., fail_open=True)
decision = aegl.decide(...)
# decision.outcome == "PERMITTED"  (if API is down)
```

### Auth Errors

Authentication errors always raise, even with fail-open:

```python
try:
    decision = aegl.decide(...)
except AEGLAuthError:
    print("Invalid API key — fix credentials")
```
