import type { BrianSDK } from "@brian-ai/sdk";
import type { Wallet } from "@coinbase/coinbase-sdk";
import { z } from "zod";
import { BrianCDPTool } from "../tool";

const deployNftSchema = z.object({
  name: z.string(),
  symbol: z.string(),
  baseURI: z.string(),
});

export const createCDPDeployNftTool = (brianSDK: BrianSDK, wallet: Wallet) => {
  return new BrianCDPTool({
    name: "deploy_nft",
    description:
      "This tool will deploy an NFT (ERC-721) contract onchain from the wallet. It takes the name of the NFT collection, the symbol of the NFT collection, and the base URI for the token metadata as inputs.",
    schema: deployNftSchema,
    brianSDK,
    wallet,
    func: async ({ name, symbol, baseURI }) => {
      const nftContract = await wallet.deployNFT({ name, symbol, baseURI });

      return `Deployed NFT Collection ${name} to address ${nftContract.getContractAddress()} on network ${wallet.getNetworkId()}.\nTransaction hash for the deployment: ${nftContract
        .getTransaction()
        .getTransactionHash()}\nTransaction link for the deployment: ${nftContract
        .getTransaction()
        .getTransactionLink()}`;
    },
  });
};
