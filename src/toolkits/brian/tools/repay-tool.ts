import { z } from "zod";
import { BrianTool, BrianToolOptions } from "./tool.js";
import { BrianSDK } from "@brian-ai/sdk";
import { type Account } from "viem";
import { executeTransactionSteps } from "./utils";

const repayToolSchema = z.object({
  token: z.string(),
  chain: z.string(),
  amount: z.string(),
});

export const createRepayTool = (
  brianSDK: BrianSDK,
  account: Account,
  options?: BrianToolOptions
) => {
  return new BrianTool({
    name: "repay",
    description:
      "repays the borrowed amount of token to aave on the given chain. you must've borrowed before to execute this action.",
    schema: repayToolSchema,
    brianSDK,
    account,
    options,
    func: async ({ token, amount, chain }) => {
      const prompt = `Repay ${amount} ${token} on ${chain}`;

      const brianTx = await brianSDK.transact({
        prompt,
        address: account.address,
      });

      if (brianTx.length === 0) {
        return "Whoops, could not perform the repay, an error occurred while calling the Brian APIs.";
      }

      const [tx] = brianTx;
      const { data } = tx;

      if (data.steps && data.steps.length > 0) {
        return await executeTransactionSteps(
          data,
          account,
          `Repay executed successfully! I've borrowed ${amount} of ${token} on ${chain}.`,
          options
        );
      }

      return "No transaction to be executed from this prompt. Maybe you should try with another one?";
    },
  });
};
