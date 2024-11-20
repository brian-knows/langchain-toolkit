import {
  XMTPCallbackHandlerOptions,
  XMTPCallbackHandler,
} from "@/callback-handlers";
import { BrianCDPToolkitOptions, BrianCDPToolkit } from "@/toolkits";
import { LanguageModelLike } from "@langchain/core/language_models/base";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { HandlerContext } from "@xmtp/message-kit";
import { createToolCallingAgent, AgentExecutor } from "langchain/agents";

export type BrianAgentCDPOptions = BrianCDPToolkitOptions & {
  llm: LanguageModelLike;
  instructions?: string;
  xmtpHandler?: HandlerContext;
  xmtpHandlerOptions?: XMTPCallbackHandlerOptions;
};

/**
 * @dev creates a new "default" Brian CDP agent.
 * @param {BrianAgentCDPOptions} options - the options for initializing the agent.
 * @returns {Promise<AgentExecutor>} - the agent executor.
 */
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
  xmtpHandler,
  xmtpHandlerOptions,
}: BrianAgentCDPOptions): Promise<AgentExecutor> => {
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
