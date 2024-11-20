import { Scraper } from "agent-twitter-client";
import { z } from "zod";
import { TwitterTool } from "./tool.js";

const getTweetsToolSchema = z.object({
  username: z.string(),
  count: z.number().optional().default(5),
});

export const createGetTweetsTool = (scraper: Scraper, cookies: any[]) => {
  return new TwitterTool({
    name: "get_tweets",
    description:
      "returns the last tweets of the given username. use the count parameter to specify the number of tweets to return.",
    schema: getTweetsToolSchema,
    scraper,
    func: async ({ username, count = 5 }) => {
      await scraper.setCookies(cookies);

      let text = `These are the latest ${count} tweets from ${username}:\n\n`;

      const tweets = scraper.getTweets(username, count);

      for await (const tweet of tweets) {
        text += `- [${tweet.timeParsed?.toDateString()}] [ID: ${tweet.id}] "${
          tweet.text
        }"\n`;
      }

      return text;
    },
  });
};
