import { NeynarAPIClient } from "@neynar/nodejs-sdk";
import { z } from "zod";
import { FarcasterTool } from "./tool";

const replyCastToolSchema = z.object({
  text: z.string(),
  castId: z.string(),
});

export const createReplyCastTool = (
  neynar: NeynarAPIClient,
  signerUUID: string
) => {
  return new FarcasterTool({
    name: "reply-cast-farcaster",
    description:
      "this tool replies to a cast with the given castId to farcaster.",
    neynar,
    signerUUID,
    schema: replyCastToolSchema,
    func: async ({ text, castId }) => {
      console.log(`replying to cast ${castId} to Farcaster..`);

      const { hash } = await neynar.publishCast(signerUUID, text, {
        replyTo: castId,
      });

      return `Replied to cast ${castId}. Cast successfully published at hash: ${hash}`;
    },
  });
};
