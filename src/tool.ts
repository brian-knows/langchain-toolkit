import type { BrianSDK } from "@brian-ai/sdk";
import type { Wallet } from "@coinbase/coinbase-sdk";
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
