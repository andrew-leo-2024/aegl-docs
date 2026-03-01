---
sidebar_position: 1
title: Dashboard
description: Overview of the E-AEGL web dashboard
---

# Dashboard

The E-AEGL dashboard provides real-time visibility into every AI decision your organization makes.

## Overview Page

The main dashboard displays key metrics for the last 24 hours:

| Metric | Description |
|--------|-------------|
| **Total Decisions** | Number of decisions processed |
| **Permit Rate** | Percentage of decisions that were PERMITTED |
| **Deny Rate** | Percentage of decisions that were DENIED |
| **Escalation Rate** | Percentage of decisions that were ESCALATED |
| **Avg Latency** | Average decision latency in milliseconds |
| **Pending Escalations** | Number of escalations awaiting human review |

### Recent Decisions Table

The overview page shows the 20 most recent decisions with:
- Trace ID (clickable — links to full audit trail)
- Action type
- Outcome (color-coded: green=PERMITTED, red=DENIED, yellow=ESCALATED)
- Agent name
- Latency (ms)
- Timestamp

Metrics refresh automatically every 10 seconds.

## Navigation

The sidebar provides access to all sections:

| Section | Purpose |
|---------|---------|
| **Overview** | Dashboard metrics and recent decisions |
| **Policies** | Create, edit, and manage governance policies |
| **Audit Logs** | Search and verify the decision audit trail |
| **Escalations** | Review and resolve escalated decisions |
| **Agents** | Register and manage AI agents |
| **Models** | Approve and configure AI models |
| **Settings** | Organization, team, billing, and integrations |

## Authentication

The dashboard uses NextAuth for authentication. Users can log in with:
- Email/password
- SSO (configurable per organization)

Each user has a role that determines their permissions:
- **OWNER**: Full access to all features
- **ADMIN**: All features except billing management
- **POLICY_MANAGER**: Manage policies, view decisions
- **REVIEWER**: Resolve escalations, view audit logs
- **VIEWER**: Read-only access to dashboard and logs
