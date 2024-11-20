import { createBrianAgent } from "@brian-ai/langchain";
import { ChatXAI } from "@langchain/xai";
import { run, HandlerContext } from "@xmtp/message-kit";

run(async (context: HandlerContext) => {
  const brianAgent = await createBrianAgent({
    apiKey: process.env.BRIAN_API_KEY!,
    privateKeyOrAccount: process.env.KEY as `0x${string}`,
    llm: new ChatXAI({ apiKey: process.env.GROK_API_KEY }),
    instructions: "You're a web3 assistant. You speak like a wookie.",
    xmtpHandler: context,
    xmtpHandlerOptions: {
      onAgentAction: true,
      onToolStart: true,
      onToolError: true,
    },
  });
  const { content } = context.message;
  const result = await brianAgent.invoke({ input: content.text });
  await context.send(result.output);
});
