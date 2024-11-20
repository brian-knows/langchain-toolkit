import {
  type BrianAgentOptions,
  BrianToolkit,
  XMTPCallbackHandler,
} from "@brian-ai/langchain";
import type { BaseChatMessageHistory } from "@langchain/core/chat_history";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableWithMessageHistory } from "@langchain/core/runnables";
import { ChatXAI } from "@langchain/xai";
import { createToolCallingAgent, AgentExecutor } from "langchain/agents";
import { ChatMessageHistory } from "langchain/memory";
import { DynamicStructuredTool } from "langchain/tools";
import { z } from "zod";

const store: Record<string, ChatMessageHistory> = {};

function getMessageHistory(sessionId: string): BaseChatMessageHistory {
  if (!(sessionId in store)) {
    store[sessionId] = new ChatMessageHistory();
  }
  return store[sessionId];
}

const coingeckoTool = new DynamicStructuredTool({
  name: "ethereum_price",
  description: "this tool is used to retrieve the price of ethereum (ETH).",
  schema: z.object({}),
  func: async () => {
    try {
      const coingeckoResponse = await fetch(
        `https://api.coingecko.com/api/v3/coins/ethereum`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "x-cg-demo-api-key": process.env.COINGECKO_API_KEY!,
          },
        }
      );
      const data = await coingeckoResponse.json();

      return `The price of ETH is $${data.market_data.current_price.usd}.`;
    } catch (error) {
      console.error(error);
      return `An error occurred while fetching the price of ETH.`;
    }
  },
});

const createCustomAgent = async ({
  instructions,
  apiKey,
  apiUrl,
  privateKeyOrAccount,
  llm,
  xmtpHandler,
  xmtpHandlerOptions,
}: BrianAgentOptions) => {
  const { tools } = new BrianToolkit({
    apiKey,
    apiUrl,
    privateKeyOrAccount,
  });

  const prompt = ChatPromptTemplate.fromMessages([
    ["system", instructions || "You are a web3 helpful assistant"],
    ["placeholder", "{chat_history}"],
    ["human", "{input}"],
    ["placeholder", "{agent_scratchpad}"],
  ]);

  const agent = createToolCallingAgent({
    llm,
    tools: [coingeckoTool, ...tools],
    prompt,
  });

  const agentExecutor = new AgentExecutor({
    agent,
    tools: [coingeckoTool, ...tools],
    callbacks: xmtpHandler
      ? [
          new XMTPCallbackHandler(
            xmtpHandler,
            llm,
            instructions,
            xmtpHandlerOptions
          ),
        ]
      : [],
  });

  return new RunnableWithMessageHistory({
    runnable: agentExecutor,
    getMessageHistory,
    inputMessagesKey: "input",
    historyMessagesKey: "chat_history",
  });
};

const main = async () => {
  const brianAgent = await createCustomAgent({
    apiKey: process.env.BRIAN_API_KEY!,
    privateKeyOrAccount: process.env.PRIVATE_KEY as `0x${string}`,
    llm: new ChatXAI({ apiKey: process.env.GROK_API_KEY }),
    instructions: "You're a web3 assistant. You speak like a wookie.",
  });
  const result = await brianAgent.invoke(
    { input: "If ETH price is lower than 2.5k, swap 100 USDC for ETH." },
    { configurable: { sessionId: "1" } }
  );
  console.log(result.output);
};

main();
