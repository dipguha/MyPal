---
name: change_log
description: Record the important, relevant changes from a completed implementation into a dated changelog file under _changelog/. Use this skill whenever the user runs /change_log, asks Claude to "write a changelog", "record what changed", "log this implementation", or at the end of /tech_implement. The skill inspects git history, the migration files, the plan, and the architecture doc, then writes a structured entry highlighting new database tables and new architecture/patterns.
argument-hint: feature slug or plan path (optional — inferred from the branch if omitted)
allowed-tools: Read, Write, Glob, Grep, Bash(git status:*, git branch:*, git log:*, git diff:*, ls:*, date:*)
---

# change_log — Implementation Changelog Recorder

You are writing a changelog entry that records the important, relevant changes from a completed implementation. The audience is a developer scanning `_changelog/` months later who did **not** follow the work. Two things matter most to the reader and must always be answered explicitly: **what new database tables were introduced**, and **what new architecture or patterns were added**.

This is a record of what *did* happen, written from the actual diff and migrations — not a plan of what *should* happen. Never invent changes; only report what the git history and files show.

## Input

The user may provide a feature slug or a plan path:

```
/change_log recipes--library
/change_log _plans/recipes--library_tech.md
```

If nothing is provided, infer the feature slug from the current branch (`claude/feature/<slug>` → `<slug>`) and find the matching `_plans/<slug>_tech.md` and `_specs/<area>--<module>.md`. If you cannot confidently resolve the feature, ask the user before proceeding.

---

## Workflow

### 1. Establish scope
- Run `git branch --show-current` to get the branch and derive the feature slug.
- Run `git log main..HEAD --oneline` and `git diff --stat main...HEAD` to see every commit and file touched on this branch since it diverged from `main`. This is the source of truth for what changed — base the changelog on it, not on the plan's intentions.
- Read the plan (`_plans/<slug>_tech.md`) for context: its "Decisions captured", "Database cleanup", and "Open follow-ups" sections. Read the spec header for the feature name and traceability.

### 2. Mine the database changes (priority)
- Identify any new Alembic migration file(s) in `backend/alembic/versions/` introduced on this branch (`git diff --stat main...HEAD -- backend/alembic/versions/`).
- Read each new migration and extract, precisely:
  - **New tables** — name, purpose, key columns, scoping (`account_id` / `member_id`), soft-delete, unique constraints.
  - **New enums / types**, **new columns on existing tables**, **indexes**, **RLS policies**, **CHECK constraints**, **views**, and **seed data**.
  - **Database cleanup** — anything dropped or rewritten in the same migration.
- These populate the **Highlights → New database tables** line and the **Database** section. If there was no schema change, say so explicitly ("None") rather than omitting the answer.

### 3. Mine the architecture / pattern changes (priority)
- Check whether `MyDigitalPal_architecture.md` was modified on this branch (`git diff main...HEAD -- MyDigitalPal_architecture.md`) and summarise what was added.
- Look for new services, layers, external integrations, auth/security boundaries, or cross-cutting patterns a future contributor must know about (e.g. a new RLS model, a new BFF route shape, a new per-area layout convention).
- Note any deviation from the plan's "Decisions captured". These populate **Highlights → New architecture / patterns** and the **Architecture & patterns** section.

### 4. Mine the remaining changes
- **API:** new routers/endpoints under `backend/app/api/` (method, path, purpose, access gate).
- **Frontend:** new routes/layouts under `src/app/(app)/`, components under `src/components/`, hooks, and `src/lib/api` additions.
- **Config / env / dependencies:** new env vars (and whether added to `.env.example`), new packages in `pyproject.toml` / `package.json`, CI/docker/infra changes.
- **Files:** created / modified / deleted (derive from `git diff --stat main...HEAD`; keep it to the meaningful files, not every lockfile line).
- **Verification:** pull the verification results from the implementation's completion report if available in the conversation, or from test output you can see; otherwise state what was run.

### 5. Write the entry
- Read `.claude/commands/references/changelog_template.md` and follow its structure exactly.
- Fill every section. Omit a whole section **only** when the template says it is omittable and that area genuinely had no change. For the two Highlights lines, never omit — write "None" if nothing applies.
- Keep it factual and concise. Bullet points over prose. Reference real file paths and the real migration revision id.

### 6. Save
- Get the timestamp: `date -u +"%Y%m%d%H%M%S"`.
- Save to `_changelog/<timestamp>_<feature-slug>.md` (matches the existing `YYYYMMDDHHMMSS_<slug>.md` naming in `_changelog/`).
- Confirm the saved path to the user and show the two Highlights lines so they can see at a glance what was recorded.

---

## Quality bar

Before saving, check:
- **The two Highlights questions are answered.** New tables and new architecture are stated explicitly (or "None") — this is the whole point of the file.
- **Every claim traces to the diff or a file.** No aspirational entries; if the plan said it but the code doesn't show it, it doesn't go in.
- **Migration detail is exact.** Real revision id, real table/column/enum/policy names.
- **No secrets.** Env var names only, never values.
- **Filename matches convention** (`_changelog/<YYYYMMDDHHMMSS>_<slug>.md`).
