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

const bridgeToolSchema = z.object({
  tokenIn: z.string(),
  inputChain: z.string(),
  outputChain: z.string(),
  amount: z.string(),
});

export const createBridgeTool = (brianSDK: BrianSDK, account: Account) => {
  return new BrianTool({
    name: "bridge",
    description:
      "bridges the amount of tokenIn from the inputChain to the outputChain",
    schema: bridgeToolSchema,
    brianSDK,
    account,
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

        return `Bridge executed successfully! I've moved ${amount} of ${tokenIn} from ${inputChain} to ${outputChain}`;
      }

      return "No transaction to be executed from this prompt. Maybe you should try with another one?";
    },
  });
};
