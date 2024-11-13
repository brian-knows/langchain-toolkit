import { BrianSDK } from "@brian-ai/sdk";
import { Wallet } from "@coinbase/coinbase-sdk";
import {
  DynamicStructuredTool,
  DynamicStructuredToolInput,
} from "langchain/tools";

export class BrianCDPTool extends DynamicStructuredTool {
  brianSDK: BrianSDK;
  wallet: Wallet;

  constructor(
    fields: DynamicStructuredToolInput & {
      brianSDK: BrianSDK;
      wallet: Wallet;
    }
  ) {
    super(fields);
    this.brianSDK = fields.brianSDK;
    this.wallet = fields.wallet;
  }
}
