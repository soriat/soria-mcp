import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerTools(server: McpServer) {
  // Greeting tool
  server.registerTool(
    "greeting",
    {
      title: "Greeting Tool",
      description: "Greet the user",
      inputSchema: {},
    },
    async () => {
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
            type: "text",
            text: `Hello ${result.content?.name ?? "Stranger"}`,
          },
        ],
      };
    }
  );

  // Contact information tool
  server.registerTool(
    "contact-info",
    {
      title: "Contact Information Tool",
      description: "Collect user contact information",
      inputSchema: {},
    },
    async () => {
      const elicitationMessage = "Please provide your contact information";

      const result = await server.server.elicitInput({
        message: elicitationMessage,
        requestedSchema: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "Your full name",
            },
            email: {
              type: "string",
              format: "email",
              description: "Your email address",
            },
            age: {
              type: "number",
              minimum: 18,
              description: "Your age",
            },
          },
          required: ["name", "email"],
        },
      });

      console.log(
        `Contact Info Elicitation Result: ${JSON.stringify(result)}`
      );

      const name = result.content?.name ?? "Unknown";
      const email = result.content?.email ?? "No email provided";
      const age = result.content?.age ? `, age ${result.content.age}` : "";

      return {
        content: [
          {
            type: "text",
            text: `Contact information received: ${name} (${email}${age})`,
          },
        ],
      };
    }
  );
}