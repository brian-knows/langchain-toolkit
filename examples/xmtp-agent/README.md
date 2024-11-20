# XMTP Agent

This example demonstrates how to create an agent that receives messages from an XMTP chat and executes transactions based on what he receives. It also logs messages back to the XMTP chat.

## Running the example

1. Install dependencies:

```bash
bun install
```

2. Set the `.env` file with the following variables:

```bash
BRIAN_API_KEY="" # your brian api key
KEY="" # your agent and xmtp bot private key
GROK_API_KEY="" # your grok api key
```

3. Run the agent:

```bash
bun src/index.ts
```
