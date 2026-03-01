---
sidebar_position: 10
title: "SOP-009: Compliance Audit Preparation"
description: "Preparing for SOC 2, regulatory, and customer audits"
---

# SOP-009: Compliance Audit Preparation

## Purpose
Prepare evidence and documentation for SOC 2 Type II, regulatory examinations, and customer due diligence audits.

## Scope
All compliance-relevant controls: access control, change management, monitoring, data protection.

## Schedule
Quarterly preparation; on-demand for regulatory requests.

## Procedure

### Phase 1: Evidence Collection (Week 1)

1. **Generate SOC 2 evidence report**:
   ```bash
   curl "https://api.aegl.io/v1/compliance/soc2-evidence?period=2026-Q1" \
     -H "Authorization: Bearer $ADMIN_KEY" > soc2-evidence-q1.json
   ```

2. **Generate compliance summary**:
   ```bash
   curl "https://api.aegl.io/v1/compliance/summary" \
     -H "Authorization: Bearer $ADMIN_KEY" > compliance-summary.json
   ```

3. **Export audit trail** for the period:
   ```bash
   aegl audit export --from 2026-01-01 --to 2026-03-31 --format csv > audit-q1.csv
   ```

4. **Verify hash chain integrity**:
   ```bash
   aegl audit integrity
   # Must return: Chain integrity: VALID
   ```

### Phase 2: Evidence Review (Week 2)

5. **Review access control evidence**:
   - API keys created/revoked during period
   - User role assignments
   - Any unauthorized access attempts

6. **Review change management evidence**:
   - Policy changes (create, update, deactivate) with version history
   - Code deployments (git log, CI/CD records)

7. **Review monitoring evidence**:
   - Decision latency SLA compliance (target: 99% under 10ms)
   - Escalation resolution times
   - System availability metrics

8. **Review data protection evidence**:
   - Audit chain integrity (must be valid)
   - Encryption status
   - Backup verification records

### Phase 3: Gap Remediation (Week 3)

9. **Address critical issues** from the evidence report
10. **Address recommendations** from the evidence report
11. **Document any exceptions** with rationale

### Phase 4: Audit Readiness (Week 4)

12. **Prepare evidence binder**:
    - SOC 2 evidence report (JSON or PDF)
    - Audit trail export (CSV)
    - Chain integrity verification results
    - System architecture documentation
    - Incident reports (if any)
    - Change log / deployment records

13. **Brief audit team** on:
    - Platform architecture (reference this documentation site)
    - Data flow diagrams
    - Control descriptions
    - Any incidents during the audit period

14. **Schedule auditor access** (read-only):
    - Create VIEWER API key for auditor
    - Provide dashboard read-only access
    - Provide documentation site access

## Verification
- All evidence reports generated without errors
- Hash chain integrity is valid
- No critical issues unresolved
- Evidence binder complete and reviewed
- Auditor access configured and tested

## SOC 2 Controls Checklist

| Control | Evidence Source | Verification |
|---------|---------------|-------------|
| Access management | API key lifecycle, RBAC roles | `soc2-evidence.access_control` |
| Change management | Policy versioning, git history | `soc2-evidence.change_management` |
| Monitoring | Decision metrics, latency SLA | `soc2-evidence.monitoring` |
| Incident management | Incident reports, resolution times | Incident log review |
| Data integrity | Hash chain verification | `GET /v1/audit/integrity` |
| Encryption | Tenant encryption keys | `soc2-evidence.data_protection` |
| Backup and recovery | Backup logs, restore tests | SOP-003 execution records |
| Availability | Uptime metrics | Prometheus `up` metric |
