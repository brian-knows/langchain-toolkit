import type { BrianSDK } from "@brian-ai/sdk";
import {
  DynamicStructuredTool,
  type DynamicStructuredToolInput,
} from "langchain/tools";
import type { Account } from "viem";

export class BrianTool extends DynamicStructuredTool {
  brianSDK: BrianSDK;
  account: Account;

  constructor(
    fields: DynamicStructuredToolInput & {
      brianSDK: BrianSDK;
      account: Account;
    }
  ) {
    super(fields);
    this.brianSDK = fields.brianSDK;
    this.account = fields.account;
  }
}
