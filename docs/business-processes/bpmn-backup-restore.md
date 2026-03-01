---
sidebar_position: 12
title: "BP-012: Backup & Restore"
description: "BPMN — Database backup, verification, offsite storage, and restore procedures"
---

# BP-012: Backup & Restore

**Process ID:** BP-012
**Type:** Scheduled automation + manual restore
**Frequency:** Every 6 hours (configurable)
**RPO:** &lt; 6 hours
**RTO:** &lt; 15 minutes
**Owner:** Platform operations
**Source:** `scripts/backup-postgres.sh`, `docs/disaster-recovery-runbook.md`

## BPMN Diagram — Backup

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Pool: Backup Automation                                                      │
│                                                                              │
│  ⏰──→[Cron fires every   ]──→[Setup:               ]──→[pg_dump:        ]│
│  6h   [6 hours             ]   [BACKUP_DIR = /var/   ]   [--format=custom ]│
│       [                    ]   [backups/aegl         ]   [--compress=9    ]│
│                                [TIMESTAMP = now      ]   [--no-owner      ]│
│                                [Ensure dir exists    ]   [--no-privileges ]│
│                                                          [| gzip          ]│
│                                                              │              │
│                                                              ▼              │
│                                                     [Verify integrity:   ]  │
│                                                     [gzip -t backup.gz  ]  │
│                                                              │              │
│                                                              ▼              │
│                                                     (X) Integrity OK?       │
│                                                      │              │       │
│                                                 [Corrupted]    [Valid]      │
│                                                      │              │       │
│                                                      ▼              ▼       │
│                                               [Log ERROR   ] (X) S3 configured?│
│                                               [Exit code 1 ]  │          │  │
│                                               (X) FAIL       [No S3]  [S3] │
│                                                                │       │   │
│                                                                ▼       ▼   │
│                                                          [Skip S3 ] [aws ] │
│                                                          [upload  ] [s3  ] │
│                                                                     [cp  ] │
│                                                                     [with] │
│                                                                     [SSE ] │
│                                                                     [KMS ] │
│                                                                       │    │
│                                                              ┌────────┘    │
│                                                              ▼             │
│                                                     [Cleanup: delete    ]  │
│                                                     [backups older than ]  │
│                                                     [RETENTION days     ]  │
│                                                              │              │
│                                                              ▼              │
│                                                     [Log: "Backup        ] │
│                                                     [complete"           ] │
│                                                     (O) END                │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## BPMN Diagram — Restore

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Pool: Disaster Recovery (Manual)                                             │
│                                                                              │
│  (O)──→[Identify incident  ]──→[Select backup:     ]──→[Stop API         ]│
│        [and scope          ]   [latest verified    ]   [service(s)       ]│
│                                [backup file        ]                       │
│                                                              │              │
│                                                              ▼              │
│                                                    [Restore command:     ]  │
│                                                    [gunzip -c backup.gz ]  │
│                                                    [| pg_restore         ]  │
│                                                    [--dbname=aegl        ]  │
│                                                    [--clean              ]  │
│                                                    [--if-exists          ]  │
│                                                              │              │
│                                                              ▼              │
│                                                    [Run Prisma migrate  ]  │
│                                                    [deploy (apply       ]  │
│                                                    [pending migrations) ]  │
│                                                              │              │
│                                                              ▼              │
│                                                    [Verify audit chain  ]  │
│                                                    [GET /v1/audit/      ]  │
│                                                    [integrity           ]  │
│                                                              │              │
│                                                              ▼              │
│                                                    (X) Chain valid?         │
│                                                     │              │        │
│                                                [Invalid]      [Valid]      │
│                                                     │              │        │
│                                                     ▼              ▼        │
│                                              [Investigate  ] [Restart API]  │
│                                              [corruption,  ] [service(s) ]  │
│                                              [try older    ] [Verify     ]  │
│                                              [backup       ] [health     ]  │
│                                                              (O) END        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Backup Schedule

| Type | Frequency | Retention (Local) | Retention (S3) | Encryption |
|------|-----------|-------------------|----------------|------------|
| pg_dump (full) | Every 6 hours | 7 days | 30 days | AES-256 (S3 SSE-KMS) |
| WAL archive | Continuous | 7 days | 7 days | AES-256 |
| Redis AOF | Continuous | Local volume | — | — |
| Config/Secrets | On change | Indefinite | — | Secrets Manager |

## RPO/RTO Targets

| Component | RPO | RTO | Strategy |
|-----------|-----|-----|----------|
| **Audit Logs** | 0 (zero loss) | &lt; 15 min | WAL archiving + streaming replication |
| **Policy Store** | &lt; 1 min | &lt; 5 min | Streaming replication + auto-failover |
| **Decision Engine** | N/A | &lt; 2 min | Stateless, container restart |
| **Dashboard** | N/A | &lt; 5 min | Stateless, container restart |
| **Redis** | &lt; 5 min | &lt; 5 min | AOF + Sentinel failover |

## Configuration

| Parameter | Default | Env Var |
|-----------|---------|---------|
| Backup directory | /var/backups/aegl | `BACKUP_DIR` |
| Retention days | 7 | `BACKUP_RETENTION` |
| S3 bucket | — | `S3_BUCKET` |
| S3 prefix | — | `S3_PREFIX` |
| KMS key | — | `AWS_KMS_KEY_ID` |
| Compression | 9 (max) | — |
