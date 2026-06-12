#!/usr/bin/env bash
# Seed a sample dietary restriction onto the local dev account so the
# Recipe Library "Create with AI" dietary check can be exercised before the
# Health -> Profiles edit screen exists.
#
# LOCAL/DEV ONLY — runs against the docker compose Postgres.
#
# Usage:  ./scripts/seed_dietary.sh ["nut allergy"]
set -euo pipefail

RESTRICTION="${1:-nut allergy}"

docker compose exec -T postgres psql -U mypal -d mypal -c "
  UPDATE member_settings ms
     SET dietary_restrictions = ARRAY['${RESTRICTION}']
    FROM members m
   WHERE ms.member_id = m.id
     AND m.id = (SELECT id FROM members WHERE deleted_at IS NULL
                 ORDER BY created_at LIMIT 1);"

echo "✓ Seeded dietary restriction '${RESTRICTION}' onto the first member."
