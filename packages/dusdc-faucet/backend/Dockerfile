# syntax=docker/dockerfile:1.7

# ---------- deps ----------
FROM oven/bun:1 AS deps
WORKDIR /app
COPY package.json bun.lockb* bun.lock* ./
RUN bun install --frozen-lockfile

# ---------- build (prisma client generation) ----------
FROM oven/bun:1 AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bunx prisma generate --config prisma/prisma.config.ts

# ---------- runtime ----------
FROM oven/bun:1-slim AS runtime
WORKDIR /app

ENV NODE_ENV=production \
    APP_PORT=4127

# Tini for clean signal handling under Dokploy.
RUN apt-get update \
 && apt-get install -y --no-install-recommends tini ca-certificates \
 && rm -rf /var/lib/apt/lists/*

COPY --from=build /app /app

# bun image ships a non-root `bun` user. Make sure it owns the app dir
# so prisma generated client + node_modules are readable at runtime.
RUN chown -R bun:bun /app
USER bun

EXPOSE 4127

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD bun -e "fetch('http://127.0.0.1:'+ (process.env.APP_PORT||4127) +'/').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"

ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["bun", "index.ts"]
