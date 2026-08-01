# Changelog

All notable changes to this project are documented here. This project follows
[Semantic Versioning](https://semver.org/).

## [0.2.1]

- `get_transcript` now documents the platforms it has always accepted: TikTok,
  Instagram, X, Facebook and direct media URLs alongside YouTube. The tool only
  claimed YouTube support, so MCP clients would not select it for other
  platforms even though the calls succeeded.
- Added the `ai_fallback` argument, which transcribes the audio when a video has
  no caption track. Most short-form video does not, so multi-platform support is
  not much use without it.

## [0.2.0]

- Added `get_credits`, which reports the remaining balance for the current key.
  Backed by `GET /api/v1/me`, which is never billed, so agents can check before
  spending.
- Added a Dockerfile for running the server as a container.

## [0.1.0]

Initial release.

- Stdio MCP server exposing `get_transcript`, `search_videos`, `list_channel_videos`, and `list_playlist_videos`.
- Runs via `npx transcriptfetch-mcp` with a `TRANSCRIPTFETCH_API_KEY`.
- Errors are returned to the model as tool errors rather than crashing the transport.
