---
name: tech_architecture
description: Create or update the system architecture document at docs/architecture.md, and keep docs/adrs.md in sync with any architectural decisions surfaced. Use this skill whenever the user runs /tech_architecture, asks Claude to "write/update the architecture doc", "document the architecture", "record an ADR", or after a feature changes the system shape (new service, auth boundary, data model, infra). The skill reads the ADR log, the per-area CLAUDE.md files, the real codebase (frontend, backend, db, infrastructure), then writes docs/architecture.md from the template and proposes ADR additions/updates.
argument-hint: optional — a feature slug, plan path (_plans/<slug>_tech.md), or a free-text decision to record as an ADR
allowed-tools: Read, Write, Edit, Glob, Grep, Bash(git status:*, git branch:*, git log:*, git diff:*, ls:*, find:*, date:*)
---

# tech_architecture — Architecture Document & ADR Maintainer

You maintain two authoritative documents and keep them consistent with each other and with the real codebase:

- **`docs/architecture.md`** — the orientation map: components, request flow, auth, data, deployment (the *how*).
- **`docs/adrs.md`** — the decision log (the *why*).

The architecture doc is **synthesis, not invention** — every claim must trace to a real file, a CLAUDE.md rule, or an ADR. The doc describes the **target design** and marks anything not yet built with _(not yet built)_ rather than pretending it exists or silently omitting it. The architecture doc never contradicts an ADR: if the design has genuinely changed, the ADR is updated first, then the architecture doc reflects it.

## Input

```
/tech_architecture                              # full refresh against the current codebase + ADRs
/tech_architecture platform--access-control     # fold a just-implemented feature into the doc
/tech_architecture _plans/recipes--library_tech.md
/tech_architecture adr "Use SQS for outbound email"   # record a specific new decision
```

Argument is optional. Resolve the mode in step 0.

---

## Step 0 — Resolve mode & pre-flight

1. **Mode.**
   - No argument → **Full refresh**: re-derive the whole document from the current codebase and ADRs, correcting drift.
   - A feature slug or `_plans/*.md` path → **Feature fold-in**: focus the update on what that feature changed (read its plan's "Decisions captured", "Database cleanup", and the matching `_changelog/` entry if present), then reconcile the rest of the doc.
   - `adr "<text>"` → **ADR-first**: record the stated decision as an ADR (step 4), then reflect it in the architecture doc.
2. **Does `docs/architecture.md` exist?** If not → **create** from the template. If it does → **update in place**, preserving the version header and revision history (you will append, not reset).
3. **Branch.** Run `git branch --show-current`. If on `main`/`master`, do not commit there — tell the user and offer to create a `claude/feature/docs--architecture` (or `docs--adr`) branch before writing. Writing the file locally is fine; committing is the user's call (and only when they ask).
4. **Timestamp.** Get the real UTC time with `date -u +"%d/%m/%Y %H:%M UTC"`. Never hand-type the time.

A dirty working tree is acceptable here — the doc may legitimately describe in-progress work. Note it, do not abort.

---

## Step 1 — Gather sources (always, before writing)

Read these in full. They are the only permitted basis for the document.

| Source | Extract |
|---|---|
| `docs/adrs.md` | Every ADR — the architecture doc summarises and links these; it must not restate a decision in a way that conflicts. |
| `CLAUDE.md` (root) | Stack table, auth-model paragraph, account/member/user vocabulary, plan-tier labelling. |
| `backend/CLAUDE.md` | Rails layering, Pundit, Blueprinter, `cognito_jwt_verifier.rb`, current-member resolution. |
| `frontend/CLAUDE.md` | BFF contract, NextAuth v5 session cookie, the `/api/[...path]` proxy, TanStack Query/Zustand, Tailwind v4. |
| `infrastructure/CLAUDE.md` + `infrastructure/` tree | ECS/ALB/RDS/S3/Cognito, Terraform `modules/` + `environments/`, state, OIDC. |
| `db/mypal-schema.sql`, `db/migrate/` | Real data model, account-scoping, core tables. |
| Codebase tree | `frontend/src/` (route groups, `api/` proxy), `backend/` (note scaffolding state honestly), `.github/workflows/` (CI/CD — mark _(not yet built)_ if absent). |

In **feature fold-in** mode also read the feature's `_plans/<slug>_tech.md` and any `_changelog/*<slug>*.md`, and use `git log main..HEAD --oneline` + `git diff --stat main...HEAD` to see what actually changed.

**Ground every path.** Use Glob/Grep/`find` to confirm files exist before you reference them. Never invent a path; if the context map points to something that does not exist, document the gap, do not fabricate it.

---

## Step 2 — Detect architectural decisions (feeds the ADR sync)

While reading, collect anything that is a *decision*, not just a detail: a new service or boundary, a changed auth/authz model, a new cross-cutting pattern, a data-model choice, a deviation from an existing ADR, or a "Decisions captured" entry from a plan that has no ADR yet. Hold these for step 4. If the user passed `adr "<text>"`, that is the decision to record.

---

## Step 3 — Write / update `docs/architecture.md`

Read `.claude/commands/references/architecture_template.md` and follow its structure exactly. Fill every section with real content for this codebase.

- **Create mode:** instantiate the template, set Version `1.0`, stamp Updated by / Last updated, write the first revision-history row.
- **Update mode:** edit the affected sections in place, refresh diagrams that drifted, bump the **Version** (patch/minor/major per the rule in the header), update **Last updated** + **Updated by**, and append a revision-history row summarising the change. Do not wipe prior history.
- Use **Mermaid** for diagrams (renders on GitHub), **UK English**, and the project's GBP/DD-MM-YYYY conventions in any examples.
- Keep it an orientation map, not a data dictionary — capture shapes, invariants, and the request flow; defer exhaustive detail to the source-of-truth files via the §8 cross-reference table.

---

## Step 4 — Sync `docs/adrs.md`

For each decision collected in step 2 (and any explicit `adr "<text>"`):

1. **New decision** → add a new ADR using the template at the bottom of `docs/adrs.md`. Assign the **next free number** (read the index; do not reuse). Fill Context / Decision / Consequences concretely. Add it to the **Index** table and write the body in numerical position.
2. **Changed decision** → never silently rewrite an `Accepted` ADR's Decision. Mark the old one `Superseded by ADR-YYY`, and add a new ADR YYY that states the new decision and references the one it supersedes. This preserves the history of *why it changed*.
3. **Maintenance** → bump the adrs.md **Version**, update **Last updated** (same `date -u` value), set **Updated by**, append a revision-history row.

ADRs are an authoritative log — when in doubt about whether something rises to an ADR, **propose it to the user with a one-line rationale and let them confirm** before writing. Detail-level facts belong in architecture.md, not a new ADR.

Keep the two docs consistent: every ADR touched in this run should be reflected (and linked) in architecture.md, and every architectural claim in architecture.md should have an ADR or a CLAUDE.md rule behind it.

---

## Step 5 — Report

Tell the user:
- The path written (`docs/architecture.md`) and its new version number.
- Each ADR added or superseded (number + title), or "ADR log unchanged" if none.
- Any gaps you documented as _(not yet built)_ or unresolved, so they know what is design-only.
- The branch, and a reminder that committing is their call.

Do not paste the full document back unless asked.

---

## Quality bar

Before finishing, check:
- **No invented paths or components.** Everything traces to a real file, a CLAUDE.md rule, or an ADR. `find`/Glob confirmed each reference.
- **No contradiction with ADRs.** If the doc and an ADR disagree, the ADR was updated first (step 4) — they now agree.
- **Honest about reality.** Not-yet-built parts are marked, not implied as running code (the backend is currently scaffolding-only — say so where relevant).
- **Headers maintained.** Both touched docs have a bumped version, a real `date -u` timestamp, an Updated by, and a new revision-history row; header and latest history row agree.
- **Diagrams valid.** Mermaid blocks parse and match the prose.
- **Orientation, not duplication.** The doc points to source-of-truth files rather than copying schemas or code wholesale.
