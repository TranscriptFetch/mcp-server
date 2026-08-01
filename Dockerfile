# Containerised build of the TranscriptFetch MCP server.
#
# This is a stdio server: it speaks MCP over stdin/stdout, so there is no port to
# expose and no HTTP surface. Clients (Claude Desktop, Cursor, Glama) launch the
# container and talk to it through the pipe, which is why CMD runs the binary in
# the foreground and nothing is daemonised.
#
#   docker build -t transcriptfetch-mcp .
#   docker run --rm -i -e TRANSCRIPTFETCH_API_KEY=tf_live_... transcriptfetch-mcp
#
# The -i is required. Without an attached stdin the transport closes immediately.

# ---- build ----------------------------------------------------------------
FROM node:22-alpine AS build
WORKDIR /app

# Copy manifests first so the dependency layer caches independently of source.
COPY package.json package-lock.json ./
# devDependencies are needed here: tsup and typescript do the build.
RUN npm ci

COPY tsconfig.json tsup.config.ts ./
COPY src ./src
RUN npm run build

# Re-resolve production-only dependencies for the runtime layer, so tsup,
# typescript and their trees do not ship in the final image.
RUN npm ci --omit=dev

# ---- runtime --------------------------------------------------------------
FROM node:22-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production

# Run unprivileged. node:alpine ships a `node` user (uid 1000) already.
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
COPY --chown=node:node package.json ./

USER node

# TRANSCRIPTFETCH_API_KEY is required at runtime and deliberately NOT baked in:
# it is a secret and must be passed per-container. The server exits with a clear
# message if it is missing. TRANSCRIPTFETCH_BASE_URL is optional and only used
# to point at a non-production API.
CMD ["node", "dist/index.js"]
