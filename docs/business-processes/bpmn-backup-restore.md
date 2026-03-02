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

```mermaid
flowchart TD
    CRON["⏰ Cron fires every 6h"] --> SETUP["Setup:\nBACKUP_DIR, TIMESTAMP\nEnsure dir exists"]
    SETUP --> DUMP["pg_dump:\n--format=custom --compress=9\n--no-owner --no-privileges\n| gzip"]
    DUMP --> VERIFY["Verify integrity:\ngzip -t backup.gz"]
    VERIFY --> INTEG{"Integrity OK?"}
    INTEG -->|"Corrupted"| FAIL["Log ERROR\nExit code 1"]
    INTEG -->|"Valid"| S3{"S3 configured?"}
    S3 -->|"No S3"| SKIP["Skip S3 upload"]
    S3 -->|"Yes"| UPLOAD["aws s3 cp\nwith SSE-KMS"]
    SKIP --> CLEANUP["Cleanup: delete backups\nolder than RETENTION days"]
    UPLOAD --> CLEANUP
    CLEANUP --> DONE["Log: 'Backup complete'"]
```

## BPMN Diagram — Restore

```mermaid
flowchart TD
    START(["O"]) --> IDENTIFY["Identify incident\nand scope"]
    IDENTIFY --> SELECT["Select backup:\nlatest verified file"]
    SELECT --> STOP["Stop API service(s)"]
    STOP --> RESTORE["Restore command:\ngunzip -c | pg_restore\n--dbname=aegl --clean"]
    RESTORE --> MIGRATE["Run Prisma migrate deploy\n(apply pending migrations)"]
    MIGRATE --> AUDIT["Verify audit chain\nGET /v1/audit/integrity"]
    AUDIT --> VALID{"Chain valid?"}
    VALID -->|"Invalid"| INVESTIGATE["Investigate corruption\ntry older backup"]
    VALID -->|"Valid"| RESTART["Restart API service(s)\nVerify health"]
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
