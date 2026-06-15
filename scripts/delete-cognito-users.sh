#!/usr/bin/env bash
#
# Delete users from the MyPal Cognito user pool.
#
# Usage:
#   scripts/delete-cognito-users.sh <username-or-email>   Delete a single user
#   scripts/delete-cognito-users.sh --all                 Delete ALL users (prompts)
#   scripts/delete-cognito-users.sh --all --yes           Delete ALL users (no prompt)
#   scripts/delete-cognito-users.sh --help                Show usage
#
# Config is resolved from environment variables first, then backend/.env:
#   COGNITO_USER_POOL_ID, AWS_REGION
#
# Requires: AWS CLI configured with credentials that have
#   cognito-idp:ListUsers and cognito-idp:AdminDeleteUser on the pool.
#   (The project's backend/.env has the Cognito *client* creds but no AWS IAM
#    credentials — run this from an AWS-configured shell.)
#
# NOTE: --all permanently removes EVERY user in the pool. It does not touch the
#   Postgres DB; to also clear local rows:
#     docker compose run --rm backend bin/rails runner "Account.destroy_all"

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
Delete users from the MyPal Cognito user pool.

Usage:
  $(basename "$0") <username-or-email>    Delete a single user
  $(basename "$0") --all [--yes]          Delete ALL users (--yes skips the prompt)

Pool:   ${POOL:-<unset>}
Region: ${REGION:-<unset>}
EOF
}

case "${1:-}" in
  -h | --help | "") usage; [ -z "${1:-}" ] && exit 1 || exit 0 ;;
esac

# --- preconditions ---
command -v aws >/dev/null 2>&1 || { echo "Error: aws CLI not found on PATH." >&2; exit 1; }
if [ -z "${POOL:-}" ] || [ -z "${REGION:-}" ]; then
  echo "Error: COGNITO_USER_POOL_ID and AWS_REGION must be set (env or backend/.env)." >&2
  exit 1
fi

delete_user() {
  aws cognito-idp admin-delete-user \
    --user-pool-id "$POOL" --region "$REGION" --username "$1"
  echo "deleted: $1"
}

if [ "$1" = "--all" ]; then
  if [ "${2:-}" != "--yes" ]; then
    read -r -p "Delete ALL users from pool $POOL ($REGION)? Type 'yes' to confirm: " ans
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
  echo "Done. Removed $count user(s) from $POOL."
else
  delete_user "$1"
fi
