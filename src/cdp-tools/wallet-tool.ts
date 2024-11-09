import type { BrianSDK } from "@brian-ai/sdk";
import type { Wallet } from "@coinbase/coinbase-sdk";
import { z } from "zod";
import { BrianCDPTool } from "../tool";

export const createCDPGetWalletTool = (brianSDK: BrianSDK, wallet: Wallet) => {
  return new BrianCDPTool({
    name: "get_wallet_details",
    description: "This tool will get details about the MPC Wallet.",
    schema: z.object({}),
    brianSDK,
    wallet,
    func: async ({ assetId }) => {
      return `Wallet: ${wallet.getId()} on network: ${wallet.getNetworkId()} with default address: ${(
        await wallet.getDefaultAddress()
      ).getId()}`;
    },
  });
};
