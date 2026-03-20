#!/bin/sh
set -e

echo "[entrypoint] Applying schema..."
/app/node_modules/.bin/prisma db push --skip-generate

# GCS FUSE does not support SQLite WAL mode; force DELETE journal mode
sqlite3 /app/data/dev.db "PRAGMA journal_mode=DELETE;" 2>/dev/null || true

# Only seed on a fresh database (no users = first run)
USER_COUNT=$(sqlite3 /app/data/dev.db "SELECT COUNT(*) FROM User;" 2>/dev/null || echo "0")
if [ "$USER_COUNT" = "0" ]; then
  echo "[entrypoint] Fresh database — running seed..."
  /app/node_modules/.bin/tsx /app/prisma/seed.ts
else
  echo "[entrypoint] Existing database — skipping seed."
fi

echo "[entrypoint] Starting Next.js..."
exec node /app/server.js
