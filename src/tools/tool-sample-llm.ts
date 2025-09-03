import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { requestTextSampling } from "../lib/sampling.js";

const SampleLLMSchema = z.object({
  prompt: z.string().describe("The prompt to send to the LLM"),
  maxTokens: z
    .number()
    .default(100)
    .describe("Maximum number of tokens to generate"),
  systemPrompt: z
    .string()
    .optional()
    .describe("System prompt to guide the LLM's behavior"),
});

export const sampleLlmTool = {
  name: "sampleLLM",
  description: "Samples from an LLM using MCP's sampling feature",
  inputSchema: zodToJsonSchema(SampleLLMSchema),
  handler: async (args: any, request: any, server: Server) => {
    const validatedArgs = SampleLLMSchema.parse(args);
    const { prompt, maxTokens, systemPrompt } = validatedArgs;

    const result = await requestTextSampling(
      prompt,
      systemPrompt,
      maxTokens,
      server,
      undefined // modelPreferences
    );
    return {
      content: [
        {
          type: "text" as const,
          text: `LLM sampling result: ${result.content.text}`,
        },
      ],
    };
  },
};
