import { BrianSDK } from "@brian-ai/sdk";
import {
  DynamicStructuredTool,
  DynamicStructuredToolInput,
} from "langchain/tools";
import { Account } from "viem";

export type BrianToolOptions = {
  gelatoApiKey?: string;
};

export class BrianTool extends DynamicStructuredTool {
  brianSDK: BrianSDK;
  account: Account;
  options?: BrianToolOptions;

  constructor(
    fields: DynamicStructuredToolInput & {
      brianSDK: BrianSDK;
      account: Account;
      options?: BrianToolOptions;
    }
  ) {
    super(fields);
    this.brianSDK = fields.brianSDK;
    this.account = fields.account;
    this.options = fields.options;
  }
}
