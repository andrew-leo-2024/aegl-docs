---
sidebar_position: 5
title: Audit System
description: SHA-256 hash-chained, tamper-evident audit trail
---

# Audit System

The audit system provides a **legally defensible, tamper-evident** record of every AI decision.

## Hash Chain Architecture

Every audit log entry contains:

| Field | Description |
|-------|-------------|
| `data` | Full decision details (action, payload, outcome, evaluations) |
| `previousHash` | SHA-256 hash of the preceding record |
| `hash` | SHA-256 hash of `data + previousHash + sequenceNumber` |
| `sequenceNumber` | Monotonically increasing, per-organization |

```
Genesis           Block 1           Block 2           Block N
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│ Hash: G  │────→│ Prev: G  │────→│ Prev: H1 │────→│ Prev: HN │
│          │     │ Data: D1 │     │ Data: D2 │     │ Data: DN │
│          │     │ Hash: H1 │     │ Hash: H2 │     │ Hash: HN │
│          │     │ Seq: 1   │     │ Seq: 2   │     │ Seq: N   │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
```

## Tamper Detection

If any record is modified:
1. Its hash changes (because the hash includes the data)
2. The next record's `previousHash` no longer matches
3. Every subsequent hash in the chain is invalid

This makes it impossible to tamper with any record without detection.

## Implementation Details

### Deterministic Serialization

Data is serialized with **sorted keys** to ensure hash reproducibility:

```typescript
function deterministicSerialize(obj: unknown): string {
  return JSON.stringify(obj, Object.keys(obj).sort());
}
```

This prevents key ordering differences from producing different hashes for identical data.

### Atomic Writes

Each audit entry is written in a Prisma transaction with **serializable isolation**:

```typescript
await db.$transaction(async (tx) => {
  const previousBlock = await tx.auditLog.findFirst({
    where: { organizationId },
    orderBy: { sequenceNumber: 'desc' },
  });

  const previousHash = previousBlock?.hash ?? genesisHash;
  const sequenceNumber = (previousBlock?.sequenceNumber ?? 0) + 1;

  const hash = computeHash(data, previousHash, sequenceNumber);

  await tx.auditLog.create({
    data: {
      organizationId,
      data,
      previousHash,
      hash,
      sequenceNumber,
    },
  });
}, {
  isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
});
```

Serializable isolation prevents race conditions where two concurrent writes could read the same `previousHash` and break the chain.

### Genesis Hash

The first block in the chain uses a genesis hash:
- Default: SHA-256 of the string `"AEGL_GENESIS"`
- Configurable via `GENESIS_HASH` environment variable
- Must be consistent across the lifetime of the organization

## Chain Verification

The `verifyChainIntegrity()` function walks the entire chain and verifies each block:

```typescript
async function verifyChainIntegrity(organizationId: string) {
  const blocks = await db.auditLog.findMany({
    where: { organizationId },
    orderBy: { sequenceNumber: 'asc' },
  });

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    const expectedPrevHash = i === 0 ? genesisHash : blocks[i - 1].hash;
    const expectedHash = computeHash(block.data, expectedPrevHash, block.sequenceNumber);

    if (block.hash !== expectedHash || block.previousHash !== expectedPrevHash) {
      return { valid: false, brokenAt: block.sequenceNumber };
    }
  }

  return { valid: true, totalBlocks: blocks.length };
}
```

## Legal Defensibility

The hash chain provides several properties important for regulatory compliance:

1. **Completeness** — Every decision is recorded (no gaps)
2. **Ordering** — Sequence numbers prove temporal ordering
3. **Integrity** — Hash chain detects any modification
4. **Non-repudiation** — Records include agent ID, user ID, and timestamps
5. **Auditability** — SOC 2 evidence reports reference chain integrity

## Performance

Hash computation adds < 1ms to the audit write path. The SHA-256 computation itself is microseconds; the dominant cost is the database write.
