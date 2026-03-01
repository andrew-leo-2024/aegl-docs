---
sidebar_position: 5
title: CrewAI Integration
description: Govern CrewAI agent tool calls with E-AEGL
---

# CrewAI Integration

Govern CrewAI agent actions with E-AEGL policy enforcement.

## Setup

```python
from aegl import AEGL
from aegl.integrations.crewai import AEGLCrewAITool

aegl = AEGL(
    api_key=os.environ["AEGL_API_KEY"],
    agent_id="crewai-agent",
)
```

## Wrapping CrewAI Tools

Wrap your CrewAI tools with AEGL governance:

```python
from crewai import Agent, Task, Crew

# Original tool
def approve_loan(amount: float, borrower_id: str) -> str:
    # ... loan approval logic
    return f"Loan of ${amount} approved for {borrower_id}"

# Wrap with AEGL governance
governed_approve = AEGLCrewAITool(
    aegl=aegl,
    tool_fn=approve_loan,
    action_type="approve_loan",
)

# Use in CrewAI agent
loan_agent = Agent(
    role="Loan Processor",
    goal="Process loan applications according to policy",
    tools=[governed_approve],
)
```

## How It Works

1. CrewAI agent calls the governed tool
2. AEGL evaluates the tool arguments against policies
3. If PERMITTED: tool executes normally
4. If DENIED: returns denial reason instead of executing
5. If ESCALATED: returns escalation info

## Full Example

```python
from crewai import Agent, Task, Crew
from aegl import AEGL
from aegl.integrations.crewai import AEGLCrewAITool

aegl = AEGL(
    api_key=os.environ["AEGL_API_KEY"],
    agent_id="crewai-loan-crew",
)

# Define governed tools
approve_tool = AEGLCrewAITool(
    aegl=aegl,
    tool_fn=approve_loan,
    action_type="approve_loan",
)

# Create agent
processor = Agent(
    role="Senior Loan Processor",
    goal="Evaluate and process loan applications",
    tools=[approve_tool],
    verbose=True,
)

# Create task
task = Task(
    description="Process the loan application for $350,000",
    agent=processor,
)

# Execute
crew = Crew(agents=[processor], tasks=[task])
result = crew.kickoff()
```
