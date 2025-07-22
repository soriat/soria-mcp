import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export const greetingPrompt = {
  name: "greeting-prompt",
  config: {
    title: "User greeting",
    description: "Greet the user by their name",
    argsSchema: {},
  },
  handler: (server: McpServer) => async () => {
    const elicitationMessage = "Please input your name";
    const result = await server.server.elicitInput({
      message: elicitationMessage,
      requestedSchema: {
        type: "object",
        properties: { name: { type: "string" } },
      },
    });

    const greetingPrompt = result?.content?.name
      ? `Please greet me by my name:\n\n${result.content.name}`
      : `I am unnamed :p`;

    return {
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text: greetingPrompt,
          },
        },
      ],
    };
  },
};