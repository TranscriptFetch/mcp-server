/** Builds the MCP server: registers the tool catalog and routes calls. */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { createClient } from "./client.js";
import { callTool, TOOLS } from "./tools.js";
import { VERSION } from "./version.js";

// Server-level guidance sent on initialize. Kept in step with the tool
// descriptions in tools.ts: it is the first thing a client reads, and stating
// YouTube-only here would undercut the multi-platform support get_transcript
// actually has.
const INSTRUCTIONS =
  "Turn videos into text. get_transcript fetches the full transcript for a " +
  "YouTube, TikTok, Instagram, X (Twitter) or Facebook video, or a direct media " +
  "file URL. Most short-form video has no caption track; when that happens the " +
  "result reports whether captions definitively do not exist and whether " +
  "transcribing the audio would still work, in which case call get_transcript " +
  "again with ai_fallback: true. search_videos, list_channel_videos and " +
  "list_playlist_videos discover videos on YouTube. get_credits reports the " +
  "remaining balance and is never billed. Each successful fetch costs 1 credit; " +
  "failed, blocked and empty results are free.";

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
