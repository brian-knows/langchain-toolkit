import { z } from "zod";
import { BrianTool, BrianToolOptions } from "./tool.js";
import { BrianSDK } from "@brian-ai/sdk";
import { type Account } from "viem";
import { executeTransactionSteps } from "./utils";

const withdrawToolSchema = z.object({
  tokenIn: z.string(),
  chain: z.string(),
  amount: z.string(),
  protocol: z.string(),
});

export const createWithdrawTool = (
  brianSDK: BrianSDK,
  account: Account,
  options?: BrianToolOptions
) => {
  return new BrianTool({
    name: "withdraw",
    description:
      "withdraws the amount of tokenIn in the given protocol on the given chain.",
    schema: withdrawToolSchema,
    brianSDK,
    account,
    options,
    func: async ({ tokenIn, amount, protocol, chain }) => {
      const prompt = `Withdraw ${amount} ${tokenIn} on ${protocol} on ${chain}`;

      const brianTx = await brianSDK.transact({
        prompt,
        address: account.address,
      });

      if (brianTx.length === 0) {
        return "Whoops, could not perform the withdraw, an error occurred while calling the Brian APIs.";
      }

      const [tx] = brianTx;
      const { data } = tx;
      let lastTxLink = "";

      if (data.steps && data.steps.length > 0) {
        return await executeTransactionSteps(
          data,
          account,
          `Withdraw executed successfully! I've withdrawn ${amount} of ${tokenIn} on ${protocol} on ${chain}.`,
          options
        );
      }

      return "No transaction to be executed from this prompt. Maybe you should try with another one?";
    },
  });
};
