---
sidebar_position: 12
title: Billing
description: Stripe billing webhook endpoint
---

# Billing API

Billing is managed via Stripe integration. The API includes a webhook endpoint for Stripe event processing.

## POST /v1/billing/stripe-webhook

Receives and processes Stripe webhook events. This endpoint requires raw body parsing for signature verification.

### Stripe Events Handled

| Event | Action |
|-------|--------|
| `customer.subscription.created` | Activate subscription, update org plan |
| `customer.subscription.updated` | Update plan tier |
| `customer.subscription.deleted` | Mark subscription as cancelled |
| `invoice.payment_succeeded` | Record successful payment |
| `invoice.payment_failed` | Flag payment failure |

### Configuration

Set the following environment variables:

```bash
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Usage Metering

Decision counts are reported to Stripe as metered usage:

```typescript
// Internal — called automatically by the billing system
reportUsageToStripe(organizationId, decisionCount);
```

### Billing Estimate

The billing estimate is included in the `GET /v1/org/usage` response:

```json
{
  "billing_estimate": {
    "plan": "STARTER",
    "plan_limit": 100000,
    "current_usage": 47832,
    "overage": 0,
    "estimated_cost_cents": 49900
  }
}
```

### Self-Hosted License Keys

Self-hosted deployments use HMAC-SHA256 signed license keys instead of Stripe:

```bash
AEGL_LICENSE_KEY=aegl_lic_org123_SELF_HOSTED_2027-03-01_abc123signature
```

License key format: `aegl_lic_{orgId}_{plan}_{expiry}_{signature}`
