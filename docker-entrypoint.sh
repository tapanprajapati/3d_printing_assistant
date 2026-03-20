#!/bin/sh
set -e

echo "[entrypoint] Ensuring persistent directories exist..."
mkdir -p /app/data /app/public/uploads/images /app/public/uploads/models

echo "[entrypoint] Running prisma db push..."
npx prisma db push --skip-generate

echo "[entrypoint] Setting journal mode to DELETE for GCS FUSE compatibility..."
sqlite3 /app/data/dev.db "PRAGMA journal_mode=DELETE;" 2>/dev/null || true

if [ "${SEED_ON_START}" = "true" ]; then
  echo "[entrypoint] Seeding database..."
  npx tsx prisma/seed.ts
fi

echo "[entrypoint] Starting Next.js..."
exec npm run start
