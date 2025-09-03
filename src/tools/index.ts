import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  Tool,
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { echoTool } from "./tool-echo.js";
import { addTool } from "./tool-add.js";
import { longRunningOperationTool } from "./tool-long-running-operation.js";
import { printEnvTool } from "./tool-print-env.js";
import { sampleLlmTool } from "./tool-sample-llm.js";
import { getTinyImageTool } from "./tool-get-tiny-image.js";
import { annotatedMessageTool } from "./tool-annotated-message.js";
import { getResourceReferenceTool } from "./tool-get-resource-reference.js";
import { elicitationTool } from "./tool-elicitation.js";
import { getResourceLinksTool } from "./tool-get-resource-links.js";
import { sampleWithPreferencesTool } from "./tool-sample-with-preferences.js";
import { sampleMultimodalTool } from "./tool-sample-multimodal.js";
import { sampleConversationTool } from "./tool-sample-conversation.js";
import { sampleWithContextTool } from "./tool-sample-with-context.js";

const allTools = [
  echoTool,
  addTool,
  longRunningOperationTool,
  printEnvTool,
  sampleLlmTool,
  sampleWithPreferencesTool,
  sampleMultimodalTool,
  sampleConversationTool,
  sampleWithContextTool,
  getTinyImageTool,
  annotatedMessageTool,
  getResourceReferenceTool,
  elicitationTool,
  getResourceLinksTool,
];

export const getTools = (): Tool[] => {
  return allTools.map((tool) => ({
    name: tool.name,
    description: tool.description,
    inputSchema: tool.inputSchema as any,
  }));
};

export const getToolHandler = (name: string) => {
  const tool = allTools.find((t) => t.name === name);
  return tool?.handler;
};

// Setup function to handle all tool-related request handlers
export const setupTools = (server: Server) => {
  // Handle listing all available tools
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools: getTools() };
  });

  // Handle tool execution
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    const handler = getToolHandler(name);

    if (handler) {
      return await handler(args, request, server);
    }

    throw new Error(`Unknown tool: ${name}`);
  });
};
