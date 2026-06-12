#!/usr/bin/env bash
# Interactive git workflow:
#   1. prompt for a branch name and check it out (creating if needed)
#   2. if there are changes, git add + commit (prompt for message)
#   3. push the branch to origin
#   4. checkout main, merge the branch, push main
#
# Usage:  ./scripts/git-flow.sh
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${REPO_ROOT}"

if ! git rev-parse --git-dir >/dev/null 2>&1; then
  echo "✗ Not inside a git repo: ${REPO_ROOT}" >&2
  exit 1
fi

MAIN_BRANCH="main"

# ── 1. Branch name ────────────────────────────────────────────────────
CURRENT_BRANCH="$(git branch --show-current)"
echo "Current branch: ${CURRENT_BRANCH}"
read -r -p "Branch to work on: " BRANCH
if [[ -z "${BRANCH}" ]]; then
  echo "✗ No branch name provided." >&2
  exit 1
fi
if [[ "${BRANCH}" == "${MAIN_BRANCH}" ]]; then
  echo "✗ Refusing to run this workflow with the branch set to ${MAIN_BRANCH}." >&2
  echo "  This script merges <branch> -> ${MAIN_BRANCH}; pick a feature branch." >&2
  exit 1
fi

# ── 2. Checkout (create if missing) ───────────────────────────────────
if [[ "${CURRENT_BRANCH}" != "${BRANCH}" ]]; then
  if git show-ref --verify --quiet "refs/heads/${BRANCH}"; then
    echo "→ Checking out existing branch ${BRANCH}"
    git checkout "${BRANCH}"
  else
    echo "→ Creating new branch ${BRANCH} from ${CURRENT_BRANCH}"
    git checkout -b "${BRANCH}"
  fi
else
  echo "→ Already on ${BRANCH}"
fi

# ── 3. Stage + commit (only if there are changes) ─────────────────────
# `git status --porcelain` lists modified/added/deleted/untracked; empty = clean.
if [[ -n "$(git status --porcelain)" ]]; then
  echo ""
  echo "Changes to commit:"
  git status --short
  echo ""
  read -r -p "Commit message: " MSG
  if [[ -z "${MSG}" ]]; then
    echo "✗ No commit message — aborting before commit." >&2
    exit 1
  fi
  git add -A
  git commit -m "${MSG}"
  echo "✓ Committed."
else
  echo "→ No changes to commit; skipping commit step."
fi

# ── 4. Push branch (handles first push + updates) ─────────────────────
echo ""
echo "→ Pushing ${BRANCH} to origin"
# -u sets upstream on first push and is a no-op once already set.
git push -u origin "${BRANCH}"

# ── 5. Merge into main and push ───────────────────────────────────────
echo ""
read -r -p "Merge ${BRANCH} into ${MAIN_BRANCH} and push? [y/N] " CONFIRM
if [[ ! "${CONFIRM}" =~ ^[Yy]$ ]]; then
  echo "→ Skipping merge. Branch ${BRANCH} pushed; main untouched."
  exit 0
fi

echo "→ Checking out ${MAIN_BRANCH}"
git checkout "${MAIN_BRANCH}"

echo "→ Pulling latest ${MAIN_BRANCH} from origin"
git pull --ff-only origin "${MAIN_BRANCH}" || {
  echo "✗ Could not fast-forward ${MAIN_BRANCH}. Resolve manually and re-run." >&2
  exit 1
}

echo "→ Merging ${BRANCH} into ${MAIN_BRANCH}"
git merge --no-ff "${BRANCH}" -m "Merge branch '${BRANCH}'"

echo "→ Pushing ${MAIN_BRANCH} to origin"
git push origin "${MAIN_BRANCH}"

echo ""
echo "✓ Done. ${BRANCH} merged into ${MAIN_BRANCH} and pushed."
