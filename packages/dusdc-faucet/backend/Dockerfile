FROM oven/bun:1 AS builder

WORKDIR /usr/src/app

COPY package.json bun.lock* ./
RUN bun install

COPY . .
RUN bunx prisma generate --config prisma/prisma.config.ts

FROM oven/bun:1

ENV NODE_ENV=production
WORKDIR /usr/src/app

COPY --from=builder /usr/src/app ./

USER bun

EXPOSE 3700

CMD ["bun", "index.ts"]
