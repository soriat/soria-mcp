import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { greetingTool } from "./greeting.js";
import { contactInfoTool } from "./contact-info.js";

const tools = [greetingTool, contactInfoTool];

export function registerTools(server: McpServer) {
  tools.forEach((tool) => {
    server.registerTool(tool.name, tool.config, tool.handler(server));
  });
}