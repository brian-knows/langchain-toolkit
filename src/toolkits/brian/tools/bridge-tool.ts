import { z } from "zod";
import { BrianTool, BrianToolOptions } from "./tool.js";
import { BrianSDK } from "@brian-ai/sdk";
import { type Account } from "viem";
import { executeTransactionSteps } from "./utils.js";

const bridgeToolSchema = z.object({
  tokenIn: z.string(),
  inputChain: z.string(),
  outputChain: z.string(),
  amount: z.string(),
});

export const createBridgeTool = (
  brianSDK: BrianSDK,
  account: Account,
  options?: BrianToolOptions
) => {
  return new BrianTool({
    name: "bridge",
    description:
      "bridges the amount of tokenIn from the inputChain to the outputChain",
    schema: bridgeToolSchema,
    brianSDK,
    account,
    options,
    func: async ({ tokenIn, inputChain, outputChain, amount }) => {
      const prompt = `Bridge ${amount} ${tokenIn} from ${inputChain} to ${outputChain}`;

      const brianTx = await brianSDK.transact({
        prompt,
        address: account.address,
      });

      if (brianTx.length === 0) {
        return "Whoops, could not perform the bridge, an error occurred while calling the Brian APIs.";
      }

      const [tx] = brianTx;
      const { data } = tx;

      if (data.steps && data.steps.length > 0) {
        return await executeTransactionSteps(
          data,
          account,
          `Bridge executed successfully! I've moved ${amount} of ${tokenIn} from ${inputChain} to ${outputChain}.`,
          options
        );
      }

      return "No transaction to be executed from this prompt. Maybe you should try with another one?";
    },
  });
};
