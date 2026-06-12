#!/usr/bin/env bash
# Start the MyPal backend (FastAPI on :8000) and frontend (Next.js on :3000)
# together in one terminal. Ctrl+C stops both cleanly.
#
# Usage:  ./scripts/dev.sh
# Logs:   tail -f /tmp/mypal-backend.log
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_LOG="/tmp/mypal-backend.log"
BACKEND_PID=""

cleanup() {
  echo ""
  echo "→ Stopping backend (pid ${BACKEND_PID})…"
  if [[ -n "${BACKEND_PID}" ]] && kill -0 "${BACKEND_PID}" 2>/dev/null; then
    kill "${BACKEND_PID}" 2>/dev/null || true
    wait "${BACKEND_PID}" 2>/dev/null || true
  fi
  echo "✓ Stopped."
}
trap cleanup EXIT INT TERM

echo "→ Starting backend  (FastAPI on http://localhost:8000)"
echo "  logs: ${BACKEND_LOG}"
(
  cd "${REPO_ROOT}/backend"
  uv run uvicorn app.main:app --reload
) >"${BACKEND_LOG}" 2>&1 &
BACKEND_PID=$!

echo "→ Starting frontend (Next.js on http://localhost:3000)"
echo ""
cd "${REPO_ROOT}/frontend"
exec npm run dev
