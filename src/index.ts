import type { BaseLanguageModelInterface } from "@langchain/core/language_models/base";
import { BrianToolkit, type BrianToolkitOptions } from "./toolkit.js";
import { AgentExecutor, createReactAgent } from "langchain/agents";
import { pull } from "langchain/hub";
import { PromptTemplate } from "@langchain/core/prompts";

export * from "./tool.js";
export * from "./toolkit.js";

export type BrianAgentOptions = BrianToolkitOptions & {
  llm: BaseLanguageModelInterface;
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

  const prompt = await pull<PromptTemplate>("hwchase17/react");
  const reactAgent = await createReactAgent({ llm, tools, prompt });

  return new AgentExecutor({
    agent: reactAgent,
    tools,
  });
};
