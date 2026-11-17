#!/usr/bin/env bash
# Netlify build: apply pending migrations, then build Next.js.
#
# Netlify DB (Neon) exposes NETLIFY_DATABASE_URL (pooled) and
# NETLIFY_DATABASE_URL_UNPOOLED (direct). Map them to the names Prisma reads,
# unless DATABASE_URL / DIRECT_URL are set explicitly (e.g. your own Neon project).
set -euo pipefail

export DATABASE_URL="${DATABASE_URL:-${NETLIFY_DATABASE_URL:-}}"
export DIRECT_URL="${DIRECT_URL:-${NETLIFY_DATABASE_URL_UNPOOLED:-$DATABASE_URL}}"

if [ -z "$DATABASE_URL" ]; then
  echo "No database configured: set DATABASE_URL or connect Netlify DB to this site." >&2
  exit 1
fi

pnpm exec prisma migrate deploy
pnpm build
