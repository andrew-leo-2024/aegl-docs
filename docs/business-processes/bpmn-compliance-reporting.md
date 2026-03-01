---
sidebar_position: 10
title: "BP-010: Compliance Reporting"
description: "BPMN — SOC 2 evidence collection and regulatory report generation"
---

# BP-010: Compliance Reporting

**Process ID:** BP-010
**Type:** On-demand report generation
**SLA:** &lt; 60 seconds
**Trigger:** API call, CLI command, or dashboard action
**Owner:** Compliance subsystem
**Source:** `apps/api/src/compliance/evidence-collector.ts`, `apps/api/src/routes/compliance.ts`

## BPMN Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Pool: Compliance Officer / Auditor                                           │
│                                                                              │
│  (O)──→(X) Trigger source                                                   │
│         │              │              │                                      │
│    [Dashboard]    [CLI command]  [API call]                                  │
│         │              │              │                                      │
│         ▼              ▼              ▼                                      │
│  [Click "Export  ] [aegl audit   ] [GET /v1/          ]                     │
│  [Compliance"    ] [export       ] [compliance/       ]                     │
│  [button         ] [--regulation ] [soc2-evidence     ]                     │
│                    [occ-sr-11-7  ] [?period=2026-Q1   ]                     │
│                                                                              │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ Pool: Evidence Collection Engine                                             │
│                                                                              │
│  [Parse period       ]──→[Resolve date range ]──→(+) Parallel collection   │
│  [string (e.g.,      ]   [from: 2026-01-01   ]    │    │    │    │         │
│  [2026-Q1)           ]   [to:   2026-03-31   ]    │    │    │    │         │
│                                                    ▼    ▼    ▼    ▼         │
│                                                                              │
│ ┌─ Lane: Access Control Evidence ────────────────────────────────────────┐  │
│ │  [Count API keys created  ]  [Count keys revoked  ]  [Count expired  ]│  │
│ │  [Count active keys       ]  [Group users by role  ]                   │  │
│ └─────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│ ┌─ Lane: Change Management Evidence ─────────────────────────────────────┐  │
│ │  [Count policies created  ]  [Count updated       ]  [Count deactivated]│ │
│ │  [Active policies count   ]  [Recent version      ]  [Total governed  ]│  │
│ │                               [history (sample 50) ]  [decisions       ]│  │
│ └─────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│ ┌─ Lane: Monitoring Evidence ────────────────────────────────────────────┐  │
│ │  [Total decisions         ]  [Avg latency         ]  [P95 latency    ]│  │
│ │  [Max latency             ]  [SLA compliance %    ]  [By outcome     ]│  │
│ │  [Escalations created     ]  [Escalations resolved]  [Avg resolution ]│  │
│ │                                                       [time (hours)  ]│  │
│ └─────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│ ┌─ Lane: Data Protection Evidence ───────────────────────────────────────┐  │
│ │  [Verify hash chain       ]  [Check encryption    ]  [Data retention ]│  │
│ │  [integrity               ]  [key configured      ]  [policy         ]│  │
│ │  [Total audit blocks      ]  [First/last block    ]  [Data residency ]│  │
│ └─────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│                              (+) Join all evidence                            │
│                                       │                                      │
│                                       ▼                                      │
│  [Generate summary:         ]──→[Build report JSON  ]──→[Return HTTP   ]   │
│  [critical_issues[]         ]   [with all 4 domains ]   [200 with      ]   │
│  [recommendations[]         ]   [+ summary          ]   [report        ]   │
│  [total_findings            ]   [+ metadata         ]   (O) END            │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## SOC 2 Trust Service Criteria Mapping

| TSC | Criteria | E-AEGL Evidence |
|-----|----------|----------------|
| **CC6.1** | Logical access security | API key management, RBAC roles, auth events |
| **CC6.2** | Access provisioning | User roles, key creation/revocation counts |
| **CC6.3** | Access removal | Key revocation, expiration tracking |
| **CC7.1** | Configuration management | Policy versioning, change tracking |
| **CC7.2** | Change management | Policy create/update/deactivate history |
| **CC7.3** | Testing of changes | Policy evaluation results, test coverage |
| **CC8.1** | Monitoring | Decision latency, throughput, SLA compliance |
| **A1.2** | Recovery objectives | RPO/RTO targets, backup verification |
| **PI1.1** | Data integrity | Hash chain verification, tamper detection |
| **P1.1** | Data protection | Encryption at rest, data residency |

## Compliance Summary Endpoint

`GET /v1/compliance/summary` provides a real-time compliance posture:

```json
{
  "period": "last_30_days",
  "posture": {
    "audit_chain_valid": true,
    "audit_chain_blocks": 15847,
    "active_policies": 12,
    "governance_rate": "34.2%"
  },
  "decisions": {
    "total": 48293,
    "denied": 8421,
    "escalated": 2103,
    "permitted": 37769
  },
  "escalations": {
    "pending": 3,
    "expired": 0,
    "sla_compliance": "healthy"
  },
  "recommendations": []
}
```

## Report Output Structure

```json
{
  "report_id": "soc2-org_abc123-2026-Q1",
  "generated_at": "2026-03-01T00:00:00Z",
  "period": {
    "from": "2026-01-01T00:00:00Z",
    "to": "2026-03-31T23:59:59Z",
    "label": "2026-Q1"
  },
  "organization_id": "org_abc123",
  "organization_name": "Acme Bank",
  "access_control": { /* ... */ },
  "change_management": { /* ... */ },
  "monitoring": { /* ... */ },
  "data_protection": { /* ... */ },
  "summary": {
    "total_findings": 1,
    "critical_issues": [],
    "recommendations": [
      "3 pending escalations approaching SLA deadline"
    ]
  }
}
```
