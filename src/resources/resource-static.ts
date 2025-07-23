import { Resource } from "@modelcontextprotocol/sdk/types.js";
import { generateAllResources } from "../lib/resources.js";

export const PAGE_SIZE = 10;

export const getResourceTemplates = () => {
  return [
    {
      uriTemplate: "test://static/resource/{id}",
      name: "Static Resource",
      description: "A static resource with a numeric ID",
    },
  ];
};

export const readStaticResource = (uri: string): Resource | null => {
  const ALL_RESOURCES = generateAllResources();

  if (uri.startsWith("test://static/resource/")) {
    const index = parseInt(uri.split("/").pop() ?? "", 10) - 1;
    if (index >= 0 && index < ALL_RESOURCES.length) {
      return ALL_RESOURCES[index];
    }
  }

  return null;
};