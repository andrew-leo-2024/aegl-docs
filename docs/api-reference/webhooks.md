---
sidebar_position: 9
title: Webhooks
description: Webhook management endpoints
---

# Webhooks API

Create and manage webhook subscriptions for real-time event notifications.

## POST /v1/webhooks

Create a new webhook subscription.

**Permission required**: `webhooks:write`

### Request

```json
{
  "url": "https://hooks.slack.com/services/T00/B00/abc123",
  "events": ["decision.denied", "escalation.created"],
  "description": "Notify Slack on denials and new escalations"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `url` | string | Yes | HTTPS endpoint URL (SSRF-protected) |
| `events` | string[] | Yes | Events to subscribe to |
| `description` | string | No | Webhook description |

### Supported Events

- `decision.permitted`
- `decision.denied`
- `decision.escalated`
- `decision.timeout`
- `escalation.created`
- `escalation.resolved`

### Response

```json
{
  "id": "wh_abc123",
  "url": "https://hooks.slack.com/services/T00/B00/abc123",
  "events": ["decision.denied", "escalation.created"],
  "secret": "whsec_abc123def456..."
}
```

:::warning
The `secret` is only returned once at creation. Store it securely for signature verification.
:::

---

## GET /v1/webhooks

List all webhooks.

**Permission required**: `webhooks:read`

---

## GET /v1/webhooks/:id

Get webhook detail.

**Permission required**: `webhooks:read`

---

## DELETE /v1/webhooks/:id

Delete a webhook subscription.

**Permission required**: `webhooks:write`
