# MyPal — Product Workflow

| | |
|---|---|
| **File** | `_workflow/workflow.md` |
| **Purpose** | Single source of truth for how Cowork and Claude Code work together to take a feature from idea to merged PR |
| **Version** | 0.4 |
| **Updated by** | Cowork |
| **Last updated** | 12/06/2026 UTC |

> Revision history is at the bottom of this file.

---

## Overview

```
Cowork (design)                  Claude Code (build)             GitHub
  │                                     │                           │
  ├─ 0. Create feature branch           │                           │
  │    claude/feature/<slug>            │                           │
  │                                     │                           │
  ├─ 1. Discuss module design           │                           │
  │                                     │                           │
  ├─ 2. Update prototype                │                           │
  │    ui_working/mypal-app-working.jsx │                           │
  │                                     │                           │
  ├─ 3. Dip approves                    │                           │
  │    → copies to mypal-app.jsx        │                           │
  │    → commits on feature branch      │                           │
  │                                     │                           │
  ├─ 4. Write feature spec              │                           │
  │    _specs/[area]--[module].md       │                           │
  │                                     │                           │
  ├─ 5. Dip reviews spec ──────────────▶│                           │
  │                                     ├─ 6. /tech_spec            │
  │                                     │    _plans/<slug>_tech.md  │
  │                                     │                           │
  │                                     ├─ 7. Dip reviews plan      │
  │                                     │                           │
  │                                     ├─ 8. Rebase onto main      │
  │                                     │    (if main has new work) │
  │                                     │                           │
  │                                     ├─ 9. /tech_implement       │
  │                                     │    (commits per phase)    │
  │                                     │                           │
  │                                     ├─ 10. Open PR ────────────▶│
  │                                     │                           ├─ Review
  │                                     │                           └─ Merge → main
```

**Parallel features:** A new feature branch can be started from `main` at any time — Cowork works on `branch02` while Code implements `branch01`. Once `branch01` merges, Code rebases `branch02` onto `main` before implementation begins.

---

## Cowork Workflow

Cowork handles all UI design and feature spec writing. Every session follows this process.

### Step 0 — Branch check (before any file edit)

Before touching any file, check the current branch:

```bash
git status          # must be clean — no uncommitted changes
git branch          # check which branch you're on
```

- If on `main`: create a feature branch first — `git checkout -b claude/feature/<area>--<module>`
- If already on a feature branch: continue
- **Never edit any file while on `main`**

Branch naming: `claude/feature/<area>--<module>` (e.g. `claude/feature/account--access`, `claude/feature/life-admin--tasks`)

### Step 1 — Orient

Read these in order before discussing anything:

```
_UI/CLAUDE.md                          ← editing rules, shared constants, post-edit checklist
_UI/ui-prototype.md                    ← structural guide (SUBNAV map, CSS classes, design contract)
_UI/ui_working/mypal-app-working.jsx   ← Cowork's working copy — read the relevant section only
```

**Do not read the whole JSX file.** It is large (~400KB). Use `grep` or `Read` with an offset to locate the specific screen function or component. Read 30–50 lines of context around the insertion point.

After reading, identify the shared helpers you will reuse: which `T.xxx` tokens, which style constants (`fldLbl`, `fldInp`, `modalShell`, `rowBase`), which CSS classes (`.btn-sm`, `.card`, etc.). You will name these explicitly in Step 3.

### Step 2 — Discuss

Understand what needs to change before proposing anything. Ask clarifying questions. Summarise your understanding before moving to a proposal.

### Step 3 — Propose

Describe the proposed changes in chat. **Do not touch any file at this stage.** The proposal must include:

1. **What changes** — which section/component and what it does differently
2. **Where** — the screen function name and approximate location in the file
3. **Shared helpers to reuse** — name every `T.xxx` token, style constant (`fldLbl`, `modalShell`, etc.), and CSS class (`.btn-sm`, `.card`, etc.) the change will use
4. **New state or data** — any new `useState` hooks or local data constants being added

A proposal that says "I'll add a modal" without naming `modalShell`, `fldLbl`, and `fldInp` is incomplete. Dip should be able to verify the approach from the proposal alone.

### Step 4 — Await explicit approval

Only proceed after Dip gives one of these explicit approval signals:

> **"looks good"** · **"approved"** · **"do it"**

A discussion or a "yes that sounds right" does not count. Prior concept agreement does not count. Wait for the phrase.

### Step 5 — Edit the file

Make the approved changes to:

```
_UI/ui_working/mypal-app-working.jsx   ← only file Cowork ever edits
```

**Never edit `_UI/mypal-app.jsx`** — that is Dip's manually maintained approved copy, used by Claude Code as the visual contract.

**No widget previews** unless Dip explicitly asks ("show me a preview", "show the widget"). Go straight to editing once approved.

### Step 6 — Close-out reminder

After Dip confirms the result, remind them to:

- Copy `mypal-app-working.jsx` → `mypal-app.jsx`
- Commit on the feature branch using the convention: `feat/<feature-slug>: <description>`
- Update `_specs/[area]--[module].md` if design decisions were made during the session
- Update `_UI/ui-prototype.md` if any of the following changed:
  - Area or module structure (section 9.1 table)
  - SUBNAV tab names (section 5)
  - Notable design details for a newly completed module (section 9.2)
  - Do **not** update line number ranges in section 2 — these drift constantly

---

## Claude Code Workflow

Claude Code handles technical planning and implementation. It works from the approved prototype and feature spec produced by Cowork.

### Step 1 — Switch to the feature branch

The feature branch will already exist — created by Cowork in its Step 0. Switch to it:

```bash
git checkout claude/feature/<area>--<module>
git status   # confirm clean working tree
```

If the branch does not exist (spec-only session with no prior Cowork file edits), create it now following the same naming convention.

**Spec naming convention:** `[area]--[module].md` — double hyphen between area and module, single hyphens within each slug, all lowercase. See CLAUDE.md for the area slug table.

### Step 2 — Review spec (Dip)

Before handing to Claude Code, check:
- Scope is correct (in scope / out of scope)
- Section 13 (Open questions) — all items resolved or formally deferred
- Functional requirements and acceptance criteria are complete

### Step 3 — Write tech plan (`/tech_spec`)

```
/tech_spec _specs/[area]--[module].md
```

Pre-flight checks (command aborts if any fail):
- Clean working tree
- On a `claude/feature/*` branch (not `main`)
- Unresolved open questions surfaced and confirmed

The command reads the spec, explores the real codebase (no invented paths), identifies layers touched, and writes a phase-by-phase plan to:

```
_plans/<slug>_tech.md
```

**UI reference:** Claude Code reads `_UI/mypal-app.jsx` (the approved canonical file) as the visual contract. It never reads the working file.

### Step 4 — Review tech plan (Dip)

Check:
- Phases are sensibly ordered (each independently testable where possible)
- All file paths match the real codebase
- Architectural decisions are justified with a "because" clause
- Open follow-ups are tagged

### Step 5 — Rebase onto main (if needed)

Before implementation begins, check whether `main` has new commits that aren't in the current branch (e.g. another feature was merged while this one was being designed):

```bash
git fetch origin
git log origin/main --oneline --not HEAD   # any commits listed = main is ahead
```

If `main` has new commits, rebase:

```bash
git rebase origin/main
```

Resolve any conflicts, then proceed. This keeps the branch up to date and ensures the final PR merges cleanly. If there are no new commits on `main`, skip this step.

### Step 6 — Implement (`/tech_implement`)

```
/tech_implement _plans/<slug>_tech.md
```

Implements the plan phase by phase. Commits at the end of each verified phase using conventional commits:

```
feat(<feature-slug>): short description
fix(<feature-slug>): short description
chore(<feature-slug>): short description
```

### Step 7 — Open PR

PR from `claude/feature/<slug>` → `main`. Dip reviews and merges.

---

## Branching Strategy

### One branch per feature

All work for a feature — prototype changes, spec, tech plan, implementation — happens on a single branch:

```
claude/feature/<area>--<module>
```

The branch is created by **Cowork** at the start of design (Step 0), before any file is touched. Code switches to the same branch when implementation begins.

### Parallel features

A second feature can be designed in Cowork while Code is implementing the first. Create the new branch from `main`:

```bash
git checkout main
git pull origin main
git checkout -b claude/feature/<area>--<module-2>
```

The two branches are independent. Each contains its own version of `mypal-app-working.jsx` with changes scoped to its module — conflicts are unlikely since modules live in different sections of the file.

### Keeping a branch in sync after another feature merges

When `branch01` merges to `main`, `branch02` is behind. Before Code begins implementing `branch02`, rebase it:

```bash
git checkout claude/feature/<area>--<module-2>
git fetch origin
git rebase origin/main
```

This replays `branch02`'s commits on top of the updated `main`, picking up all changes from `branch01` with a clean linear history. Resolve any conflicts as they arise.

```
main ──── A ──── B (branch01 merged) ──────────────────── D (branch02 merged)
                  \                                        /
branch02           C ──── rebase ──── C' ───────────────/
```

**When to rebase:** Code checks at Step 5 (before `/tech_implement`) whether `main` has new commits. If yes, rebase before starting. Cowork does not need to rebase — it works on the branch independently.

---

## Key Rules (both Cowork and Claude Code)

| Rule | Detail |
|------|--------|
| **Source of truth for reads** | `~/Documents/project/MyPal/` — the git repo. Never read from `~/Documents/Claude/Projects/MyDigitalPals/` (write-only outputs folder) |
| **UI visual contract** | `_UI/mypal-app.jsx` — approved, canonical. Claude Code reads this. Cowork never edits this directly |
| **UI working copy** | `_UI/ui_working/mypal-app-working.jsx` — Cowork edits this only. Dip copies to canonical after approval |
| **One branch per feature** | All work (spec → plan → implementation) happens on the same `claude/feature/<slug>` branch |
| **Never commit to main** | All changes go through a PR |
| **Schema changes** | Always via Alembic revisions — never edit `mypal-schema.sql` directly |
| **Currency** | GBP (£) — e.g. £2.99/mo, £4.99/mo |
| **Date format** | DD/MM/YYYY (displayed as DD-Mon-YYYY in UI, e.g. 24-May-2026) |
| **Language** | UK English — "authorise" not "authorize", "organisation" not "organization" |
| **Plan tier labels** | "Individual" (not `solo`) and "Family" (not `family`) — never expose raw DB enum values |
| **Variable renames in prototype** | Always use `replace_all: true` on the Edit tool when renaming any variable in the JSX prototype. Immediately after, grep for the old name to confirm zero remaining references before moving on. Targeted edits miss cross-component usages (e.g. `REC_LIB` → `recipes` broke `RECIPE_OPTIONS` in Meal Planner). |

---

## File Reference

| What | Path |
|------|------|
| UI working file (Cowork edits) | `_UI/ui_working/mypal-app-working.jsx` |
| UI approved file (Claude Code reads) | `_UI/mypal-app.jsx` |
| UI structural guide | `_UI/ui-prototype.md` |
| Feature specs | `_specs/[area]--[module].md` |
| Tech plans | `_plans/<slug>_tech.md` |
| Spec template | `.claude/commands/references/feature_spec_template.md` |
| Tech plan template | `.claude/commands/references/tech_plan_template.md` |
| Slash commands | `.claude/commands/` |
| Architecture doc | `docs/architecture.md` |
| Architecture decisions (ADRs) | `docs/adrs.md` |
| UI prototype editing rules | `_UI/CLAUDE.md` |
| This file | `_workflow/workflow.md` |

---

## Open Items

- [ ] `README.md` needs updating: (1) Step 1 incorrectly states Cowork shows widget previews before editing — no widget previews unless explicitly asked; (2) Step 1 references `mypal-app.jsx` as the file Cowork edits directly — it should reference the working file `ui_working/mypal-app-working.jsx`

---

## Revision History

| Version | Updated by | Last updated (UTC) | Summary of changes |
|---------|------------|--------------------|--------------------|
| 0.1 | Dip | 27/05/2026 | Initial version — captures Cowork 6-step UI workflow (orient, discuss, propose, approve, edit, close-out) and Claude Code 6-step workflow (/feature_spec → /tech_spec → /tech_implement → PR); approval phrases defined; no-widget rule; working file vs canonical file distinction; replaces COWORK.md |
| 0.2 | Dip | 27/05/2026 | Branching strategy finalised — Cowork creates branch before any file edit (Step 0); branch naming claude/feature/<area>--<module>; parallel feature branches created from main; Code rebases onto main before /tech_implement if main has new commits; branching strategy section added |
| 0.3 | Dip | 28/05/2026 11:36 | Aligned the header and revision-history format to the CLAUDE.md convention: `Last updated by` → `Updated by`, added a Version row, timestamps now carry a UTC label, and history columns renamed to Version / Updated by / Last updated (UTC) / Summary of changes. |
| 0.4 | Cowork | 12/06/2026 UTC | Strengthened Cowork Step 1 (Orient): mandates reading _UI/CLAUDE.md first, then ui-prototype.md, then the relevant JSX section; requires naming shared helpers after orienting. Strengthened Step 3 (Propose): proposal must name the T.xxx tokens, style constants, and CSS classes to be reused. Fixed stale source-of-truth path (MyDigitalPals → project/MyPal). Updated File Reference table to remove old-project files and add correct paths. |
