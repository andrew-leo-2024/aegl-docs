---
sidebar_position: 3
title: Policy-as-Code
description: Managing policies as YAML files in version control
---

# Policy-as-Code

E-AEGL supports managing policies as YAML files, enabling GitOps workflows for governance rules.

## Policy File Format

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
  - field: action_payload.amount
    operator: gt
    value: 1000000
    action: DENY
    reason: "Loans over $1M are not auto-approved"
```

## Apply

```bash
aegl policies apply -f policies/loan-limits.yaml
```

If the policy name already exists, it creates a new version (the old version is deactivated).

## Directory Structure

Organize policies by domain:

```
policies/
├── lending/
│   ├── loan-limits.yaml
│   ├── credit-score-floor.yaml
│   └── income-verification.yaml
├── trading/
│   ├── trade-volume-caps.yaml
│   └── restricted-assets.yaml
└── general/
    ├── budget-limits.yaml
    └── high-risk-escalation.yaml
```

## GitOps Workflow

1. **Author**: Write policy YAML in a feature branch
2. **Review**: Submit pull request — team reviews the rules
3. **Test**: Simulate against historical data before merging
4. **Deploy**: CI/CD applies the policy on merge to main
5. **Audit**: Git history provides change tracking

### CI/CD Example

```yaml title=".github/workflows/deploy-policies.yml"
name: Deploy Policies
on:
  push:
    branches: [main]
    paths: ['policies/**']

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm install -g @aegl/cli
      - run: |
          for f in policies/**/*.yaml; do
            aegl policies apply -f "$f"
          done
        env:
          AEGL_API_KEY: ${{ secrets.AEGL_API_KEY }}
```

## JSON Format

JSON is also supported:

```json title="policies/loan-limits.json"
{
  "name": "Loan Amount Limits",
  "type": "THRESHOLD",
  "priority": 10,
  "rules": [
    {
      "field": "action_payload.amount",
      "operator": "gt",
      "value": 200000,
      "action": "ESCALATE",
      "reason": "Loans over $200K require approval"
    }
  ]
}
```

```bash
aegl policies apply -f policies/loan-limits.json
```

## Simulation Before Deploy

Always simulate before deploying to production:

```bash
# Simulate against a single context
aegl policies simulate pol_abc123 \
  --action-type approve_loan \
  --payload '{"amount": 350000}'

# Or via API: historical batch simulation
curl -X POST https://api.aegl.io/v1/policies/pol_abc123/simulate \
  -H "Authorization: Bearer $AEGL_API_KEY" \
  -d '{"date_range": {"from": "2026-01-01", "to": "2026-02-28"}}'
```
