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
  });

  test(
    "it should swap two tokens",
    async () => {
      const res = await brianAgent.invoke({
        input: "What is the ETH balance of orbulo.eth on Base?",
      });
      console.log(res.output);
    },
    TIMEOUT
  );
});
