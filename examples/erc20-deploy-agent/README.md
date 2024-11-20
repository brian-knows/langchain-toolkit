# ERC20 Deployer Agent

This example demonstrates how to create an agent that is capable of deploying an ERC20 token contract and create a pool on Uniswap.

## Running the example

1. Install dependencies:

```bash
bun install
```

2. Set the `.env` file with the following variables:

```bash
BRIAN_API_KEY="" # your brian api key
PRIVATE_KEY="" # your agent private key
```

3. Run the agent:

```bash
bun src/index.ts
```
