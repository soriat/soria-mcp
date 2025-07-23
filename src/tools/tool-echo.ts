import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

const EchoSchema = z.object({
  message: z.string().describe("Message to echo"),
});

export const echoTool = {
  name: "echo",
  description: "Echoes back the input!",
  inputSchema: zodToJsonSchema(EchoSchema),
  handler: async (args: any) => {
    const validatedArgs = EchoSchema.parse(args);
    return {
      content: [{ type: "text" as const, text: `Echo: ${validatedArgs.message}` }],
    };
  },
};