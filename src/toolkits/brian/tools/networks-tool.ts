import { BrianSDK, Network } from "@brian-ai/sdk";
import { Account } from "viem";
import { z } from "zod";
import { BrianTool } from "./tool";

const getNetworksToolSchema = z.object({});

export const createGetNetworksToolSchema = (
  brianSDK: BrianSDK,
  account: Account
) => {
  return new BrianTool({
    name: "get_networks",
    description:
      "gets all the networks available. useful for mapping a chain name to its chainId.",
    schema: getNetworksToolSchema,
    brianSDK,
    account,
    func: async () => {
      const networks = await brianSDK.getNetworks();

      return `These are all the supported networks:\n\n${networks.map(
        (network: Network) => `- ${network.name} [chainId: ${network.id}]\n`
      )}`;
    },
  });
};
