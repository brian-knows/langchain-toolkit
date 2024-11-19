import { NeynarAPIClient } from "@neynar/nodejs-sdk";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings } from "@langchain/openai";
import { getFarcasterUserCasts } from "@/utils/farcaster";

type FarcasterMemoryStoreOptions = { neynarApiKey: string; fid: number };

export const createFarcasterMemoryVectorStore = async ({
  neynarApiKey,
  fid,
}: FarcasterMemoryStoreOptions) => {
  const neynar = new NeynarAPIClient(neynarApiKey);
  const casts = await getFarcasterUserCasts(neynar, fid);

  const vectorStore = await MemoryVectorStore.fromTexts(
    casts.map((cast) => cast.text),
    casts.map((cast) => cast.hash),
    new OpenAIEmbeddings()
  );

  return vectorStore;
};
