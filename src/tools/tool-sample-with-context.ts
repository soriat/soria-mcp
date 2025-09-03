import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { requestSampling } from "../lib/sampling.js";

const ContextSampleSchema = z.object({
  prompt: z.string().describe("The main prompt to send to the LLM"),
  contextLevel: z
    .enum(["none", "thisServer", "allServers"])
    .default("thisServer")
    .describe("Level of MCP context to include"),
  systemPrompt: z
    .string()
    .default("You are an assistant with access to MCP server context.")
    .describe("System prompt explaining context availability"),
  maxTokens: z
    .number()
    .default(200)
    .describe("Maximum number of tokens to generate"),
  explainContext: z
    .boolean()
    .default(false)
    .describe(
      "Whether to ask the LLM to explain what context it has access to"
    ),
});

export const sampleWithContextTool = {
  name: "sampleWithContext",
  description: "Sample from an LLM with different levels of MCP server context",
  inputSchema: zodToJsonSchema(ContextSampleSchema),
  handler: async (args: any, request: any, server: Server) => {
    const validatedArgs = ContextSampleSchema.parse(args);
    const { prompt, contextLevel, systemPrompt, maxTokens, explainContext } =
      validatedArgs;

    // Modify prompt if context explanation is requested
    let finalPrompt = prompt;
    if (explainContext) {
      finalPrompt = `${prompt}

Additionally, please explain what MCP server context and capabilities you have access to in this interaction.`;
    }

    // Set model preferences for context-aware tasks
    const modelPreferences = {
      intelligencePriority: 0.9, // High intelligence for context understanding
      speedPriority: 0.5,
      costPriority: 0.4,
      hints: [{ name: "claude" }], // Prefer Claude models for MCP context
    };

    const result = await requestSampling(
      {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: finalPrompt,
            },
          },
        ],
        systemPrompt,
        maxTokens,
        modelPreferences,
        includeContext: contextLevel,
      },
      server
    );

    return {
      content: [
        {
          type: "text" as const,
          text: `Context-Aware Sampling Result:

Context Level: ${contextLevel}
Model: ${result.model || "unknown"}
Stop Reason: ${result.stopReason || "unknown"}

Response:
${result.content.text}`,
        },
      ],
    };
  },
};
