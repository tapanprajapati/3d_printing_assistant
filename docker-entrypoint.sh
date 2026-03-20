#!/bin/sh
echo "[entrypoint] script started" >&2
set -ex

if [ ! -f /app/data/dev.db ]; then
  echo "[entrypoint] Fresh install — running prisma db push..."
  npx prisma db push --skip-generate
  sqlite3 /app/data/dev.db "PRAGMA journal_mode=DELETE;" 2>/dev/null || true
else
  echo "[entrypoint] Database exists — skipping prisma db push."
fi

if [ "${SEED_ON_START}" = "true" ]; then
  echo "[entrypoint] Seeding database..."
  npx tsx prisma/seed.ts
fi

echo "[entrypoint] Starting Next.js..."
exec npm run start
