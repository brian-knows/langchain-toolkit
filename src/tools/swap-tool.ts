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

const swapToolSchema = z.object({
  tokenIn: z.string(),
  tokenOut: z.string(),
  chain: z.string(),
  amount: z.string(),
});

export const createSwapTool = (brianSDK: BrianSDK, account: Account) => {
  return new BrianTool({
    name: "swap",
    description:
      "swaps the amount of tokenIn with the tokenOut on the given chain",
    schema: swapToolSchema,
    brianSDK,
    account,
    func: async ({ tokenIn, tokenOut, chain, amount }) => {
      try {
        const prompt = `Swap ${amount} ${tokenIn} for ${tokenOut} on ${chain}`;

        const brianTx = await brianSDK.transact({
          prompt,
          address: account.address,
        });

        if (brianTx.length === 0) {
          return "Whoops, could not perform the swap, an error occurred while calling the Brian APIs.";
        }

        const [tx] = brianTx;
        const { data } = tx;
        const transactionLinks = [];

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
            if (xmtpContext) {
              await xmtpContext.reply(
                `Transaction executed, tx hash: ${txHash} -- waiting for confirmation.`
              );
            }

            const { transactionHash } =
              await publicClient.waitForTransactionReceipt({
                hash: txHash,
              });

            console.log(
              `Transaction executed successfully, this is the transaction link: ${network.blockExplorers?.default.url}/tx/${transactionHash}`
            );
            if (xmtpContext) {
              await xmtpContext.reply(
                `Transaction executed successfully, this is the transaction link: ${network.blockExplorers?.default.url}/tx/${transactionHash}`
              );
            }
            transactionLinks.push(
              `${network.blockExplorers?.default.url}/tx/${transactionHash}`
            );
          }

          return `Swap executed successfully between ${amount} of ${tokenIn} and ${data.toAmountMin} of ${tokenOut} on ${chain}.`;
        }

        return "No transaction to be executed from this prompt. Maybe you should try with another one?";
      } catch (error) {
        return `Calling tool with arguments:\n\n${JSON.stringify({
          tokenIn,
          tokenOut,
          chain,
          amount,
        })}\n\nraised the following error:\n\n${error}`;
      }
    },
  });
};
