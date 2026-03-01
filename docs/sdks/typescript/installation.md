---
sidebar_position: 1
title: Installation
description: Install and configure the TypeScript SDK
---

# TypeScript SDK Installation

## Install

```bash npm2yarn
npm install @aegl/sdk
```

## Requirements

- Node.js 18+ (uses native `fetch`)
- TypeScript 5.0+ (optional, but recommended)

## Initialize

```typescript
import { AEGL } from '@aegl/sdk';

const aegl = new AEGL({
  apiKey: process.env.AEGL_API_KEY!,
  agentId: 'my-agent-v1',
});
```

## Configuration

```typescript
const aegl = new AEGL({
  // Required
  apiKey: 'aegl_key_...',    // Your API key
  agentId: 'my-agent-v1',    // Registered agent ID

  // Optional
  baseUrl: 'https://api.aegl.io',  // API base URL
  timeout: 10000,                    // Request timeout (ms)
  retryCount: 3,                     // Retry attempts on failure
  failOpen: false,                   // Fail-closed by default

  // Policy cache (offline fallback)
  policyCache: {
    enabled: false,        // Enable local policy caching
    ttlMs: 3600000,        // Cache TTL (1 hour)
    location: '~/.aegl/cache',  // Cache file location
  },
});
```

## Configuration Reference

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `apiKey` | string | required | API key for authentication |
| `agentId` | string | required | Registered agent identifier |
| `baseUrl` | string | `https://api.aegl.io` | API base URL |
| `timeout` | number | `10000` | Request timeout in milliseconds |
| `retryCount` | number | `3` | Number of retry attempts |
| `failOpen` | boolean | `false` | If true, permit actions on API errors |
| `policyCache` | object | `{ enabled: false }` | Local policy cache config |

## Cleanup

If using policy cache with periodic sync, call `destroy()` before process exit:

```typescript
// Stop background sync timers
aegl.destroy();
```
