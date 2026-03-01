---
sidebar_position: 8
title: "SOP-007: Escalation SLA Breach"
description: "Handling escalations that breach their 24-hour SLA"
---

# SOP-007: Escalation SLA Breach

## Purpose
Respond to escalation SLA breaches, investigate root cause, and prevent future occurrences.

## Scope
Escalation records with status = TIMEOUT.

## Procedure

1. **Detect SLA breach** — Monitor for `decision.timeout` webhook events or dashboard alerts

2. **Review timed-out escalations**:
   ```bash
   aegl escalations list --status TIMEOUT --limit 20
   ```

3. **For each timed-out escalation**:
   - Identify the original decision and action
   - Determine impact (was the action time-sensitive?)
   - Contact the customer if the denied action was business-critical

4. **Investigate root cause**:
   - Were reviewers assigned?
   - Was the escalation visible in the dashboard?
   - Was the SLA worker running? Check BullMQ job history
   - Was there a notification failure? Check webhook delivery logs

5. **Remediate**:
   - If reviewer oversight: improve notification/alerting
   - If worker failure: restart worker, investigate logs
   - If business process gap: adjust SLA duration or escalation routing

6. **Document** — Record the breach, root cause, and remediation in incident log

## Prevention
- Configure webhook alerts for new escalations (Slack, PagerDuty)
- Set up Prometheus alerts for pending escalation count > threshold
- Review SLA duration — 24 hours may be too long or too short for some action types
- Assign escalation reviewers proactively
