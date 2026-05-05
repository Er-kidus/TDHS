#!/bin/bash
set -e

DATABASE_URL="${DATABASE_URL:?DATABASE_URL not set}"

RESET_SEED="database/seeds/00_reset_and_demo_seed.sql"

if [ -f "$RESET_SEED" ]; then
	psql "$DATABASE_URL" -f "$RESET_SEED"
	echo "Seed data applied from $RESET_SEED."
	exit 0
fi

for f in database/seeds/*.sql; do
	[ -e "$f" ] || continue
	echo "Applying $f..."
	psql "$DATABASE_URL" -f "$f"
done

echo "Seed data applied."
