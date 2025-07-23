import { Resource } from "@modelcontextprotocol/sdk/types.js";

// Shared function to generate all static resources (used across tools, prompts, and resources)
export const generateAllResources = (): Resource[] => {
  return Array.from({ length: 100 }, (_, i) => {
    const uri = `test://static/resource/${i + 1}`;
    if (i % 2 === 0) {
      return {
        uri,
        name: `Resource ${i + 1}`,
        mimeType: "text/plain",
        text: `Resource ${i + 1}: This is a plaintext resource`,
      };
    } else {
      const buffer = Buffer.from(`Resource ${i + 1}: This is a base64 blob`);
      return {
        uri,
        name: `Resource ${i + 1}`,
        mimeType: "application/octet-stream",
        blob: buffer.toString("base64"),
      };
    }
  });
};