# Changelog — [Feature name]

**Date:** [YYYY-MM-DD]
**Git branch:** `[claude/feature/<slug>]`
**Spec:** `_specs/[area]--[module].md`
**Plan:** `_plans/[slug]_tech.md`

[1–3 sentences: what shipped and why it matters. Write for someone scanning the changelog months from now who did not follow the implementation.]

---

## Highlights

> The two things readers care about most. Fill these even if the detail sections below repeat them. If a row genuinely doesn't apply, write "None".

- **New database tables:** [`table_a`, `table_b` — one phrase each — or "None"]
- **New architecture / patterns:** [new layer, integration, auth boundary, cross-cutting style — or "None". If anything here is non-trivial, it MUST also appear in `MyDigitalPal_architecture.md`.]

---

## Database

*(Omit this whole section only if the feature made no schema change.)*

- **Migration:** `backend/alembic/versions/[revision_id].py` (revises `[down_revision]`).
- **New tables:**
  - **`[table_name]`** — [purpose in one line]. Key columns: [`col` (type/enum), …]. [Scoping: `account_id` / `member_id`; soft-delete? unique constraints?]
- **New enums / types:** [`enum_name` (values) — or "None"]
- **New columns on existing tables:** [`table.column` (type) — purpose — or "None"]
- **Indexes:** [name + columns + partial predicate — or "None"]
- **RLS policies:** [policy name + table + the rule, e.g. "account-scoped via `current_setting('app.member_id')`" — or "None". Note if the app connects as table owner and RLS is a backstop only.]
- **CHECK constraints / views:** [list — or "None"]
- **Database cleanup:** [tables/columns/indexes/views dropped or rewritten in the same migration, per the plan's cleanup section — or "None"]
- **Seed data:** [what was inserted, e.g. "10 predefined recipes" — or "None"]

---

## Architecture & patterns

*(Omit only if nothing architectural changed.)*

- **New / changed:** [new service, layer, external integration, auth/security boundary, or a pattern that future code should follow. Be explicit — this is the section a new engineer reads to understand "what's different now".]
- **Architecture doc:** [updated `MyDigitalPal_architecture.md` §X.Y / no architectural change to record]
- **Deviations from the plan's "Decisions captured":** [anything implemented differently from the plan, and why — or "None"]

---

## API changes

*(Omit if no backend endpoints changed.)*

| Method | Path | Purpose |
|--------|------|---------|
| [GET] | `[/api/v1/...]` | [what it does + access gate] |

- **Access / role gates:** [who can call what; where enforced — service vs router — or "n/a"]

---

## Frontend changes

*(Omit if no frontend change.)*

- **Routes:** [new pages / route-group layouts — e.g. "`(app)/recipes/library` + area subnav layout" — or "None"]
- **Components:** [notable new components in `src/components/<area>/` — or "None"]
- **Hooks / data:** [new TanStack Query hooks, `src/lib/api` additions — or "None"]

---

## Config / env / dependencies

- **New env vars:** [`VAR_NAME` — purpose; added to `.env.example`? — or "None"]
- **New dependencies:** [package + why; backend `pyproject.toml` / frontend `package.json` — or "None"]
- **Other config:** [CI, docker, infra — or "None"]

---

## Files

### Created
- [`path/to/file` — role]

### Modified
- [`path/to/file` — what changed]

### Deleted
- [`path/to/file` — why — or "None"]

---

## Verification snapshot

- [Migration applied: `uv run alembic upgrade head` → result]
- [Backend: `uv run pytest` → **N passed**; `uv run ruff check .` / `uv run mypy app` → clean]
- [Frontend: `npm run typecheck` → clean (+ lint status / note if eslint not configured)]
- [Manual / end-to-end checks performed and their outcome]

---

## Deferred / follow-up

- [Anything explicitly out of scope, deferred to a later phase, or left as a decision — carry over the plan's Open follow-ups that remain open]
