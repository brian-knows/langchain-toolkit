import { Scraper } from "agent-twitter-client";
import { z } from "zod";
import { TwitterTool } from "./tool.js";

const postTweetSchema = z.object({
  text: z.string(),
});

export const createPostTweetTool = (scraper: Scraper, cookies: any[]) => {
  return new TwitterTool({
    name: "post_tweet",
    description: "posts a new tweet on Twitter using the given text.",
    schema: postTweetSchema,
    scraper,
    func: async ({ text }) => {
      await scraper.setCookies(cookies);

      const tweet = await scraper.sendTweet(text);

      return `Tweet posted successfully:\n\n- [${new Date().toDateString()}] "${
        tweet.text
      }"`;
    },
  });
};
