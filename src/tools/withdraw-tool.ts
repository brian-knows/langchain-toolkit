import { z } from "zod";
import { BrianTool } from "../tool";
import { BrianSDK } from "@brian-ai/sdk";
import {
  createPublicClient,
  createWalletClient,
  http,
  type Account,
} from "viem";
import { getChain } from "../utils";

const withdrawToolSchema = z.object({
  tokenIn: z.string(),
  chain: z.string(),
  amount: z.string(),
  protocol: z.string(),
});

export const createWithdrawTool = (brianSDK: BrianSDK, account: Account) => {
  return new BrianTool({
    name: "withdraw",
    description:
      "withdraws the amount of tokenIn in the given protocol on the given chain.",
    schema: withdrawToolSchema,
    brianSDK,
    account,
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

      if (data.steps && data.steps.length > 0) {
        const chainId = data.fromChainId;
        const network = getChain(chainId!);

        const walletClient = createWalletClient({
          account,
          chain: network,
          transport: http(),
        });
        const publicClient = createPublicClient({
          chain: network,
          transport: http(),
        });

        for (const step of data.steps) {
          if (step.chainId !== walletClient.chain.id) {
            // change chain
            await walletClient.switchChain({ id: step.chainId });
          }

          const txHash = await walletClient.sendTransaction({
            from: step.from,
            to: step.to,
            value: BigInt(step.value),
            data: step.data,
            chainId: step.chainId,
          });

          console.log(
            `Transaction executed, tx hash: ${txHash} -- waiting for confirmation.`
          );

          const { transactionHash } =
            await publicClient.waitForTransactionReceipt({
              hash: txHash,
            });

          console.log(
            `Transaction executed successfully, this is the transaction link: ${network.blockExplorers?.default.url}/tx/${transactionHash}`
          );
        }
        return `Withdraw executed successfully! I've withdrawn ${amount} of ${tokenIn} on ${protocol} on ${chain}.`;
      }

      return "No transaction to be executed from this prompt. Maybe you should try with another one?";
    },
  });
};
