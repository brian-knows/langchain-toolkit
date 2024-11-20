import { Scraper } from "agent-twitter-client";
import { z } from "zod";
import { TwitterTool } from "./tool.js";

const getLatestTweetSchema = z.object({
  username: z.string(),
});

export const createGetLatestTweetTool = (scraper: Scraper, cookies: any[]) => {
  return new TwitterTool({
    name: "get_latest_tweet",
    description:
      "returns the latest weet for the user with the given username.",
    schema: getLatestTweetSchema,
    scraper,
    func: async ({ username }) => {
      await scraper.setCookies(cookies);

      const tweet = await scraper.getLatestTweet(username);

      if (!tweet) {
        return "No tweet found for this user.";
      }

      return `This is the last tweet from ${username}:\n\n- [${tweet.timeParsed?.toDateString()}] [ID: ${
        tweet.id
      }] "${tweet.text}"`;
    },
  });
};
