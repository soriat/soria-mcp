import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export const greetingTool = {
  name: "greeting",
  config: {
    title: "Greeting Tool",
    description: "Greet the user",
    inputSchema: {},
  },
  handler: (server: McpServer) => async () => {
    const elicitationMessage = "Please input your name";

    const result = await server.server.elicitInput({
      message: elicitationMessage,
      requestedSchema: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "The name of the user",
          },
        },
        required: ["name"],
      },
    });

    console.log(`Elicitation Result: ${JSON.stringify(result)}`);

    return {
      content: [
        {
          type: "text" as const,
          text: `Hello ${result.content?.name ?? "Stranger"}`,
        },
      ],
    };
  },
};