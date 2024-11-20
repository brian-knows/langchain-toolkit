import { BaseToolkit, ToolInterface } from "@langchain/core/tools";
import { Scraper } from "agent-twitter-client";
import {
  createGetLatestTweetTool,
  createGetTrendsTool,
  createGetTweetsTool,
  createGetTweetTool,
  createPostTweetTool,
} from "./tools";

export type TwitterToolkitOptions = {
  twitterUsername: string;
  twitterPassword: string;
  twitterEmail?: string;
};

export class TwitterToolkit extends BaseToolkit {
  scraper: Scraper;
  cookies: any[];
  tools: ToolInterface[] = [];

  constructor() {
    super();
    this.scraper = new Scraper();
    this.cookies = [];
  }

  async setup({
    twitterUsername,
    twitterPassword,
    twitterEmail,
  }: TwitterToolkitOptions) {
    await this.scraper.login(twitterUsername, twitterPassword, twitterEmail);
    const cookies = await this.scraper.getCookies();
    this.cookies = cookies;

    this.tools = [
      createGetLatestTweetTool(this.scraper, this.cookies),
      createGetTweetTool(this.scraper, this.cookies),
      createGetTweetsTool(this.scraper, this.cookies),
      createPostTweetTool(this.scraper, this.cookies),
      createGetTrendsTool(this.scraper, this.cookies),
    ];
  }
}
