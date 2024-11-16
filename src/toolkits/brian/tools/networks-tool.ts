import { BrianSDK, Network } from "@brian-ai/sdk";
import { Account } from "viem";
import { z } from "zod";
import { BrianTool } from "./tool";

const getNetworksToolSchema = z.object({
  chain: z.string(),
});

export const createGetNetworksTool = (brianSDK: BrianSDK, account: Account) => {
  return new BrianTool({
    name: "get_networks",
    description:
      "you should use this tool whenever you need to get the chainId of a network from its name.",
    schema: getNetworksToolSchema,
    brianSDK,
    account,
    func: async ({ chain }) => {
      console.log("using networks");
      const networks = await brianSDK.getNetworks();

      return `These are all the supported networks:\n\n${networks.map(
        (network: Network) => `- ${network.name} [chainId: ${network.id}]\n`
      )}`;
    },
  });
};
