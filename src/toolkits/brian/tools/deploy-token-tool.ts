import { BrianSDK } from "@brian-ai/sdk";
import { Account, createPublicClient, createWalletClient, http } from "viem";
import { z } from "zod";
import { BrianTool, BrianToolOptions } from "./tool";
import { getChain } from "@/utils";

const deployTokenToolSchema = z.object({
  name: z.string(),
  symbol: z.string(),
  totalSupply: z.number(),
  chainId: z.number(),
});

export const createDeployTokenTool = (
  brianSDK: BrianSDK,
  account: Account,
  options?: BrianToolOptions
) => {
  return new BrianTool({
    name: "deploy_token",
    description:
      "tool used for deploying tokens with the given name, symbol and total supply on the given chain",
    brianSDK,
    account,
    options,
    schema: deployTokenToolSchema,
    func: async ({ name, symbol, totalSupply, chainId }) => {
      try {
        const deployPrompt = `Deploy an ERC-20 token with name ${name}, symbol ${symbol} and total supply ${totalSupply}`;

        const { abi, bytecode } = await brianSDK.generateCode({
          prompt: deployPrompt,
          compile: true,
          context: [],
        });

        const network = getChain(chainId);

        const walletClient = createWalletClient({
          account,
          chain: network,
          transport: http(),
        });
        const publicClient = createPublicClient({
          chain: network,
          transport: http(),
        });

        const deployTxHash = await walletClient.deployContract({
          abi,
          bytecode,
          args: [],
        });

        console.log(
          `Deploy contract executed, tx hash: ${deployTxHash} -- waiting for confirmation.`
        );

        await publicClient.waitForTransactionReceipt({
          hash: deployTxHash,
        });

        console.log(
          `Transaction executed successfully, this is the transaction link: ${network.blockExplorers?.default.url}/tx/${deployTxHash}`
        );

        return `Smart contract deployed successfully! I've created the token ${name} with symbol ${symbol} and ${totalSupply} total supply - You can check the transaction here: ${network.blockExplorers?.default.url}/tx/${deployTxHash}`;
      } catch (error) {
        console.error(error);
        return `Calling deploy token tool with arguments:\n\n${JSON.stringify({
          name,
          symbol,
          chainId,
          totalSupply,
        })}\n\nraised the following error:\n\n${error}`;
      }
    },
  });
};
