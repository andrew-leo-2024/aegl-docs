---
sidebar_position: 4
title: Policy Cache
description: Local policy cache for offline resilience
---

# Policy Cache

The policy cache enables offline decision-making when the E-AEGL API is unreachable. Policies are synced periodically and cached locally on disk.

## How It Works

```
Normal operation:
  decide() → API request → Response

API unreachable (after retries):
  decide() → Local cache evaluation → Offline response
                                        ↓
                              Audit log queued for later submission
```

## Enable

```typescript
const aegl = new AEGL({
  apiKey: '...',
  agentId: '...',
  policyCache: {
    enabled: true,
    ttlMs: 3600000,            // 1 hour cache TTL
    location: '~/.aegl/cache', // Cache file location
  },
});
```

## Behavior

1. **On initialization**: Client syncs policies from API and saves to disk
2. **Periodic sync**: Policies are refreshed at `ttlMs / 2` interval (minimum 30s)
3. **On API failure**: If cached policies exist and are within TTL, evaluate locally
4. **Audit queuing**: Offline decisions are queued and submitted when API recovers
5. **Cache expiry**: After TTL expires, cache is invalid — falls back to fail-closed/open

## Cache File

Policies are stored as JSON at the configured location:

```
~/.aegl/cache/policies.json
```

```json
{
  "policies": [
    {
      "id": "pol_abc123",
      "name": "Loan Amount Limits",
      "type": "THRESHOLD",
      "priority": 10,
      "rules": [...]
    }
  ],
  "syncedAt": "2026-03-01T12:00:00Z",
  "organizationId": "org_abc123"
}
```

## Local Evaluation

The cache includes a local rule evaluator that mirrors the server-side engine:
- All 10 operators supported (gt, gte, lt, lte, eq, neq, in, not_in, contains, matches)
- Dot-notation field access
- Policy priority ordering
- STATIC/DYNAMIC → DENY, THRESHOLD → ESCALATE

## Audit Queue

Decisions made offline are queued for later submission:
- Queue capped at 10,000 entries (oldest trimmed)
- Queued audits submitted during periodic sync
- If submission fails, audits are re-queued

## Limitations

- Local evaluation does not have access to agent risk levels
- Local evaluation does not create escalation records
- Decision IDs are prefixed with `local-` to distinguish from API decisions
- Audit log hash chain may have gaps during offline periods

## Manual Sync

Force a policy sync:

```typescript
await aegl.syncPolicies();
```
