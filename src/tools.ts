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
      "Fetch the full transcript for a video. Accepts a YouTube video ID or URL, plus TikTok and Instagram video URLs and direct media file URLs. If no transcript comes back, the result says whether captions definitively do not exist (aiFallback.captionsUnavailable) and whether transcribing the audio would still work (aiFallback.available). When it does, call this tool again with ai_fallback: true.",
    inputSchema: {
      type: "object",
      properties: {
        video: {
          type: "string",
          description:
            "Video ID or URL, YouTube (dQw4w9WgXcQ, youtu.be/...), TikTok, Instagram, or a direct media file URL.",
        },
        ai_fallback: {
          type: "boolean",
          description:
            "Skip captions and transcribe the audio with AI instead. Use this only after a previous call reported aiFallback.available. Charged 1 credit per started minute of audio (minimum 1), on delivery only; typically ~30 seconds for short videos, longer for long ones.",
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
  {
    name: "get_credits",
    description:
      "Check the remaining TranscriptFetch credit balance for the current API key. Free: this call is never billed.",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
  },
] as const;

type Args = Record<string, unknown>;

// Each tool maps to a v1 endpoint and the request body it expects.
const ROUTES: Record<string, { path: string; body: (a: Args) => Record<string, unknown> }> = {
  get_transcript: {
    path: "/api/v1/transcripts/video",
    body: (a) => ({
      video: a.video,
      ...(a.ai_fallback != null ? { ai_fallback: a.ai_fallback } : {}),
    }),
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
  // get_credits is a GET against /api/v1/me and takes no arguments, so it sits
  // outside the POST-with-a-body ROUTES table rather than being bent to fit it.
  // The response is passed through unchanged, like every other tool: the API
  // returns { kind, user_id, credits } and reshaping it here would make this the
  // only tool whose output does not match the documented v1 envelope.
  if (name === "get_credits") {
    const data = await client.get("/api/v1/me");
    return JSON.stringify(data, null, 2);
  }

  const route = ROUTES[name];
  if (!route) throw new Error(`Unknown tool: ${name}`);
  const data = await client.post(route.path, route.body(args ?? {}));
  return JSON.stringify(data, null, 2);
}
