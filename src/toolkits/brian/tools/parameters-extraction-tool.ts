import { z } from "zod";
import { BrianTool } from "./tool.js";
import { BrianSDK } from "@brian-ai/sdk";
import { type Account } from "viem";

const parametersExtractionToolSchema = z.object({
  prompt: z.string(),
});

export const createParametersExtractionTool = (
  brianSDK: BrianSDK,
  account: Account
) => {
  return new BrianTool({
    name: "parameters_extraction",
    description:
      "extracts the parameters from the given prompt, it's useful before calling other configured tools to get the right parameters for them.",
    schema: parametersExtractionToolSchema,
    brianSDK,
    account,
    responseFormat: "json",
    func: async ({ prompt }) => {
      return await brianSDK.extract({
        prompt,
      });
    },
  });
};
