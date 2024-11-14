import { z } from "zod";
import { BrianTool, BrianToolOptions } from "./tool.js";
import { BrianSDK } from "@brian-ai/sdk";
import { type Account } from "viem";
import { executeTransactionSteps } from "./utils.js";

const transferToolSchema = z.object({
  token: z.string(),
  chain: z.string(),
  amount: z.string(),
  receiver: z.string(),
});

export const createTransferTool = (
  brianSDK: BrianSDK,
  account: Account,
  options?: BrianToolOptions
) => {
  return new BrianTool({
    name: "transfer",
    description:
      "transfers the amount of token to the receiver on the given chain",
    schema: transferToolSchema,
    brianSDK,
    account,
    options,
    func: async ({ token, chain, amount, receiver }) => {
      const prompt = `Transfer ${amount} ${token} to ${receiver} on ${chain}`;

      const brianTx = await brianSDK.transact({
        prompt,
        address: account.address,
      });

      if (brianTx.length === 0) {
        return "Whoops, could not perform the transfer, an error occurred while calling the Brian APIs.";
      }

      const [tx] = brianTx;
      const { data } = tx;
      let lastTxLink = "";

      if (data.steps && data.steps.length > 0) {
        return await executeTransactionSteps(
          data,
          account,
          `Transfer executed successfully! I've transferred ${amount} of ${token} to ${receiver} on ${chain}.`,
          options
        );
      }

      return "No transaction to be executed from this prompt. Maybe you should try with another one?";
    },
  });
};
