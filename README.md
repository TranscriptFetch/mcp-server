<p align="center">
  <img src="https://raw.githubusercontent.com/TranscriptFetch/mcp-server/main/assets/logo.png" alt="TranscriptFetch" width="84" height="84" />
</p>

# TranscriptFetch MCP Server

A [Model Context Protocol](https://modelcontextprotocol.io) server that gives any MCP client (Claude Desktop, Cursor, and others) access to the [TranscriptFetch API](https://transcriptfetch.com): a production transcript API for YouTube, TikTok and Instagram, with AI transcription when captions are missing. Fetch transcripts, search videos, list channels and playlists, and check your credit balance.

## Get an API key

1. Create a free account at [transcriptfetch.com](https://transcriptfetch.com/sign-up). No card needed.
2. Open [Dashboard, then API keys](https://transcriptfetch.com/app/keys) and create a key. It starts with `tf_live_`.
3. Put it in `TRANSCRIPTFETCH_API_KEY` in the client configuration below.

Every account gets 50 free credits a month. Failures are free: a fetch that returns no transcript is never charged.

Runs locally over stdio and calls the TranscriptFetch API with your key. Prefer a hosted, remote server? Point your client at `https://transcriptfetch.com/mcp` instead (OAuth or API key). The hosted server waits inline for short-form AI transcription, so no polling is needed there.

## Tools

| Tool | What it does |
|---|---|
| `get_transcript` | Transcript for a video. YouTube, TikTok, Instagram, or a direct media URL. Set `ai_fallback: true` to transcribe the audio when no captions exist (typically ~30 seconds for short videos, longer for long ones) |
| `search_videos` | Search YouTube by keyword |
| `list_channel_videos` | List a YouTube channel's videos (handle, ID, or URL) |
| `list_playlist_videos` | List a YouTube playlist's videos (ID or URL) |
| `get_credits` | Remaining credit balance for the key. Never billed |

Pricing is per successful result: a caption fetch or a video list costs 1 credit, and AI transcription of the audio costs 1 credit per started minute of audio, charged only on delivery. Failed, blocked and empty results are never charged, which matters on short-form video where many clips have no speech at all.

## Install

No install needed. Run it on demand with `npx`:

```bash
TRANSCRIPTFETCH_API_KEY=tf_live_... npx -y transcriptfetch-mcp
```

Or install globally:

```bash
npm install -g transcriptfetch-mcp
```

Requires Node 18+.

### Run from source

```bash
git clone https://github.com/TranscriptFetch/mcp-server
cd mcp-server && npm install && npm run build
```

Then point your client at the built entrypoint with `"command": "node"` and
`"args": ["/absolute/path/to/mcp-server/dist/index.js"]`.

## Client configuration

### Claude Desktop

Add this to `claude_desktop_config.json` (Settings then Developer then Edit Config):

```json
{
  "mcpServers": {
    "transcriptfetch": {
      "command": "npx",
      "args": ["-y", "transcriptfetch-mcp"],
      "env": { "TRANSCRIPTFETCH_API_KEY": "tf_live_..." }
    }
  }
}
```

### Cursor

Add the same block under `mcpServers` in your Cursor MCP settings.

Restart the client, and the five tools appear.

## Example

Once connected, ask your assistant naturally:

> Get the transcript for https://youtu.be/aircAruvnKk and summarize the key points.

> Search YouTube for "how transformers work" and list the top 5 videos.

> List the latest videos from @lexfridman and pull the transcript of the newest one.

> How many TranscriptFetch credits do I have left?

The assistant picks the matching tool and works from the returned transcript or video list.

## Configuration

| Env var | Required | Default |
|---|---|---|
| `TRANSCRIPTFETCH_API_KEY` | yes | none |
| `TRANSCRIPTFETCH_BASE_URL` | no | `https://transcriptfetch.com` |

## Docker

The server speaks MCP over stdio, so there is no port to expose. `-i` is
required: without an attached stdin the transport closes immediately and the
container looks like it crashed.

```bash
docker build -t transcriptfetch-mcp .
docker run --rm -i -e TRANSCRIPTFETCH_API_KEY=tf_live_... transcriptfetch-mcp
```

## Links

- API docs: https://transcriptfetch.com/docs
- MCP docs: https://transcriptfetch.com/docs/mcp
- Node SDK: https://github.com/TranscriptFetch/node-sdk
- Python SDK: https://github.com/TranscriptFetch/python-sdk

## License

MIT
