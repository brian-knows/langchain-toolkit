import { BaseToolkit, ToolInterface } from "@langchain/core/tools";
import { NeynarAPIClient } from "@neynar/nodejs-sdk";
import { createPublishCastTool, createReplyCastTool } from "./tools";

export type FarcasterToolkitOptions = {
  neynarApiKey: string;
  signerUUID: string;
};

export class FarcasterToolkit extends BaseToolkit {
  neynar: NeynarAPIClient;
  signerUUID: string;
  tools: ToolInterface[];

  constructor({ neynarApiKey, signerUUID }: FarcasterToolkitOptions) {
    super();
    this.neynar = new NeynarAPIClient(neynarApiKey);
    this.signerUUID = signerUUID;

    this.tools = [
      createPublishCastTool(this.neynar, this.signerUUID),
      createReplyCastTool(this.neynar, this.signerUUID),
    ];
  }
}
