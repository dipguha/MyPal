---
name: build_readme
description: Create or update README.md to serve as the human-facing quickstart for the project. Per CONTEXT_CONTRACT.md, README.md owns exactly: what MyPal is, how to run locally (≤5 commands), and links to _workflow/workflow.md and docs/. It must NOT duplicate stack detail, workflow narrative, or rules from CLAUDE.md or subtree files.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash(git branch:*, docker:*, ls:*)
---

# build_readme — README Quickstart Generator

You are writing (or updating) the project's `README.md`. This file has a strictly bounded scope defined in `CONTEXT_CONTRACT.md`:

> **README.md owns:** Human-facing quickstart — what MyPal is, how to run locally (≤5 commands), links to `_workflow/workflow.md` and `docs/`.
> **README.md must NOT contain:** A parallel workflow narrative. Stack detail. Any rule duplicated from CLAUDE.md.

Do not expand beyond this scope. If something belongs in `CLAUDE.md`, `backend/CLAUDE.md`, `_workflow/workflow.md`, or any other file per `CONTEXT_CONTRACT.md`, put a pointer link there — not the content itself.

---

## Input

No arguments required. Run as:

```
/build_readme
```

If `README.md` already exists and has meaningful content, update it in place. If it is a placeholder, write it from scratch.

---

## Pre-flight

Read these files before writing anything — to get accurate commands, port numbers, and links:

1. `CLAUDE.md` (root) — product name, one-line stack description, locale
2. `CONTEXT_CONTRACT.md` — confirm scope boundary (do not exceed it)
3. `docker-compose.yml` (root or `backend/`) — actual service name and port for Postgres
4. `backend/CLAUDE.md` — exact Rails dev commands and port
5. `frontend/CLAUDE.md` — exact Next.js dev commands and port
6. `backend/.env.example` — confirm the env file name to copy
7. `frontend/.env.example` or `.env.local.example` — confirm the env file name to copy

Use Glob to check whether `docker-compose.yml` lives at root or inside `backend/`. Use the actual service name and port — never invent them.

---

## What to write

### 1. One-paragraph overview
What MyPal is, who it's for, and the tech stack in one sentence. 4–6 sentences maximum. No feature list.

### 2. Quick start (≤5 commands)
The minimum set of commands to get from a fresh clone to a running app. Number them. Use code blocks. Cover:

1. Copy the env files and fill in values (one command per service — check actual file names)
2. Start Postgres in Docker
3. Set up the database (create + migrate + seed)
4. Start the Rails API
5. Start the Next.js dev server

Do not break these into more than 5 steps. If steps can be combined (e.g. a `make setup` or script exists), use them. Verify actual commands against `backend/CLAUDE.md` and `frontend/CLAUDE.md`.

After the commands, add one line: where the app is accessible (e.g. `App: http://localhost:3000 · API: http://localhost:3001`).

### 3. Where to go next
A short table of links — no descriptions beyond a few words. Link to the files that own the detail, not the detail itself:

| | |
|---|---|
| Developer setup in depth | `backend/CLAUDE.md`, `frontend/CLAUDE.md` |
| Architecture and decisions | `docs/architecture.md`, `docs/adrs.md` |
| How Cowork and Claude Code work together | `_workflow/workflow.md` |
| Design system and UI tokens | `docs/design-system.md` |
| Feature specs | `_specs/` |

Only include files that actually exist. Do not list placeholder files.

---

## Format rules

- Total README length: aim for under 60 lines
- Use `##` for the three sections above — no deeper nesting
- UK English throughout
- No revision history table — that belongs in CLAUDE.md files
- No branch naming rules, commit conventions, env var tables, linting commands, or locale rules — those live in their respective owner files

---

## After saving

Tell the user:
- `README.md` written (or updated) — length in lines
- Any commands you could not verify from the codebase (flag these so the user can correct them)
- Remind them to commit: `git add README.md && git commit -m "docs: update README.md"`
