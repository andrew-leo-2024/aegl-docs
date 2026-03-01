---
sidebar_position: 3
title: Monitoring
description: OpenTelemetry, Prometheus metrics, and structured logging
---

# Monitoring

E-AEGL provides comprehensive observability through OpenTelemetry, Prometheus, and structured logging.

## Prometheus Metrics

Metrics are exposed at `GET /metrics`:

### Decision Metrics

| Metric | Type | Description |
|--------|------|-------------|
| `aegl_decisions_total` | Counter | Total decisions by outcome |
| `aegl_decision_latency_ms` | Histogram | Decision latency distribution |
| `aegl_policy_evaluations_total` | Counter | Policy evaluations by result |

### System Metrics

| Metric | Type | Description |
|--------|------|-------------|
| `aegl_active_escalations` | Gauge | Current pending escalations |
| `aegl_api_requests_total` | Counter | API requests by endpoint and status |
| `aegl_api_request_duration_ms` | Histogram | API request latency |

### Example Prometheus Config

```yaml title="prometheus.yml"
scrape_configs:
  - job_name: 'aegl-api'
    scrape_interval: 15s
    static_configs:
      - targets: ['api:4000']
    metrics_path: '/metrics'
```

## OpenTelemetry Tracing

Distributed tracing is enabled via OpenTelemetry:

```bash
OTEL_EXPORTER_OTLP_ENDPOINT=http://jaeger:4318
OTEL_SERVICE_NAME=aegl-api
```

Traces include:
- Full decision pipeline spans (Layer 1-4)
- Database query spans
- Redis operation spans
- Webhook dispatch spans

### Trace Correlation

The `X-Trace-ID` header correlates API traces with your application's distributed tracing:

```typescript
const decision = await aegl.decide({
  actionType: 'approve_loan',
  actionPayload: { amount: 50000 },
});
// decision.traceId can be used to look up the trace in Jaeger/Zipkin
```

## Structured Logging

All logs are structured JSON (no `console.log`):

```json
{
  "level": "info",
  "message": "Decision processed",
  "traceId": "trace_abc123",
  "organizationId": "org_abc123",
  "outcome": "PERMITTED",
  "latencyMs": 4,
  "timestamp": "2026-03-01T12:00:00Z"
}
```

### Log Levels

| Level | Usage |
|-------|-------|
| `error` | Unrecoverable errors, failed transactions |
| `warn` | Recoverable issues, revoked API keys |
| `info` | Decision outcomes, policy changes |
| `debug` | Detailed evaluation steps (development only) |

## Alerting Recommendations

### Critical Alerts

| Condition | Action |
|-----------|--------|
| `aegl_decision_latency_ms{p99} > 50` | Investigate database performance |
| `aegl_active_escalations > 100` | Reviewers may be overwhelmed |
| `audit chain integrity = false` | Investigate immediately |
| API health check failing | Restart service, check DB/Redis |

### Warning Alerts

| Condition | Action |
|-----------|--------|
| `aegl_decisions_total{outcome="DENIED"} / total > 0.5` | Review policies for over-restriction |
| Decision volume drop > 50% | Check SDK connectivity |
| Escalation SLA breach rate > 10% | Add reviewers or adjust SLA windows |

## Grafana Dashboard

Import the pre-built Grafana dashboard for E-AEGL:

Panels:
- Decision volume over time (by outcome)
- Latency percentiles (p50, p95, p99)
- Policy evaluation breakdown
- Escalation queue depth
- SLA compliance rate
- API request rate and error rate
