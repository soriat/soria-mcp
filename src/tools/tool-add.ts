import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

const AddSchema = z.object({
  a: z.number().describe("First number"),
  b: z.number().describe("Second number"),
});

export const addTool = {
  name: "add",
  description: "Adds two numbers",
  inputSchema: zodToJsonSchema(AddSchema),
  handler: async (args: any) => {
    const validatedArgs = AddSchema.parse(args);
    const sum = validatedArgs.a + validatedArgs.b;
    return {
      content: [
        {
          type: "text" as const,
          text: `The sum of ${validatedArgs.a} and ${validatedArgs.b} is ${sum}.`,
        },
      ],
    };
  },
};