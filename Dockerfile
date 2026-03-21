# syntax=docker/dockerfile:1

# ─── Stage 1: Build ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma/

RUN npm ci

COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL="file:/mnt/data/dev.db"
ENV NEXTAUTH_SECRET="build-placeholder"
ENV NEXTAUTH_URL="http://localhost:3000"

RUN npx prisma generate && npm run build

# Compile seed script to plain JS and strip dev dependencies
RUN npx tsc prisma/seed.ts \
      --module commonjs --moduleResolution node \
      --esModuleInterop --target es2020 \
      --skipLibCheck --noEmit false \
      --outDir prisma/dist \
 && npm prune --production

# ─── Stage 2: Runner ─────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

RUN apk add --no-cache libc6-compat openssl sqlite

WORKDIR /app

RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

# Standalone Next.js bundle (includes server.js + minimal node_modules)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# Static assets must sit alongside the standalone bundle
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Full pruned node_modules — directory copy preserves .bin/ symlinks
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules

# Prisma schema + compiled seed, app manifest
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

COPY --chown=nextjs:nodejs docker-entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh \
 && mkdir -p /mnt

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV UPLOAD_DIR=/mnt/public/uploads

ENTRYPOINT ["/bin/sh", "/entrypoint.sh"]
