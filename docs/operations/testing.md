---
sidebar_position: 6
title: Testing
description: Unit tests, integration tests, E2E tests, and load testing
---

# Testing

E-AEGL has comprehensive test coverage across unit, integration, E2E, and load tests.

## Test Architecture

```
aegl/
├── apps/api/src/
│   ├── engine/__tests__/        # Unit tests: policy engine
│   ├── audit/__tests__/         # Unit tests: hash chain
│   └── routes/__tests__/        # Integration tests: API routes
├── packages/sdk/src/__tests__/  # SDK unit tests
├── e2e/
│   ├── api/                     # E2E API tests
│   └── load/                    # Load/performance tests
└── playwright/                  # Dashboard E2E tests
```

## Running Tests

```bash
# All tests
npm test

# API unit tests only
npm test --workspace=aegl-api

# SDK tests only
npm test --workspace=@aegl/sdk

# E2E API tests
npm run test:e2e

# Load tests
npm run test:load

# Dashboard E2E (Playwright)
npx playwright test
```

## Unit Tests

### Policy Engine Tests

Tests for the core governance logic:

- **Rule evaluator**: All 10 operators (gt, gte, lt, lte, eq, neq, in, not_in, contains, matches)
- **Nested field access**: Dot-notation paths like `action_payload.amount`
- **Policy evaluation**: AND logic across rules, priority ordering
- **Policy types**: STATIC → DENY, THRESHOLD → ESCALATE
- **Edge cases**: undefined fields (fail-closed), invalid regex, empty rules
- **ReDoS protection**: Long patterns rejected

### Hash Chain Tests

Tests for the cryptographic audit trail:

- **Deterministic hashing**: Same input → same hash
- **Chain verification**: Valid chain returns true
- **Tamper detection**: Modified data → verification fails
- **Chain continuity**: Broken previousHash → detected
- **Genesis hash**: Consistent across instances

## E2E Tests

End-to-end tests against a running API:

### Decision Tests
- Auth validation (missing/invalid API key → 401)
- Request validation (missing fields → 400)
- Decision outcomes (PERMITTED, DENIED, ESCALATED)
- Audit log creation verification
- Latency measurement

### Policy Tests
- CRUD operations (create, read, update, delete)
- Version creation on update
- Policy simulation (single-context + historical batch)
- Rule validation

### Escalation Tests
- Creation via THRESHOLD policy
- Status filtering (PENDING, APPROVED, DENIED)
- Human reviewer decision flow
- Original decision update on resolution

### Audit Chain Tests
- Hash chain integrity after multiple decisions
- Chain verification endpoint

## Load Tests

Performance benchmarks:

```bash
npm run test:load
```

### Targets

| Metric | Target |
|--------|--------|
| p50 latency | < 5ms |
| p95 latency | < 10ms |
| p99 latency | < 15ms |
| Throughput | > 1,000 decisions/second |

### Test Scenarios

1. **Sequential**: 1,000 decisions one at a time
2. **Concurrent**: 100 decisions simultaneously (Promise.all)
3. **Sustained**: 10,000 decisions over 60 seconds
4. **Hash chain integrity**: Verify no corruption under concurrent load

## Test Database

E2E tests use a separate test database:

```bash
DATABASE_URL=postgresql://aegl:password@localhost:5432/aegl_test
```

Test setup seeds:
- Test organization
- Test API key
- Test agent
- Sample policies

Test teardown cleans all test data.

## Writing New Tests

### Unit Test Pattern

```typescript
import { describe, it, expect } from 'vitest';
import { evaluateRule } from '../rule-evaluator';

describe('evaluateRule', () => {
  it('should evaluate gt operator correctly', () => {
    const result = evaluateRule(
      { field: 'amount', operator: 'gt', value: 100 },
      { amount: 150 },
    );
    expect(result.result).toBe('FAIL'); // 150 > 100 triggers the rule
  });
});
```

### E2E Test Pattern

```typescript
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { TEST_API_KEY } from './setup';

describe('POST /v1/decisions', () => {
  it('should return PERMITTED when no policies match', async () => {
    const res = await request(API_URL)
      .post('/v1/decisions')
      .set('Authorization', `Bearer ${TEST_API_KEY}`)
      .send({
        action_type: 'test_action',
        action_payload: { value: 10 },
        agent_id: TEST_AGENT_ID,
      });

    expect(res.status).toBe(200);
    expect(res.body.outcome).toBe('PERMITTED');
  });
});
```
