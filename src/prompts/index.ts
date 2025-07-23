import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { ListPromptsRequestSchema, GetPromptRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { simplePrompt } from "./prompt-simple.js";
import { complexPrompt } from "./prompt-complex.js";
import { resourcePrompt } from "./prompt-resource.js";

const allPrompts = [simplePrompt, complexPrompt, resourcePrompt];

export const getPrompts = () => {
  return allPrompts.map((prompt) => ({
    name: prompt.name,
    description: prompt.description,
    arguments: 'arguments' in prompt ? prompt.arguments : undefined,
  }));
};

export const getPromptHandler = (name: string) => {
  const prompt = allPrompts.find((p) => p.name === name);
  return prompt?.handler;
};

// Setup function to handle all prompt-related request handlers
export const setupPrompts = (server: Server) => {
  // Handle listing all available prompts
  server.setRequestHandler(ListPromptsRequestSchema, async () => {
    return {
      prompts: getPrompts(),
    };
  });

  // Handle prompt execution
  server.setRequestHandler(GetPromptRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    const handler = getPromptHandler(name);

    if (handler) {
      return await handler(args);
    }

    throw new Error(`Unknown prompt: ${name}`);
  });
};



export const handlePromptCompletion = ({ argument }: any) => {
  const completions: Record<string, string[]> = {
    style: ["casual", "formal", "technical", "friendly"],
    temperature: ["0", "0.5", "0.7", "1.0"],
  };

  const values =
    completions[argument.name]?.filter((v) => v.startsWith(argument.value)) || [];

  return { completion: { values, hasMore: false, total: values.length } };
};