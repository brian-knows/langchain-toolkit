import { z } from "zod";
import { BrianCDPTool } from "../tool";
import { BrianSDK } from "@brian-ai/sdk";
import { erc20Abi } from "viem";
import { Coinbase, type Wallet } from "@coinbase/coinbase-sdk";
import {
  decodeFunctionDataForCdp,
  getAddressFromWallet,
  NULL_ADDRESS,
} from "./utils";

const transferToolSchema = z.object({
  token: z.string(),
  chain: z.string(),
  amount: z.string(),
  receiver: z.string(),
});

export const createCDPTransferTool = (brianSDK: BrianSDK, wallet: Wallet) => {
  return new BrianCDPTool({
    name: "transfer",
    description:
      "transfers the amount of token to the receiver on the given chain",
    schema: transferToolSchema,
    brianSDK,
    wallet,
    func: async ({ token, chain, amount, receiver }) => {
      const prompt = `Transfer ${amount} ${token} to ${receiver} on ${chain}`;
      const address = await getAddressFromWallet(wallet);

      const brianTx = await brianSDK.transact({
        prompt,
        address,
      });

      if (brianTx.length === 0) {
        return "Whoops, could not perform the transfer, an error occurred while calling the Brian APIs.";
      }

      const [tx] = brianTx;
      const { data } = tx;

      if (data.steps && data.steps.length > 0) {
        const txStep = data.steps[0]!;
        let txLink: string | undefined = "";

        if (data.fromToken?.address === NULL_ADDRESS) {
          // generate tx for ETH
          const ethTransferTx = await wallet.createTransfer({
            destination: txStep.to,
            amount: BigInt(txStep.value),
            assetId: Coinbase.assets.Wei,
          });
          const transfer = await ethTransferTx.wait();
          txLink = transfer.getTransactionLink();
        } else {
          const [decodedData, functionName] = decodeFunctionDataForCdp(
            erc20Abi,
            txStep.data
          );
          const erc20TransferTx = await wallet.invokeContract({
            contractAddress: txStep.to,
            method: functionName,
            abi: erc20Abi,
            args: decodedData,
          });
          const transaction = await erc20TransferTx.wait();
          txLink = transaction.getTransactionLink();
        }

        console.log(
          `Transaction executed successfully, this is the transaction link: ${txLink}`
        );
        return `Transfer executed successfully! I've transferred ${amount} of ${token} to ${receiver} on ${chain}.`;
      }

      return "No transaction to be executed from this prompt. Maybe you should try with another one?";
    },
  });
};
