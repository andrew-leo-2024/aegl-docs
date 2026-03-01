---
sidebar_position: 9
title: "SOP-008: Capacity Planning"
description: "Scaling the platform based on usage growth"
---

# SOP-008: Capacity Planning

## Purpose
Proactively scale E-AEGL infrastructure based on usage trends to maintain &lt;10ms latency SLA.

## Scope
API compute, database capacity, Redis cache, and queue workers.

## Schedule
Monthly review; immediate action if thresholds breached.

## Procedure

### Monthly Review

1. **Check usage trends**:
   ```bash
   aegl decisions list --limit 1  # Check total count in pagination
   ```
   Or via API: `GET /v1/org/usage/history?months=6`

2. **Review Prometheus metrics**:
   - `aegl_decisions_total` — Total decisions per period
   - `aegl_decision_duration_seconds` — Latency percentiles
   - `aegl_escalations_pending` — Escalation backlog
   - Container CPU/memory utilization

3. **Scaling thresholds**:

   | Metric | Warning | Critical | Action |
   |--------|---------|----------|--------|
   | API CPU utilization | > 60% | > 80% | Add API replicas |
   | Decision latency p95 | > 8ms | > 15ms | Investigate; scale DB/API |
   | Database connections | > 70% max | > 85% max | Increase connection pool |
   | Redis memory | > 70% | > 85% | Scale Redis node |
   | Pending escalations | > 50 | > 200 | Add reviewers; check SLA worker |

### Scaling Actions

4. **Scale API horizontally**:
   ```bash
   # Docker Compose
   docker compose -f docker/docker-compose.selfhosted.yml up -d --scale api=3

   # ECS
   aws ecs update-service --cluster aegl-production \
     --service aegl-production-api --desired-count 4

   # Kubernetes
   kubectl scale deployment aegl-api --replicas=4
   ```

5. **Scale database vertically**:
   - Aurora Serverless: Increase `max_capacity` in Terraform
   - Self-hosted: Migrate to larger instance

6. **Scale Redis**:
   - Add read replicas for cache reads
   - Increase node size for memory

## Capacity Model

| Decisions/Month | API Replicas | DB Instance | Redis |
|----------------|-------------|-------------|-------|
| &lt; 1M | 1 | db.t3.medium | cache.t3.small |
| 1M - 10M | 2 | db.r6g.large | cache.r6g.large |
| 10M - 100M | 4 | db.r6g.xlarge | cache.r6g.xlarge |
| 100M+ | 8+ | Aurora Serverless (auto) | Redis Cluster |
