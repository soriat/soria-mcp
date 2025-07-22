import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export const greetingResource = {
  name: "greeting",
  uri: "config://user",
  config: {
    title: "User Greeting",
    description: "Greet the user",
    mimeType: "text/plain",
  },
  handler: (server: McpServer) => async (uri: any) => {
    const elicitationMessage = "Please input your name";

    const result = await server.server.elicitInput({
      message: elicitationMessage,
      requestedSchema: {
        type: "object",
        properties: { name: { type: "string" } },
      },
    });

    console.log(`Elicitation Result: ${JSON.stringify(result)}`);
    const name = result.content?.name ?? "Stranger";

    return {
      contents: [
        {
          uri: uri.href,
          text: `Hello there, ${name}`,
        },
      ],
    };
  },
};