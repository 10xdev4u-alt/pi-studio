# Multi-stage Dockerfile for Pi Studio
# Stage 1: build everything
# Stage 2: production runtime

FROM node:22-slim AS builder
WORKDIR /app

# Install build deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install all deps
COPY package.json package-lock.json* ./
COPY tsconfig.base.json ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/daemon/package.json ./packages/daemon/
COPY packages/browser/package.json ./packages/browser/
RUN npm ci --ignore-scripts

# Build shared first
COPY packages/shared/ ./packages/shared/
RUN npm run build -w @pi-studio/shared

# Build daemon
COPY packages/daemon/ ./packages/daemon/
RUN npm run build -w @pi-studio/daemon

# Build browser
COPY packages/browser/ ./packages/browser/
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build -w @pi-studio/browser

# ---- Runtime stage ----
FROM node:22-slim AS runtime
WORKDIR /app

# Runtime deps for better-sqlite3 native module
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy built artifacts
COPY --from=builder /app/packages/shared/dist /app/packages/shared/dist
COPY --from=builder /app/packages/shared/package.json /app/packages/shared/
COPY --from=builder /app/packages/daemon/dist /app/packages/daemon/dist
COPY --from=builder /app/packages/daemon/package.json /app/packages/daemon/
COPY --from=builder /app/packages/browser/.next /app/packages/browser/.next
COPY --from=builder /app/packages/browser/public /app/packages/browser/public
COPY --from=builder /app/packages/browser/package.json /app/packages/browser/
COPY --from=builder /app/packages/browser/next.config.ts /app/packages/browser/
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/package.json /app/package.json

# Environment
ENV NODE_ENV=production
ENV PI_STUDIO_HOST=0.0.0.0
ENV PI_STUDIO_PORT=7331
ENV NEXT_PUBLIC_WS_URL=ws://localhost:7331/ws
ENV PI_STUDIO_DB=/data/data.db
ENV PI_STUDIO_BROWSER_PORT=3000
ENV PI_STUDIO_BROWSER_HOST=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED=1

# Data dir
RUN mkdir -p /data && chown -R node:node /data /app
USER node
WORKDIR /app/packages/daemon

EXPOSE 7331 3000

# Health check via daemon
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD node -e "fetch('http://127.0.0.1:7331/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

# Start daemon + browser
CMD ["sh", "-c", "cd /app && node packages/daemon/dist/index.js & cd /app/packages/browser && npx next start -p 3000 -H 0.0.0.0 & wait"]
