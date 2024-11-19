import {
  XMTPCallbackHandlerOptions,
  XMTPCallbackHandler,
} from "@/callback-handlers";
import { BrianToolkitOptions, BrianToolkit } from "@/toolkits";
import { LanguageModelLike } from "@langchain/core/language_models/base";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres";
import { HandlerContext } from "@xmtp/message-kit";
import { createToolCallingAgent, AgentExecutor } from "langchain/agents";
import pg from "pg";
import { createReactAgent as createLanggraphReactAgent } from "@langchain/langgraph/prebuilt";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";

export type BrianMemoryOptions = {
  shortTerm?: boolean;
  longTerm?: {
    postgres?: {
      connectionString: string;
    };
  };
  llm: BaseChatModel;
};

export type BrianAgentOptions = BrianToolkitOptions & {
  llm: LanguageModelLike;
  instructions?: string;
  xmtpHandler?: HandlerContext;
  xmtpHandlerOptions?: XMTPCallbackHandlerOptions;
};

export const createBrianAgentWithMemory = async ({
  instructions,
  apiKey,
  apiUrl,
  privateKeyOrAccount,
  llm,
  xmtpHandler,
  xmtpHandlerOptions,
  options,
  shortTerm,
  longTerm,
}: BrianAgentOptions & BrianMemoryOptions) => {
  let checkpointer;

  const { tools } = new BrianToolkit({
    apiKey,
    apiUrl,
    privateKeyOrAccount,
    options,
  });

  if (longTerm?.postgres && longTerm.postgres.connectionString) {
    const { Pool } = pg;
    const pool = new Pool({
      connectionString: "postgresql://user:password@localhost:5434/testdb",
    });

    checkpointer = new PostgresSaver(pool);
    await checkpointer.setup();

    const graph = createLanggraphReactAgent({
      tools: tools,
      llm: llm as BaseChatModel,
      checkpointSaver: checkpointer,
    });
  }
};

export const createBrianAgent = async ({
  instructions,
  apiKey,
  apiUrl,
  privateKeyOrAccount,
  llm,
  xmtpHandler,
  xmtpHandlerOptions,
  options,
}: BrianAgentOptions) => {
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
