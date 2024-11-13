import { z } from "zod";
import { BrianStarknetTool } from "./tool.js";
import { BrianSDK } from "@brian-ai/sdk";
import { Account } from "starknet";

const transferToolSchema = z.object({
  token: z.string(),
  amount: z.string(),
  receiver: z.string(),
});

export const createStarknetTransferTool = (
  brianSDK: BrianSDK,
  account: Account
) => {
  return new BrianStarknetTool({
    name: "transfer",
    description:
      "transfers the amount of token to the receiver on the given chain",
    schema: transferToolSchema,
    brianSDK,
    account,
    func: async ({ token, chain, amount, receiver }) => {
      const prompt = `Transfer ${amount} ${token} to ${receiver} on Starknet`;

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
        return `Transfer executed successfully! I've transferred ${amount} of ${token} to ${receiver} on ${chain}. You can check the transaction here: ${lastTxLink}`;
      }

      return "No transaction to be executed from this prompt. Maybe you should try with another one?";
    },
  });
};
