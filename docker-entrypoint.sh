#!/bin/sh
set -eu

if [ -z "${DATABASE_URL:-}" ]; then
  echo "ERROR: DATABASE_URL must be set" >&2
  exit 1
fi

case "$DATABASE_URL" in
  file:*)
    db_path="${DATABASE_URL#file:}"
    db_path="${db_path%%\?*}"
    mkdir -p "$(dirname "$db_path")"
    ;;
esac

echo "Applying database migrations..."
prisma migrate deploy

if [ -n "${SEED_ADMIN_EMAIL:-}" ] && [ -n "${SEED_ADMIN_PASSWORD:-}" ]; then
  echo "Seeding admin account..."
  node prisma/seed-admin.mjs
fi

exec "$@"
