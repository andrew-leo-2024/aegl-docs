---
sidebar_position: 5
title: Agent Management
description: Registering and managing AI agents
---

# Agent Management

Agents represent AI systems that make decisions. Every decision submitted to E-AEGL is associated with a registered agent.

## Registering an Agent

### Via API

```bash
curl -X POST https://api.aegl.io/v1/agents \
  -H "Authorization: Bearer $AEGL_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "loan-processor-v1",
    "description": "Automated loan approval system powered by GPT-4",
    "risk_level": "MEDIUM",
    "allowed_actions": ["approve_loan", "reject_loan", "request_docs"],
    "max_budget": 1000000,
    "budget_window_hours": 24
  }'
```

### Via Dashboard

1. Navigate to **Agents** in the sidebar
2. Click **Register Agent**
3. Fill in agent details
4. Save

## Agent Properties

| Property | Description |
|----------|-------------|
| `name` | Unique identifier (used as `agentId` in SDK) |
| `description` | Human-readable description |
| `risk_level` | LOW, MEDIUM, HIGH, or CRITICAL |
| `allowed_actions` | List of action types the agent can perform |
| `max_budget` | Maximum cumulative action value per budget window |
| `budget_window_hours` | Rolling window for budget tracking |
| `active` | Whether the agent is active (inactive agents are blocked) |

## Risk Levels

The agent's risk level affects the Action Gate:

| Risk Level | Behavior |
|-----------|----------|
| **LOW** | Policy results pass through unchanged |
| **MEDIUM** | Policy results pass through unchanged |
| **HIGH** | PERMITTED decisions are escalated for review |
| **CRITICAL** | All decisions are escalated for review |

## Agent Decision Stats

View an agent's decision history:

```bash
curl -H "Authorization: Bearer $AEGL_API_KEY" \
  "https://api.aegl.io/v1/agents/agent_abc123"
```

Response includes 24-hour breakdown:
```json
{
  "id": "agent_abc123",
  "name": "loan-processor-v1",
  "decision_stats_24h": {
    "total": 142,
    "permitted": 98,
    "denied": 31,
    "escalated": 13
  }
}
```

## Deactivating an Agent

Deactivating an agent blocks all future decisions from it:

```bash
curl -X PUT https://api.aegl.io/v1/agents/agent_abc123 \
  -H "Authorization: Bearer $AEGL_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "active": false }'
```
