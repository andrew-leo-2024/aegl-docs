---
sidebar_position: 2
title: Policy Management
description: Creating, editing, and managing governance policies
---

# Policy Management

Policies are the rules that govern AI decisions. Every decision is evaluated against all active policies in priority order.

## Policy Types

### STATIC
Hard rules that always apply. If a STATIC policy fails, the decision is **immediately DENIED**. No exceptions.

**Example**: "Never approve loans with credit scores below 580"

### DYNAMIC
Conditional rules based on context. If a DYNAMIC policy fails, the decision is DENIED.

**Example**: "Deny trades exceeding agent's daily budget limit"

### THRESHOLD
Escalation triggers. When a THRESHOLD policy fires, the decision is **ESCALATED** for human review instead of denied.

**Example**: "Loans over $200K require senior reviewer approval"

## Creating a Policy

### Via Dashboard

1. Navigate to **Policies** in the sidebar
2. Click **Create Policy**
3. Fill in:
   - **Name**: Descriptive name (e.g., "Loan Amount Limits")
   - **Type**: STATIC, DYNAMIC, or THRESHOLD
   - **Priority**: Lower number = higher priority (0–10000)
   - **Description**: Explain the policy's purpose
4. Add rules using the visual rule builder
5. Click **Save**

### Via API

```bash
curl -X POST https://api.aegl.io/v1/policies \
  -H "Authorization: Bearer $AEGL_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Trading Limits",
    "description": "Restrict trading volume and asset types",
    "type": "STATIC",
    "priority": 10,
    "rules": [
      {
        "field": "action_payload.trade_value",
        "operator": "gt",
        "value": 500000,
        "action": "DENY",
        "reason": "Trade value exceeds maximum allowed"
      },
      {
        "field": "action_payload.asset_type",
        "operator": "in",
        "value": ["CRYPTO", "DERIVATIVES"],
        "action": "ESCALATE",
        "reason": "High-risk asset class requires approval"
      }
    ]
  }'
```

### Via CLI (Policy-as-Code)

```bash
aegl policies apply -f policies/trading-limits.yaml
```

```yaml title="policies/trading-limits.yaml"
name: Trading Limits
type: STATIC
priority: 10
description: Restrict trading volume and asset types
rules:
  - field: action_payload.trade_value
    operator: gt
    value: 500000
    action: DENY
    reason: "Trade value exceeds maximum allowed"
  - field: action_payload.asset_type
    operator: in
    value: [CRYPTO, DERIVATIVES]
    action: ESCALATE
    reason: "High-risk asset class requires approval"
```

## Rule Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `eq` | Equal to | `credit_score eq 800` |
| `neq` | Not equal to | `status neq "blocked"` |
| `gt` | Greater than | `amount gt 200000` |
| `gte` | Greater than or equal | `risk_score gte 80` |
| `lt` | Less than | `credit_score lt 580` |
| `lte` | Less than or equal | `amount lte 100000` |
| `in` | Value is in list | `asset_type in ["CRYPTO", "DERIVATIVES"]` |
| `not_in` | Value is not in list | `status not_in ["blocked", "suspended"]` |
| `contains` | String/array contains | `description contains "urgent"` |
| `matches` | Regex match | `email matches ".*@company\\.com$"` |

## Field Access

Rules use **dot-notation** to access nested fields in the action payload:

```yaml
rules:
  - field: action_payload.borrower.address.state
    operator: eq
    value: "CA"
```

Available field paths:
- `action_type` — The action being performed
- `action_payload.*` — Any field in the action payload
- `context.*` — Any field in the context object

## Policy Versioning

Policies are **immutable once active**. Updating a policy:
1. Creates a new version of the policy
2. Deactivates the previous version
3. The old version is preserved in the audit trail

Every historical decision traces to the exact policy version that governed it.

```bash
# View version history
curl -H "Authorization: Bearer $AEGL_API_KEY" \
  https://api.aegl.io/v1/policies/pol_abc123
```

## Policy Simulation

Test a policy before activating it:

### Single-Context Simulation

```bash
curl -X POST https://api.aegl.io/v1/policies/pol_abc123/simulate \
  -H "Authorization: Bearer $AEGL_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "action_type": "approve_loan",
    "context": {
      "action_payload": {
        "amount": 350000,
        "credit_score": 720
      }
    }
  }'
```

### Historical Batch Simulation

Re-evaluate a policy against historical decisions to see what would have changed:

```bash
curl -X POST https://api.aegl.io/v1/policies/pol_abc123/simulate \
  -H "Authorization: Bearer $AEGL_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "date_range": {
      "from": "2026-01-01",
      "to": "2026-02-28"
    },
    "sample_size": 1000
  }'
```

Response:
```json
{
  "total_evaluated": 847,
  "would_have_permitted": 612,
  "would_have_denied": 180,
  "would_have_escalated": 55,
  "top_trigger_rules": [...],
  "impacted_agents": [...]
}
```

## Priority and Evaluation Order

- Policies are evaluated in **ascending priority order** (lower number = higher priority)
- Priority 5 (Credit Score Floor) evaluates before Priority 10 (Loan Amount Limits)
- A STATIC policy DENY at priority 5 will block the decision — no further policies are evaluated
- THRESHOLD escalations accumulate — a decision can be escalated by multiple policies
