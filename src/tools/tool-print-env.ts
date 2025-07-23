import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

const PrintEnvSchema = z.object({});

export const printEnvTool = {
  name: "printEnv",
  description: "Prints all environment variables, helpful for debugging MCP server configuration",
  inputSchema: zodToJsonSchema(PrintEnvSchema),
  handler: async (args: any) => {
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(process.env, null, 2),
        },
      ],
    };
  },
};