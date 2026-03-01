---
sidebar_position: 2
title: "SOP-001: Incident Response"
description: "Security and availability incident response playbook"
---

# SOP-001: Incident Response

## Purpose
Provide a structured response to security incidents, availability incidents, and data integrity incidents affecting the E-AEGL platform.

## Scope
All E-AEGL production components: API, Dashboard, PostgreSQL, Redis, workers, and network infrastructure.

## Severity Levels

| Level | Definition | Response Time | Examples |
|-------|-----------|---------------|---------|
| **SEV-1** | Platform unavailable or data breach | 15 minutes | API down, audit chain compromised, data leak |
| **SEV-2** | Degraded service or security concern | 1 hour | Elevated latency, failed auth spike, worker crash |
| **SEV-3** | Minor issue, no customer impact | 4 hours | Non-critical log errors, monitoring gap |

## Prerequisites
- Access to production infrastructure (Docker/K8s, database, monitoring)
- On-call rotation schedule active
- Communication channels configured (Slack, PagerDuty)

## Procedure

### Phase 1: Detection & Triage (0-15 minutes)

1. **Acknowledge alert** — Respond in on-call channel within 5 minutes
2. **Assess severity** — Use the severity table above
3. **Check health endpoints**:
   ```bash
   curl https://api.aegl.io/health
   curl https://api.aegl.io/health/ready
   ```
4. **Check monitoring dashboards** — Prometheus/Grafana for anomalies
5. **Declare incident** — If SEV-1 or SEV-2, create incident channel

### Phase 2: Containment (15-60 minutes)

6. **If API unavailable**:
   ```bash
   # Check container status
   docker ps -a | grep aegl
   # Check logs
   docker logs aegl-api --tail 100
   # Restart if unresponsive
   docker restart aegl-api
   ```

7. **If database unavailable**:
   ```bash
   # Check PostgreSQL
   docker exec aegl-postgres pg_isready
   # Check replication (if HA)
   docker exec aegl-postgres psql -c "SELECT * FROM pg_stat_replication;"
   ```

8. **If audit chain compromised**:
   ```bash
   # Verify chain integrity
   curl https://api.aegl.io/v1/audit/integrity
   # If invalid, identify break point — DO NOT modify audit data
   ```

9. **If data breach suspected**:
   - Immediately revoke all API keys for affected organization
   - Preserve all logs — do not rotate or delete
   - Notify security team and legal

### Phase 3: Resolution (1-4 hours)

10. **Apply fix** — Deploy hotfix, restore from backup, or reconfigure
11. **Verify resolution** — Confirm health endpoints, run integration tests
12. **Verify audit integrity** — `GET /v1/audit/integrity` must return `valid: true`

### Phase 4: Post-Incident (24-72 hours)

13. **Write incident report** — Timeline, root cause, impact, resolution
14. **Update runbooks** — If procedures were missing or incorrect
15. **Implement preventive measures** — Monitoring, alerting, code fixes
16. **Notify affected customers** — If customer data or SLA was impacted

## Verification
- All health endpoints return 200
- Prometheus metrics show normal latency and error rates
- Audit chain integrity verified
- No pending alerts in monitoring

## Escalation

| Severity | Primary | Secondary | Executive |
|----------|---------|-----------|-----------|
| SEV-1 | On-call engineer | Platform lead + Security | CTO within 1 hour |
| SEV-2 | On-call engineer | Platform lead | CTO if unresolved in 4 hours |
| SEV-3 | On-call engineer | — | — |

## Audit Chain Compromise — Special Procedure

If `GET /v1/audit/integrity` returns `valid: false`:

1. **STOP** — Do not modify any audit data
2. **Record** the `broken_at` sequence number
3. **Compare** with latest verified backup
4. **Identify** whether corruption is in production or backup
5. **Contact** security team and compliance officer immediately
6. **Restore** from last verified backup if necessary (see [SOP-005](./sop-005-audit-chain-repair))
7. **File incident report** — This is a compliance-critical event
