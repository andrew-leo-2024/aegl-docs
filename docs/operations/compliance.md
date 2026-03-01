---
sidebar_position: 5
title: Compliance
description: SOC 2, regulatory compliance, and evidence collection
---

# Compliance

E-AEGL provides built-in compliance features for regulated industries.

## SOC 2 Evidence Collection

Generate evidence reports for SOC 2 audits:

```bash
curl -H "Authorization: Bearer $AEGL_API_KEY" \
  "https://api.aegl.io/v1/compliance/soc2-evidence?period=2026-Q1"
```

### Trust Service Criteria

| Criterion | Evidence Collected |
|-----------|-------------------|
| **CC6: Access Control** | API key inventory, auth events, unique agents, permission scoping |
| **CC8: Change Management** | Policy version history, configuration changes, deployment records |
| **CC7: Monitoring** | Decision volume, latency SLA compliance, escalation metrics, error rates |
| **CC6: Data Protection** | Hash chain integrity, audit completeness, encryption status |

### Report Periods

- Quarter format: `2026-Q1` (Jan–Mar)
- Month format: `2026-03` (March)

## Regulatory Frameworks

E-AEGL's architecture supports compliance with:

| Regulation | How E-AEGL Helps |
|-----------|------------------|
| **EU AI Act** | Decision logging, human oversight (escalations), transparency |
| **OCC SR 11-7** | Model risk management, audit trails, policy enforcement |
| **GDPR** | Data residency, per-tenant isolation, right to explanation |
| **SOC 2** | Access controls, change management, monitoring, data protection |
| **ISO 27001** | Information security management controls |

## Audit Trail Properties

The hash-chained audit log provides:

1. **Completeness** — Every decision is recorded (no gaps in sequence numbers)
2. **Integrity** — SHA-256 hash chain detects any modification
3. **Ordering** — Sequence numbers prove temporal ordering
4. **Non-repudiation** — Records include agent ID, user ID, timestamps
5. **Immutability** — Append-only design prevents deletion
6. **Verification** — On-demand integrity check via API

## Policy Governance

Policy lifecycle features for compliance:

- **Immutable versions** — Every policy change creates a new version
- **Historical traceability** — Every decision links to the exact policy version
- **Separation of duties** — RBAC prevents unauthorized policy changes
- **Change approval** — Policy-as-code enables PR-based approval workflows
- **Simulation** — Test policies before activation to prevent unintended consequences

## Decision Transparency

Every decision includes:
- The complete action payload that was evaluated
- Per-policy evaluation results with reasons
- The final outcome and explanation
- Latency measurement
- Agent and model identification

This provides the "explainability" required by regulatory frameworks like the EU AI Act.

## Export and Reporting

### Audit Log Export

Query and export audit logs for external analysis:

```bash
# API query with filters
curl -H "Authorization: Bearer $AEGL_API_KEY" \
  "https://api.aegl.io/v1/audit?from=2026-01-01&to=2026-03-31&limit=10000"

# CLI export
aegl audit query --from 2026-01-01 --to 2026-03-31 --format json > audit-q1.json
```

### Decision Replay

Re-evaluate historical decisions against current policies:

```bash
curl -X POST -H "Authorization: Bearer $AEGL_API_KEY" \
  "https://api.aegl.io/v1/decisions/dec_abc123/replay"
```

This is useful for:
- Regulatory "what-if" analysis
- Impact assessment for policy changes
- Demonstrating governance effectiveness
