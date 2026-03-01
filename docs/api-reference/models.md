---
sidebar_position: 6
title: Models
description: AI model registry endpoints
---

# Models API

Register and manage approved AI models.

## POST /v1/models

Register a new AI model.

**Permission required**: `models:write`

### Request

```json
{
  "name": "GPT-4o Production",
  "provider": "openai",
  "model_id": "gpt-4o-2024-08-06",
  "version": "2024-08-06",
  "risk_rating": "MEDIUM",
  "approved": true
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Display name |
| `provider` | string | Yes | AI provider identifier |
| `model_id` | string | Yes | Provider's model ID |
| `version` | string | No | Model version |
| `risk_rating` | string | No | `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` |
| `approved` | boolean | No | Approval status (default: false) |

---

## GET /v1/models

List all registered models.

**Permission required**: `models:read`

---

## GET /v1/models/:id

Get model detail with decision count.

**Permission required**: `models:read`

---

## PUT /v1/models/:id

Update model configuration or approval status.

**Permission required**: `models:write`
