import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { ToolInput, MCP_TINY_IMAGE } from "../types.js";

const GetTinyImageSchema = z.object({});

export const getTinyImageTool = {
  name: "getTinyImage",
  description: "Returns the MCP_TINY_IMAGE",
  inputSchema: zodToJsonSchema(GetTinyImageSchema) as ToolInput,
  handler: async (args: any) => {
    GetTinyImageSchema.parse(args);
    return {
      content: [
        {
          type: "text" as const,
          text: "This is a tiny image:",
        },
        {
          type: "image" as const,
          data: MCP_TINY_IMAGE,
          mimeType: "image/png",
        },
        {
          type: "text" as const,
          text: "The image above is the MCP tiny image.",
        },
      ],
    };
  },
};