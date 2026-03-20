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
ENV DATABASE_URL="file:/app/data/dev.db"
ENV NEXTAUTH_SECRET="build-placeholder"
ENV NEXTAUTH_URL="http://localhost:3000"

RUN npx prisma generate && npm run build

# ─── Stage 2: Runner ─────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

RUN apk add --no-cache libc6-compat openssl sqlite

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --chown=nextjs:nodejs docker-entrypoint.sh ./docker-entrypoint.sh

RUN chmod +x ./docker-entrypoint.sh \
 && mkdir -p /app/data /app/public/uploads/images /app/public/uploads/models \
 && chown -R nextjs:nodejs /app/data /app/public/uploads

USER nextjs

EXPOSE 3000
ENV PORT=3000

ENTRYPOINT ["./docker-entrypoint.sh"]
