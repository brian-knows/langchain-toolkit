import { z } from "zod";
import { BrianCDPTool } from "./tool.js";
import { BrianSDK } from "@brian-ai/sdk";
import { erc20Abi } from "viem";
import { Coinbase, type Wallet } from "@coinbase/coinbase-sdk";
import {
  BUNGEE_ROUTER_ABI,
  decodeFunctionDataForCdp,
  ENSO_ROUTER_ABI,
  getAddressFromWallet,
  LIFI_ROUTER_ABI,
} from "./utils";

const swapToolSchema = z.object({
  tokenIn: z.string(),
  tokenOut: z.string(),
  chain: z.string(),
  amount: z.string(),
});

export const createCDPSwapTool = (brianSDK: BrianSDK, wallet: Wallet) => {
  return new BrianCDPTool({
    name: "swap",
    description:
      "swaps the amount of tokenIn with the tokenOut on the given chain",
    schema: swapToolSchema,
    brianSDK,
    wallet,
    func: async ({ tokenIn, tokenOut, chain, amount }) => {
      const prompt = `Swap ${amount} ${tokenIn} for ${tokenOut} on ${chain}`;

      const address = await getAddressFromWallet(wallet);

      const brianTx = await brianSDK.transact({
        prompt,
        address,
      });

      if (brianTx.length === 0) {
        return "Whoops, could not perform the swap, an error occurred while calling the Brian APIs.";
      }

      const [tx] = brianTx;
      const { solver, data } = tx;

      //check if there are any steps
      const txStepsLength = data.steps!.length;
      if (txStepsLength === 0) {
        return "No transaction to be executed from this prompt. Maybe you should try with another one?";
      }

      const approveNeeded = data.steps!.length > 1;

      if (approveNeeded) {
        const [decodedData, functionName] = decodeFunctionDataForCdp(
          erc20Abi,
          data.steps![0].data
        );
        //make approve
        const erc20ApproveTx = await wallet.invokeContract({
          contractAddress: data.steps![0].to,
          method: functionName,
          abi: erc20Abi,
          args: decodedData,
        });
        await erc20ApproveTx.wait();
      }
      //retrieve swap data
      const solverAbi =
        solver === "Enso"
          ? ENSO_ROUTER_ABI
          : solver === "Bungee"
          ? BUNGEE_ROUTER_ABI
          : LIFI_ROUTER_ABI;

      //decode data according to CDP sdk
      const [decodedData, functionName] = decodeFunctionDataForCdp(
        solverAbi,
        data.steps![data.steps!.length - 1].data
      );
      //make swap
      const swapTx = await wallet.invokeContract({
        contractAddress: data.steps![data.steps!.length - 1].to,
        method: functionName,
        abi: solverAbi,
        args: decodedData,
        amount: BigInt(data.steps![data.steps!.length - 1].value),
        assetId: Coinbase.assets.Wei,
      });
      const receipt = await swapTx.wait();
      const txLink = receipt.getTransactionLink();

      console.log(
        `Transaction executed successfully, this is the transaction link: ${txLink}`
      );
      return `Swap executed successfully between ${amount} of ${tokenIn} and ${data.toAmountMin} of ${tokenOut} on ${chain}.`;
    },
  });
};
