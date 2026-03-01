---
sidebar_position: 1
title: Deployment
description: Docker, Docker Compose, and production deployment guide
---

# Deployment

E-AEGL supports Docker Compose, Kubernetes, and bare-metal deployments.

## Docker Compose (Recommended)

### Standard Deployment

```bash
git clone https://github.com/aegl/aegl.git
cd aegl
cp .env.example .env
# Edit .env with your configuration

docker compose -f docker-compose.selfhosted.yml up -d
```

Services:
- **API**: Port 4000
- **Dashboard**: Port 3000
- **PostgreSQL**: Port 5432
- **Redis**: Port 6379

### High-Availability Deployment

```bash
docker compose -f docker/docker-compose.ha.yml up -d
```

Additional services:
- PostgreSQL primary + streaming replica
- Redis Sentinel (3 nodes for quorum)
- Dual API instances
- Traefik load balancer (port 80/443)
- Automated backup cron (every 6 hours)

## Build from Source

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate --schema=apps/api/prisma/schema.prisma

# Build all packages
npm run build

# Run migrations
npx prisma db push --schema=apps/api/prisma/schema.prisma

# Start
node apps/api/dist/index.js
```

## Environment Variables

### Required

```bash
DATABASE_URL=postgresql://aegl:password@localhost:5432/aegl
JWT_SECRET=your-jwt-secret-minimum-32-chars
API_KEY_SALT=your-api-key-salt-minimum-16-chars
```

### Optional

```bash
REDIS_URL=redis://localhost:6379
PORT=4000
GENESIS_HASH=custom-genesis-hash
CORS_ALLOWED_ORIGINS=https://app.aegl.io
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
AWS_S3_BACKUP_BUCKET=aegl-backups
AEGL_LICENSE_KEY=aegl_lic_...
```

## Health Checks

Configure your orchestrator to use these endpoints:

| Endpoint | Purpose | Check |
|----------|---------|-------|
| `GET /health` | Basic health | Process alive |
| `GET /health/ready` | Readiness | DB + Redis connected |
| `GET /health/live` | Liveness | Process alive + memory stats |

Example Docker Compose healthcheck:

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:4000/health/ready"]
  interval: 30s
  timeout: 5s
  retries: 3
  start_period: 10s
```

## Reverse Proxy

Place behind nginx, Traefik, or similar:

```nginx
upstream aegl-api {
    server api-1:4000;
    server api-2:4000;
}

server {
    listen 443 ssl;
    server_name api.aegl.io;

    location / {
        proxy_pass http://aegl-api;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Trace-ID $request_id;
    }
}
```

## Database Migrations

```bash
# Apply schema changes
npx prisma db push --schema=apps/api/prisma/schema.prisma

# Or use migration workflow
npx prisma migrate deploy --schema=apps/api/prisma/schema.prisma
```

Always back up the database before running migrations in production.
