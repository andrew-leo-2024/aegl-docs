---
sidebar_position: 6
title: LangChain Integration
description: Govern LangChain tool calls with E-AEGL callback handler
---

# LangChain Integration

The E-AEGL SDK provides a LangChain callback handler that automatically governs tool calls.

## Import

```typescript
import { AEGL } from '@aegl/sdk';
import { AEGLCallbackHandler } from '@aegl/sdk/middleware/langchain';
```

## Setup

```typescript
const aegl = new AEGL({
  apiKey: process.env.AEGL_API_KEY!,
  agentId: 'langchain-agent',
});

const handler = new AEGLCallbackHandler(aegl, {
  governedTools: ['approve_loan', 'execute_trade', 'send_notification'],
});
```

## Usage with LangChain Agent

```typescript
import { ChatOpenAI } from '@langchain/openai';
import { AgentExecutor, createOpenAIFunctionsAgent } from 'langchain/agents';

const llm = new ChatOpenAI({ model: 'gpt-4o' });

const agent = await createOpenAIFunctionsAgent({
  llm,
  tools: [approveLoanTool, executeTradeToool],
  prompt,
});

const executor = new AgentExecutor({
  agent,
  tools,
  callbacks: [handler],  // AEGL governance callback
});

const result = await executor.invoke({
  input: 'Process this loan application for $250,000',
});
```

## How It Works

1. LangChain calls `onToolStart()` before executing each tool
2. The callback handler checks if the tool is in `governedTools`
3. If governed, it calls `aegl.decide()` with the tool name and input
4. If the decision is DENIED, the tool execution is blocked
5. Decisions are stored for post-execution inspection

## Selective Governance

Only govern specific tools — let non-critical tools run ungoverned:

```typescript
const handler = new AEGLCallbackHandler(aegl, {
  governedTools: ['approve_loan', 'execute_trade'],
  // 'search_database' and 'format_report' are NOT governed
});
```

## Inspecting Decisions

After execution, inspect what decisions were made:

```typescript
const executor = await AgentExecutor.invoke({...});

// Check decisions made during execution
const decisions = handler.getDecisions();
for (const [toolName, decision] of decisions) {
  console.log(`${toolName}: ${decision.outcome}`);
}
```

## Error Handling

If `aegl.decide()` fails (API down), the behavior depends on `failOpen`:
- **Fail-closed** (default): Tool execution is blocked
- **Fail-open**: Tool execution proceeds
