import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { requestElicitation } from "../lib/elicitation.js";

const ElicitationSchema = z.object({});

export const elicitationTool = {
  name: "startElicitation",
  description: "Demonstrates the Elicitation feature by asking the user to provide information about their favorite color, number, and pets.",
  inputSchema: zodToJsonSchema(ElicitationSchema),
  handler: async (args: any, request: any, server: Server) => {
    ElicitationSchema.parse(args);

    const elicitationResult = await requestElicitation(
      'What are your favorite things?',
      {
        type: 'object',
        properties: {
          color: { type: 'string', description: 'Favorite color' },
          number: { type: 'integer', description: 'Favorite number', minimum: 1, maximum: 100 },
          pets: {
            type: 'string',
            enum: ['cats', 'dogs', 'birds', 'fish', 'reptiles'],
            description: 'Favorite pets'
          },
        }
      },
      server
    );

    // Handle different response actions
    const content: any[] = [];

    if (elicitationResult.action === 'accept' && elicitationResult.content) {
      content.push({
        type: "text" as const,
        text: `✅ User provided their favorite things!`,
      });

      // Only access elicitationResult.content when action is accept
      const { color, number, pets } = elicitationResult.content;
      content.push({
        type: "text" as const,
        text: `Their favorites are:\n- Color: ${color || 'not specified'}\n- Number: ${number || 'not specified'}\n- Pets: ${pets || 'not specified'}`,
      });
    } else if (elicitationResult.action === 'decline') {
      content.push({
        type: "text" as const,
        text: `❌ User declined to provide their favorite things.`,
      });
    } else if (elicitationResult.action === 'cancel') {
      content.push({
        type: "text" as const,
        text: `⚠️ User cancelled the elicitation dialog.`,
      });
    }

    // Include raw result for debugging
    content.push({
      type: "text" as const,
      text: `\nRaw result: ${JSON.stringify(elicitationResult, null, 2)}`,
    });

    return { content };
  },
};