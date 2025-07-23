import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { generateAllResources } from "../lib/resources.js";

const GetResourceReferenceSchema = z.object({
  resourceId: z
    .number()
    .min(1)
    .max(100)
    .describe("ID of the resource to reference (1-100)"),
});

export const getResourceReferenceTool = {
  name: "getResourceReference",
  description: "Returns a resource reference that can be used by MCP clients",
  inputSchema: zodToJsonSchema(GetResourceReferenceSchema),
  handler: async (args: any) => {
    const validatedArgs = GetResourceReferenceSchema.parse(args);
    const resourceId = validatedArgs.resourceId;

    const ALL_RESOURCES = generateAllResources();
    const resourceIndex = resourceId - 1;
    if (resourceIndex < 0 || resourceIndex >= ALL_RESOURCES.length) {
      throw new Error(`Resource with ID ${resourceId} does not exist`);
    }

    const resource = ALL_RESOURCES[resourceIndex];

    return {
      content: [
        {
          type: "text" as const,
          text: `Returning resource reference for Resource ${resourceId}:`,
        },
        {
          type: "resource" as const,
          resource: resource,
        },
        {
          type: "text" as const,
          text: `You can access this resource using the URI: ${resource.uri}`,
        },
      ],
    };
  },
};