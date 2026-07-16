<p align="center">
  <img src="https://raw.githubusercontent.com/TranscriptFetch/mcp-server/main/assets/logo.png" alt="TranscriptFetch" width="84" height="84" />
</p>

# TranscriptFetch MCP Server

A [Model Context Protocol](https://modelcontextprotocol.io) server that gives any MCP client (Claude Desktop, Cursor, and others) access to the [TranscriptFetch API](https://transcriptfetch.com): fetch YouTube transcripts, search videos, and enumerate channels and playlists.

Runs locally over stdio and calls the TranscriptFetch API with your key. Prefer a hosted, remote server? Point your client at `https://transcriptfetch.com/mcp` instead (OAuth or API key).

## Tools

| Tool | What it does |
|---|---|
| `get_transcript` | Full transcript for a single video (ID or URL) |
| `search_videos` | Search YouTube by keyword |
| `list_channel_videos` | List a channel's videos (handle, ID, or URL) |
| `list_playlist_videos` | List a playlist's videos (ID or URL) |

Each successful fetch costs 1 credit. Get a key (100 free credits) at [the dashboard](https://transcriptfetch.com/app).

## Install

No install needed. Run it on demand with `npx`:

```bash
TRANSCRIPTFETCH_API_KEY=tf_live_... npx transcriptfetch-mcp
```

Or install globally:

```bash
npm install -g transcriptfetch-mcp
```

Requires Node 18+.

### Run from source

Until the package is on npm, you can run it straight from the repo:

```bash
git clone https://github.com/TranscriptFetch/mcp-server
cd mcp-server && npm install && npm run build
```

Then set your client's `command` to `node` with the built entrypoint (see the config below, using `"command": "node"` and `"args": ["/absolute/path/to/mcp-server/dist/index.js"]`).

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

Restart the client, and the four tools appear.

## Example

Once connected, ask your assistant naturally:

> Get the transcript for https://youtu.be/aircAruvnKk and summarize the key points.

> Search YouTube for "how transformers work" and list the top 5 videos.

> List the latest videos from @lexfridman and pull the transcript of the newest one.

The assistant picks the matching tool and works from the returned transcript or video list.

## Configuration

| Env var | Required | Default |
|---|---|---|
| `TRANSCRIPTFETCH_API_KEY` | yes | none |
| `TRANSCRIPTFETCH_BASE_URL` | no | `https://transcriptfetch.com` |

## Links

- API docs: https://transcriptfetch.com/docs
- MCP docs: https://transcriptfetch.com/docs/mcp
- Node SDK: https://github.com/TranscriptFetch/node-sdk
- Python SDK: https://github.com/TranscriptFetch/python-sdk

## License

MIT
