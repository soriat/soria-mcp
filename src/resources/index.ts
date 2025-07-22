import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { greetingResource } from "./greeting.js";

const resources = [greetingResource];

export function registerResources(server: McpServer) {
  resources.forEach((resource) => {
    server.registerResource(
      resource.name,
      resource.uri,
      resource.config,
      resource.handler(server)
    );
  });
}