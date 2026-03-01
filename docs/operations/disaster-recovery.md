---
sidebar_position: 4
title: Disaster Recovery
description: Backup, restore, and disaster recovery procedures
---

# Disaster Recovery

E-AEGL provides comprehensive disaster recovery capabilities with defined RPO and RTO targets.

## Recovery Objectives

| Metric | Target |
|--------|--------|
| **RPO** (Recovery Point Objective) | 6 hours (backup frequency) |
| **RTO** (Recovery Time Objective) | < 30 minutes |

## Scenario Playbook

### 1. Primary Database Failure

**Symptoms**: API returns 500 errors, health/ready fails

**Recovery**:
1. Promote replica to primary (if HA deployment)
2. Update `DATABASE_URL` to point to new primary
3. Restart API services
4. Verify audit chain integrity

**RTO**: < 5 minutes (with HA), < 30 minutes (without)

### 2. Complete Data Loss

**Symptoms**: Database empty or corrupted

**Recovery**:
1. Stop API services
2. Restore from latest backup:
   ```bash
   gunzip < backup-latest.sql.gz | psql $DATABASE_URL
   ```
3. Verify audit chain integrity
4. Restart API services
5. Reconcile any decisions made since last backup

**RTO**: < 30 minutes

### 3. Redis Failure

**Symptoms**: Webhook delivery stops, escalation SLA monitoring stops

**Recovery**:
1. Redis is non-critical — API continues to function
2. Restart Redis
3. Workers will reconnect automatically
4. Pending queue items are replayed

**RTO**: < 5 minutes

### 4. API Server Crash

**Symptoms**: All API requests fail

**Recovery**:
1. Check logs for root cause
2. Restart API container/process
3. Graceful shutdown ensures no data loss

**RTO**: < 2 minutes

### 5. Network Partition

**Symptoms**: SDKs cannot reach API

**Recovery**:
- SDKs with policy cache continue operating offline
- Audit logs queue locally
- When connectivity restores, queued audits are submitted
- No manual intervention needed

### 6. Audit Chain Corruption

**Symptoms**: `GET /v1/audit/integrity` returns `valid: false`

**Recovery**:
1. Identify the broken block number
2. Investigate the cause (database modification, migration issue)
3. If intentional (migration): document the break, reset genesis
4. If unintentional: restore from backup before the break
5. Report to compliance team

## Backup Procedures

### Automated Backups

The HA deployment includes automated backups every 6 hours:

```bash
# Manual trigger
./scripts/backup-postgres.sh
```

Backups are:
- Compressed with gzip
- Uploaded to S3 (if configured)
- Retained for 30 days
- Named with timestamp: `aegl-backup-20260301-120000.sql.gz`

### Verify Backups

Periodically verify backup integrity:

```bash
# Restore to a test database
createdb aegl_test
gunzip < backup-latest.sql.gz | psql aegl_test

# Verify audit chain
curl http://localhost:4000/v1/audit/integrity
```

## High-Availability Architecture

```
                    Traefik LB
                   ┌─────┴─────┐
                   │           │
              API-1:4000   API-2:4000
                   │           │
              ┌────┴───────────┴────┐
              │                     │
        PG Primary            PG Replica
        (write)               (read)
              │                     │
              └──── WAL Streaming ──┘

        Redis Sentinel (3 nodes)
        └── Master election on failure
```
