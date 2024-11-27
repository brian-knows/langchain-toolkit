import {
  XMTPCallbackHandlerOptions,
  XMTPCallbackHandler,
} from "@/callback-handlers";
import { BrianStarknetToolkitOptions, BrianStarknetToolkit } from "@/toolkits";
import { LanguageModelLike } from "@langchain/core/language_models/base";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ToolInterface } from "@langchain/core/tools";
import { HandlerContext } from "@xmtp/message-kit";
import { createToolCallingAgent, AgentExecutor } from "langchain/agents";

export type BrianStarknetAgentOptions = BrianStarknetToolkitOptions & {
  llm: LanguageModelLike;
  instructions?: string;
  xmtpHandler?: HandlerContext;
  xmtpHandlerOptions?: XMTPCallbackHandlerOptions;
  tools?: ToolInterface[];
};

/**
 * @dev creates a new "default" Brian Starknet agent.
 * @param {BrianStarknetAgentOptions} options - the options for initializing the agent.
 * @returns {Promise<AgentExecutor>} - the agent executor.
 */
export const createBrianStarknetAgent = async ({
  instructions,
  apiKey,
  apiUrl,
  account,
  llm,
  xmtpHandler,
  xmtpHandlerOptions,
  tools: customTools = [],
}: BrianStarknetAgentOptions): Promise<AgentExecutor> => {
  const { tools } = new BrianStarknetToolkit({
    apiKey,
    apiUrl,
    account,
  });

  const prompt = ChatPromptTemplate.fromMessages([
    ["system", instructions || "You are a web3 helpful assistant"],
    ["placeholder", "{chat_history}"],
    ["human", "{input}"],
    ["placeholder", "{agent_scratchpad}"],
  ]);

  const agent = createToolCallingAgent({
    llm,
    tools: [...tools, ...customTools],
    prompt,
  });

  return new AgentExecutor({
    agent,
    tools,
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
};
