import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { ToolInput } from "../types.js";

const EchoSchema = z.object({
  message: z.string().describe("Message to echo"),
});

export const echoTool = {
  name: "echo",
  description: "Echoes back the input!",
  inputSchema: zodToJsonSchema(EchoSchema) as ToolInput,
  handler: async (args: any) => {
    const validatedArgs = EchoSchema.parse(args);
    return {
      content: [{ type: "text" as const, text: `Echo: ${validatedArgs.message}` }],
    };
  },
};