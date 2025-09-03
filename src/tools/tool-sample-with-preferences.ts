import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { requestSampling, ModelPreferences } from "../lib/sampling.js";

const ModelHintSchema = z.object({
  name: z
    .string()
    .describe("Model name hint (e.g., 'claude-3-sonnet', 'gpt-4')"),
});

const ModelPreferencesSchema = z.object({
  hints: z
    .array(ModelHintSchema)
    .optional()
    .describe("Ordered list of preferred model hints"),
  costPriority: z
    .number()
    .min(0)
    .max(1)
    .optional()
    .describe("Priority for cost optimization (0-1, higher = prefer cheaper)"),
  speedPriority: z
    .number()
    .min(0)
    .max(1)
    .optional()
    .describe("Priority for speed optimization (0-1, higher = prefer faster)"),
  intelligencePriority: z
    .number()
    .min(0)
    .max(1)
    .optional()
    .describe("Priority for intelligence (0-1, higher = prefer more capable)"),
});

const SampleWithPreferencesSchema = z.object({
  prompt: z.string().describe("The prompt to send to the LLM"),
  systemPrompt: z
    .string()
    .optional()
    .describe("System prompt to guide the LLM's behavior"),
  maxTokens: z
    .number()
    .default(100)
    .describe("Maximum number of tokens to generate"),
  modelPreferences: ModelPreferencesSchema.optional().describe(
    "Model selection preferences"
  ),
});

export const sampleWithPreferencesTool = {
  name: "sampleWithPreferences",
  description: "Sample from an LLM with detailed model preferences",
  inputSchema: zodToJsonSchema(SampleWithPreferencesSchema),
  handler: async (args: any, request: any, server: Server) => {
    const validatedArgs = SampleWithPreferencesSchema.parse(args);
    const { prompt, systemPrompt, maxTokens, modelPreferences } = validatedArgs;

    const result = await requestSampling(
      {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: prompt,
            },
          },
        ],
        systemPrompt,
        maxTokens,
        modelPreferences: modelPreferences as ModelPreferences,
      },
      server
    );

    return {
      content: [
        {
          type: "text" as const,
          text: `Model used: ${result.model || "unknown"}\nStop reason: ${
            result.stopReason || "unknown"
          }\n\nResponse: ${result.content.text}`,
        },
      ],
    };
  },
};
