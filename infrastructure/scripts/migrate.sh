#!/bin/bash
set -e
# Run database migrations
DATABASE_URL="${DATABASE_URL:?DATABASE_URL not set}"
for f in database/migrations/*.sql; do
  echo "Applying $f..."
  psql "$DATABASE_URL" -f "$f"
done
echo "Migrations complete."
