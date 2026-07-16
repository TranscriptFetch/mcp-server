/**
 * Tool catalog + handlers. The definitions mirror the hosted TranscriptFetch
 * MCP server; each tool maps to a v1 API endpoint.
 */

import type { ApiClient } from "./client.js";

const limitProp = {
  type: "integer",
  minimum: 1,
  maximum: 50,
  description: "Max results to return (1-50). Defaults to 5.",
} as const;

export const TOOLS = [
  {
    name: "get_transcript",
    description:
      "Fetch the full transcript for a single YouTube video. Accepts a video ID or any YouTube URL.",
    inputSchema: {
      type: "object",
      properties: {
        video: {
          type: "string",
          description: "YouTube video ID or URL (e.g. dQw4w9WgXcQ or https://youtu.be/...).",
        },
      },
      required: ["video"],
      additionalProperties: false,
    },
  },
  {
    name: "search_videos",
    description: "Search YouTube for videos matching a query. Returns titles, IDs, and URLs.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search keywords." },
        limit: limitProp,
      },
      required: ["query"],
      additionalProperties: false,
    },
  },
  {
    name: "list_channel_videos",
    description:
      "List recent videos for a YouTube channel. Accepts a channel handle (@name), channel ID (UC...), or URL.",
    inputSchema: {
      type: "object",
      properties: {
        channel: { type: "string", description: "Channel handle, ID, or URL." },
        limit: limitProp,
      },
      required: ["channel"],
      additionalProperties: false,
    },
  },
  {
    name: "list_playlist_videos",
    description: "List the videos in a YouTube playlist. Accepts a playlist ID or URL.",
    inputSchema: {
      type: "object",
      properties: {
        playlist: { type: "string", description: "Playlist ID or URL." },
        limit: limitProp,
      },
      required: ["playlist"],
      additionalProperties: false,
    },
  },
] as const;

type Args = Record<string, unknown>;

// Each tool maps to a v1 endpoint and the request body it expects.
const ROUTES: Record<string, { path: string; body: (a: Args) => Record<string, unknown> }> = {
  get_transcript: {
    path: "/api/v1/transcripts/video",
    body: (a) => ({ video: a.video }),
  },
  search_videos: {
    path: "/api/v1/transcripts/search",
    body: (a) => ({ query: a.query, ...(a.limit != null ? { limit: a.limit } : {}) }),
  },
  list_channel_videos: {
    path: "/api/v1/transcripts/channel",
    body: (a) => ({ channel: a.channel, ...(a.limit != null ? { limit: a.limit } : {}) }),
  },
  list_playlist_videos: {
    path: "/api/v1/transcripts/playlist",
    body: (a) => ({ playlist: a.playlist, ...(a.limit != null ? { limit: a.limit } : {}) }),
  },
};

/** Run a tool by name and return its result as JSON text. */
export async function callTool(client: ApiClient, name: string, args: Args): Promise<string> {
  const route = ROUTES[name];
  if (!route) throw new Error(`Unknown tool: ${name}`);
  const data = await client.post(route.path, route.body(args ?? {}));
  return JSON.stringify(data, null, 2);
}
