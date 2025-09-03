import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CompleteRequestSchema,
  LoggingLevel,
  SetLevelRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { setupTools } from "./tools/index.js";
import { setupPrompts, handlePromptCompletion } from "./prompts/index.js";
import { setupResources, handleResourceCompletion } from "./resources/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const instructions = readFileSync(
  join(__dirname, "../instructions.md"),
  "utf-8"
);

export const createServer = () => {
  const server = new Server(
    {
      name: "soria-everything",
      version: "1.0.0",
    },
    {
      capabilities: {
        prompts: {},
        resources: { subscribe: true },
        tools: {},
        logging: {},
        completions: {},
        elicitation: {},
        sampling: {},
      },
      instructions,
    }
  );

  let subscriptions: Set<string> = new Set();
  let subsUpdateInterval: NodeJS.Timeout | undefined;
  let stdErrUpdateInterval: NodeJS.Timeout | undefined;

  // Set up update interval for subscribed resources
  subsUpdateInterval = setInterval(() => {
    for (const uri of subscriptions) {
      server.notification({
        method: "notifications/resources/updated",
        params: { uri },
      });
    }
  }, 10000);

  let logLevel: LoggingLevel = "debug";
  let logsUpdateInterval: NodeJS.Timeout | undefined;
  const messages = [
    { level: "debug", data: "Debug-level message" },
    { level: "info", data: "Info-level message" },
    { level: "notice", data: "Notice-level message" },
    { level: "warning", data: "Warning-level message" },
    { level: "error", data: "Error-level message" },
    { level: "critical", data: "Critical-level message" },
    { level: "alert", data: "Alert level-message" },
    { level: "emergency", data: "Emergency-level message" },
  ];

  const isMessageIgnored = (level: LoggingLevel): boolean => {
    const currentLevel = messages.findIndex((msg) => logLevel === msg.level);
    const messageLevel = messages.findIndex((msg) => level === msg.level);
    return messageLevel < currentLevel;
  };

  // Set up update interval for random log messages
  logsUpdateInterval = setInterval(() => {
    let message = {
      method: "notifications/message",
      params: messages[Math.floor(Math.random() * messages.length)],
    };
    if (!isMessageIgnored(message.params.level as LoggingLevel))
      server.notification(message);
  }, 20000);

  // Set up update interval for stderr messages
  stdErrUpdateInterval = setInterval(() => {
    const shortTimestamp = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    server.notification({
      method: "notifications/stderr",
      params: { content: `${shortTimestamp}: A stderr message` },
    });
  }, 30000);

  // Setup all MCP capabilities
  setupTools(server);
  setupPrompts(server);
  setupResources(server, subscriptions);

  server.setRequestHandler(CompleteRequestSchema, async (request) => {
    const { ref } = request.params;

    if (ref.type === "ref/resource") {
      return handleResourceCompletion(request.params);
    }

    if (ref.type === "ref/prompt") {
      return handlePromptCompletion(request.params);
    }

    throw new Error(`Unknown reference type`);
  });

  server.setRequestHandler(SetLevelRequestSchema, async (request) => {
    const { level } = request.params;
    logLevel = level;

    // Demonstrate different log levels
    await server.notification({
      method: "notifications/message",
      params: {
        level: "debug",
        logger: "test-server",
        data: `Logging level set to: ${logLevel}`,
      },
    });

    return {};
  });

  const cleanup = async () => {
    if (subsUpdateInterval) clearInterval(subsUpdateInterval);
    if (logsUpdateInterval) clearInterval(logsUpdateInterval);
    if (stdErrUpdateInterval) clearInterval(stdErrUpdateInterval);
  };

  return { server, cleanup };
};
