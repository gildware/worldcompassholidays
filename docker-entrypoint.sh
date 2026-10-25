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

# Migration SQL was written for SQLite. Postgres is synced from schema.prisma.
echo "Syncing database schema..."
attempts=0
until prisma db push --skip-generate; do
  attempts=$((attempts + 1))
  if [ "$attempts" -ge 10 ]; then
    echo "Could not reach the database or sync the schema." >&2
    exit 1
  fi
  echo "Database is not ready yet. Retrying..." >&2
  sleep 3
done

if [ -n "${SEED_ADMIN_EMAIL:-}" ] && [ -n "${SEED_ADMIN_PASSWORD:-}" ]; then
  echo "Seeding admin account..."
  node prisma/seed-admin.mjs
fi

exec "$@"
