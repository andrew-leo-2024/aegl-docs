---
sidebar_position: 11
title: Compliance
description: SOC 2 evidence and compliance reporting endpoints
---

# Compliance API

Generate compliance evidence reports for regulatory audits.

## GET /v1/compliance/soc2-evidence

Generate a SOC 2 evidence report for a specified period.

**Permission required**: `audit:read`

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `period` | string | Yes | Period in format `YYYY-QN` (quarter) or `YYYY-MM` (month) |

### Example

```bash
curl -H "Authorization: Bearer $AEGL_API_KEY" \
  "https://api.aegl.io/v1/compliance/soc2-evidence?period=2026-Q1"
```

### Response

```json
{
  "report_type": "SOC2_EVIDENCE",
  "organization_id": "org_abc123",
  "period": {
    "start": "2026-01-01T00:00:00Z",
    "end": "2026-03-31T23:59:59Z"
  },
  "generated_at": "2026-03-01T12:00:00Z",
  "trust_service_criteria": {
    "access_control": {
      "total_api_keys": 6,
      "active_api_keys": 5,
      "expired_api_keys": 1,
      "total_auth_events": 47832,
      "unique_agents": 4
    },
    "change_management": {
      "policy_versions_created": 12,
      "policies_active": 8,
      "policies_deactivated": 2,
      "configuration_changes": 5
    },
    "monitoring": {
      "total_decisions": 47832,
      "decisions_by_outcome": {
        "PERMITTED": 35421,
        "DENIED": 9847,
        "ESCALATED": 2564
      },
      "avg_latency_ms": 4,
      "sla_compliance_rate": 0.998,
      "escalations_created": 2564,
      "escalations_resolved": 2102,
      "escalations_expired": 12
    },
    "data_protection": {
      "audit_chain_valid": true,
      "total_audit_blocks": 47832,
      "chain_verified_at": "2026-03-01T12:00:00Z"
    }
  }
}
```

### Trust Service Criteria

| Category | Evidence Collected |
|----------|-------------------|
| **Access Control** | API key inventory, auth events, agent usage |
| **Change Management** | Policy version history, configuration changes |
| **Monitoring** | Decision volume, latency SLA compliance, escalation metrics |
| **Data Protection** | Hash chain integrity, audit log completeness |

### Supported Period Formats

| Format | Example | Date Range |
|--------|---------|------------|
| Quarter | `2026-Q1` | Jan 1 – Mar 31, 2026 |
| Month | `2026-03` | Mar 1 – Mar 31, 2026 |
