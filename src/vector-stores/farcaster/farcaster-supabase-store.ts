import { createClient } from "@supabase/supabase-js";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { getFarcasterUserCasts } from "@/utils/farcaster";
import { NeynarAPIClient } from "@neynar/nodejs-sdk";
import { OpenAIEmbeddings } from "@langchain/openai";
import type { Document } from "@langchain/core/documents";
import { CastWithInteractions } from "@neynar/nodejs-sdk/build/neynar-api/v2";

type FarcasterSupabaseStore = {
  neynarApiKey: string;
  fid: number;
  supabaseApiKey: string;
  supabaseUrl: string;
};

export const createFarcasterSupabaseVectorStore = async ({
  neynarApiKey,
  fid,
  supabaseApiKey,
  supabaseUrl,
}: FarcasterSupabaseStore) => {
  const neynar = new NeynarAPIClient(neynarApiKey);

  const supabaseClient = createClient(supabaseUrl, supabaseApiKey);

  const vectorStore = new SupabaseVectorStore(new OpenAIEmbeddings(), {
    client: supabaseClient,
    tableName: "documents",
    queryName: "match_documents",
  });

  // check if no casts have been recorded yet
  const { count } = await supabaseClient
    .from("documents")
    .select("metadata.hash", { count: "exact", head: true });

  if (count === 0) {
    const casts: CastWithInteractions[] = await getFarcasterUserCasts(
      neynar,
      fid
    );

    const documents: Document[] = [];

    for (const cast of casts) {
      documents.push({
        pageContent: cast.text,
        metadata: {
          author: cast.author,
          hash: cast.hash,
          timestamp: cast.timestamp,
          hasFrames: cast.frames !== undefined,
          channelId: cast.channel?.id,
          channelName: cast.channel?.name,
          parentHash: cast.parent_hash,
          parentAuthor: cast.parent_author,
          type: cast.type,
        },
      });
    }

    await vectorStore.addDocuments(documents, {
      ids: documents.map((doc) => doc.metadata.hash),
    });
  }

  return vectorStore;
};
