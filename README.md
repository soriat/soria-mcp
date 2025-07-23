# MCP Everything Server

A comprehensive reference implementation for the [Model Context Protocol](https://modelcontextprotocol.io/) (MCP) that demonstrates all features of the protocol. This server showcases the versatility and extensibility of MCP, demonstrating how it can be used to give Large Language Models (LLMs) secure, controlled access to tools and data sources.

<a href="https://glama.ai/mcp/servers/@soriat/soria-mcp">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/@soriat/soria-mcp/badge" alt="Elicitations Demo Server MCP server" />
</a>

This server is built with the [TypeScript MCP SDK](https://github.com/modelcontextprotocol/typescript-sdk).

## Features

This server implements a comprehensive set of MCP features including:

- **Tools**: Various tools including echo, add, long-running operations, environment variable printing, LLM sampling, and more
- **Prompts**: Simple and complex prompts with arguments, resource references, and embedded content
- **Resources**: Static resources with pagination support, resource templates, and subscriptions
- **Logging**: Configurable logging levels with real-time notifications
- **Completions**: Auto-completion for prompt arguments and resource references
- **Elicitation**: Interactive user input collection with structured schemas
- **Annotations**: Content annotations for priority and audience targeting
- **Progress Tracking**: Progress notifications for long-running operations
- **Real-time Updates**: Resource update notifications and stderr streaming

## Installation

```bash
npm install -g @modelcontextprotocol/server-everything
```

## Usage

### Standard I/O
```bash
mcp-server-everything
```

### Server-Sent Events (SSE)
```bash
npm run start:sse
```

### HTTP with Streaming Support
```bash
npm run start:streamableHttp
```

## Development

1. Clone the repository:
```bash
git clone https://github.com/modelcontextprotocol/servers.git
cd servers
```

2. Install dependencies:
```bash
npm install
```

3. Build the server:
```bash
npm run build
```

4. Run the server:
```bash
npm start
```

## Configuration

The server supports various configuration options and can be used to test and demonstrate MCP capabilities. It includes:

- 100 static resources (mix of text and binary)
- Multiple tool implementations
- Various prompt templates
- Real-time notifications and updates
- Progress tracking for long operations

## Docker

Build and run with Docker:

```bash
docker build -t mcp-everything-server .
docker run -p 3000:3000 mcp-everything-server
```

## License

MIT - See [LICENSE](LICENSE) file for details.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.