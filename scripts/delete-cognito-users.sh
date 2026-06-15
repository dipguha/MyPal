#!/usr/bin/env bash
#
# Delete users from the MyPal Cognito user pool AND their rows in the local
# Postgres DB. Deleting a user destroys the WHOLE account it belongs to, which
# cascades to members, users, member_settings, groups, group_members,
# account_settings, and any account-scoped feature rows (FKs are ON DELETE
# CASCADE from accounts).
#
# Usage:
#   scripts/delete-cognito-users.sh <username-or-email>    Delete one user + their account
#   scripts/delete-cognito-users.sh --all                  Delete ALL users + ALL accounts (prompts)
#   scripts/delete-cognito-users.sh --all --yes            Delete ALL users + ALL accounts (no prompt)
#   scripts/delete-cognito-users.sh <target|--all> --no-db Cognito only; leave the DB untouched
#   scripts/delete-cognito-users.sh --help                 Show usage
#
# Config is resolved from environment variables first, then backend/.env:
#   COGNITO_USER_POOL_ID, AWS_REGION
#
# Requires:
#   - AWS CLI configured with credentials that have cognito-idp:ListUsers and
#     cognito-idp:AdminDeleteUser on the pool. (backend/.env holds the Cognito
#     *client* creds but no AWS IAM creds — run from an AWS-configured shell.)
#   - DB cleanup: Docker + the compose stack (the Postgres DB is only reachable
#     on the compose network). It is skipped with --no-db, or with a warning if
#     Docker/compose is unavailable.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
ENV_FILE="$ROOT_DIR/backend/.env"

read_env() { # read_env KEY -> value from backend/.env (empty if absent)
  [ -f "$ENV_FILE" ] || return 0
  grep -E "^$1=" "$ENV_FILE" | tail -1 | cut -d= -f2- | tr -d '"' || true
}

POOL="${COGNITO_USER_POOL_ID:-$(read_env COGNITO_USER_POOL_ID)}"
REGION="${AWS_REGION:-$(read_env AWS_REGION)}"

usage() {
  cat <<EOF
Delete users from the MyPal Cognito user pool AND their local Postgres rows.

Usage:
  $(basename "$0") <username-or-email>      Delete one user + their whole account
  $(basename "$0") --all [--yes]            Delete ALL users + ALL accounts
  $(basename "$0") <target|--all> --no-db   Cognito only; leave the DB untouched

Deleting a user destroys the entire account it belongs to (all members + users).

Pool:   ${POOL:-<unset>}
Region: ${REGION:-<unset>}
EOF
}

# --- parse args (flags may appear in any order) ---
ASSUME_YES=0
DB_CLEANUP=1
TARGET=""
for arg in "$@"; do
  case "$arg" in
    -h | --help) usage; exit 0 ;;
    --yes) ASSUME_YES=1 ;;
    --no-db) DB_CLEANUP=0 ;;
    --all | [!-]*)
      if [ -z "$TARGET" ]; then
        TARGET="$arg"
      else
        echo "Error: unexpected extra argument '$arg'" >&2
        exit 1
      fi
      ;;
    *) echo "Error: unknown option '$arg'" >&2; exit 1 ;;
  esac
done
[ -n "$TARGET" ] || { usage; exit 1; }

# --- preconditions ---
command -v aws >/dev/null 2>&1 || { echo "Error: aws CLI not found on PATH." >&2; exit 1; }
if [ -z "${POOL:-}" ] || [ -z "${REGION:-}" ]; then
  echo "Error: COGNITO_USER_POOL_ID and AWS_REGION must be set (env or backend/.env)." >&2
  exit 1
fi

# --- Cognito ---
delete_user() {
  aws cognito-idp admin-delete-user \
    --user-pool-id "$POOL" --region "$REGION" --username "$1"
  echo "Cognito: deleted $1"
}

# --- DB (run inside the backend container; the DB is only on the compose net) ---
compose() { ( cd "$ROOT_DIR" && docker compose "$@" ); }

db_available() {
  [ "$DB_CLEANUP" = "1" ] || return 1
  command -v docker >/dev/null 2>&1 || return 1
  [ -f "$ROOT_DIR/docker-compose.yml" ] || return 1
  ( cd "$ROOT_DIR" && docker compose version >/dev/null 2>&1 ) || return 1
  return 0
}

db_warn_skip() {
  echo "Warning: DB cleanup skipped — Docker/compose is not available." >&2
  echo "  Run it manually once Docker is up, e.g.:" >&2
  echo "    docker compose run --rm backend bin/rails runner 'Account.destroy_all'" >&2
}

# Runs a Ruby snippet in the backend container, preferring the running service
# and falling back to a one-off run. DEL_EMAIL, if set, is passed through.
rails_runner() {
  local ruby="$1"
  local env_args=""
  [ -n "${DEL_EMAIL:-}" ] && env_args="-e DEL_EMAIL=$DEL_EMAIL"
  if [ -n "$(compose ps -q backend 2>/dev/null)" ]; then
    # shellcheck disable=SC2086
    compose exec -T $env_args backend bin/rails runner "$ruby"
  else
    # shellcheck disable=SC2086
    compose run --rm -T $env_args backend bin/rails runner "$ruby"
  fi
}

db_destroy_account_by_email() {
  DEL_EMAIL="$1" rails_runner '
    email = ENV["DEL_EMAIL"].to_s.strip
    user  = User.find_by(email: email)
    if user.nil?
      puts "DB: no account found for #{email} (nothing to delete)"
    else
      account = user.account
      members = account.members.count
      users   = account.users.count
      account.destroy!
      puts "DB: destroyed account #{account.id} — removed #{members} member(s), #{users} user(s)"
    end
  '
}

db_destroy_all_accounts() {
  rails_runner '
    n = Account.count
    Account.destroy_all
    puts "DB: destroyed #{n} account(s)"
  '
}

# --- run ---
if [ "$TARGET" = "--all" ]; then
  if [ "$ASSUME_YES" != "1" ]; then
    if [ "$DB_CLEANUP" = "1" ]; then
      msg="Delete ALL users from pool $POOL ($REGION) AND destroy ALL local accounts?"
    else
      msg="Delete ALL users from pool $POOL ($REGION)? (DB left untouched)"
    fi
    read -r -p "$msg Type 'yes' to confirm: " ans
    [ "$ans" = "yes" ] || { echo "Aborted."; exit 1; }
  fi

  count=0
  # Re-list each round so pagination is handled until the pool is empty.
  while :; do
    users=$(aws cognito-idp list-users \
              --user-pool-id "$POOL" --region "$REGION" \
              --query 'Users[].Username' --output text)
    [ -z "$users" ] && break
    for u in $users; do delete_user "$u"; count=$((count + 1)); done
  done
  echo "Cognito: removed $count user(s) from $POOL."

  if [ "$DB_CLEANUP" = "1" ]; then
    if db_available; then db_destroy_all_accounts; else db_warn_skip; fi
  fi
else
  if [ "$ASSUME_YES" != "1" ] && [ "$DB_CLEANUP" = "1" ]; then
    read -r -p "Delete Cognito user '$TARGET' AND destroy their entire MyPal account (all members + users)? Type 'yes' to confirm: " ans
    [ "$ans" = "yes" ] || { echo "Aborted."; exit 1; }
  fi

  # Best-effort so DB cleanup still runs if the Cognito user is already gone.
  delete_user "$TARGET" || echo "Cognito: '$TARGET' not found or already deleted." >&2

  if [ "$DB_CLEANUP" = "1" ]; then
    if db_available; then db_destroy_account_by_email "$TARGET"; else db_warn_skip; fi
  fi
fi
