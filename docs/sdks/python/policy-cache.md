---
sidebar_position: 4
title: Policy Cache
description: Local policy cache for offline resilience (Python)
---

# Policy Cache (Python)

The Python SDK supports local policy caching for offline decision-making, mirroring the TypeScript SDK's functionality.

## Enable

```python
aegl = AEGL(
    api_key="...",
    agent_id="...",
    policy_cache={
        "enabled": True,
        "ttl_seconds": 3600,           # 1 hour
        "location": "~/.aegl/cache",   # Cache directory
    },
)
```

## Behavior

1. **On initialization**: Syncs policies from API to local disk
2. **On API failure**: Evaluates against cached policies (if within TTL)
3. **Audit queuing**: Offline decisions queued for later submission
4. **Cache expiry**: After TTL, falls back to fail-closed/open

## Cache File

```
~/.aegl/cache/policies.json
```

```json
{
  "policies": [...],
  "synced_at": "2026-03-01T12:00:00Z",
  "organization_id": "org_abc123"
}
```

## Local Evaluation

The cache evaluator supports all 10 rule operators:

| Operator | Support |
|----------|---------|
| gt, gte, lt, lte | Numeric comparison |
| eq, neq | Equality |
| in, not_in | List membership |
| contains | String/list containment |
| matches | Regex pattern matching |

## Manual Sync

```python
aegl.sync_policies()
```

## Audit Queue

Offline decisions are queued with a 10,000 entry cap:
- Queue is in-memory (not persisted to disk)
- Entries include `queued_at` timestamp
- Oldest entries trimmed when cap is reached
