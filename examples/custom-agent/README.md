# Custom Agent

This example demonstrates how to create a more custom agent that uses extra tools like a Coingecko one to retrieve the ETH price and memory.

## Running the example

1. Install dependencies:

```bash
bun install
```

2. Set the `.env` file with the following variables:

```bash
BRIAN_API_KEY="" # your brian api key
PRIVATE_KEY="" # your agent private key
COINGECKO_API_KEY="" # your coingecko api key
GROK_API_KEY="" # your grok api key
```

3. Run the agent:

```bash
bun src/index.ts
```
