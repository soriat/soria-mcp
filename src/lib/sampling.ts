import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CreateMessageRequest, CreateMessageResultSchema } from "@modelcontextprotocol/sdk/types.js";

// Shared helper method to request sampling from client
export const requestSampling = async (
  context: string,
  uri: string,
  maxTokens: number = 100,
  server: Server
) => {
  const request: CreateMessageRequest = {
    method: "sampling/createMessage",
    params: {
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Resource ${uri} context: ${context}`,
          },
        },
      ],
      systemPrompt: "You are a helpful test server.",
      maxTokens,
      temperature: 0.7,
      includeContext: "thisServer",
    },
  };

  return await server.request(request, CreateMessageResultSchema);
};