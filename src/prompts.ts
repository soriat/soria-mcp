import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerPrompts(server: McpServer) {
  // Greeting prompt
  server.registerPrompt(
    "greeting-prompt",
    {
      title: "User greeting",
      description: "Greet the user by their name",
      argsSchema: {},
    },
    async () => {
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
            role: "user",
            content: {
              type: "text",
              text: greetingPrompt,
            },
          },
        ],
      };
    }
  );
}