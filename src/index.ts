// CLI entrypoint: connect the MCP server over stdio. The shebang is injected by
// the bundler (see tsup.config.ts), so this file is directly executable.

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { buildServer } from "./server.js";
import { VERSION } from "./version.js";

async function main(): Promise<void> {
  const server = buildServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // Logs must go to stderr: stdout is the JSON-RPC channel.
  console.error(`transcriptfetch-mcp ${VERSION} ready (stdio)`);
}

main().catch((err) => {
  console.error("transcriptfetch-mcp failed to start:", err);
  process.exit(1);
});
