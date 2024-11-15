import { z } from "zod";
import { BrianTool, BrianToolOptions } from "./tool.js";
import { BrianSDK } from "@brian-ai/sdk";
import { formatUnits, type Account } from "viem";
import { executeTransactionSteps } from "./utils.js";

const swapToolSchema = z.object({
  tokenIn: z.string(),
  tokenOut: z.string(),
  chain: z.string(),
  amount: z.string(),
});

export const createSwapTool = (
  brianSDK: BrianSDK,
  account: Account,
  options?: BrianToolOptions
) => {
  return new BrianTool({
    name: "swap",
    description:
      "swaps the amount of tokenIn with the tokenOut on the given chain",
    schema: swapToolSchema,
    brianSDK,
    account,
    options,
    func: async ({ tokenIn, tokenOut, chain, amount }) => {
      try {
        const prompt = `Swap ${amount} ${tokenIn} for ${tokenOut} on ${chain}`;

        const brianTx = await brianSDK.transact({
          prompt,
          address: account.address,
        });

        if (brianTx.length === 0) {
          return "Whoops, could not perform the swap, an error occurred while calling the Brian APIs.";
        }

        const [tx] = brianTx;
        const { data } = tx;

        if (data.steps && data.steps.length > 0) {
          return await executeTransactionSteps(
            data,
            account,
            `Swap executed successfully between ${amount} of ${tokenIn} and ${formatUnits(
              BigInt(data.toAmountMin!),
              data.toToken?.decimals || 18
            )} of ${tokenOut} on ${chain}.`,
            options
          );
        }

        return "No transaction to be executed from this prompt. Maybe you should try with another one?";
      } catch (error) {
        return `Calling swap tool with arguments:\n\n${JSON.stringify({
          tokenIn,
          tokenOut,
          chain,
          amount,
        })}\n\nraised the following error:\n\n${error}`;
      }
    },
  });
};
