#!/bin/sh
set -e

echo "[entrypoint] Ensuring persistent directories exist..."
mkdir -p /app/data /app/public/uploads/images /app/public/uploads/models

echo "[entrypoint] Running prisma db push..."
npx prisma db push --skip-generate

if [ "${SEED_ON_START}" = "true" ]; then
  echo "[entrypoint] Seeding database..."
  npx tsx prisma/seed.ts
fi

echo "[entrypoint] Starting Next.js..."
exec npm run start
