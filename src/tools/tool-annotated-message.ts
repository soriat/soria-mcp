import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { MCP_TINY_IMAGE } from "../lib/shared.js";

const AnnotatedMessageSchema = z.object({
  messageType: z
    .enum(["error", "success", "debug"])
    .describe("Type of message to demonstrate different annotation patterns"),
  includeImage: z
    .boolean()
    .default(false)
    .describe("Whether to include an example image"),
});

export const annotatedMessageTool = {
  name: "annotatedMessage",
  description: "Demonstrates how annotations can be used to provide metadata about content",
  inputSchema: zodToJsonSchema(AnnotatedMessageSchema),
  handler: async (args: any) => {
    const { messageType, includeImage } = AnnotatedMessageSchema.parse(args);

    const content: any[] = [];

    // Main message with different priorities/audiences based on type
    if (messageType === "error") {
      content.push({
        type: "text" as const,
        text: "Error: Operation failed",
        annotations: {
          priority: 1.0, // Errors are highest priority
          audience: ["user", "assistant"], // Both need to know about errors
        },
      });
    } else if (messageType === "success") {
      content.push({
        type: "text" as const,
        text: "Operation completed successfully",
        annotations: {
          priority: 0.7, // Success messages are important but not critical
          audience: ["user"], // Success mainly for user consumption
        },
      });
    } else if (messageType === "debug") {
      content.push({
        type: "text" as const,
        text: "Debug: Cache hit ratio 0.95, latency 150ms",
        annotations: {
          priority: 0.3, // Debug info is low priority
          audience: ["assistant"], // Technical details for assistant
        },
      });
    }

    // Optional image with its own annotations
    if (includeImage) {
      content.push({
        type: "image" as const,
        data: MCP_TINY_IMAGE,
        mimeType: "image/png",
        annotations: {
          priority: 0.5,
          audience: ["user"], // Images primarily for user visualization
        },
      });
    }

    return { content };
  },
};