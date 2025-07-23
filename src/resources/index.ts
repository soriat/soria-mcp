import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  ListResourcesRequestSchema,
  ListResourceTemplatesRequestSchema,
  ReadResourceRequestSchema,
  SubscribeRequestSchema,
  UnsubscribeRequestSchema,
  CreateMessageRequest,
  CreateMessageResultSchema
} from "@modelcontextprotocol/sdk/types.js";
import { PAGE_SIZE, getResourceTemplates as getTemplates, readStaticResource } from "./resource-static.js";
import { generateAllResources } from "../lib/resources.js";
import { requestSampling } from "../lib/sampling.js";

export const getAllResources = generateAllResources;
export const getPageSize = () => PAGE_SIZE;
export const getResourceTemplates = getTemplates;
export const readResource = readStaticResource;

// Setup function to handle all resource-related request handlers
export const setupResources = (server: Server, subscriptions: Set<string>) => {
  const ALL_RESOURCES = getAllResources();
  const PAGE_SIZE = getPageSize();

  // Handle listing resources with pagination
  server.setRequestHandler(ListResourcesRequestSchema, async (request) => {
    const cursor = request.params?.cursor;
    let startIndex = 0;

    if (cursor) {
      const decodedCursor = parseInt(atob(cursor), 10);
      if (!isNaN(decodedCursor)) {
        startIndex = decodedCursor;
      }
    }

    const endIndex = Math.min(startIndex + PAGE_SIZE, ALL_RESOURCES.length);
    const resources = ALL_RESOURCES.slice(startIndex, endIndex);

    let nextCursor: string | undefined;
    if (endIndex < ALL_RESOURCES.length) {
      nextCursor = btoa(endIndex.toString());
    }

    return {
      resources,
      nextCursor,
    };
  });

  // Handle listing resource templates
  server.setRequestHandler(ListResourceTemplatesRequestSchema, async () => {
    return {
      resourceTemplates: getResourceTemplates(),
    };
  });

  // Handle reading individual resources
  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const uri = request.params.uri;
    const resource = readResource(uri);

    if (resource) {
      return {
        contents: [resource],
      };
    }

    throw new Error(`Unknown resource: ${uri}`);
  });

  // Handle resource subscriptions
  server.setRequestHandler(SubscribeRequestSchema, async (request) => {
    const { uri } = request.params;
    subscriptions.add(uri);

    // Request sampling from client when someone subscribes
    await requestSampling("A new subscription was started", uri, 100, server);
    return {};
  });

  // Handle resource unsubscriptions
  server.setRequestHandler(UnsubscribeRequestSchema, async (request) => {
    subscriptions.delete(request.params.uri);
    return {};
  });
};