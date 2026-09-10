# Changelog

All notable changes to this project are documented here. This project follows
[Semantic Versioning](https://semver.org/).

## [0.2.6] - 2026-09-10

### Changed

- Listing refresh for the brand: a production transcript API for YouTube, TikTok and Instagram. Podcast inputs (Spotify, Apple Podcasts, RSS) were retired by the API on 2026-09-10 and now answer `unsupported_platform`; the tool descriptions come from the hosted server, so no code changes here.

## [0.2.5] - 2026-08-28

### Changed

- npm listing refresh: description names the clients and the AI-transcription fallback, richer keywords, homepage points at /mcp-server. No code changes.

## [0.2.4]

- **Fixed: stale `ai_fallback` timing claim.** The argument description said AI
  transcription "starts an async job ... that takes 1-3 minutes". After
  pipeline optimizations it typically completes in ~30 seconds for short
  videos (longer videos take longer), and short media is returned inline
  rather than as a job to poll. The description now says so.
- README: the `get_transcript` row notes the typical AI-transcription time, and
  the hosted-server line notes that the hosted MCP waits inline for short-form
  AI transcription, so no polling is needed there.

## [0.2.3]

- **Fixed: the server advertised two platforms it cannot fetch.** The
  `get_transcript` description, its `video` argument description, the server
  instructions sent on initialize, the README and the npm package description
  all claimed support for X (Twitter) and Facebook. Neither has ever worked:
  the API rejects those URLs. An agent reading the tool would pick this server
  for an X or Facebook link and burn a call on a guaranteed error, so the claim
  was worse than an omission. The 0.2.1 entry below, which introduced the
  wording, is wrong for the same reason and is left in place only as the record
  of what shipped.
- The supported set is now stated exactly as it is: YouTube, TikTok, Instagram
  and direct media file URLs.

## [0.2.2]

- Server instructions now match the tool definitions. The text sent on
  initialize still described the server as YouTube-only and did not mention
  `ai_fallback` or `get_credits`, which is the first thing an MCP client reads.

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
