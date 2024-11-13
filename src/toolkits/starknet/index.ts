import { BrianSDK } from "@brian-ai/sdk";
import { BaseToolkit, ToolInterface } from "@langchain/core/tools";
import { Account } from "starknet";
import {
  createStarknetGetBalanceTool,
  createStarknetSwapTool,
  createStarknetTransferTool,
} from "./tools";

export type BrianStarknetToolkitOptions = {
  apiKey: string;
  account: Account;
  apiUrl?: string;
};

export class BrianStarknetToolkit extends BaseToolkit {
  account: Account;
  brianSDK: BrianSDK;
  tools: ToolInterface[];

  constructor({ apiKey, apiUrl, account }: BrianStarknetToolkitOptions) {
    super();

    this.account = account;
    this.brianSDK = new BrianSDK({ apiKey, apiUrl });
    this.tools = [
      createStarknetGetBalanceTool(this.brianSDK, this.account),
      createStarknetSwapTool(this.brianSDK, this.account),
      createStarknetTransferTool(this.brianSDK, this.account),
    ];
  }
}
