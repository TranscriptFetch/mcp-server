/** Thin client for the TranscriptFetch v1 API, used by the tool handlers. */

import { VERSION } from "./version.js";

const DEFAULT_BASE_URL = "https://transcriptfetch.com";
const ENV_API_KEY = "TRANSCRIPTFETCH_API_KEY";

export interface ApiClient {
  post(path: string, body: Record<string, unknown>): Promise<unknown>;
}

/** Resolve the API key from env and return a client bound to it. */
export function createClient(): ApiClient {
  const apiKey = process.env[ENV_API_KEY];
  if (!apiKey) {
    throw new Error(
      `Missing ${ENV_API_KEY}. Get a key at https://transcriptfetch.com/app and set it in your MCP client config.`,
    );
  }
  const baseUrl = (process.env.TRANSCRIPTFETCH_BASE_URL ?? DEFAULT_BASE_URL).replace(/\/+$/, "");

  return {
    async post(path, body) {
      const res = await fetch(baseUrl + path, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          Accept: "application/json",
          "User-Agent": `transcriptfetch-mcp/${VERSION}`,
        },
        body: JSON.stringify(body),
      });

      const text = await res.text();
      let payload: unknown = null;
      try {
        payload = text ? JSON.parse(text) : null;
      } catch {
        payload = null;
      }

      if (!res.ok) {
        const message =
          (payload as { error?: { message?: string } } | null)?.error?.message ??
          `Request failed with status ${res.status}`;
        throw new Error(message);
      }

      // The API wraps successes as { ok, request_id, data, usage }.
      const envelope = payload as { data?: unknown } | null;
      return envelope?.data ?? payload;
    },
  };
}
