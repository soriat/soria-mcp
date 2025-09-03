import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { requestSampling } from "../lib/sampling.js";

const AdvancedSampleSchema = z.object({
  prompt: z.string().describe("The main prompt to send to the LLM"),
  systemPrompt: z
    .string()
    .default("You are a helpful and intelligent assistant.")
    .describe("System prompt to guide the LLM's behavior"),
  maxTokens: z
    .number()
    .default(200)
    .describe("Maximum number of tokens to generate"),
  useIntelligentModel: z
    .boolean()
    .default(true)
    .describe("Whether to prioritize intelligent models for complex tasks"),
  optimizeFor: z
    .enum(["intelligence", "speed", "cost", "balanced"])
    .default("balanced")
    .describe("What to optimize the model selection for"),
});

export const sampleWithContextTool = {
  name: "sampleAdvanced",
  description: "Sample from an LLM with advanced model selection optimization",
  inputSchema: zodToJsonSchema(AdvancedSampleSchema),
  handler: async (args: any, request: any, server: Server) => {
    const validatedArgs = AdvancedSampleSchema.parse(args);
    const {
      prompt,
      systemPrompt,
      maxTokens,
      useIntelligentModel,
      optimizeFor,
    } = validatedArgs;

    // Build model preferences based on optimization choice
    let modelPreferences;
    switch (optimizeFor) {
      case "intelligence":
        modelPreferences = {
          intelligencePriority: 0.9,
          speedPriority: 0.3,
          costPriority: 0.2,
          hints: [{ name: "claude-3" }, { name: "gpt-4" }],
        };
        break;
      case "speed":
        modelPreferences = {
          intelligencePriority: 0.4,
          speedPriority: 0.9,
          costPriority: 0.5,
          hints: [{ name: "claude-3-haiku" }, { name: "gpt-3.5" }],
        };
        break;
      case "cost":
        modelPreferences = {
          intelligencePriority: 0.3,
          speedPriority: 0.6,
          costPriority: 0.9,
          hints: [{ name: "claude-3-haiku" }],
        };
        break;
      default: // balanced
        modelPreferences = {
          intelligencePriority: 0.6,
          speedPriority: 0.6,
          costPriority: 0.6,
          hints: [{ name: "claude-3-sonnet" }],
        };
    }

    // Override with intelligent model preference if requested
    if (useIntelligentModel && optimizeFor !== "intelligence") {
      modelPreferences.intelligencePriority = Math.max(
        0.7,
        modelPreferences.intelligencePriority
      );
    }

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
        modelPreferences,
      },
      server
    );

    return {
      content: [
        {
          type: "text" as const,
          text: `Advanced Sampling Result:

Optimization: ${optimizeFor}
Intelligent Model Priority: ${useIntelligentModel ? "Enabled" : "Disabled"}
Model: ${result.model || "unknown"}
Stop Reason: ${result.stopReason || "unknown"}

Response:
${result.content.text}`,
        },
      ],
    };
  },
};
