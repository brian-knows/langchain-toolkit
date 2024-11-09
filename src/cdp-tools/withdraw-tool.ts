import { z } from "zod";
import { BrianCDPTool } from "../tool";
import { BrianSDK } from "@brian-ai/sdk";
import { erc20Abi } from "viem";
import { Coinbase, Wallet } from "@coinbase/coinbase-sdk";
import {
  getAddressFromWallet,
  decodeFunctionDataForCdp,
  ENSO_ROUTER_ABI,
  LIDO_ABI,
} from "./utils";

const withdrawToolSchema = z.object({
  tokenIn: z.string(),
  chain: z.string(),
  amount: z.string(),
  protocol: z.string(),
});

export const createCDPWithdrawTool = (brianSDK: BrianSDK, wallet: Wallet) => {
  return new BrianCDPTool({
    name: "withdraw",
    description:
      "withdraws the amount of tokenIn in the given protocol on the given chain.",
    schema: withdrawToolSchema,
    brianSDK,
    wallet,
    func: async ({ tokenIn, amount, protocol, chain }) => {
      const prompt = `Withdraw ${amount} ${tokenIn} on ${protocol} on ${chain}`;

      const address = await getAddressFromWallet(wallet);

      const brianTx = await brianSDK.transact({
        prompt,
        address,
      });

      if (brianTx.length === 0) {
        return "Whoops, could not perform the deposit, an error occurred while calling the Brian APIs.";
      }

      const [tx] = brianTx;
      const { solver, data } = tx;

      //check if there are any steps
      const txStepsLength = data.steps!.length;
      if (txStepsLength === 0) {
        return "No transaction to be executed from this prompt. Maybe you should try with another one?";
      }

      const approveNeeded = data.steps!.length > 1;

      if (approveNeeded) {
        const [decodedData, functionName] = decodeFunctionDataForCdp(
          erc20Abi,
          data.steps![0].data
        );
        //make approve
        const erc20ApproveTx = await wallet.invokeContract({
          contractAddress: data.steps![0].to,
          method: functionName,
          abi: erc20Abi,
          args: decodedData,
        });
        await erc20ApproveTx.wait();
      }
      //get deposit solver
      const withdrawSolver = solver;
      //decode data according to CDP sdk
      const [decodedData, functionName] = decodeFunctionDataForCdp(
        withdrawSolver === "Enso" ? ENSO_ROUTER_ABI : LIDO_ABI,
        data.steps![data.steps!.length - 1].data
      );
      //make swap
      const withdrawTx = await wallet.invokeContract({
        contractAddress: data.steps![data.steps!.length - 1].to,
        method: functionName,
        abi: withdrawSolver === "Enso" ? ENSO_ROUTER_ABI : LIDO_ABI,
        args: decodedData,
        amount: BigInt(data.steps![data.steps!.length - 1].value),
        assetId: Coinbase.assets.Wei,
      });
      const receipt = await withdrawTx.wait();
      const txLink = receipt.getTransactionLink();

      console.log(
        `Transaction executed successfully, this is the transaction link: ${txLink}`
      );
      return `Withdraw executed successfully! I've withdrawn ${amount} of ${tokenIn} on ${protocol} on ${chain}.`;
    },
  });
};
