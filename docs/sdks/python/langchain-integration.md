---
sidebar_position: 6
title: LangChain Integration
description: Govern LangChain Python tool calls with E-AEGL
---

# LangChain Integration (Python)

Govern LangChain agent tool calls with E-AEGL policy enforcement.

## Setup

```python
from aegl import AEGL
from aegl.integrations.langchain import AEGLCallbackHandler

aegl = AEGL(
    api_key=os.environ["AEGL_API_KEY"],
    agent_id="langchain-agent",
)

handler = AEGLCallbackHandler(
    aegl=aegl,
    governed_tools=["approve_loan", "execute_trade"],
)
```

## Usage with LangChain Agent

```python
from langchain_openai import ChatOpenAI
from langchain.agents import AgentExecutor, create_openai_functions_agent

llm = ChatOpenAI(model="gpt-4o")

agent = create_openai_functions_agent(llm, tools, prompt)
executor = AgentExecutor(
    agent=agent,
    tools=tools,
    callbacks=[handler],  # AEGL governance
)

result = executor.invoke({
    "input": "Process loan application for $250,000"
})
```

## How It Works

1. LangChain calls `on_tool_start()` for each tool invocation
2. If the tool is in `governed_tools`, AEGL evaluates the call
3. PERMITTED: tool proceeds normally
4. DENIED: tool execution is blocked, denial reason returned
5. Decisions stored for post-execution inspection

## Selective Governance

Only govern specific tools:

```python
handler = AEGLCallbackHandler(
    aegl=aegl,
    governed_tools=["approve_loan", "execute_trade"],
    # search_documents, format_report — NOT governed
)
```

## Inspecting Decisions

```python
result = executor.invoke({...})

for tool_name, decision in handler.get_decisions().items():
    print(f"{tool_name}: {decision.outcome}")
```
