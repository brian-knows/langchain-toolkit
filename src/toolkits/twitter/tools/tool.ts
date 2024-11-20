import { Scraper } from "agent-twitter-client";
import {
  DynamicStructuredTool,
  DynamicStructuredToolInput,
} from "langchain/tools";

export class TwitterTool extends DynamicStructuredTool {
  scraper: Scraper;

  constructor(
    fields: DynamicStructuredToolInput & {
      scraper: Scraper;
    }
  ) {
    super(fields);
    this.scraper = fields.scraper;
  }
}
