---
sidebar_position: 2
title: Commands
description: Complete CLI command reference
---

# CLI Commands

## auth

Manage authentication credentials.

```bash
# Login with API key
aegl auth login --api-key aegl_key_abc123

# Check current auth status
aegl auth status
```

## policies

Manage governance policies.

```bash
# List all active policies
aegl policies list

# List all policies (including inactive)
aegl policies list --all

# Get policy details
aegl policies get pol_abc123

# Apply policy from file (create or update)
aegl policies apply -f policies/loan-limits.yaml

# Delete (deactivate) a policy
aegl policies delete pol_abc123

# Simulate a policy
aegl policies simulate pol_abc123 \
  --action-type approve_loan \
  --payload '{"amount": 350000, "credit_score": 720}'
```

## audit

Query and verify the audit trail.

```bash
# Query audit logs
aegl audit query

# Filter by date range
aegl audit query --from 2026-01-01 --to 2026-02-28

# Filter by outcome
aegl audit query --outcome DENIED

# Filter by action type
aegl audit query --action-type approve_loan

# Verify chain integrity
aegl audit integrity
```

## agents

Manage AI agents.

```bash
# List all agents
aegl agents list

# Register a new agent
aegl agents register \
  --name "loan-processor-v2" \
  --risk-level MEDIUM \
  --description "Updated loan processor"

# Get agent details
aegl agents get agent_abc123
```

## health

Check system health.

```bash
# Full health check
aegl health check

# JSON output
aegl health check --format json
```

## Global Flags

| Flag | Description |
|------|-------------|
| `--api-key` | Override stored API key |
| `--base-url` | Override API base URL |
| `--format` | Output format: `table` (default) or `json` |
| `--help` | Show command help |
| `--version` | Show CLI version |
