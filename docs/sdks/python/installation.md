---
sidebar_position: 1
title: Installation
description: Install and configure the Python SDK
---

# Python SDK Installation

## Install

```bash
pip install aegl
```

## Requirements

- Python 3.9+
- No external dependencies (uses `urllib` from standard library)

## Initialize

```python
import os
from aegl import AEGL

aegl = AEGL(
    api_key=os.environ["AEGL_API_KEY"],
    agent_id="my-agent-v1",
)
```

## Configuration

```python
aegl = AEGL(
    # Required
    api_key="aegl_key_...",
    agent_id="my-agent-v1",

    # Optional
    base_url="https://api.aegl.io",  # API base URL
    timeout=10.0,                     # Request timeout (seconds)
    retry_count=3,                    # Retry attempts on failure
    fail_open=False,                  # Fail-closed by default

    # Policy cache (offline fallback)
    policy_cache={
        "enabled": False,
        "ttl_seconds": 3600,          # Cache TTL (1 hour)
        "location": "~/.aegl/cache",  # Cache file location
    },
)
```

## Configuration Reference

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `api_key` | str | required | API key for authentication |
| `agent_id` | str | required | Registered agent identifier |
| `base_url` | str | `https://api.aegl.io` | API base URL |
| `timeout` | float | `10.0` | Request timeout in seconds |
| `retry_count` | int | `3` | Number of retry attempts |
| `fail_open` | bool | `False` | If True, permit actions on API errors |
| `policy_cache` | dict | `{"enabled": False}` | Local policy cache config |
