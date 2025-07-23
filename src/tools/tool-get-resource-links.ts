import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { ToolInput } from "../types.js";
import { generateAllResources } from "../lib/resources.js";

const GetResourceLinksSchema = z.object({
  count: z
    .number()
    .min(1)
    .max(10)
    .default(3)
    .describe("Number of resource links to return (1-10)"),
});

export const getResourceLinksTool = {
  name: "getResourceLinks",
  description: "Returns multiple resource links that reference different types of resources",
  inputSchema: zodToJsonSchema(GetResourceLinksSchema) as ToolInput,
  handler: async (args: any) => {
    const { count } = GetResourceLinksSchema.parse(args);
    const content: any[] = [];

    // Add intro text
    content.push({
      type: "text" as const,
      text: `Here are ${count} resource links to resources available in this server (see full output in tool response if your client does not support resource_link yet):`,
    });

    // Return resource links to actual resources from ALL_RESOURCES
    const ALL_RESOURCES = generateAllResources();
    const actualCount = Math.min(count, ALL_RESOURCES.length);
    for (let i = 0; i < actualCount; i++) {
      const resource = ALL_RESOURCES[i];
      content.push({
        type: "resource_link" as const,
        uri: resource.uri,
        name: resource.name,
        description: `Resource ${i + 1}: ${
          resource.mimeType === "text/plain"
            ? "plaintext resource"
            : "binary blob resource"
        }`,
        mimeType: resource.mimeType,
      });
    }

    return { content };
  },
};