import { z } from "zod";
import { BrianTool } from "./tool.js";
import { BrianSDK } from "@brian-ai/sdk";
import { type Account } from "viem";

const balanceToolSchema = z.object({
  token: z.string(),
  chain: z.string(),
  address: z.string().or(z.undefined()),
});

export const createGetBalanceTool = (brianSDK: BrianSDK, account: Account) => {
  return new BrianTool({
    name: "get_balance",
    description:
      "returns the balance of the token for the given address on the given chain.",
    schema: balanceToolSchema,
    brianSDK,
    account,
    func: async ({ token, chain, address }) => {
      const prompt = `What is the ${token} balance of ${
        address || account.address
      } on ${chain}?`;

      const brianTx = await brianSDK.transact({
        prompt,
        address: account.address,
      });

      if (brianTx.length === 0) {
        return `The ${token} balance of ${
          address || account.address
        } is 0 on ${chain}.`;
      }

      const [tx] = brianTx;

      return tx.data.description;
    },
  });
};
