---
sidebar_position: 5
title: Agents
description: Agent registration and management endpoints
---

# Agents API

Register and manage AI agents that submit decisions.

## POST /v1/agents

Register a new agent.

**Permission required**: `agents:write`

### Request

```json
{
  "name": "loan-processor-v1",
  "description": "Automated loan approval system",
  "risk_level": "MEDIUM",
  "allowed_actions": ["approve_loan", "reject_loan", "request_docs"],
  "max_budget": 1000000,
  "budget_window_hours": 24
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Unique agent name |
| `description` | string | No | Agent description |
| `risk_level` | string | Yes | `LOW`, `MEDIUM`, `HIGH`, or `CRITICAL` |
| `allowed_actions` | string[] | No | Permitted action types |
| `max_budget` | number | No | Maximum cumulative action value per window |
| `budget_window_hours` | number | No | Rolling budget window in hours |

### Response

```json
{
  "id": "agent_abc123",
  "name": "loan-processor-v1",
  "risk_level": "MEDIUM",
  "active": true,
  "created_at": "2026-03-01T12:00:00Z"
}
```

---

## GET /v1/agents

List all agents with pagination.

**Permission required**: `agents:read`

---

## GET /v1/agents/:id

Get agent detail including 24-hour decision statistics.

**Permission required**: `agents:read`

### Response

```json
{
  "id": "agent_abc123",
  "name": "loan-processor-v1",
  "description": "Automated loan approval system",
  "risk_level": "MEDIUM",
  "allowed_actions": ["approve_loan", "reject_loan", "request_docs"],
  "max_budget": 1000000,
  "budget_window_hours": 24,
  "active": true,
  "decision_stats_24h": {
    "total": 142,
    "permitted": 98,
    "denied": 31,
    "escalated": 13
  },
  "created_at": "2026-03-01T12:00:00Z"
}
```

---

## PUT /v1/agents/:id

Update agent configuration.

**Permission required**: `agents:write`

```json
{
  "risk_level": "HIGH",
  "active": false
}
```

---

## GET /v1/agents/:id/decisions

Get the decision history for a specific agent.

**Permission required**: `agents:read`

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `outcome` | string | Filter by outcome |
| `from` | string | Start date |
| `to` | string | End date |
| `page` | number | Page number |
| `limit` | number | Results per page |
