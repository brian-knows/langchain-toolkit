import { Account, formatUnits } from "viem";
import { z } from "zod";
import { BrianTool } from "./tool";
import { BrianSDK } from "@brian-ai/sdk";
import {
  ChainType,
  createConfig,
  getTokenBalances,
  getTokens,
} from "@lifi/sdk";
import { getChain, roundToFirstDecimal } from "@/utils";

const getWalletToolSchema = z.object({
  chainId: z.number(),
});

export const createGetWalletTool = (brianSDK: BrianSDK, account: Account) => {
  return new BrianTool({
    name: "get_wallet_details",
    description:
      "this tool will give you info about your wallet on a specific chain. use the get_networks to retrieve the chainId of the network you are interested in.",
    brianSDK,
    account,
    schema: getWalletToolSchema,
    func: async ({ chainId }) => {
      try {
        createConfig({
          integrator: "Brian",
        });
        const chain = getChain(chainId);
        const { tokens: chainTokens } = await getTokens({
          chainTypes: [ChainType.EVM],
        });
        const tokens = await getTokenBalances(
          account.address,
          chainTokens[chainId]
        );
        console.log(chainId, tokens, account.address);
        if (!tokens) {
          return `You don't own any tokens on ${chain.name}. Maybe try with a different one?`;
        }

        return `These are the tokens you own on ${
          chain.name
        } with their relative balances:\n${tokens
          .filter((token) => token.amount && token.amount > 0)
          .map(
            (token) =>
              `${roundToFirstDecimal(
                parseFloat(formatUnits(token.amount!, token.decimals!))
              )} ${token.symbol} ($${roundToFirstDecimal(
                parseFloat(formatUnits(token.amount!, token.decimals!)) *
                  parseFloat(token.priceUSD)
              )})`
          )
          .join("\n")}`;
      } catch (error) {
        return `Calling get wallet tool with arguments:\n\n${JSON.stringify({
          chainId,
        })}\n\nraised the following error:\n\n${error}`;
      }
    },
  });
};
