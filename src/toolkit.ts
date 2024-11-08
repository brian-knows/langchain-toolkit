import { BrianSDK } from "@brian-ai/sdk";
import { BaseToolkit, type ToolInterface } from "@langchain/core/tools";
import type { Account, Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import {
  createBorrowTool,
  createBridgeTool,
  createDepositTool,
  createGetBalanceTool,
  createRepayTool,
  createSwapTool,
  createTransferTool,
  createWithdrawTool,
} from "./tools";

export type BrianToolkitOptions = {
  apiKey: string;
  privateKeyOrAccount: Hex | Account;
  apiUrl?: string;
};

export class BrianToolkit extends BaseToolkit {
  account: Account;
  brianSDK: BrianSDK;
  tools: ToolInterface[];

  constructor({ apiKey, apiUrl, privateKeyOrAccount }: BrianToolkitOptions) {
    super();

    if (typeof privateKeyOrAccount === "string") {
      this.account = privateKeyToAccount(privateKeyOrAccount);
    } else {
      this.account = privateKeyOrAccount;
    }

    this.brianSDK = new BrianSDK({ apiKey, apiUrl });
    this.tools = [
      //createParametersExtractionTool(this.brianSDK, this.account),
      createSwapTool(this.brianSDK, this.account),
      createBridgeTool(this.brianSDK, this.account),
      createDepositTool(this.brianSDK, this.account),
      createWithdrawTool(this.brianSDK, this.account),
      createBorrowTool(this.brianSDK, this.account),
      createRepayTool(this.brianSDK, this.account),
      createTransferTool(this.brianSDK, this.account),
      createGetBalanceTool(this.brianSDK, this.account),
    ];
  }
}
