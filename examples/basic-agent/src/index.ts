import "dotenv/config";
import { createBrianAgent } from "@brian-ai/langchain";
import { ChatOpenAI } from "@langchain/openai";

const BRIAN_API_KEY = process.env.BRIAN_API_KEY;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

if (!BRIAN_API_KEY) {
  throw new Error("BRIAN_API_KEY is not set");
}

if (!PRIVATE_KEY) {
  throw new Error("PRIVATE_KEY is not set");
}

const main = async () => {
  const brianAgent = await createBrianAgent({
    apiKey: BRIAN_API_KEY,
    privateKeyOrAccount: PRIVATE_KEY as `0x${string}`,
    llm: new ChatOpenAI(),
  });

  const res = await brianAgent.invoke({
    input: "Swap 1 USDC for ETH on zkSync",
  });
  console.log(res.output);
};

main();
