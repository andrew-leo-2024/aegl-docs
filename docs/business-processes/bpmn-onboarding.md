---
sidebar_position: 9
title: "BP-009: Tenant Onboarding"
description: "BPMN — New customer setup from signup to first governed decision"
---

# BP-009: Tenant Onboarding

**Process ID:** BP-009
**Type:** Manual + automated
**SLA:** &lt; 1 business day
**Trigger:** New customer signs up or contract signed
**Owner:** Platform team + customer

## BPMN Diagram

```mermaid
flowchart TD
    subgraph CUSTOMER["Pool: Customer"]
        C1(["O"]) --> C2["Sign contract /\nregister account"]
        C2 --> C3["Receive org credentials\n+ API key"]
        C3 --> C4["Install SDK\nnpm install @aegl/sdk"]
        C4 --> C5["Configure aegl\nin application\naegl.decide()"]
        C5 --> C6["Define first policy\n(YAML or Dashboard)"]
        C6 --> C7["Submit test decision\nVerify response"]
        C7 --> C_END(["O"])
    end

    subgraph PLATFORM["Pool: E-AEGL Platform"]
        subgraph SETUP["Lane: Organization Setup"]
            P1(["O"]) --> P2["Create Organization\nname, slug, plan"]
            P2 --> P3["Generate admin\nuser account"]
            P3 --> P4["Create API key\n(OWNER permissions)"]
            P4 --> P5["Generate tenant\nencryption key\n(if encrypted plan)"]
        end
        subgraph CONFIG["Lane: Default Configuration"]
            D1["Apply default settings\ntimezone, locale"] --> D2["Set data residency\nregion (US default)"]
            D2 --> D3["Configure webhook\ntemplates"]
        end
        subgraph VERIFY["Lane: Verification"]
            V1["First API call\nauthenticates"] --> V2["First decision\nprocessed < 10ms"]
            V2 --> V3["Audit log\ngenesis block created"]
            V3 --> V4["Onboarding complete"]
            V4 --> P_END(["O"])
        end
    end
```

## Onboarding Checklist

| Step | Actor | Action | Verification |
|------|-------|--------|-------------|
| 1 | Platform | Create Organization record | org.id exists in DB |
| 2 | Platform | Create admin User account | user can login to dashboard |
| 3 | Platform | Generate OWNER API key | Key authenticates successfully |
| 4 | Platform | Generate tenant encryption key | Key stored securely |
| 5 | Customer | Install SDK in application | `import { AEGL } from '@aegl/sdk'` compiles |
| 6 | Customer | Configure API key | `AEGL_API_KEY` env var set |
| 7 | Customer | Write first policy | Policy visible in dashboard |
| 8 | Customer | Submit test decision | Response includes outcome + trace_id |
| 9 | Customer | Verify audit log | Dashboard shows first audit entry |
| 10 | Customer | Configure webhooks (optional) | Webhook receives test event |

## Self-Hosted Onboarding

For self-hosted deployments, additional steps:

| Step | Actor | Action |
|------|-------|--------|
| 1 | Customer DevOps | `docker compose -f docker-compose.selfhosted.yml up` |
| 2 | Customer DevOps | Run Prisma migrations: `npx prisma migrate deploy` |
| 3 | Customer DevOps | Seed initial organization: `npm run seed` |
| 4 | Customer DevOps | Configure `.env` with secrets |
| 5 | Customer DevOps | Verify health: `curl http://localhost:4000/health/ready` |
| 6 | Customer | Connect SDK to self-hosted API URL |
