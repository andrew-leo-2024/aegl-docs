---
sidebar_position: 6
title: "BP-005: Authentication & Authorization"
description: "BPMN — API key authentication and RBAC permission enforcement"
---

# BP-005: Authentication & Authorization

**Process ID:** BP-005
**Type:** Per-request middleware
**SLA:** &lt; 2ms combined
**Trigger:** Every API request
**Owner:** Auth middleware
**Source:** `apps/api/src/auth/api-key.ts`, `apps/api/src/auth/rbac.ts`

## BPMN Diagram — Authentication

```mermaid
flowchart TD
    START(["Request"]) --> EXTRACT["Extract Authorization header"]
    EXTRACT --> HDR{"Header present?"}
    HDR -->|"Missing"| ERR1["401: Missing API key"]
    HDR -->|"Present"| TOKEN["Extract token from Bearer"]
    TOKEN --> LEN{"Key >= 16 chars?"}
    LEN -->|"Too short"| ERR2["401: Invalid format"]
    LEN -->|"Valid"| HASH["SHA-256 hash the raw key"]
    HASH --> LOOKUP["DB lookup by keyHash"]
    LOOKUP --> FOUND{"Key found?"}
    FOUND -->|"Not found"| ERR3["401: Invalid key"]
    FOUND -->|"Found"| ACTIVE{"Active?"}
    ACTIVE -->|"Revoked"| ERR4["401: Key revoked"]
    ACTIVE -->|"Active"| EXPIRED{"Expired?"}
    EXPIRED -->|"Expired"| ERR5["401: Key expired"]
    EXPIRED -->|"Valid"| ATTACH["Attach to request:\norganizationId, apiKeyId, permissions"]
    ATTACH --> ASYNC["Async: update lastUsedAt"]
    ASYNC --> NEXT["next() — proceed to route handler"]
```

## BPMN Diagram — RBAC Authorization

```mermaid
flowchart TD
    START(["Request"]) --> READ["Read req.permissions from auth context"]
    READ --> ADMIN{"Has 'admin'?"}
    ADMIN -->|"Yes"| PASS1["next() — proceed"]
    ADMIN -->|"No"| REQ{"Has required permission?"}
    REQ -->|"Yes"| PASS2["next() — proceed"]
    REQ -->|"No"| DENY["403: Forbidden\nrequires: permission"]
```

## RBAC Permission Matrix

| Role | Permissions Granted |
|------|-------------------|
| **OWNER** | `admin` (grants all) |
| **ADMIN** | `decisions:read`, `decisions:write`, `policies:read`, `policies:write`, `escalations:read`, `escalations:write`, `agents:read`, `agents:write`, `models:read`, `models:write`, `webhooks:read`, `webhooks:write`, `audit:read`, `audit:export`, `org:read`, `org:write` |
| **POLICY_MANAGER** | `decisions:read`, `policies:read`, `policies:write`, `escalations:read`, `agents:read`, `models:read`, `webhooks:read`, `webhooks:write`, `audit:read`, `audit:export` |
| **REVIEWER** | `decisions:read`, `escalations:read`, `escalations:write`, `agents:read`, `models:read`, `audit:read` |
| **VIEWER** | `decisions:read`, `escalations:read`, `agents:read`, `models:read`, `audit:read` |

## API Key Lifecycle

```mermaid
flowchart LR
    GEN["Generate key"] --> HASH["Hash with SHA-256"]
    HASH --> STORE["Store hash in DB"]
    STORE --> RETURN["Return raw key ONCE"]
    RETURN --> USE["Key used in API calls"]
    USE --> ACTIVE["Active use\nlastUsedAt updated"]
    USE --> REVOKED["Revoked\nactive = false"]
    USE --> EXPIRED["Expired\nexpiresAt < now"]
```

**Security properties:**
- Raw API key is returned **once** at creation — never stored or retrievable
- Only the SHA-256 hash is stored in the database
- Key comparison is hash-to-hash (constant-time safe)
- `lastUsedAt` tracks usage for audit purposes (async, non-blocking)
- Revocation is immediate — `active=false` checked on every request
