import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { greetingPrompt } from "./greeting-prompt.js";

const prompts = [greetingPrompt];

export function registerPrompts(server: McpServer) {
  prompts.forEach((prompt) => {
    server.registerPrompt(prompt.name, prompt.config, prompt.handler(server));
  });
}