/** Builds the MCP server: registers the tool catalog and routes calls. */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { createClient } from "./client.js";
import { callTool, TOOLS } from "./tools.js";
import { VERSION } from "./version.js";

const INSTRUCTIONS =
  "Fetch YouTube transcripts and discover videos. Use get_transcript for a single " +
  "video's full text, search_videos to find videos by keyword, and " +
  "list_channel_videos / list_playlist_videos to enumerate a channel or playlist. " +
  "Each successful fetch costs 1 credit.";

export function buildServer(): Server {
  const server = new Server(
    { name: "transcriptfetch", version: VERSION },
    { capabilities: { tools: {} }, instructions: INSTRUCTIONS },
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
      const client = createClient();
      const text = await callTool(client, name, (args ?? {}) as Record<string, unknown>);
      return { content: [{ type: "text", text }] };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      // Surface the failure to the model rather than crashing the transport.
      return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
    }
  });

  return server;
}
