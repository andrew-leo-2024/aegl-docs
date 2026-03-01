---
sidebar_position: 6
title: "SOP-005: Audit Chain Repair"
description: "Handling broken hash chain integrity — compliance-critical procedure"
---

# SOP-005: Audit Chain Repair

## Purpose
Investigate and repair audit hash chain integrity failures. This is a **compliance-critical** procedure — a broken chain may indicate data tampering.

## Scope
AuditLog table with SHA-256 hash-chained records.

## Prerequisites
- `audit:read` API permissions
- Database read access
- Latest verified backup available
- Security team notified

:::danger
A broken audit chain is a compliance event. Do NOT modify audit data without following this procedure. All actions must be documented.
:::

## Procedure

### Phase 1: Detection

1. **Detect break**:
   ```bash
   curl https://api.aegl.io/v1/audit/integrity
   # Returns: { "valid": false, "broken_at": "4523", "total_blocks": 15847 }
   ```

2. **Record details**: Note `broken_at` sequence number and timestamp

### Phase 2: Investigation

3. **Query the broken block**:
   ```sql
   SELECT * FROM "AuditLog"
   WHERE "sequenceNumber" = 4523
   AND "organizationId" = 'org_xxx';
   ```

4. **Query surrounding blocks**:
   ```sql
   SELECT "sequenceNumber", "hash", "previousHash", "createdAt"
   FROM "AuditLog"
   WHERE "sequenceNumber" BETWEEN 4520 AND 4526
   AND "organizationId" = 'org_xxx'
   ORDER BY "sequenceNumber";
   ```

5. **Compare with backup** — Restore backup to staging and compare the same block

6. **Determine root cause**:
   - Direct database modification (unauthorized)
   - Application bug in hash computation
   - Database corruption (hardware)
   - Intentional tampering

### Phase 3: Remediation

7. **If backup matches production** — Bug in hash computation:
   - Fix the application code
   - The chain break is a known artifact; document it

8. **If backup differs from production** — Data was modified after creation:
   - Preserve production data as evidence
   - Restore from backup
   - File security incident report
   - Notify compliance officer and legal

9. **If no backup covers the break point**:
   - Document the gap
   - The chain is permanently broken at that point
   - All records after the break point have reduced legal standing
   - Generate a "chain break certificate" documenting the incident

### Phase 4: Documentation

10. **Create incident report** with:
    - Break point (sequence number, timestamp)
    - Root cause analysis
    - Remediation steps taken
    - Impact assessment (which decisions are affected)
    - Future prevention measures

## Verification
- After repair: `GET /v1/audit/integrity` returns `valid: true`
- Incident report filed and reviewed by compliance officer
- Preventive measures implemented

## Escalation
- **Immediately**: Security team + Compliance officer
- **Within 1 hour**: Platform lead + CTO
- **If data breach**: Legal counsel + affected customers
