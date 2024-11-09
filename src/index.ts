import type { LanguageModelLike } from "@langchain/core/language_models/base";
import { BrianToolkit, type BrianToolkitOptions } from "./toolkit.js";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { AgentExecutor, createToolCallingAgent } from "langchain/agents";
import { BrianCDPToolkit, type BrianCDPToolkitOptions } from "./cdp-toolkit.js";

export * from "./tool.js";
export * from "./toolkit.js";

export type BrianAgentOptions = BrianToolkitOptions & {
  llm: LanguageModelLike;
  instructions?: string;
};

export const createBrianAgent = async ({
  instructions,
  apiKey,
  apiUrl,
  privateKeyOrAccount,
  llm,
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
    tools,
    prompt,
  });

  return new AgentExecutor({
    agent,
    tools,
  });
};

export type BrianAgentCDPOptions = BrianCDPToolkitOptions & {
  llm: LanguageModelLike;
  instructions?: string;
};

export const createBrianCDPAgent = async ({
  instructions,
  apiKey,
  apiUrl,
  wallet,
  walletData,
  coinbaseApiKeyName,
  coinbaseApiKeySecret,
  coinbaseFilePath,
  coinbaseOptions,
  llm,
}: BrianAgentCDPOptions) => {
  const brianCDPToolkit = new BrianCDPToolkit({
    apiKey,
    apiUrl,
    coinbaseApiKeyName,
    coinbaseApiKeySecret,
    coinbaseFilePath,
    coinbaseOptions,
  });

  const tools = await brianCDPToolkit.setup({
    wallet,
    walletData,
  });

  const prompt = ChatPromptTemplate.fromMessages([
    ["system", instructions || "You are a web3 helpful assistant"],
    ["placeholder", "{chat_history}"],
    ["human", "{input}"],
    ["placeholder", "{agent_scratchpad}"],
  ]);

  const agent = createToolCallingAgent({
    llm,
    tools,
    prompt,
  });

  return new AgentExecutor({
    agent,
    tools,
  });
};
