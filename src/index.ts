import type { LanguageModelLike } from "@langchain/core/language_models/base";
import { BrianToolkit, type BrianToolkitOptions } from "./toolkit.js";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { AgentExecutor, createToolCallingAgent } from "langchain/agents";

export * from "./tool.js";
export * from "./toolkit.js";

export type BrianAgentOptions = BrianToolkitOptions & {
  llm: LanguageModelLike;
};

export const createBrianAgent = async ({
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
    ["system", "You are a web3 helpful assistant"],
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
    // verbose: true,
  });
};
