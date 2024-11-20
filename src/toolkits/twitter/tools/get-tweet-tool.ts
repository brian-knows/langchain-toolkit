import { Scraper } from "agent-twitter-client";
import { z } from "zod";
import { TwitterTool } from "./tool.js";

const getTweetSchema = z.object({
  tweetId: z.string(),
});

export const createGetTweetTool = (scraper: Scraper, cookies: any[]) => {
  return new TwitterTool({
    name: "get_tweet_by_id",
    description: "returns the information about the tweet with the given id.",
    schema: getTweetSchema,
    scraper,
    func: async ({ tweetId }) => {
      await scraper.setCookies(cookies);

      const tweet = await scraper.getTweet(tweetId);

      if (!tweet) {
        return `No tweet found with id ${tweetId}.`;
      }

      return `This is the tweet with the id ${tweetId}:\n\n[${tweet.timeParsed?.toDateString()}] "${
        tweet.text
      }"`;
    },
  });
};
