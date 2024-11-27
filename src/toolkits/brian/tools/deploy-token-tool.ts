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

        const apiResult = await ky.post<{
          result: {
            contract: string;
            contractName: string;
            version: string;
            abi: any;
            bytecode: Hex;
          };
        }>("https://staging-api.brianknows.org/api/v0/agent/smart-contract", {
          headers: {
            "Content-Type": "application/json",
            "x-brian-api-key": process.env.BRIAN_API_KEY,
          },
          timeout: 60000,
          json: {
            prompt: deployPrompt,
            compile: true,
          },
        });
        const { result } = await apiResult.json();
        const {
          contract: code,
          contractName,
          version: solidityVersion,
          abi,
          bytecode,
        } = result;

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

        if (options?.etherscanApiKey && network.blockExplorers?.default) {
          // wait 5 seconds before verifying the smart contract
          await new Promise((resolve) => setTimeout(resolve, 5000));
          // verify the smart contract
          const parsedCode = code.replace("```solidity", "").replace("```", "");
          //.replace("\n", " ");
          try {
            const key = `contracts/${contractName}.sol`;
            const formData = new FormData();
            formData.append("chainId", network.id.toString());
            formData.append("codeformat", "solidity-standard-json-input");
            formData.append(
              "sourceCode",
              JSON.stringify({
                language: "Solidity",
                sources: {
                  [key]: {
                    content: parsedCode,
                  },
                },
              })
            );
            formData.append("contractaddress", receipt.contractAddress!);
            formData.append(
              "contractname",
              `contracts/${contractName}.sol:${contractName}`
            );
            formData.append("compilerversion", `v${solidityVersion}`);

            await ky.post(
              `${network.blockExplorers?.default.url}/api?module=contract&action=verifysourcecode&apiKey=${options.etherscanApiKey}`,
              {
                body: formData,
                headers: {},
              }
            );
            console.log("Smart contract verified successfully!");
          } catch (error) {
            console.error(error);
          }
        }

        return `Smart contract deployed successfully! I've created the token ${name} with symbol ${symbol} and ${totalSupply} total supply at this address: ${receipt.contractAddress} - You can check the transaction here: ${network.blockExplorers?.default.url}/tx/${deployTxHash}`;
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
