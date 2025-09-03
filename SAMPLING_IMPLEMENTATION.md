# MCP Sampling Implementation

This document describes the comprehensive sampling implementation that follows the latest MCP sampling specification (draft protocol revision).

## Overview

The sampling implementation provides a standardized way for the MCP server to request LLM sampling ("completions" or "generations") from language models via clients. This allows the server to leverage AI capabilities while maintaining client control over model access, selection, and permissions.

## Key Features Implemented

### 1. Protocol Compliance

- ✅ **Sampling Capability Declaration**: Server declares `sampling: {}` capability during initialization
- ✅ **Standard Message Format**: Implements `sampling/createMessage` requests with proper JSON-RPC structure
- ✅ **Model Preferences**: Full support for cost, speed, and intelligence priorities with model hints
- ✅ **Multimodal Content**: Support for text, image, and audio content types

### 2. Enhanced Sampling Library (`src/lib/sampling.ts`)

The core sampling library provides:

```typescript
// Main sampling function with full specification support
export const requestSampling = async (
  options: SamplingOptions,
  server: Server
) => { ... }

// Backward compatibility helper for simple text sampling
export const requestTextSampling = async (
  text: string,
  systemPrompt: string,
  maxTokens: number,
  server: Server,
  modelPreferences?: ModelPreferences
) => { ... }
```

#### Type Definitions

- **MessageContent**: Union type supporting text, image, and audio content
- **ModelPreferences**: Cost, speed, and intelligence priorities with model hints
- **SamplingOptions**: Complete configuration for sampling requests

### 3. Comprehensive Tool Suite

#### Basic Sampling Tool (`tool-sample-llm.ts`)

- Simple text-based LLM sampling
- Configurable system prompts and token limits
- Backward compatible with existing implementations

#### Advanced Sampling with Preferences (`tool-sample-with-preferences.ts`)

- Full model preference configuration
- Cost, speed, and intelligence priority settings
- Model hints support (e.g., "claude-3-sonnet", "gpt-4")
- Context inclusion control

#### Multimodal Sampling (`tool-sample-multimodal.ts`)

- Support for text, image, and audio content in messages
- Multiple message conversation support
- Content type validation and processing
- Detailed response formatting with input summaries

#### Conversation Continuation (`tool-sample-conversation.ts`)

- Structured conversation history handling
- Alternating user/assistant message flows
- Optimized model preferences for conversation quality
- Formatted conversation display

#### Advanced Sampling with Optimization (`tool-sample-with-context.ts`)

- Model selection optimization strategies (intelligence, speed, cost, balanced)
- Intelligent model prioritization options
- Comprehensive model preference configuration
- Detailed response analysis with optimization metrics

## Model Preference System

The implementation includes a sophisticated model preference system that abstracts model selection:

### Capability Priorities (0-1 scale)

- **costPriority**: Higher values prefer cheaper models
- **speedPriority**: Higher values prefer faster models
- **intelligencePriority**: Higher values prefer more capable models

### Model Hints

- Flexible substring matching for model names
- Multiple hints processed in preference order
- Cross-provider model mapping support
- Examples: "claude-3-sonnet", "claude", "gpt-4"

### Example Usage

```json
{
  "hints": [{ "name": "claude-3-sonnet" }, { "name": "claude" }],
  "costPriority": 0.3,
  "speedPriority": 0.8,
  "intelligencePriority": 0.5
}
```

## Content Type Support

### Text Content

```typescript
{
  type: "text",
  text: "The message content"
}
```

### Image Content

```typescript
{
  type: "image",
  data: "base64-encoded-image-data",
  mimeType: "image/jpeg"
}
```

### Audio Content

```typescript
{
  type: "audio",
  data: "base64-encoded-audio-data",
  mimeType: "audio/wav"
}
```

## Security and Trust Considerations

The implementation follows MCP security guidelines:

- **Human-in-the-loop**: All sampling requests should be reviewed by users
- **Content Validation**: Proper type checking and validation of all inputs

- **Error Handling**: Graceful handling of sampling failures
- **Rate Limiting**: Support for client-side rate limiting

## Usage Examples

### Simple Text Sampling

```typescript
const result = await requestTextSampling(
  "What is the capital of France?",
  "You are a helpful assistant.",
  100,
  server
);
```

### Advanced Sampling with Preferences

```typescript
const result = await requestSampling(
  {
    messages: [
      {
        role: "user",
        content: { type: "text", text: "Explain quantum computing" },
      },
    ],
    modelPreferences: {
      hints: [{ name: "claude-3-sonnet" }],
      intelligencePriority: 0.9,
      speedPriority: 0.5,
      costPriority: 0.3,
    },
    maxTokens: 200,
  },
  server
);
```

### Multimodal Sampling

```typescript
const result = await requestSampling(
  {
    messages: [
      {
        role: "user",
        content: {
          type: "image",
          data: "base64-image-data",
          mimeType: "image/jpeg",
        },
      },
    ],
    systemPrompt: "Describe what you see in this image.",
    maxTokens: 150,
  },
  server
);
```

## Tool Registration

All sampling tools are automatically registered in the server's tool registry:

- `sampleLLM` - Basic text sampling
- `sampleWithPreferences` - Advanced preference-based sampling
- `sampleMultimodal` - Multimodal content sampling
- `sampleConversation` - Conversation continuation
- `sampleAdvanced` - Advanced optimization-based sampling

## Testing and Validation

The implementation has been validated with:

- ✅ TypeScript compilation without errors
- ✅ Proper type checking against MCP SDK types
- ✅ Linting compliance
- ✅ Build process validation
- ✅ Tool registration verification

## Migration Notes

### Breaking Changes

- `requestSampling` function signature has changed to use options object
- Parameter order changed in `requestTextSampling` for consistency
- Message roles limited to "user" and "assistant" (system messages handled via systemPrompt)

### Backward Compatibility

- `requestTextSampling` helper maintains simple interface
- Existing tool functionality preserved with enhanced capabilities
- Gradual migration path available

## Future Enhancements

Potential areas for expansion:

- Streaming response support
- Enhanced error handling with retry logic
- Sampling result caching
- Advanced conversation management
- Custom model provider integrations

This implementation provides a solid foundation for MCP sampling that fully complies with the latest specification while offering extensive customization and ease of use.
