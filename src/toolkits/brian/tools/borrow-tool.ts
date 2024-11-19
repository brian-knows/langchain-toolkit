import { z } from "zod";
import { BrianTool, BrianToolOptions } from "./tool.js";
import { BrianSDK } from "@brian-ai/sdk";
import { type Account } from "viem";
import { executeTransactionSteps } from "./utils";

const borrowToolSchema = z.object({
  token: z.string(),
  chain: z.string(),
  amount: z.string(),
});

export const createBorrowTool = (
  brianSDK: BrianSDK,
  account: Account,
  options?: BrianToolOptions
) => {
  return new BrianTool({
    name: "borrow",
    description:
      "borrows the amount of token from aave on the given chain. you must've deposited before to execute this action.",
    schema: borrowToolSchema,
    brianSDK,
    account,
    options,
    func: async ({ token, amount, chain }) => {
      const prompt = `Borrow ${amount} ${token} on ${chain}`;

      const brianTx = await brianSDK.transact({
        prompt,
        address: account.address,
      });

      if (brianTx.length === 0) {
        return "Whoops, could not perform the borrow, an error occurred while calling the Brian APIs.";
      }

      const [tx] = brianTx;
      const { data } = tx;

      if (data.steps && data.steps.length > 0) {
        return await executeTransactionSteps(
          data,
          account,
          `Borrow executed successfully! I've borrowed ${amount} of ${token} on ${chain}.`,
          options
        );
      }

      return "No transaction to be executed from this prompt. Maybe you should try with another one?";
    },
  });
};
