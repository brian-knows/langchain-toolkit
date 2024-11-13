import { AgentRun, BaseTracer, Run } from "@langchain/core/tracers/base";
import { HandlerContext } from "@xmtp/message-kit";
import { tryJsonStringify, formatKVMapItem } from "./utils.js";
import { LanguageModelLike } from "@langchain/core/language_models/base";
import { AIMessage } from "@langchain/core/messages";

const generateSystemTemplate = (instructions: string) => {
  return [
    instructions,
    "Generate a message based on the context that the user will provide. This message must be human-readable without any complex terms.",
    "Your message will be sent to a chat, so make sure it is clear and concise.",
    "Speak in first person, since the context that you will receive will be related to your actions and thoughts.",
  ].join("\n");
};

const generateMessage = async (
  llm: LanguageModelLike,
  instructions: string,
  context: string
): Promise<string> => {
  const result: AIMessage | string = await llm.invoke([
    {
      role: "system",
      content: generateSystemTemplate(instructions),
    },
    {
      role: "user",
      content: context,
    },
  ]);
  return typeof result === "string" ? result : result.text;
};

export type XMTPCallbackHandlerOptions = {
  onChainStart?: boolean;
  onChainEnd?: boolean;
  onChainError?: boolean;
  onLLMStart?: boolean;
  onLLMEnd?: boolean;
  onLLMError?: boolean;
  onToolStart?: boolean;
  onToolEnd?: boolean;
  onToolError?: boolean;
  onRetrieverStart?: boolean;
  onRetrieverEnd?: boolean;
  onRetrieverError?: boolean;
  onAgentAction?: boolean;
};

export class XMTPCallbackHandler extends BaseTracer {
  name = "xmtp_callback_handler" as const;
  xmtpHandler: HandlerContext;
  llm: LanguageModelLike;
  instructions: string;
  options: XMTPCallbackHandlerOptions = {
    onChainStart: false,
    onChainEnd: false,
    onChainError: false,
    onLLMStart: false,
    onLLMEnd: false,
    onLLMError: false,
    onToolStart: false,
    onToolEnd: false,
    onToolError: false,
    onRetrieverStart: false,
    onRetrieverEnd: false,
    onRetrieverError: false,
    onAgentAction: false,
  };

  protected persistRun(run: Run): Promise<void> {
    return Promise.resolve();
  }

  constructor(
    xmtpHandler: HandlerContext,
    llm: LanguageModelLike,
    instructions: string | undefined,
    options?: XMTPCallbackHandlerOptions
  ) {
    super();
    this.xmtpHandler = xmtpHandler;
    this.llm = llm;
    this.instructions = instructions || "You are a web3 helpful assistant";
    this.options = options || this.options;
  }

  /**
   * Method used to get all the parent runs of a given run.
   * @param run The run whose parents are to be retrieved.
   * @returns An array of parent runs.
   */
  getParents(run: Run) {
    const parents: Run[] = [];
    let currentRun = run;
    while (currentRun.parent_run_id) {
      const parent = this.runMap.get(currentRun.parent_run_id);
      if (parent) {
        parents.push(parent);
        currentRun = parent;
      } else {
        break;
      }
    }
    return parents;
  }

  /**
   * Method used to get a string representation of the run's lineage, which
   * is used in logging.
   * @param run The run whose lineage is to be retrieved.
   * @returns A string representation of the run's lineage.
   */
  getBreadcrumbs(run: Run) {
    const parents = this.getParents(run).reverse();
    const string = [...parents, run]
      .map((parent, i, arr) => {
        const name = `${parent.execution_order}:${parent.run_type}:${parent.name}`;
        return name;
      })
      .join(" > ");
    return string;
  }

  // logging methods

  /**
   * Method used to log the start of a chain run.
   * @param run The chain run that has started.
   * @returns void
   */
  async onChainStart(run: Run) {
    if (!this.options.onChainStart) return;
    const crumbs = this.getBreadcrumbs(run);
    const message = await generateMessage(
      this.llm,
      this.instructions,
      `You are entering the chain of thoughts with this input: ${tryJsonStringify(
        run.inputs,
        "[inputs]"
      )}.`
    );
    await this.xmtpHandler.send(message);
  }

  /**
   * Method used to log the end of a chain run.
   * @param run The chain run that has ended.
   * @returns void
   */
  async onChainEnd(run: Run) {
    if (!this.options.onChainEnd) return;
    const crumbs = this.getBreadcrumbs(run);
    const message = await generateMessage(
      this.llm,
      this.instructions,
      `You are exiting the chain of thoughts with this output: ${tryJsonStringify(
        run.outputs,
        "[outputs]"
      )}.`
    );
    await this.xmtpHandler.send(message);
  }

  /**
   * Method used to log any errors of a chain run.
   * @param run The chain run that has errored.
   * @returns void
   */
  async onChainError(run: Run) {
    if (!this.options.onChainError) return;
    const crumbs = this.getBreadcrumbs(run);
    const message = await generateMessage(
      this.llm,
      this.instructions,
      `Chain run errored with error: ${tryJsonStringify(run.error, "[error]")}.`
    );
    await this.xmtpHandler.send(message);
  }

  /**
   * Method used to log the start of an LLM run.
   * @param run The LLM run that has started.
   * @returns void
   */
  async onLLMStart(run: Run) {
    if (!this.options.onLLMStart) return;
    const crumbs = this.getBreadcrumbs(run);
    const inputs =
      "prompts" in run.inputs
        ? { prompts: (run.inputs.prompts as string[]).map((p) => p.trim()) }
        : run.inputs;
    const message = await generateMessage(
      this.llm,
      this.instructions,
      `You are entering the LLM run with this input: ${tryJsonStringify(
        inputs,
        "[inputs]"
      )}.`
    );
    await this.xmtpHandler.send(message);
  }

  /**
   * Method used to log the end of an LLM run.
   * @param run The LLM run that has ended.
   * @returns void
   */
  async onLLMEnd(run: Run) {
    if (!this.options.onLLMEnd) return;
    const crumbs = this.getBreadcrumbs(run);
    const message = await generateMessage(
      this.llm,
      this.instructions,
      `You are exiting the LLM run with this output: ${tryJsonStringify(
        run.outputs,
        "[outputs]"
      )}.`
    );
    await this.xmtpHandler.send(message);
  }

  /**
   * Method used to log any errors of an LLM run.
   * @param run The LLM run that has errored.
   * @returns void
   */
  async onLLMError(run: Run) {
    if (!this.options.onLLMError) return;
    const crumbs = this.getBreadcrumbs(run);
    const message = await generateMessage(
      this.llm,
      this.instructions,
      `LLM run errored with error: ${tryJsonStringify(run.error, "[error]")}.`
    );
    await this.xmtpHandler.send(message);
  }

  /**
   * Method used to log the start of a tool run.
   * @param run The tool run that has started.
   * @returns void
   */
  async onToolStart(run: Run) {
    if (!this.options.onToolStart) return;
    const crumbs = this.getBreadcrumbs(run);
    const message = await generateMessage(
      this.llm,
      this.instructions,
      `You are entering the Tool run with this input: ${tryJsonStringify(
        run.inputs,
        "[inputs]"
      )}.`
    );
    await this.xmtpHandler.send(message);
  }

  /**
   * Method used to log the end of a tool run.
   * @param run The tool run that has ended.
   * @returns void
   */
  async onToolEnd(run: Run) {
    if (!this.options.onToolEnd) return;
    const crumbs = this.getBreadcrumbs(run);
    const message = await generateMessage(
      this.llm,
      this.instructions,
      `You are exiting the Tool run with this output: "${formatKVMapItem(
        run.outputs?.output
      )}".`
    );
    await this.xmtpHandler.send(message);
  }

  /**
   * Method used to log any errors of a tool run.
   * @param run The tool run that has errored.
   * @returns void
   */
  async onToolError(run: Run) {
    if (!this.options.onToolError) return;
    const crumbs = this.getBreadcrumbs(run);
    const message = await generateMessage(
      this.llm,
      this.instructions,
      `Tool run errored with error: ${tryJsonStringify(run.error, "[error]")}.`
    );
    await this.xmtpHandler.send(message);
  }

  /**
   * Method used to log the start of a retriever run.
   * @param run The retriever run that has started.
   * @returns void
   */
  async onRetrieverStart(run: Run) {
    if (!this.options.onRetrieverStart) return;
    const crumbs = this.getBreadcrumbs(run);
    const message = await generateMessage(
      this.llm,
      this.instructions,
      `You are entering the Retriever run with this input: ${tryJsonStringify(
        run.inputs,
        "[inputs]"
      )}.`
    );
    await this.xmtpHandler.send(message);
  }

  /**
   * Method used to log the end of a retriever run.
   * @param run The retriever run that has ended.
   * @returns void
   */
  async onRetrieverEnd(run: Run) {
    if (!this.options.onRetrieverEnd) return;
    const crumbs = this.getBreadcrumbs(run);
    const message = await generateMessage(
      this.llm,
      this.instructions,
      `You are exiting the Retriever run with this output: ${tryJsonStringify(
        run.outputs,
        "[outputs]"
      )}.`
    );
    await this.xmtpHandler.send(message);
  }

  /**
   * Method used to log any errors of a retriever run.
   * @param run The retriever run that has errored.
   * @returns void
   */
  async onRetrieverError(run: Run) {
    if (!this.options.onRetrieverError) return;
    const crumbs = this.getBreadcrumbs(run);
    const message = await generateMessage(
      this.llm,
      this.instructions,
      `Retriever run errored with error: ${tryJsonStringify(
        run.error,
        "[error]"
      )}.`
    );
    await this.xmtpHandler.send(message);
  }

  /**
   * Method used to log the action selected by the agent.
   * @param run The run in which the agent action occurred.
   * @returns void
   */
  async onAgentAction(run: Run) {
    if (!this.options.onAgentAction) return;
    const agentRun = run as AgentRun;
    const crumbs = this.getBreadcrumbs(run);
    const message = await generateMessage(
      this.llm,
      this.instructions,
      `Agent selected action: ${tryJsonStringify(
        agentRun.actions[agentRun.actions.length - 1],
        "[action]"
      )}.`
    );
    await this.xmtpHandler.send(message);
  }
}
