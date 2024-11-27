import {
  XMTPCallbackHandlerOptions,
  XMTPCallbackHandler,
} from "@/callback-handlers";
import { BrianToolkitOptions, BrianToolkit } from "@/toolkits";
import { LanguageModelLike } from "@langchain/core/language_models/base";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ToolInterface } from "@langchain/core/tools";
import { HandlerContext } from "@xmtp/message-kit";
import { createToolCallingAgent, AgentExecutor } from "langchain/agents";

export type BrianAgentOptions = BrianToolkitOptions & {
  llm: LanguageModelLike;
  instructions?: string;
  xmtpHandler?: HandlerContext;
  xmtpHandlerOptions?: XMTPCallbackHandlerOptions;
  tools?: ToolInterface[];
};

/**
 * @dev creates a new "default" Brian agent.
 * @param {BrianAgentOptions} options - the options for initializing the agent.
 * @returns {Promise<AgentExecutor>} - the agent executor.
 */
export const createBrianAgent = async ({
  instructions,
  apiKey,
  apiUrl,
  privateKeyOrAccount,
  llm,
  xmtpHandler,
  xmtpHandlerOptions,
  options,
  tools: customTools = [],
}: BrianAgentOptions): Promise<AgentExecutor> => {
  const { tools } = new BrianToolkit({
    apiKey,
    apiUrl,
    privateKeyOrAccount,
    options,
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
