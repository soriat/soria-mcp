import { MCP_TINY_IMAGE } from "../shared.js";

export const complexPrompt = {
  name: 'complex_prompt',
  description: "A prompt with arguments",
  arguments: [
    {
      name: "temperature",
      description: "Temperature setting",
      required: true,
    },
    {
      name: "style",
      description: "Output style",
      required: false,
    },
  ],
  handler: async (args?: any) => {
    return {
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text: `This is a complex prompt with arguments: temperature=${args?.temperature}, style=${args?.style}`,
          },
        },
        {
          role: "assistant" as const,
          content: {
            type: "text" as const,
            text: "I understand. You've provided a complex prompt with temperature and style arguments. How would you like me to proceed?",
          },
        },
        {
          role: "user" as const,
          content: {
            type: "image" as const,
            data: MCP_TINY_IMAGE,
            mimeType: "image/png",
          },
        },
      ],
    };
  },
};