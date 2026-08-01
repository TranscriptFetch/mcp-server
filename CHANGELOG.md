# Changelog

All notable changes to this project are documented here. This project follows
[Semantic Versioning](https://semver.org/).

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
