---
sidebar_position: 4
title: "SOP-003: Database Backup & Restore"
description: "Backup verification, restore procedures, and disaster recovery"
---

# SOP-003: Database Backup & Restore

## Purpose
Ensure database backups are created, verified, and restorable to meet RPO &lt; 6 hours.

## Scope
PostgreSQL database containing all E-AEGL data: decisions, policies, audit logs, organizations, users.

## Prerequisites
- `pg_dump` and `pg_restore` available
- Access to backup storage (local + S3)
- Database credentials

## Procedure — Verify Backup (Weekly)

1. **Check backup exists**:
   ```bash
   ls -la /var/backups/aegl/aegl_*.sql.gz | tail -5
   ```

2. **Verify latest backup integrity**:
   ```bash
   LATEST=$(ls -t /var/backups/aegl/aegl_*.sql.gz | head -1)
   gzip -t "$LATEST" && echo "PASS" || echo "FAIL"
   ```

3. **Test restore to staging** (monthly):
   ```bash
   # Create test database
   createdb aegl_restore_test

   # Restore
   gunzip -c "$LATEST" | pg_restore --dbname=aegl_restore_test --clean --if-exists

   # Verify record counts
   psql aegl_restore_test -c "SELECT COUNT(*) FROM \"Decision\";"
   psql aegl_restore_test -c "SELECT COUNT(*) FROM \"AuditLog\";"

   # Cleanup
   dropdb aegl_restore_test
   ```

4. **Check S3 backups** (if configured):
   ```bash
   aws s3 ls s3://${S3_BUCKET}/${S3_PREFIX}/ --recursive | tail -5
   ```

## Procedure — Emergency Restore

1. **Stop API services**:
   ```bash
   docker stop aegl-api
   ```

2. **Identify backup to restore**:
   ```bash
   # List available backups (newest first)
   ls -lt /var/backups/aegl/aegl_*.sql.gz

   # Or from S3
   aws s3 ls s3://${S3_BUCKET}/${S3_PREFIX}/ --recursive
   ```

3. **Restore database**:
   ```bash
   gunzip -c /var/backups/aegl/aegl_YYYYMMDD_HHMMSS.sql.gz \
     | pg_restore --dbname=aegl --clean --if-exists
   ```

4. **Apply pending migrations**:
   ```bash
   cd apps/api && npx prisma migrate deploy
   ```

5. **Verify audit chain integrity**:
   ```bash
   curl http://localhost:4000/v1/audit/integrity
   # Must return: { "valid": true }
   ```

6. **Restart API services**:
   ```bash
   docker start aegl-api
   ```

7. **Verify health**:
   ```bash
   curl http://localhost:4000/health/ready
   ```

## Verification
- Backup file exists and passes gzip integrity check
- Restore completes without errors
- Audit chain integrity returns `valid: true`
- Record counts match expectations
- API health check passes after restore

## Rollback
If restore introduces problems, restore from an older backup. Backups are retained for 7 days locally and 30 days on S3.

## Escalation
- On-call engineer: first responder
- Platform lead: approves production restore operations
- Compliance officer: notified if audit data loss exceeds RPO
