import express from "express";
import { randomUUID } from "node:crypto";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import "dotenv/config";
const app = express();
app.use(express.json());
const transports = {};
app.post("/mcp", async (req, res) => {
    const sessionId = req.headers["mcp-session-id"];
    let transport;
    if (sessionId && transports[sessionId]) {
        transport = transports[sessionId];
    }
    else if (!sessionId && isInitializeRequest(req.body)) {
        transport = new StreamableHTTPServerTransport({
            sessionIdGenerator: () => randomUUID(),
            onsessioninitialized: (sessionId) => {
                transports[sessionId] = transport;
            },
        });
        transport.onclose = () => {
            if (transport.sessionId) {
                delete transports[transport.sessionId];
            }
        };
        const server = new McpServer({
            name: "elicitation-server",
            version: "1.0.0",
        });
        server.registerTool("greeting", {
            title: "Greeting Tool",
            description: "Greet the user",
            inputSchema: {},
        }, async () => {
            const elicitationMessage = "Please input your name";
            const result = await server.server.elicitInput({
                message: elicitationMessage,
                requestedSchema: {
                    type: "object",
                    properties: {
                        name: {
                            type: "string",
                            description: "The name of the user",
                        },
                    },
                    required: ["name"],
                },
            });
            console.log(`Elicitation Result: ${JSON.stringify(result)}`);
            return {
                content: [
                    {
                        type: "text",
                        text: `Hello ${result.content?.name ?? "Stranger"}`,
                    },
                ],
            };
        });
        server.registerResource("greeting", "config://user", {
            title: "User Greeting",
            description: "Greet the user",
            mimeType: "text/plain",
        }, async (uri) => {
            const elicitationMessage = "Please input your name";
            const result = await server.server.elicitInput({
                message: elicitationMessage,
                requestedSchema: {
                    type: "object",
                    properties: { name: { type: "string" } },
                },
            });
            console.log(`Elicitation Result: ${JSON.stringify(result)}`);
            const name = result.content?.name ?? "Stranger";
            return {
                contents: [
                    {
                        uri: uri.href,
                        text: `Hello there, ${name}`,
                    },
                ],
            };
        });
        server.registerPrompt("greeting-prompt", {
            title: "User greeting",
            description: "Greet the user by their name",
            argsSchema: {},
        }, async () => {
            const elicitationMessage = "Please input your name";
            const result = await server.server.elicitInput({
                message: elicitationMessage,
                requestedSchema: {
                    type: "object",
                    properties: { name: { type: "string" } },
                },
            });
            const greetingPrompt = result?.content?.name
                ? `Please greet me by my name:\n\n${result.content.name}`
                : `I am unnamed :p`;
            return {
                messages: [
                    {
                        role: "user",
                        content: {
                            type: "text",
                            text: greetingPrompt,
                        },
                    },
                ],
            };
        });
        server.registerTool("contact-info", {
            title: "Contact Information Tool",
            description: "Collect user contact information",
            inputSchema: {},
        }, async () => {
            const elicitationMessage = "Please provide your contact information";
            const result = await server.server.elicitInput({
                message: elicitationMessage,
                requestedSchema: {
                    type: "object",
                    properties: {
                        name: {
                            type: "string",
                            description: "Your full name",
                        },
                        email: {
                            type: "string",
                            format: "email",
                            description: "Your email address",
                        },
                        age: {
                            type: "number",
                            minimum: 18,
                            description: "Your age",
                        },
                    },
                    required: ["name", "email"],
                },
            });
            console.log(`Contact Info Elicitation Result: ${JSON.stringify(result)}`);
            const name = result.content?.name ?? "Unknown";
            const email = result.content?.email ?? "No email provided";
            const age = result.content?.age ? `, age ${result.content.age}` : "";
            return {
                content: [
                    {
                        type: "text",
                        text: `Contact information received: ${name} (${email}${age})`,
                    },
                ],
            };
        });
        await server.connect(transport);
    }
    else {
        res.status(400).json({
            jsonrpc: "2.0",
            error: {
                code: -32000,
                message: "Bad Request: No valid session ID provided",
            },
            id: null,
        });
        return;
    }
    await transport.handleRequest(req, res, req.body);
});
const handleSessionRequest = async (req, res) => {
    // Set SSE headers for GET requests before any other processing
    if (req.method === 'GET') {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Headers', 'Cache-Control');
    }
    const sessionId = req.headers["mcp-session-id"];
    if (!sessionId || !transports[sessionId]) {
        if (req.method === 'GET') {
            // For SSE, send an error event instead of plain text
            res.write(`event: error\ndata: {"error": "Invalid or missing session ID"}\n\n`);
            res.end();
        }
        else {
            res.status(400).send("Invalid or missing session ID");
        }
        return;
    }
    const transport = transports[sessionId];
    await transport.handleRequest(req, res);
};
app.get("/mcp", handleSessionRequest);
app.delete("/mcp", handleSessionRequest);
// Handle CORS preflight requests
app.options("/mcp", (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, mcp-session-id, Cache-Control');
    res.setHeader('Access-Control-Max-Age', '86400');
    res.status(200).end();
});
// Add a simple root route to confirm server is running
app.get("/", (req, res) => {
    res.json({
        message: "MCP Elicitations Server is running",
        version: "1.0.0",
        endpoints: {
            mcp: "/mcp"
        }
    });
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
