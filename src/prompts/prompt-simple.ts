export const simplePrompt = {
  name: 'simple_prompt',
  description: "A prompt without arguments",
  handler: async () => {
    return {
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text: "This is a simple prompt without arguments.",
          },
        },
      ],
    };
  },
};