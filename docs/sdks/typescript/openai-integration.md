---
sidebar_position: 5
title: OpenAI Integration
description: Govern OpenAI function calls with E-AEGL
---

# OpenAI Integration

The E-AEGL SDK provides helpers to govern OpenAI tool/function calls.

## Import

```typescript
import { AEGL } from '@aegl/sdk';
import { governAction, governAndExecute } from '@aegl/sdk/middleware/openai';
```

## governAction

Govern an action through E-AEGL before executing it:

```typescript
const aegl = new AEGL({
  apiKey: process.env.AEGL_API_KEY!,
  agentId: 'openai-agent',
});

// After OpenAI returns a function call
const functionCall = message.tool_calls[0].function;

const decision = await governAction(aegl, {
  actionType: functionCall.name,
  actionPayload: JSON.parse(functionCall.arguments),
  userId: 'user-123',
});

if (decision.permitted) {
  // Execute the function
  const result = await executeFunction(functionCall);
} else {
  console.log(`Action blocked: ${decision.outcomeReason}`);
}
```

## governAndExecute

Combines governance check and execution in one call — the action only executes if permitted:

```typescript
const result = await governAndExecute(aegl, {
  actionType: 'send_email',
  actionPayload: {
    to: 'client@example.com',
    subject: 'Loan Approved',
    body: '...',
  },
  execute: async () => {
    return await sendEmail(to, subject, body);
  },
});

if (result.permitted) {
  console.log('Email sent:', result.data);
} else {
  console.log('Blocked:', result.decision.outcomeReason);
}
```

## Full Example with OpenAI

```typescript
import OpenAI from 'openai';
import { AEGL } from '@aegl/sdk';
import { governAction } from '@aegl/sdk/middleware/openai';

const openai = new OpenAI();
const aegl = new AEGL({
  apiKey: process.env.AEGL_API_KEY!,
  agentId: 'openai-loan-agent',
});

async function processLoanApplication(application: any) {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'You are a loan processing agent.' },
      { role: 'user', content: `Process this application: ${JSON.stringify(application)}` },
    ],
    tools: [{
      type: 'function',
      function: {
        name: 'approve_loan',
        description: 'Approve a loan application',
        parameters: {
          type: 'object',
          properties: {
            amount: { type: 'number' },
            term_months: { type: 'number' },
            rate: { type: 'number' },
          },
        },
      },
    }],
  });

  const toolCall = completion.choices[0].message.tool_calls?.[0];
  if (!toolCall) return;

  // Govern the AI's decision before executing
  const decision = await governAction(aegl, {
    actionType: toolCall.function.name,
    actionPayload: JSON.parse(toolCall.function.arguments),
    modelId: 'model_gpt4o',
  });

  if (decision.permitted) {
    await executeLoanApproval(JSON.parse(toolCall.function.arguments));
  } else if (decision.escalated) {
    await notifyReviewer(decision.escalationId);
  }
}
```
