import type { BrianSDK } from "@brian-ai/sdk";
import type { Wallet } from "@coinbase/coinbase-sdk";
import { z } from "zod";
import { BrianCDPTool } from "../tool";

const getFaucetFundsToolSchema = z.object({
  assetId: z.string().nullable(),
});

export const createCDPGetFaucetFundsTool = (
  brianSDK: BrianSDK,
  wallet: Wallet
) => {
  return new BrianCDPTool({
    name: "request_faucet_funds",
    description:
      "This tool will request test tokens from the faucet for the default address in the wallet. It takes the wallet and asset ID as input. You are not allowed to faucet with any other network or asset ID. If you are on another network, suggest that the user sends you some ETH If no asset ID is provided the faucet defaults to ETH. Faucet is only allowed on `base-testnet` and can only provide asset ID `eth` or `usdc`. from another wallet and provide the user with your wallet details.",
    schema: getFaucetFundsToolSchema,
    brianSDK,
    wallet,
    func: async ({ assetId }) => {
      const faucetTx = await wallet.faucet(assetId);

      const receipt = await faucetTx.wait();

      return `Received ${assetId} from the faucet. Transaction: ${receipt.getTransactionLink()}"`;
    },
  });
};
