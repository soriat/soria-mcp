import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { ToolInput } from "../types.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";

const LongRunningOperationSchema = z.object({
  duration: z
    .number()
    .default(10)
    .describe("Duration of the operation in seconds"),
  steps: z.number().default(5).describe("Number of steps in the operation"),
});

export const longRunningOperationTool = {
  name: "longRunningOperation",
  description: "Demonstrates a long running operation with progress updates",
  inputSchema: zodToJsonSchema(LongRunningOperationSchema) as ToolInput,
  handler: async (args: any, request: any, server: Server) => {
    const validatedArgs = LongRunningOperationSchema.parse(args);
    const { duration, steps } = validatedArgs;
    const stepDuration = duration / steps;
    const progressToken = request.params._meta?.progressToken;

    for (let i = 1; i < steps + 1; i++) {
      await new Promise((resolve) =>
        setTimeout(resolve, stepDuration * 1000)
      );

      if (progressToken !== undefined) {
        await server.notification({
          method: "notifications/progress",
          params: {
            progress: i,
            total: steps,
            progressToken,
          },
        });
      }
    }

    return {
      content: [
        {
          type: "text" as const,
          text: `Long running operation completed. Duration: ${duration} seconds, Steps: ${steps}.`,
        },
      ],
    };
  },
};