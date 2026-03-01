---
sidebar_position: 7
title: Webhooks
description: Real-time notifications for decision events
---

# Webhooks

Webhooks deliver real-time HTTP notifications when events occur in E-AEGL. Use them to integrate with Slack, PagerDuty, email systems, or any HTTP endpoint.

## Supported Events

| Event | Triggered When |
|-------|----------------|
| `decision.permitted` | A decision outcome is PERMITTED |
| `decision.denied` | A decision outcome is DENIED |
| `decision.escalated` | A decision outcome is ESCALATED |
| `decision.timeout` | A decision timed out (TIMEOUT_DENIED) |
| `escalation.created` | A new escalation is created |
| `escalation.resolved` | An escalation is approved or denied |

## Creating a Webhook

```bash
curl -X POST https://api.aegl.io/v1/webhooks \
  -H "Authorization: Bearer $AEGL_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://hooks.slack.com/services/T00/B00/abc123",
    "events": ["decision.denied", "escalation.created"],
    "description": "Notify Slack on denials and new escalations"
  }'
```

Response:
```json
{
  "id": "wh_abc123",
  "url": "https://hooks.slack.com/services/T00/B00/abc123",
  "events": ["decision.denied", "escalation.created"],
  "secret": "whsec_abc123..."
}
```

:::caution
Save the `secret` value — it is only shown once. You'll need it to verify webhook signatures.
:::

## Webhook Payload

```json
{
  "event": "decision.denied",
  "timestamp": "2026-03-01T12:00:00Z",
  "data": {
    "decision_id": "dec_abc123",
    "trace_id": "trace_abc123",
    "action_type": "approve_loan",
    "outcome": "DENIED",
    "outcome_reason": "Borrower credit score below regulatory minimum",
    "agent_id": "agent_loan_proc",
    "latency_ms": 3
  }
}
```

## Signature Verification

Every webhook delivery includes an `X-AEGL-Signature` header containing an HMAC-SHA256 signature of the payload body, signed with your webhook secret.

```typescript
import crypto from 'crypto';

function verifyWebhook(body: string, signature: string, secret: string): boolean {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected),
  );
}
```

## Retry Policy

Failed deliveries are retried up to 3 times with exponential backoff:
- Attempt 1: Immediate
- Attempt 2: After 100ms
- Attempt 3: After 200ms
- Attempt 4: After 400ms

A delivery is considered failed if the endpoint returns a non-2xx status code or times out.

## SSRF Protection

Webhook URLs are validated to prevent Server-Side Request Forgery:
- Private IP ranges are blocked (10.x, 172.16-31.x, 192.168.x)
- Localhost and loopback addresses are blocked
- Link-local addresses (169.254.x) are blocked
- Cloud metadata endpoints are blocked

## Managing Webhooks

```bash
# List webhooks
curl -H "Authorization: Bearer $AEGL_API_KEY" \
  "https://api.aegl.io/v1/webhooks"

# Delete a webhook
curl -X DELETE -H "Authorization: Bearer $AEGL_API_KEY" \
  "https://api.aegl.io/v1/webhooks/wh_abc123"
```
