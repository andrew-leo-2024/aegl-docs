---
sidebar_position: 6
title: Model Registry
description: Approving and managing AI models
---

# Model Registry

The Model Registry tracks which AI models are approved for use within your organization. Decisions can optionally include a `modelId` for model-level governance.

## Registering a Model

```bash
curl -X POST https://api.aegl.io/v1/models \
  -H "Authorization: Bearer $AEGL_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "GPT-4o Production",
    "provider": "openai",
    "model_id": "gpt-4o-2024-08-06",
    "version": "2024-08-06",
    "risk_rating": "MEDIUM",
    "approved": true
  }'
```

## Model Properties

| Property | Description |
|----------|-------------|
| `name` | Display name |
| `provider` | AI provider (openai, anthropic, custom) |
| `model_id` | Provider's model identifier |
| `version` | Model version string |
| `risk_rating` | LOW, MEDIUM, HIGH, CRITICAL |
| `approved` | Whether the model is approved for use |

## Using Models in Decisions

Include `modelId` when submitting decisions to track which model produced the recommendation:

```typescript
const decision = await aegl.decide({
  actionType: 'approve_loan',
  actionPayload: { amount: 50000 },
  modelId: 'model_gpt4o',
});
```

This enables model-level analytics in the dashboard — see which models are producing the most denied or escalated decisions.

## Listing Models

```bash
curl -H "Authorization: Bearer $AEGL_API_KEY" \
  "https://api.aegl.io/v1/models"
```

## Updating Model Status

Revoke or re-approve a model:

```bash
curl -X PUT https://api.aegl.io/v1/models/model_abc123 \
  -H "Authorization: Bearer $AEGL_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "approved": false }'
```
