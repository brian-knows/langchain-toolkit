import { BrianSDK } from "@brian-ai/sdk";
import { BaseToolkit, type ToolInterface } from "@langchain/core/tools";
import type { Account, Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import {
  createBorrowTool,
  createBridgeTool,
  createCreatePoolTool,
  createDeployNFTTool,
  createDeployTokenTool,
  createDepositTool,
  createGetBalanceTool,
  createGetNetworksTool,
  createGetWalletTool,
  createRepayTool,
  createSwapTool,
  createTransferTool,
  createWithdrawTool,
} from "./tools";
import { BrianToolOptions } from "./tools/tool";

export type BrianToolkitOptions = {
  apiKey: string;
  privateKeyOrAccount: Hex | Account;
  apiUrl?: string;
  options?: BrianToolOptions;
};

export class BrianToolkit extends BaseToolkit {
  account: Account;
  brianSDK: BrianSDK;
  tools: ToolInterface[];

  constructor({
    apiKey,
    apiUrl,
    privateKeyOrAccount,
    options,
  }: BrianToolkitOptions) {
    super();

    if (typeof privateKeyOrAccount === "string") {
      this.account = privateKeyToAccount(privateKeyOrAccount);
    } else {
      this.account = privateKeyOrAccount;
    }

    this.brianSDK = new BrianSDK({ apiKey, apiUrl });
    this.tools = [
      //createParametersExtractionTool(this.brianSDK, this.account),
      createSwapTool(this.brianSDK, this.account, options),
      createBridgeTool(this.brianSDK, this.account, options),
      createDepositTool(this.brianSDK, this.account, options),
      createWithdrawTool(this.brianSDK, this.account, options),
      createBorrowTool(this.brianSDK, this.account, options),
      createRepayTool(this.brianSDK, this.account, options),
      createTransferTool(this.brianSDK, this.account, options),
      createGetBalanceTool(this.brianSDK, this.account),
      createGetNetworksTool(this.brianSDK, this.account),
      createDeployTokenTool(this.brianSDK, this.account, options),
      createDeployNFTTool(this.brianSDK, this.account, options),
      createCreatePoolTool(this.brianSDK, this.account),
      createGetWalletTool(this.brianSDK, this.account),
    ];
  }
}
