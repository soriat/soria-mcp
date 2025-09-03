import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { requestSampling, MessageContent, Message } from "../lib/sampling.js";

const TextContentSchema = z.object({
  type: z.literal("text"),
  text: z.string().describe("Text content"),
});

const ImageContentSchema = z.object({
  type: z.literal("image"),
  data: z.string().describe("Base64-encoded image data"),
  mimeType: z
    .string()
    .describe("Image MIME type (e.g., 'image/jpeg', 'image/png')"),
});

const AudioContentSchema = z.object({
  type: z.literal("audio"),
  data: z.string().describe("Base64-encoded audio data"),
  mimeType: z
    .string()
    .describe("Audio MIME type (e.g., 'audio/wav', 'audio/mp3')"),
});

const MessageContentSchema = z.discriminatedUnion("type", [
  TextContentSchema,
  ImageContentSchema,
  AudioContentSchema,
]);

const MessageSchema = z.object({
  role: z.enum(["user", "assistant"]).describe("Message role"),
  content: MessageContentSchema.describe("Message content"),
});

const MultimodalSampleSchema = z.object({
  messages: z
    .array(MessageSchema)
    .min(1)
    .describe("Array of messages with various content types"),
  systemPrompt: z
    .string()
    .optional()
    .describe("System prompt to guide the LLM's behavior"),
  maxTokens: z
    .number()
    .default(100)
    .describe("Maximum number of tokens to generate"),
});

export const sampleMultimodalTool = {
  name: "sampleMultimodal",
  description:
    "Sample from an LLM with multimodal content (text, images, audio)",
  inputSchema: zodToJsonSchema(MultimodalSampleSchema),
  handler: async (args: any, request: any, server: Server) => {
    const validatedArgs = MultimodalSampleSchema.parse(args);
    const { messages, systemPrompt, maxTokens } = validatedArgs;

    // Convert validated messages to our internal format
    const typedMessages: Message[] = messages.map((msg: any) => ({
      role: msg.role,
      content: msg.content as MessageContent,
    }));

    const result = await requestSampling(
      {
        messages: typedMessages,
        systemPrompt,
        maxTokens,
      },
      server
    );

    // Provide detailed response information
    const contentSummary = messages
      .map((msg: any, index: number) => {
        const contentType = msg.content.type;
        if (contentType === "text") {
          return `Message ${index + 1} (${
            msg.role
          }): Text - "${msg.content.text.substring(0, 50)}${
            msg.content.text.length > 50 ? "..." : ""
          }"`;
        } else if (contentType === "image") {
          return `Message ${index + 1} (${msg.role}): Image - ${
            msg.content.mimeType
          }`;
        } else if (contentType === "audio") {
          return `Message ${index + 1} (${msg.role}): Audio - ${
            msg.content.mimeType
          }`;
        }
        return `Message ${index + 1} (${msg.role}): ${contentType}`;
      })
      .join("\n");

    return {
      content: [
        {
          type: "text" as const,
          text: `Multimodal Sampling Result:
Input Summary:
${contentSummary}

Model: ${result.model || "unknown"}
Stop Reason: ${result.stopReason || "unknown"}

Response: ${result.content.text}`,
        },
      ],
    };
  },
};
