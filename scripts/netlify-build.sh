#!/usr/bin/env bash
# Netlify build: apply pending migrations, then build Next.js.
#
# Netlify DB (Neon) exposes NETLIFY_DATABASE_URL (pooled) and
# NETLIFY_DATABASE_URL_UNPOOLED (direct). Map them to the names Prisma reads,
# unless DATABASE_URL / DIRECT_URL are set explicitly (e.g. your own Neon project).
set -euo pipefail

export DATABASE_URL="${DATABASE_URL:-${NETLIFY_DATABASE_URL:-}}"
export DIRECT_URL="${DIRECT_URL:-${NETLIFY_DATABASE_URL_UNPOOLED:-$DATABASE_URL}}"

if [ -n "$DATABASE_URL" ]; then
  pnpm exec prisma migrate deploy
else
  echo "WARNING: no database configured (DATABASE_URL / Netlify DB). Skipping migrations;" >&2
  echo "         only pages that don't touch the database will work." >&2
fi

pnpm build
