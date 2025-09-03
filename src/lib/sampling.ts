import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CreateMessageRequest,
  CreateMessageResultSchema,
} from "@modelcontextprotocol/sdk/types.js";

// Message content types based on MCP specification
export interface TextContent {
  [x: string]: unknown;
  type: "text";
  text: string;
}

export interface ImageContent {
  [x: string]: unknown;
  type: "image";
  data: string; // base64-encoded image data
  mimeType: string;
}

export interface AudioContent {
  [x: string]: unknown;
  type: "audio";
  data: string; // base64-encoded audio data
  mimeType: string;
}

export type MessageContent = TextContent | ImageContent | AudioContent;

export interface Message {
  [x: string]: unknown;
  role: "user" | "assistant";
  content: MessageContent;
}

export interface ModelHint {
  [x: string]: unknown;
  name?: string;
}

export interface ModelPreferences {
  [x: string]: unknown;
  hints?: ModelHint[];
  costPriority?: number; // 0-1, higher values prefer cheaper models
  speedPriority?: number; // 0-1, higher values prefer faster models
  intelligencePriority?: number; // 0-1, higher values prefer more capable models
}

export interface SamplingOptions {
  messages: Message[];
  modelPreferences?: ModelPreferences;
  systemPrompt?: string;
  maxTokens?: number;
}

// Enhanced sampling helper with full specification support
export const requestSampling = async (
  options: SamplingOptions,
  server: Server
) => {
  const request: CreateMessageRequest = {
    method: "sampling/createMessage",
    params: {
      messages: options.messages,
      modelPreferences: options.modelPreferences,
      systemPrompt: options.systemPrompt,
      maxTokens: options.maxTokens ?? 100,
    },
  };

  return await server.request(request, CreateMessageResultSchema);
};

// Backward compatibility helper for simple text sampling
export const requestTextSampling = async (
  text: string,
  systemPrompt: string = "You are a helpful assistant.",
  maxTokens: number = 100,
  server: Server,
  modelPreferences?: ModelPreferences
) => {
  return await requestSampling(
    {
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text,
          },
        },
      ],
      systemPrompt,
      maxTokens,
      modelPreferences,
    },
    server
  );
};
