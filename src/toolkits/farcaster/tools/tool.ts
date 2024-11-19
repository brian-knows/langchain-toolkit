import { NeynarAPIClient } from "@neynar/nodejs-sdk";
import {
  DynamicStructuredTool,
  DynamicStructuredToolInput,
} from "langchain/tools";

export class FarcasterTool extends DynamicStructuredTool {
  neynar: NeynarAPIClient;
  signerUUID: string;

  constructor(
    fields: DynamicStructuredToolInput & {
      neynar: NeynarAPIClient;
      signerUUID: string;
    }
  ) {
    super(fields);
    this.neynar = fields.neynar;
    this.signerUUID = fields.signerUUID;
  }
}
