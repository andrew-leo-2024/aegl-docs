---
sidebar_position: 5
title: "SOP-004: Production Deployment"
description: "Step-by-step production deployment procedure"
---

# SOP-004: Production Deployment

## Purpose
Deploy new releases to production with zero downtime and verified rollback capability.

## Scope
API server, Dashboard, Web app, and database migrations.

## Prerequisites
- All CI checks passing on `main` branch
- Docker images built and pushed to ECR
- Database backup completed (SOP-003)
- Maintenance window communicated (if migrations required)

## Procedure

### Pre-Deployment

1. **Verify CI status**:
   ```bash
   gh run list --branch main --limit 3
   ```

2. **Create backup** before deployment:
   ```bash
   ./scripts/backup-postgres.sh
   ```

3. **Tag release**:
   ```bash
   git tag -a v1.x.x -m "Release v1.x.x"
   git push origin v1.x.x
   ```

### Database Migrations (if any)

4. **Review pending migrations**:
   ```bash
   cd apps/api && npx prisma migrate status
   ```

5. **Apply migrations** (zero-downtime compatible):
   ```bash
   npx prisma migrate deploy
   ```

### Application Deployment

6. **Deploy API** (rolling update):
   ```bash
   # Docker Compose
   docker compose -f docker/docker-compose.selfhosted.yml pull api
   docker compose -f docker/docker-compose.selfhosted.yml up -d api

   # ECS
   aws ecs update-service --cluster aegl-production --service aegl-production-api --force-new-deployment
   ```

7. **Deploy Dashboard**:
   ```bash
   docker compose -f docker/docker-compose.selfhosted.yml pull dashboard
   docker compose -f docker/docker-compose.selfhosted.yml up -d dashboard
   ```

### Post-Deployment Verification

8. **Health check**:
   ```bash
   curl https://api.aegl.io/health/ready
   ```

9. **Smoke test** — Submit a test decision:
   ```bash
   curl -X POST https://api.aegl.io/v1/decisions \
     -H "Authorization: Bearer $TEST_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"actionType":"test","actionPayload":{"value":1}}'
   ```

10. **Verify audit integrity**:
    ```bash
    curl https://api.aegl.io/v1/audit/integrity
    ```

11. **Monitor for 30 minutes** — Watch error rates, latency, throughput in Prometheus

## Rollback

If issues detected after deployment:

1. **Revert to previous image**:
   ```bash
   docker compose -f docker/docker-compose.selfhosted.yml up -d api --force-recreate
   ```

2. **If migrations need rollback** — Restore from pre-deployment backup (SOP-003)

3. **Notify team** — Post in incident channel

## Verification
- Health endpoints return 200
- Test decision returns valid outcome
- Audit chain integrity is valid
- Error rate in Prometheus is at baseline
- Latency p95 &lt; 10ms
