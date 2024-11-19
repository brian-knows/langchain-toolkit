import { NeynarAPIClient } from "@neynar/nodejs-sdk";
import { z } from "zod";
import { FarcasterTool } from "./tool";

const publishCastToolSchema = z.object({
  text: z.string(),
});

export const createPublishCastTool = (
  neynar: NeynarAPIClient,
  signerUUID: string
) => {
  return new FarcasterTool({
    name: "publish-cast-farcaster",
    description: "this tool publishes a cast to farcaster.",
    neynar,
    signerUUID,
    schema: publishCastToolSchema,
    func: async ({ text }) => {
      console.log("Publishing cast to Farcaster..");

      const { hash } = await neynar.publishCast(signerUUID, text);

      return `Cast successfully published at hash: ${hash}`;
    },
  });
};
