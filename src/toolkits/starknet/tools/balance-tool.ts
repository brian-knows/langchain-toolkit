import { z } from "zod";
import { BrianStarknetTool } from "./tool.js";
import { BrianSDK } from "@brian-ai/sdk";
import { type Account } from "starknet";

const balanceToolSchema = z.object({
  token: z.string(),
  address: z.string().or(z.undefined()),
});

export const createStarknetGetBalanceTool = (
  brianSDK: BrianSDK,
  account: Account
) => {
  return new BrianStarknetTool({
    name: "get_balance",
    description:
      "returns the balance of the token for the given address on Starknet.",
    schema: balanceToolSchema,
    brianSDK,
    account,
    responseFormat: "json",
    func: async ({ token, address }) => {
      const prompt = `What is the ${token} balance of ${
        address || account.address
      } on Starknet?`;

      const brianTx = await brianSDK.transact({
        prompt,
        address: account.address,
        chainId: "4012",
      });

      if (brianTx.length === 0) {
        return {
          description: `The ${token} balance of ${
            address || account.address
          } is 0.`,
          value: 0,
        };
      }

      const [tx] = brianTx;

      return tx.data;
    },
  });
};
