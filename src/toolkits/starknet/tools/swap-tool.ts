import { z } from "zod";
import { BrianStarknetTool } from "./tool.js";
import { BrianSDK } from "@brian-ai/sdk";
import { formatUnits } from "viem";
import { Account } from "starknet";

const swapToolSchema = z.object({
  tokenIn: z.string(),
  tokenOut: z.string(),
  amount: z.string(),
});

export const createStarknetSwapTool = (
  brianSDK: BrianSDK,
  account: Account
) => {
  return new BrianStarknetTool({
    name: "swap",
    description: "swaps the amount of tokenIn with the tokenOut on Starknet",
    schema: swapToolSchema,
    brianSDK,
    account,
    func: async ({ tokenIn, tokenOut, amount }) => {
      try {
        const prompt = `Swap ${amount} ${tokenIn} for ${tokenOut} on Starknet`;

        const brianTx = await brianSDK.transact({
          prompt,
          address: account.address,
          chainId: "4012",
        });

        if (brianTx.length === 0) {
          return "Whoops, could not perform the swap, an error occurred while calling the Brian APIs.";
        }

        const [tx] = brianTx;
        const { data } = tx;
        let lastTxLink = "";

        if (data.steps && data.steps.length > 0) {
          for (const step of data.steps) {
            const { transaction_hash } = await account.execute(
              (step as any)[Object.keys(step)[0]]
            );

            console.log(
              `Transaction executed, tx hash: ${transaction_hash} -- waiting for confirmation.`
            );

            await account.waitForTransaction(transaction_hash);

            console.log(
              `Transaction executed successfully, this is the transaction link: https://starkscan.co/tx/${transaction_hash}`
            );

            lastTxLink = `https://starkscan.co/tx/${transaction_hash}`;
          }

          return `Swap executed successfully between ${amount} of ${tokenIn} and ${formatUnits(
            BigInt(data.toAmountMin!),
            data.toToken?.decimals || 18
          )} of ${tokenOut} on Starknet. You can check the transaction here: ${lastTxLink}`;
        }

        return "No transaction to be executed from this prompt. Maybe you should try with another one?";
      } catch (error) {
        return `Calling tool with arguments:\n\n${JSON.stringify({
          tokenIn,
          tokenOut,
          amount,
        })}\n\nraised the following error:\n\n${error}`;
      }
    },
  });
};
