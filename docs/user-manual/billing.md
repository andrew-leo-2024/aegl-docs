---
sidebar_position: 9
title: Billing
description: Plans, pricing, and usage metering
---

# Billing

E-AEGL offers four plans with metered billing based on decision volume.

## Plans

| Plan | Monthly Decisions | Price |
|------|------------------|-------|
| **Trial** | 1,000 | Free |
| **Starter** | 100,000 | $499/month |
| **Enterprise** | 10,000,000 | Custom pricing |
| **Self-Hosted** | Unlimited | License key required |

## Overage Pricing

Decisions beyond your plan's monthly limit are billed as overage:
- Each overage decision is metered and charged at the end of the billing cycle
- Pricing varies by plan — contact sales for Enterprise rates

## Usage Dashboard

Navigate to **Settings > Billing** to view:
- Current plan and status
- Decisions used this period vs. plan limit
- Overage count and estimated cost
- Billing history

Or via API:

```bash
curl -H "Authorization: Bearer $AEGL_API_KEY" \
  "https://api.aegl.io/v1/org/usage"
```

```json
{
  "period_start": "2026-03-01T00:00:00Z",
  "period_end": "2026-03-31T23:59:59Z",
  "decisions_total": 47832,
  "decisions_permitted": 35421,
  "decisions_denied": 9847,
  "decisions_escalated": 2564,
  "avg_latency_ms": 4,
  "billing_estimate": {
    "plan": "STARTER",
    "plan_limit": 100000,
    "current_usage": 47832,
    "overage": 0,
    "estimated_cost_cents": 49900
  }
}
```

## Self-Hosted Licensing

Self-hosted deployments use a license key for validation:

```bash
# In .env
AEGL_LICENSE_KEY=aegl_lic_...
```

License keys are HMAC-SHA256 signed and contain:
- Organization ID
- Plan type
- Expiration date
- Feature flags

## Stripe Integration

Cloud billing is powered by Stripe:
- Annual subscriptions with monthly metered usage
- Automatic overage calculation
- Webhook-driven subscription lifecycle management
