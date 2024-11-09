import type { BrianSDK } from "@brian-ai/sdk";
import type { Wallet } from "@coinbase/coinbase-sdk";
import { z } from "zod";
import { BrianCDPTool } from "../tool";

const deployTokenSchema = z.object({
  name: z.string(),
  symbol: z.string(),
  totalSupply: z.string(),
});

export const createCDPDeployTokenTool = (
  brianSDK: BrianSDK,
  wallet: Wallet
) => {
  return new BrianCDPTool({
    name: "deploy_token",
    description:
      "This tool will deploy an ERC20 token smart contract. It takes the token name, symbol, and total supply as input. The token will be deployed using the wallet's default address as the owner and initial token holder.",
    schema: deployTokenSchema,
    brianSDK,
    wallet,
    func: async ({ name, symbol, totalSupply }) => {
      const tokenContract = await wallet.deployToken({
        name,
        symbol,
        totalSupply,
      });

      return `Deployed ERC20 token contract ${name} (${symbol}) with total supply of ${totalSupply} tokens at address ${tokenContract.getContractAddress()}. Transaction link: ${tokenContract
        .getTransaction()
        .getTransactionLink()}`;
    },
  });
};
