---
sidebar_position: 1
title: System Context Diagram
description: "C4 Level 1 — How E-AEGL fits into the enterprise landscape"
---

# System Context Diagram

## C4 Level 1: System Context

```mermaid
flowchart TD
    REG["Regulator\n(OCC, EU, State DOI)"] -->|"Audit request\n(compliance reports)"| AEGL
    PROVIDER["AI Model Provider\n(OpenAI, Anthropic,\nopen-source)"] -->|"AI output"| ENTERPRISE
    ENTERPRISE["Enterprise AI Application\n(with SDK)"] -->|"decision request"| AEGL
    AEGL -->|"outcome"| ENTERPRISE
    DASH["Dashboard Users\n(Compliance, Risk, Admin)"] -->|"Dashboard UI"| AEGL

    subgraph AEGL["E-AEGL — AI Decision Control Infrastructure"]
        PE["Policy Engine"]
        AL["Audit Logger"]
        ES["Escalation System"]
    end

    AEGL --> PG[("PostgreSQL\n(primary)")]
    AEGL --> RD[("Redis\n(cache/queue)")]
    AEGL --> WH["Webhooks\n(Slack, PagerDuty, etc.)"]
```

## C4 Level 2: Container Diagram

```mermaid
flowchart TD
    subgraph PLATFORM["E-AEGL Platform"]
        subgraph API_SERVER["API Server (Express + TypeScript) :4000"]
            DP["Decision Pipeline"]
            PEng["Policy Engine"]
            AG["Action Gate"]
            AuL["Audit Logger"]
        end

        DASH_APP["Dashboard\n(Next.js 14 + NextAuth)\n:3001"]
        WEB["Marketing Website\n(Next.js)\n:3000"]
        SLA["SLA Worker (BullMQ)\nChecks expired\nescalations every 5 min"]
        WHW["Webhook Worker (BullMQ)\nDelivers webhook events\nwith retry"]

        PG16[("PostgreSQL 16\n16 tables\nAudit trail\nAll state")]
        RD7[("Redis 7\nBullMQ queues\nPolicy cache\nSession cache")]
    end

    DASH_APP -->|"HTTP"| API_SERVER
    API_SERVER --> PG16
    API_SERVER --> RD7
    SLA --> PG16
    SLA --> RD7
    WHW --> RD7
```

## Data Flow: Decision Request

```mermaid
flowchart TD
    SDK["SDK (TypeScript/Python)\nPOST /v1/decisions"] --> AUTH["Auth Middleware\nSHA-256 key lookup"]
    AUTH --> DB_AUTH[("PostgreSQL")]
    AUTH --> PE["Policy Engine\nFetch policies, evaluate in-memory"]
    PE --> DB_POL[("PostgreSQL")]
    PE --> GATE["Action Gate\nCombine policy result + agent risk"]
    GATE --> TX["Prisma Transaction"]
    TX --> DB_TX[("PostgreSQL")]
    TX -->|"Decision record\nPolicyEvaluation records\nEscalation record (if ESCALATED)\nAuditLog record (hash-chained)"| DB_TX
    GATE --> WH_Q["Webhook Queue"]
    WH_Q --> REDIS[("Redis (BullMQ)")]
    REDIS --> WHW["Webhook Worker"] --> EXT["External URLs"]
    GATE --> RESP["Response → SDK\ndecision_id, trace_id,\noutcome, evaluations, latency_ms"]
```

## Technology Boundaries

| Boundary | Protocol | Authentication | Latency |
|----------|----------|---------------|---------|
| SDK → API | HTTPS / gRPC | Bearer API key | ~1ms (local), ~10ms (remote) |
| API → PostgreSQL | TCP (libpq) | Connection string credentials | ~1ms |
| API → Redis | TCP (RESP) | Connection string (optional auth) | ~0.5ms |
| Dashboard → API | HTTPS | Session cookie (NextAuth) | ~10ms |
| Webhook Worker → External | HTTPS | HMAC-SHA256 signature | Variable |
| CLI → API | HTTPS | Bearer API key | ~10ms |
