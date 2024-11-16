import { BrianSDK } from "@brian-ai/sdk";
import {
  Account,
  createPublicClient,
  createWalletClient,
  Hex,
  http,
} from "viem";
import { z } from "zod";
import { BrianTool, BrianToolOptions } from "./tool";
import { getChain } from "@/utils";
import ky from "ky";

const deployNFTToolSchema = z.object({
  name: z.string(),
  symbol: z.string(),
  baseURI: z.string(),
  chainId: z.number(),
});

export const createDeployNFTTool = (
  brianSDK: BrianSDK,
  account: Account,
  options?: BrianToolOptions
) => {
  return new BrianTool({
    name: "deploy_nft",
    description:
      "tool used for deploying NFTs with the given name, symbol and baseURI on the given chain",
    brianSDK,
    account,
    options,
    schema: deployNFTToolSchema,
    func: async ({ name, symbol, baseURI, chainId }) => {
      try {
        const deployPrompt = `Deploy an NFT (ERC-721) token with name ${name}, symbol ${symbol} and base URI ${baseURI}`;

        const apiResult = await ky.post<{
          result: { abi: any; bytecode: Hex };
        }>("https://api.brianknows.org/api/v0/agent/smart-contract", {
          headers: {
            "Content-Type": "application/json",
            "x-brian-api-key": process.env.BRIAN_API_KEY,
          },
          json: {
            prompt: deployPrompt,
            compile: true,
          },
        });
        const { result } = await apiResult.json();
        const { abi, bytecode } = result;

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

        const receipt = await publicClient.waitForTransactionReceipt({
          hash: deployTxHash,
        });

        console.log(
          `Transaction executed successfully, this is the transaction link: ${network.blockExplorers?.default.url}/tx/${deployTxHash}`
        );

        return `Smart contract deployed successfully! I've created the token ${name} with symbol ${symbol} and ${baseURI} base URI at this address ${receipt.contractAddress} - You can check the transaction here: ${network.blockExplorers?.default.url}/tx/${deployTxHash}`;
      } catch (error) {
        return `Calling deploy token tool with arguments:\n\n${JSON.stringify({
          name,
          symbol,
          chainId,
          baseURI,
        })}\n\nraised the following error:\n\n${error}`;
      }
    },
  });
};
