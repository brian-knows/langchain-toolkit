import type { BrianSDK } from "@brian-ai/sdk";
import type { Wallet } from "@coinbase/coinbase-sdk";
import { z } from "zod";
import { BrianCDPTool } from "./tool.js";

const getBalanceToolSchema = z.object({
  assetId: z.string(),
});

export const createCDPGetBalanceTool = (brianSDK: BrianSDK, wallet: Wallet) => {
  return new BrianCDPTool({
    name: "get_balance",
    description:
      "This tool will get the balance of all the addresses in the wallet for a given asset. It takes the asset ID as input. Always use `eth` for the native asset ETH and `usdc` for USDC.",
    schema: getBalanceToolSchema,
    brianSDK,
    wallet,
    func: async ({ assetId }) => {
      const balances = await wallet.getBalance(assetId);

      return `The balance of asset ${assetId} in the wallet is ${balances}.`;
    },
  });
};
