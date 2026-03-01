---
sidebar_position: 2
title: Self-Hosted
description: Running E-AEGL entirely on your infrastructure
---

# Self-Hosted Deployment

E-AEGL is designed to run entirely on your infrastructure. No data leaves your network.

## Quick Start

```bash
git clone https://github.com/aegl/aegl.git
cd aegl
cp .env.example .env
docker compose -f docker-compose.selfhosted.yml up -d
```

## License Key

Self-hosted deployments require a license key:

```bash
AEGL_LICENSE_KEY=aegl_lic_org123_SELF_HOSTED_2027-03-01_abc123signature
```

License keys are HMAC-SHA256 signed and contain:
- Organization ID
- Plan type (SELF_HOSTED)
- Expiration date
- Signature for tamper detection

Contact sales for a license key.

## Architecture

```
┌──────────────────────────────────────────┐
│              Your Network                 │
│                                           │
│  ┌───────────┐     ┌──────────────────┐  │
│  │ Dashboard │────→│    API Server    │  │
│  │ :3000     │     │    :4000         │  │
│  └───────────┘     └────────┬─────────┘  │
│                             │             │
│              ┌──────────────┼──────────┐  │
│              │              │          │  │
│         ┌────┴────┐   ┌────┴────┐     │  │
│         │ Postgres │   │  Redis  │     │  │
│         │  :5432   │   │  :6379  │     │  │
│         └──────────┘   └─────────┘     │  │
│                                        │  │
│  No external network connections       │  │
└──────────────────────────────────────────┘
```

## Data Residency

All data stays within your infrastructure:
- PostgreSQL runs locally
- Redis runs locally
- No telemetry or analytics sent externally
- SDK connects to your internal API URL

## Backup Strategy

### Automated Backups

```bash
# Run the backup script
./scripts/backup-postgres.sh
```

The backup script:
1. Creates a `pg_dump` of the database
2. Compresses with gzip
3. Uploads to S3 (if configured) or stores locally
4. Retains 30 days of backups
5. Runs automatically every 6 hours in the HA deployment

### Manual Backup

```bash
pg_dump $DATABASE_URL | gzip > backup-$(date +%Y%m%d-%H%M%S).sql.gz
```

### Restore

```bash
gunzip < backup-20260301-120000.sql.gz | psql $DATABASE_URL
```

## Updates

```bash
# Pull latest version
git pull origin main

# Rebuild
docker compose -f docker-compose.selfhosted.yml build

# Apply database migrations
docker compose exec api npx prisma db push

# Restart
docker compose -f docker-compose.selfhosted.yml up -d
```

## Security Considerations

- Generate strong values for `JWT_SECRET` and `API_KEY_SALT`
- Use TLS termination at your load balancer
- Restrict database access to the API server
- Monitor audit log integrity regularly
- Keep the Docker images updated
