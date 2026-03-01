---
sidebar_position: 2
title: Client
description: AEGL Python client class reference
---

# AEGL Client (Python)

The `AEGL` class is the main entry point for the Python SDK.

## Constructor

```python
from aegl import AEGL

aegl = AEGL(
    api_key=os.environ["AEGL_API_KEY"],
    agent_id="my-agent-v1",
)
```

Raises `AEGLError` if `api_key` or `agent_id` is empty.

## Methods

### `decide(action_type, action_payload, context=None, user_id=None, model_id=None)`

Submit a decision request. Returns a `DecisionResponse`.

```python
decision = aegl.decide(
    action_type="approve_loan",
    action_payload={"amount": 50000},
)
```

### `sync_policies()`

Manually sync policies from the API to the local cache.

```python
aegl.sync_policies()
```

## Retry Logic

The client retries failed requests with exponential backoff:

| Attempt | Delay |
|---------|-------|
| 1 | 100ms |
| 2 | 200ms |
| 3 | 400ms |

Retries occur on network errors and 5xx responses. 401 and 4xx errors are raised immediately.

## Error Types

```python
from aegl.types import AEGLError, AEGLTimeoutError, AEGLAuthError
```

| Class | When Raised |
|-------|------------|
| `AEGLError` | API returns a non-2xx response |
| `AEGLTimeoutError` | Request exceeds timeout |
| `AEGLAuthError` | API returns 401 |

```python
try:
    decision = aegl.decide(...)
except AEGLAuthError:
    print("Invalid API key")
except AEGLTimeoutError as e:
    print(f"Timed out after {e.timeout}s")
except AEGLError as e:
    print(f"Error: {e.message} (HTTP {e.status_code})")
```
