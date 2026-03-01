---
sidebar_position: 2
title: Installation
description: Install E-AEGL — cloud, self-hosted, or local development
---

# Installation

E-AEGL supports three deployment modes: **cloud** (managed SaaS), **self-hosted** (your infrastructure), and **local development**.

## Cloud (Managed)

Sign up at [aegl.io](https://aegl.io) to get an API key. Then install the SDK:

```bash npm2yarn
# TypeScript / Node.js
npm install @aegl/sdk
```

```bash
# Python
pip install aegl
```

```bash
# CLI
npm install -g @aegl/cli
```

## Self-Hosted

Self-hosted deployment runs entirely on your infrastructure. No data leaves your network.

### Prerequisites

- Docker and Docker Compose v2+
- PostgreSQL 15+ (or use the included container)
- Redis 7+ (or use the included container)
- Node.js 20+ (for building from source)

### Docker Compose (Recommended)

```bash
# Clone the repository
git clone https://github.com/aegl/aegl.git
cd aegl

# Configure environment
cp .env.example .env
# Edit .env with your settings:
#   DATABASE_URL, REDIS_URL, JWT_SECRET, API_KEY_SALT

# Start all services
docker compose -f docker-compose.selfhosted.yml up -d
```

This starts:
- **API Server** on port 4000
- **Dashboard** on port 3000
- **PostgreSQL** on port 5432
- **Redis** on port 6379

### High-Availability Deployment

For production workloads, use the HA Docker Compose:

```bash
docker compose -f docker/docker-compose.ha.yml up -d
```

This includes:
- PostgreSQL primary + streaming replica
- Redis Sentinel (3 nodes)
- Dual API instances behind Traefik load balancer
- Automated PostgreSQL backups (every 6 hours)

### Verify Installation

```bash
# Health check
curl http://localhost:4000/health

# Readiness (DB + Redis connected)
curl http://localhost:4000/health/ready
```

## Local Development

```bash
# Clone and install
git clone https://github.com/aegl/aegl.git
cd aegl
npm install

# Set up database
cp .env.example .env
npx prisma generate --schema=apps/api/prisma/schema.prisma
npx prisma db push --schema=apps/api/prisma/schema.prisma

# Seed demo data (optional)
npm run db:seed --workspace=aegl-api

# Start development servers
npm run dev
```

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | — | PostgreSQL connection string |
| `REDIS_URL` | No | `redis://localhost:6379` | Redis connection string |
| `JWT_SECRET` | Yes | — | Secret for JWT signing |
| `API_KEY_SALT` | Yes | — | Salt for API key hashing |
| `GENESIS_HASH` | No | SHA-256 of "AEGL_GENESIS" | First hash in audit chain |
| `PORT` | No | `4000` | API server port |
| `CORS_ALLOWED_ORIGINS` | No | `http://localhost:3000` | Comma-separated CORS origins |
| `STRIPE_SECRET_KEY` | No | — | Stripe API key (billing) |
| `STRIPE_WEBHOOK_SECRET` | No | — | Stripe webhook signing secret |
| `AWS_S3_BACKUP_BUCKET` | No | — | S3 bucket for DB backups |

## CLI Authentication

After installation, authenticate the CLI:

```bash
aegl auth login --api-key $AEGL_API_KEY
```

The API key is stored securely in your system's credential vault.

## Next Steps

- [Core Concepts](./concepts) — Understand the 4-layer architecture
- [Your First Decision](./first-decision) — Step-by-step walkthrough
- [Self-Hosted Deployment](../operations/self-hosted) — Production deployment guide
