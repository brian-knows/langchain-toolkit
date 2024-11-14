import { describe, test } from "@jest/globals";
import "dotenv/config";
import { createBrianAgent } from "../src";
import { ChatOpenAI } from "@langchain/openai";

const BRIAN_API_KEY = process.env.BRIAN_API_KEY;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const TIMEOUT = 30000;

if (!BRIAN_API_KEY) {
  throw new Error("BRIAN_API_KEY is not set");
}

if (!PRIVATE_KEY) {
  throw new Error("PRIVATE_KEY is not set");
}

describe("@brian-ai/langchain tests", async () => {
  const brianAgent = await createBrianAgent({
    apiKey: BRIAN_API_KEY,
    privateKeyOrAccount: PRIVATE_KEY as `0x${string}`,
    llm: new ChatOpenAI(),
    options: {
      gelatoApiKey: process.env.GELATO_API_KEY,
    },
  });

  test(
    "it should swap two tokens",
    async () => {
      await brianAgent.invoke({
        input: "Swap 0.00034 of ETH to USDC on Optimism",
      });
    },
    TIMEOUT
  );
});
