import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { requestSampling, Message } from "../lib/sampling.js";

const ConversationMessageSchema = z.object({
  role: z.enum(["user", "assistant"]).describe("Message role in conversation"),
  text: z.string().describe("Message text content"),
});

const ConversationSampleSchema = z.object({
  conversation: z
    .array(ConversationMessageSchema)
    .min(1)
    .describe("Conversation history (alternating user/assistant messages)"),
  systemPrompt: z
    .string()
    .default("You are a helpful assistant engaged in a conversation.")
    .describe("System prompt to guide the conversation style"),
  maxTokens: z
    .number()
    .default(150)
    .describe("Maximum number of tokens to generate"),
  modelHint: z
    .string()
    .optional()
    .describe(
      "Preferred model hint for conversation (e.g., 'claude-3-sonnet')"
    ),
});

export const sampleConversationTool = {
  name: "sampleConversation",
  description:
    "Continue a conversation by sampling the next assistant response",
  inputSchema: zodToJsonSchema(ConversationSampleSchema),
  handler: async (args: any, request: any, server: Server) => {
    const validatedArgs = ConversationSampleSchema.parse(args);
    const { conversation, systemPrompt, maxTokens, modelHint } = validatedArgs;

    // Convert conversation to messages format
    const messages: Message[] = conversation.map((msg: any) => ({
      role: msg.role,
      content: {
        type: "text",
        text: msg.text,
      },
    }));

    // Build model preferences if hint provided
    const modelPreferences = modelHint
      ? {
          hints: [{ name: modelHint }],
          intelligencePriority: 0.8, // Prefer intelligent models for conversation
          speedPriority: 0.6, // Moderate speed priority
          costPriority: 0.3, // Cost is less important for conversation quality
        }
      : undefined;

    const result = await requestSampling(
      {
        messages,
        systemPrompt,
        maxTokens,
        modelPreferences,
      },
      server
    );

    // Format the conversation display
    const conversationDisplay = conversation
      .map(
        (msg: any, index: number) => `${msg.role.toUpperCase()}: ${msg.text}`
      )
      .join("\n");

    return {
      content: [
        {
          type: "text" as const,
          text: `Conversation Continuation:

Previous Messages:
${conversationDisplay}

ASSISTANT: ${result.content.text}

---
Model: ${result.model || "unknown"}
Stop Reason: ${result.stopReason || "unknown"}`,
        },
      ],
    };
  },
};
