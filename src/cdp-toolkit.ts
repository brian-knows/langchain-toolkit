import { BrianSDK } from "@brian-ai/sdk";
import { BaseToolkit, type ToolInterface } from "@langchain/core/tools";
import { Coinbase, Wallet, type WalletData } from "@coinbase/coinbase-sdk";
import {
  createCDPTransferTool,
  createCDPSwapTool,
  createCDPBridgeTool,
  createCDPDepositTool,
  createCDPWithdrawTool,
  createCDPGetBalanceTool,
  createCDPDeployNftTool,
  createCDPDeployTokenTool,
  createCDPGetFaucetFundsTool,
  createCDPGetWalletTool,
} from "./cdp-tools";

export type BrianCDPToolkitOptions = {
  apiKey: string;
  apiUrl?: string;
  wallet?: Wallet;
  walletData?: WalletData;
  coinbaseApiKeyName?: string;
  coinbaseApiKeySecret?: string;
  coinbaseFilePath?: string;
  coinbaseOptions?: {
    useServerSigner?: boolean;
    debugging?: boolean;
    basePath?: string;
  };
};

export class BrianCDPToolkit extends BaseToolkit {
  brianSDK: BrianSDK;
  tools: ToolInterface[] = [];
  wallet?: Wallet;
  walletData?: WalletData;

  constructor({
    apiKey,
    apiUrl,
    coinbaseApiKeyName,
    coinbaseApiKeySecret,
    coinbaseFilePath,
    coinbaseOptions,
  }: BrianCDPToolkitOptions) {
    super();

    this.brianSDK = new BrianSDK({ apiKey, apiUrl });

    if (coinbaseApiKeyName && coinbaseApiKeySecret) {
      Coinbase.configure({
        apiKeyName: coinbaseApiKeyName,
        privateKey: coinbaseApiKeySecret,
        ...coinbaseOptions,
      });
    } else {
      Coinbase.configureFromJson({
        filePath: coinbaseFilePath,
        ...coinbaseOptions,
      });
    }
  }

  async setup({
    wallet,
    walletData,
  }: {
    wallet?: Wallet;
    walletData?: WalletData;
  }) {
    if (!wallet && !walletData) {
      throw new Error("Either wallet or walletData must be provided");
    }
    if (wallet) {
      this.wallet = wallet;
    } else if (walletData) {
      this.wallet = await Wallet.import(walletData);
    }

    // setup tools
    this.tools = [
      createCDPTransferTool(this.brianSDK, this.wallet!),
      createCDPSwapTool(this.brianSDK, this.wallet!),
      createCDPDeployNftTool(this.brianSDK, this.wallet!),
      createCDPDeployTokenTool(this.brianSDK, this.wallet!),
      createCDPGetFaucetFundsTool(this.brianSDK, this.wallet!),
      createCDPGetWalletTool(this.brianSDK, this.wallet!),
      createCDPGetBalanceTool(this.brianSDK, this.wallet!),
      createCDPBridgeTool(this.brianSDK, this.wallet!),
      createCDPDepositTool(this.brianSDK, this.wallet!),
      createCDPWithdrawTool(this.brianSDK, this.wallet!),
    ];

    return this.tools;
  }
}
