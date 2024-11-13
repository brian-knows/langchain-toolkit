import { BrianSDK } from "@brian-ai/sdk";
import {
  DynamicStructuredTool,
  DynamicStructuredToolInput,
} from "langchain/tools";
import { Account } from "starknet";

export class BrianStarknetTool extends DynamicStructuredTool {
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
