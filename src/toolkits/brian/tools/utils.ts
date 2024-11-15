import { TransactionData } from "@brian-ai/sdk";
import { Account, createPublicClient, createWalletClient, http } from "viem";
import { BrianToolOptions } from "./tool";
import { getChain } from "@/utils";
import {
  CallWithERC2771Request,
  GelatoRelay,
} from "@gelatonetwork/relay-sdk-viem";

export const getChainAndClients = (account: Account, chainId: number) => {
  const network = getChain(chainId);
  const walletClient = createWalletClient({
    account,
    chain: network,
    transport: http(),
  });
  const publicClient = createPublicClient({
    chain: network,
    transport: http(),
  });

  return { network, walletClient, publicClient };
};

export const executeTransactionSteps = async (
  data: TransactionData,
  account: Account,
  successMessage: string,
  options?: BrianToolOptions
) => {
  const chainId = data.fromChainId;
  const { network, walletClient, publicClient } = getChainAndClients(
    account,
    chainId!
  );
  if (options?.gelatoApiKey) {
    let lastTxLink = "";

    const gelatoRelay = new GelatoRelay();

    const walletClient = createWalletClient({
      account,
      transport: http(),
    });

    for (const step of data.steps!) {
      const gelatoRequest = {
        user: step.from,
        chainId: BigInt(network.id),
        target: step.to,
        data: step.data,
      } as CallWithERC2771Request;

      const gelatoResponse = await gelatoRelay.sponsoredCallERC2771(
        gelatoRequest,
        walletClient as any,
        options.gelatoApiKey
      );

      lastTxLink = `https://relay.gelato.digital/tasks/status/${gelatoResponse.taskId}`;
    }

    return `${successMessage} - You can check the transaction here: ${lastTxLink}`;
  } else {
    let lastTxLink = "";

    for (const step of data.steps!) {
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

      const { transactionHash } = await publicClient.waitForTransactionReceipt({
        hash: txHash,
      });

      console.log(
        `Transaction executed successfully, this is the transaction link: ${network.blockExplorers?.default.url}/tx/${transactionHash}`
      );

      lastTxLink = `${network.blockExplorers?.default.url}/tx/${transactionHash}`;
    }

    return `${successMessage} - You can check the transaction here: ${lastTxLink}`;
  }
};
