# 🤖 @brian-ai/langchain

> **Attention**: this repository it's still under active development. Expect bugs and breaking changes. Use it at your own risk.

A powerful TypeScript SDK for creating [Langchain](https://langchain.com) agents that can interact with the blockchain.

## 💪🏻 Features

- 🤖 AI-powered blockchain interactions
- 🔄 Cross-chain operations
- 💱 Token swaps
- 🌉 Token bridging
- 💰 DeFi operations (deposit, withdraw, borrow, repay)
- 💸 Token transfers
- 💼 Balance checking
- And more...

## 📦 Installation

```bash
npm install @brian-ai/langchain
```

## 🚀 Quick Start

```typescript
import { createBrianAgent } from "@brian-ai/agent";
import { ChatOpenAI } from "@langchain/openai";

const agent = await createBrianAgent({
  apiKey: "your-brian-api-key",
  privateKeyOrAccount: "your-private-key-or-account",
  llm: new ChatOpenAI(),
});

// Execute blockchain operations using natural language
const result = await agent.invoke({
  input: "Swap 100 USDC for ETH on Ethereum",
});
```

### 🔩 Using the Brian toolkit

You could also import directly the `BrianToolkit` in your agent without the need of using the `createBrianAgent` function:

```typescript
import { BrianToolkit } from "@brian-ai/langchain";

const { tools } = new BrianToolkit({
  apiKey: "your-brian-api-key",
  privateKeyOrAccount: "your-private-key-or-account",
});

// import the tools into your own agent
```

### 🛠️ Available Tools

The SDK includes several tools for different blockchain operations:

- **Swap**: Exchange tokens on various chains
- **Bridge**: Transfer tokens across different blockchains
- **Deposit**: Deposit tokens into DeFi protocols
- **Withdraw**: Withdraw tokens from DeFi protocols
- **Borrow**: Borrow tokens from lending protocols
- **Repay**: Repay borrowed tokens
- **Transfer**: Send tokens to other addresses
- **Balance**: Check token balances

> **Note**: all the actions above will be executed by the **agent** account using the private key provided. This means that some funds could be lost in the process in case of errors.

## 🔵 Using CDP Wallets

The SDK also supports the creation of Agents that use the **CDP SDK** instead of **viem** for the wallet.

```typescript
import { createBrianAgent } from "@brian-ai/langchain";
import { ChatOpenAI } from "@langchain/openai";

// load the wallet data into a variable
const walletData = /* ... */

const agent = await createBrianCDPAgent({
  apiKey: "your-brian-api-key",
  coinbaseApiKey: "your-coinbase-api-key-name",
  coinbaseApiKeySecret: "your-coinbase-api-key-secret",
  walletData,
  llm: new ChatOpenAI(),
});

// Execute blockchain operations using natural language
const result = await agent.invoke({
  input: "Swap 100 USDC for ETH on Ethereum",
});
```

### 🔩 Using the Brian CDP toolkit

You could also import directly the `BrianCDPToolkit` in your agent without the need of using the `createBrianCDPAgent` function:

```typescript
import { BrianCDPToolkit } from "@brian-ai/langchain";

const brianCDPToolkit = new BrianCDPToolkit({
  apiKey: "your-brian-api-key",
  coinbaseApiKey: "your-coinbase-api-key-name",
  coinbaseApiKeySecret: "your-coinbase-api-key-secret",
});

// load the wallet data into a variable
const walletData = /* ... */

const { tools } = await brianCDPToolkit.setup({ walletData })

// import the tools into your own agent
```

### 🛠️ CDP Available Tools

The SDK includes several tools for different blockchain operations:

- **Swap**: Exchange tokens on various chains
- **Bridge**: Transfer tokens across different blockchains
- **Deposit**: Deposit tokens into DeFi protocols
- **Withdraw**: Withdraw tokens from DeFi protocols
- **Transfer**: Send tokens to other addresses
- **Balance**: Check token balances
- **Deploy NFT**: Deploy an NFT contract
- **Deploy Token**: Deploy an ERC-20 token
- **Faucet**: Gets some faucet tokens (only on Base Sepolia)

> **Note**: all the actions above will be executed by the **agent** account using the CDP wallet provided. This means that some funds could be lost in the process in case of errors.

## ⚙️ Architecture

The SDK is built on top of LangChain's agent framework and uses:

- [zod](https://zod.dev/) for schema validation
- [viem](https://viem.sh/) for blockchain interactions
- [LangChain](https://js.langchain.com/docs/introduction/) for agent orchestration
- [Brian](https://www.brianknows.org) AI SDK for transaction processing
- [CDP SDK](https://coinbase.github.io/coinbase-sdk-nodejs/index.html) for the Brian CDP Agent

## 🤝🏻 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🛡️ License

This project is licensed under the terms of the `MIT` license. See [LICENSE](/LICENSE) for more details.

## ‼️ Disclaimer

_This code is being provided as is. No guarantee, representation or warranty is being made, express or implied, as to the safety or correctness of the code. It has not been audited and as such there can be no assurance it will work as intended, and users may experience delays, failures, errors, omissions or loss of transmitted information. Nothing in this repo should be construed as investment advice or legal advice for any particular facts or circumstances and is not meant to replace competent counsel. It is strongly advised for you to contact a reputable attorney in your jurisdiction for any questions or concerns with respect thereto. Brian is not liable for any use of the foregoing, and users should proceed with caution and use at their own risk._
