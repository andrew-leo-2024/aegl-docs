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

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Pool: API Key Authentication (apiKeyAuth middleware)                          │
│                                                                              │
│  (O)──→[Extract Authorization]──→(X) Header present?                        │
│        [header from request  ]    │                │                         │
│                              [Missing/malformed]  [Present]                  │
│                                    │                │                        │
│                                    ▼                ▼                        │
│                              [Return 401:    ] [Extract token    ]           │
│                              [Missing API key] [from "Bearer {t}"]          │
│                              (X) END              │                          │
│                                                   ▼                          │
│                                          (X) Key ≥ 16 chars?                │
│                                           │              │                   │
│                                      [Too short]    [Valid format]           │
│                                           │              │                   │
│                                           ▼              ▼                   │
│                                    [Return 401:   ] [SHA-256 hash  ]        │
│                                    [Invalid format] [the raw key   ]        │
│                                    (X) END              │                    │
│                                                         ▼                    │
│                                                [DB lookup by     ]           │
│                                                [keyHash           ]          │
│                                                [SELECT: id, orgId,]          │
│                                                [permissions,      ]          │
│                                                [active, expiresAt ]          │
│                                                         │                    │
│                                                         ▼                    │
│                                                (X) Key found?                │
│                                                 │            │               │
│                                            [Not found]  [Found]              │
│                                                 │            │               │
│                                                 ▼            ▼               │
│                                          [Return 401:] (X) Active?           │
│                                          [Invalid key] │          │          │
│                                          (X) END  [Revoked]  [Active]       │
│                                                       │          │          │
│                                                       ▼          ▼          │
│                                                [Return 401:] (X) Expired?   │
│                                                [Key revoked] │          │   │
│                                                (X) END  [Expired]  [Valid]  │
│                                                             │          │    │
│                                                             ▼          ▼    │
│                                                      [Return 401:]         │
│                                                      [Key expired]         │
│                                                      (X) END              │
│                                                                            │
│                                                [Attach to request: ]       │
│                                                [req.organizationId ]       │
│                                                [req.apiKeyId       ]       │
│                                                [req.permissions    ]       │
│                                                         │                   │
│                                                         ▼                   │
│                                                [Async: update    ]          │
│                                                [lastUsedAt = now ]          │
│                                                [(fire-and-forget)]          │
│                                                         │                   │
│                                                         ▼                   │
│                                                [next() — proceed ]──→(O)   │
│                                                [to route handler ]   END    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## BPMN Diagram — RBAC Authorization

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Pool: RBAC Authorization (requirePermission middleware)                       │
│                                                                              │
│  (O)──→[Read req.permissions]──→(X) Has 'admin'?                            │
│        [from auth context   ]    │              │                            │
│                              [No admin]     [Has admin]                      │
│                                  │              │                            │
│                                  ▼              ▼                            │
│                         (X) Has required?  [next() — proceed]──→(O) END     │
│                          │            │                                      │
│                     [Missing]    [Has it]                                    │
│                          │            │                                      │
│                          ▼            ▼                                      │
│                   [Return 403: ] [next() — proceed]──→(O) END               │
│                   [Forbidden,  ]                                             │
│                   [requires:   ]                                             │
│                   [{permission}]                                             │
│                   (X) END                                                    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
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

```
[Generate key]──→[Hash with SHA-256]──→[Store hash in DB]──→[Return raw key ONCE]
                                                                    │
                                    ┌───────────────────────────────┘
                                    │
                              [Key used in API calls]
                                    │
                         ┌──────────┼──────────┐
                         ▼          ▼          ▼
                   [Active use] [Revoked]  [Expired]
                   [lastUsedAt] [active=   [expiresAt
                   [updated   ] [false]    [< now]
```

**Security properties:**
- Raw API key is returned **once** at creation — never stored or retrievable
- Only the SHA-256 hash is stored in the database
- Key comparison is hash-to-hash (constant-time safe)
- `lastUsedAt` tracks usage for audit purposes (async, non-blocking)
- Revocation is immediate — `active=false` checked on every request
