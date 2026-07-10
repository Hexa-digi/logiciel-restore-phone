#!/bin/sh
set -e

echo "Synchronisation du schema de base de donnees..."
npx prisma db push --skip-generate

if [ "$SEED_ON_START" = "true" ]; then
  echo "Seed de la base de donnees..."
  npx tsx prisma/seed.ts
fi

exec "$@"
