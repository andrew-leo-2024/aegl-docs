---
sidebar_position: 7
title: "SOP-006: Tenant Onboarding"
description: "New customer organization setup procedure"
---

# SOP-006: Tenant Onboarding

## Purpose
Set up a new customer organization with all required infrastructure, credentials, and initial configuration.

## Scope
Organization creation, user accounts, API keys, default settings.

## Procedure

### Cloud Customers

1. **Create Organization**:
   ```bash
   # Via API or seed script
   curl -X POST https://api.aegl.io/v1/org \
     -H "Authorization: Bearer $ADMIN_KEY" \
     -d '{"name":"Acme Bank","slug":"acme-bank","plan":"ENTERPRISE"}'
   ```

2. **Create admin user account** for the customer
3. **Generate OWNER API key** and securely transmit to customer
4. **Configure billing** — Set up Stripe subscription
5. **Set data residency** — Configure region (US, EU, APAC) if required
6. **Send welcome email** with:
   - API key (encrypted)
   - Dashboard URL
   - Quickstart guide link
   - Support contact

### Self-Hosted Customers

1. **Generate license key** (if applicable)
2. **Provide deployment package**:
   - Docker Compose file
   - `.env.example` with all required variables
   - Quickstart documentation
3. **Schedule deployment call** for technical assistance
4. **Verify deployment**: Customer confirms `docker compose up` works

### Verification Checklist

- [ ] Organization record created in database
- [ ] Admin user can log into dashboard
- [ ] API key authenticates successfully
- [ ] Test decision returns valid response
- [ ] Audit log shows first entry (genesis block)
- [ ] Billing subscription active (cloud only)
- [ ] Welcome email sent with credentials
