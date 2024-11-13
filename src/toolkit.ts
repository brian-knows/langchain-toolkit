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
import { HandlerContext } from "@xmtp/message-kit";

export type BrianToolkitOptions = {
  apiKey: string;
  privateKeyOrAccount: Hex | Account;
  apiUrl?: string;
  xmtpContext?: HandlerContext;
};

export class BrianToolkit extends BaseToolkit {
  account: Account;
  brianSDK: BrianSDK;
  tools: ToolInterface[];
  xmtpContext?: HandlerContext;

  constructor({
    apiKey,
    apiUrl,
    privateKeyOrAccount,
    xmtpContext,
  }: BrianToolkitOptions) {
    super();

    if (typeof privateKeyOrAccount === "string") {
      this.account = privateKeyToAccount(privateKeyOrAccount);
    } else {
      this.account = privateKeyOrAccount;
    }

    this.brianSDK = new BrianSDK({ apiKey, apiUrl });
    this.xmtpContext = xmtpContext;
    this.tools = [
      //createParametersExtractionTool(this.brianSDK, this.account),
      createSwapTool(this.brianSDK, this.account, this.xmtpContext),
      createBridgeTool(this.brianSDK, this.account, this.xmtpContext),
      createDepositTool(this.brianSDK, this.account, this.xmtpContext),
      createWithdrawTool(this.brianSDK, this.account, this.xmtpContext),
      createBorrowTool(this.brianSDK, this.account, this.xmtpContext),
      createRepayTool(this.brianSDK, this.account, this.xmtpContext),
      createTransferTool(this.brianSDK, this.account, this.xmtpContext),
      createGetBalanceTool(this.brianSDK, this.account, this.xmtpContext),
    ];
  }
}
