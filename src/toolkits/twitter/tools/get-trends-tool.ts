import { Scraper } from "agent-twitter-client";
import { z } from "zod";
import { TwitterTool } from "./tool.js";

const getTrendsToolSchema = z.object({});

export const createGetTrendsTool = (scraper: Scraper, cookies: any[]) => {
  return new TwitterTool({
    name: "get_trends",
    description: "use it to return a list of the latest trends on twitter.",
    schema: getTrendsToolSchema,
    scraper,
    func: async ({ username, count }) => {
      await scraper.setCookies(cookies);

      const trends = await scraper.getTrends();

      return `These are the latest trends on Twitter:\n\n${trends
        .map((trend) => `- ${trend}`)
        .join("\n")}`;
    },
  });
};
