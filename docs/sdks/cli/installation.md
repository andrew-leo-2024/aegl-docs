---
sidebar_position: 1
title: Installation
description: Install and authenticate the E-AEGL CLI
---

# CLI Installation

The E-AEGL CLI enables policy-as-code workflows, audit log queries, and agent management from the terminal.

## Install

```bash
npm install -g @aegl/cli
```

## Authenticate

```bash
aegl auth login --api-key $AEGL_API_KEY
```

The API key is stored in your system's credential vault (or encrypted local file).

## Verify

```bash
aegl health check
```

```
✓ API reachable
✓ Authentication valid
✓ Database connected
✓ Redis connected
```

## Configuration

The CLI reads configuration from:
1. Command-line flags (highest priority)
2. Environment variables (`AEGL_API_KEY`, `AEGL_BASE_URL`)
3. Stored credentials (from `aegl auth login`)

| Flag | Env Variable | Default | Description |
|------|-------------|---------|-------------|
| `--api-key` | `AEGL_API_KEY` | stored | API key |
| `--base-url` | `AEGL_BASE_URL` | `https://api.aegl.io` | API base URL |
| `--format` | — | `table` | Output format (table, json) |
