---
sidebar_position: 1
title: Troubleshooting Guide
description: Common issues, debugging techniques, and resolution steps
---

# Troubleshooting Guide

## Quick Diagnostics

```bash
# Check API health
curl http://localhost:4000/health
curl http://localhost:4000/health/ready

# Check database connectivity
docker exec aegl-postgres pg_isready

# Check Redis
docker exec aegl-redis redis-cli ping

# Check audit integrity
curl http://localhost:4000/v1/audit/integrity -H "Authorization: Bearer $API_KEY"

# Check container status
docker ps -a | grep aegl
```

## Common Issues

### API Returns 401 Unauthorized

**Symptoms:** All API calls return `{"error":"Unauthorized"}`

**Causes & Fixes:**
1. **Missing API key**: Ensure `Authorization: Bearer {key}` header is present
2. **Revoked key**: Check if key is active in database
3. **Expired key**: Check `expiresAt` field on the API key
4. **Wrong key format**: Key must be at least 16 characters
5. **Mismatched environment**: Ensure you're using the correct key for the environment

### Decision Latency > 10ms

**Symptoms:** `latency_ms` in decision responses exceeds target

**Investigation:**
1. **Check active policy count** — More policies = more evaluation time
   ```bash
   aegl policies list | wc -l
   ```
2. **Check database latency** — Run `EXPLAIN ANALYZE` on slow queries
3. **Check Redis** — If policy cache miss, cold-start is slower
4. **Check API CPU** — High utilization increases latency
5. **Check connection pool** — Exhausted connections queue requests

**Resolution:** Scale API horizontally, optimize policies, increase connection pool

### Audit Chain Integrity Failed

**Symptoms:** `GET /v1/audit/integrity` returns `{"valid":false}`

**This is a compliance-critical event.** Follow [SOP-005: Audit Chain Repair](../sops/sop-005-audit-chain-repair).

### Escalations Not Being Processed

**Symptoms:** Escalations stuck in PENDING; SLA worker not timing them out

**Investigation:**
1. **Check BullMQ worker** — Is the SLA worker running?
   ```bash
   docker logs aegl-api | grep "SLA"
   ```
2. **Check Redis** — Is the queue accessible?
3. **Check job queue** — Are jobs being created?

### Webhooks Not Delivered

**Symptoms:** Webhook endpoints not receiving events

**Investigation:**
1. **Check webhook is active**: `aegl webhooks list` (via API not yet in CLI - check dashboard)
2. **Check BullMQ queue**: Webhook jobs may be stuck or failed
3. **Check target URL**: Must be reachable from the API server
4. **Check signature verification**: Client may be rejecting valid signatures
5. **Check retry status**: Webhooks retry 3 times with exponential backoff

### Docker Compose Won't Start

**Symptoms:** `docker compose up` fails

**Common fixes:**
1. **Port conflicts**: Check if ports 4000, 3001, 3000, 5432, 6379 are in use
2. **Missing .env**: Copy `.env.example` to `.env` and fill in values
3. **Image not built**: Run `docker build` for each Dockerfile first
4. **Postgres data volume**: Try `docker volume rm aegl_postgres_data` (destroys data)

### SDK `decide()` Throws Network Error

**Symptoms:** SDK fails to connect to API

**Fixes:**
1. **Check API URL**: Verify `AEGL_API_URL` environment variable
2. **Check API is running**: `curl {api_url}/health`
3. **Check firewall**: Ensure SDK can reach API on the configured port
4. **Use policy cache**: SDK can use cached policies for offline resilience
   ```typescript
   const client = new AEGL({
     apiKey: 'key',
     apiUrl: 'http://api:4000',
     cache: { enabled: true, ttlSeconds: 300 }
   });
   ```

## Log Analysis

All logs are structured JSON. Key fields:

| Field | Description |
|-------|-------------|
| `traceId` | Request correlation ID — use to trace through all components |
| `message` | Human-readable log message |
| `level` | `info`, `warn`, `error` |
| `decisionId` | Decision identifier (decision logs) |
| `organizationId` | Tenant identifier |
| `latencyMs` | Processing time |
| `error` | Error message (error logs only) |

### Searching Logs

```bash
# Find errors in last hour
docker logs aegl-api --since 1h | jq 'select(.level == "error")'

# Find specific trace
docker logs aegl-api | jq 'select(.traceId == "tr_abc123")'

# Find slow decisions
docker logs aegl-api | jq 'select(.latencyMs > 10)'
```
