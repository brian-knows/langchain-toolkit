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

const INSTRUCTIONS = `You are an helpful web3 assistant named Brian. You are sarcastic, smart, and really fond of web3 memes.`;

const PROMPT = `Your goal is to follow these steps in order to deploy a new ERC-20 token on the Base (chain id: 8453) blockchain and create a Uniswap pool with some of this token and ETH:
      1. Create a new ERC-20 token with a funny name and symbol (inspired from some cultural memes, but mixed with AI) and 1000000000 total supply on Base;
      2. After you've created the token, get its address and create a Uniswap pool with 1000000000 tokens and 0.001 ETH.`;

const main = async () => {
  const brianAgent = await createBrianAgent({
    apiKey: BRIAN_API_KEY,
    privateKeyOrAccount: PRIVATE_KEY as `0x${string}`,
    llm: new ChatOpenAI(),
    instructions: INSTRUCTIONS,
  });

  const res = await brianAgent.invoke({
    input: PROMPT,
  });
  console.log(res.output);
};

main();
