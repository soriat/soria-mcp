import { generateAllResources } from "../lib/resources.js";

export const resourcePrompt = {
  name: 'resource_prompt',
  description: "A prompt that includes an embedded resource reference",
  arguments: [
    {
      name: "resourceId",
      description: "Resource ID to include (1-100)",
      required: true,
    },
  ],
  handler: async (args?: any) => {
    const resourceId = parseInt(args?.resourceId as string, 10);
    if (isNaN(resourceId) || resourceId < 1 || resourceId > 100) {
      throw new Error(
        `Invalid resourceId: ${args?.resourceId}. Must be a number between 1 and 100.`
      );
    }

    const ALL_RESOURCES = generateAllResources();
    const resourceIndex = resourceId - 1;
    const resource = ALL_RESOURCES[resourceIndex];

    return {
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text: `This prompt includes Resource ${resourceId}. Please analyze the following resource:`,
          },
        },
        {
          role: "user" as const,
          content: {
            type: "resource" as const,
            resource: resource,
          },
        },
      ],
    };
  },
};