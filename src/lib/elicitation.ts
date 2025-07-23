import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { z } from "zod";

// Posible TODO: Use the elicitation function from the server
export const requestElicitation = async (
  message: string,
  requestedSchema: any,
  server: Server
) => {
  const request = {
    method: 'elicitation/create',
    params: {
      message,
      requestedSchema
    }
  };

  return await server.request(request, z.any());
};