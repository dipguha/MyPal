---
name: tech_spec
description: Generate a detailed technical implementation plan from a feature spec file. Use this skill whenever the user runs /tech_spec, asks Claude to "write a tech spec", "create a technical plan", "plan the implementation of", or references a file in _specs/. The skill reads the spec, explores the codebase, and produces a full plan saved to _plans/ covering architecture decisions, phase-by-phase tasks, real file paths, code snippets, and verification steps.
allowed-tools: Read, Write, Glob, Grep, Bash(git status:*, git branch:*, git log:*, mkdir:*)
---

# tech_spec — Technical Implementation Planner

You are writing a technical plan that a developer (or Claude acting as one) will follow to implement a feature end-to-end. The goal is a document that is specific enough to start coding from — not a vague outline, but a real plan with real paths, real code shapes, and real gotchas called out.

## Input

The user provides (or implies) a spec file path, e.g.:

```
/tech_spec _specs/home-page.md
/tech_spec _specs/user-signup.md
```

If `_specs/` path is not provided, add it (i.e. `/tech_spec home-page.md` becomes `/tech_spec _specs/home-page.md`).

If no path is given, look for the most recently modified file in `_specs/` and confirm with the user before proceeding.

---

## Pre-flight checks

Complete these before doing anything else. Stop and report to the user if any check fails.

### Check 1 — Clean working tree
Run `git status --short`. If there are any uncommitted, unstaged, or untracked files, abort and tell the user to commit or stash changes first. Do not proceed.

### Check 2 — Feature branch
Run `git branch --show-current`. If the current branch is `main` or `master`, abort. The spec should have been written on a `claude/feature/*` branch by Cowork. Tell the user to switch to the correct feature branch before running `/tech_spec`.

### Check 3 — Unresolved open questions
Read the spec file and scan section `## 13. Open questions` for any unchecked items (`- [ ]`). If unresolved questions exist, list them and ask the user to confirm they are happy to proceed with them unresolved, or to resolve them first. Do not silently skip this.

---

## Workflow

Work through these steps in order. Steps 1–3 are research; steps 4–11 are writing.

### 1. Read the spec

Read the spec file in full. Extract:
- **Feature name** — used as the plan title and filename
- **User-facing goal** — what problem does this solve?
- **Scope** — what's explicitly in/out of scope?
- **Key flows** — happy path, error paths, edge cases
- **Integrations** — external APIs, third-party services, constraints
- **Open questions** — surface any unresolved items in the Open follow-ups section of the plan

### 2. Explore the codebase

Before writing anything, explore the actual project. Use Glob and Grep to find:
- Directory structure (top-level, then drill into relevant areas)
- Existing auth patterns (if the feature involves users/sessions)
- Existing API route conventions
- Database schema files or ORM models
- Shared utilities and hooks the feature will reuse or extend
- Config files that may need updating (env vars, CI, infra)

The plan must reference **real paths** from this exploration — never invent file names.

**If the feature has a frontend layer**, do the following before writing any frontend tasks:

1. Read the relevant screen(s) in `_UI/mypal-app.jsx`. The prototype is the visual contract — the plan must describe implementing what is shown there. Note the component hierarchy, copy, and interaction patterns; reference them explicitly in the Phase tasks.
2. Read `docs/ui-components.md` — the canonical reference for every shared primitive (`Button`, `BtnSm`, `Input`, `Modal`, `Tabs`, `ListRow`, `Card`, `Chip`, `Collapsible`, `FormError`, `RadioCard`).
3. Read each file in `frontend/src/components/ui/` — the source is authoritative; use the actual prop names and variant strings in the plan.

The plan's Phase tasks must reference existing primitives wherever they apply. Never plan to hand-roll a button, modal, or input — that's what causes style drift.

### 3. Identify the layers

Map the feature to the stack. For each layer that's touched, note:
- What already exists that you'll extend
- What needs to be created from scratch
- What shared/reusable pieces can be used

Typical layers: Infrastructure · Database · Backend API · Frontend · Tests · Config/Env

#### 3a. Find obsolete database objects (mandatory when the schema changes)

If the feature touches the database — even adding a single column — pause and check what the new design **replaces**. Pre-launch features have no migration cost, so superseded objects should be removed in the same migration rather than left dangling.

Run targeted searches over `mypal-schema.sql`, `backend/alembic/versions/`, and `backend/app/models/` for every concept the new design supplants. Specifically look for:

- **Columns that store the same fact under an older name** (e.g. `visibility` → `recipient_tier`, `is_admin` → `role_id`)
- **Tables that the new model makes redundant** (e.g. `role_permissions` once permissions are derived from role + override tables)
- **Indexes built on columns that are being dropped** (e.g. composite indexes including `visibility`, FK indexes on a removed assignee column)
- **CHECK constraints** referencing dropped columns or old enum values
- **Database views** that join dropped tables or reference dropped columns
- **RLS policies / illustrative policy snippets** that filter on old columns
- **Backend code that still reads/writes the old shape**: `grep -rn "<old-column>" backend/app/`

For each finding, decide: drop, rewrite, or leave alone (with a one-line justification). Capture the result in the **Database cleanup** subsection (see template). When in doubt, ask the user — but the default for pre-launch is to remove rather than carry forward dead weight.

---

### 4. Capture key decisions

List the non-obvious architectural choices as "Decisions captured". Each decision should be a brief statement of what was chosen and why — because future readers (and future Claude) need to understand the intent, not just the outcome.

**Format:**
```
**Decisions captured**
- Chose X over Y because …
- Used Z pattern to avoid …
```

### 5. Draw the high-level flow

Produce an ASCII or Mermaid diagram showing the main data/control flow for the happy path. Keep it high-level — show the components and their interactions, not every line of code.

### 6. Write phase-by-phase implementation tasks

Break the work into phases. Each phase should be independently deployable or testable where possible. Within each phase, list tasks as numbered steps. Each task should be specific enough that a developer knows exactly what file to open and what to write.

**What to include per task:**
- File path (from your codebase exploration)
- What to add/change/create
- Key code shapes (types, function signatures, schema fields) — not full implementations, but enough to be unambiguous
- Any gotchas or ordering constraints

**What NOT to include:**
- Full implementations (the developer fills those in)
- Boilerplate that's obvious from context
- Steps that are already done or out of scope

Use real code snippets sparingly but purposefully — for types, schemas, config blocks, and anything where the exact shape matters. When in doubt, include a snippet; it saves the implementer from guessing.

### 7. List critical files

After the phases, call out the files that are most central to this feature — the ones a reviewer would check first, or that a new contributor needs to understand. List each with a one-line description of its role in this feature.

### 8. Identify reusable pieces

Note any utilities, hooks, helpers, or components from the existing codebase that this feature should reuse — and where they live. This prevents the implementer from re-inventing things that already exist.

### 9. Write verification steps

List numbered steps to verify the feature works end-to-end. Cover:
- Happy path (core user journey)
- Key error paths (bad input, auth failure, network failure)
- Edge cases called out in the spec
- Any automated test commands to run

Be concrete: "Navigate to `/home`, click 'Start 14-day free' → expect redirect to `/sign-up`" is better than "test the CTA flow".

### 10. Note open follow-ups

List anything that is explicitly deferred, unclear, or needs a decision before implementation can proceed. Carry over any unresolved open questions from the spec. Tag each with the person or team who needs to resolve it if known.

### 11. Save the plan

Run `mkdir -p _plans` first, then save the completed plan to `_plans/<feature-slug>_tech.md` using the template below. Confirm the saved path to the user.

---

## Output Template

Use this exact structure. Replace `[...]` placeholders with real content.

```markdown
# Plan: [Feature Name]

> Spec: `_specs/[spec-filename].md`
> Branch: `[current git branch]`

---

## Context

[2–4 sentences: what this feature does, who it's for, and why it matters in the product. Write for someone who hasn't read the spec.]

---

## Decisions captured

- [Decision 1: what was chosen and why]
- [Decision 2: what was chosen and why]

---

## High-level flow

[ASCII or Mermaid diagram showing the main happy-path flow between components]

---

## Phase 1 — [Name, e.g. "Infrastructure & Config"]

### 1.1 [Task name]
**File:** `path/to/file`

[What to do. Include a code snippet if the shape is non-obvious.]

```[lang]
// snippet
```

### 1.2 [Task name]
...

### 1.X Database cleanup — remove or update obsolete objects
*(Include this subsection whenever the feature changes the database. Omit only if no schema change at all.)*

The new design supersedes the following existing schema elements. Pre-launch, they are dropped in the same migration rather than deprecated. Each row must record what is removed and what (if anything) replaces it:

| Object | Type | Why obsolete | Replaced by |
|---|---|---|---|
| `<table_or_column>` | table / column / index / view / CHECK | [one-line reason rooted in the new design] | [new object, or "(removed)"] |

**Updates (not removals):** [list of objects whose shape changes — e.g. audit-table payloads, code paths still using the old column — with the file paths that need editing]

**Left alone (with justification):** [objects that look obsolete but are kept — say why, e.g. "harmless under the new model, not worth churning"]

**Out of scope for this migration:** [obsolete items deferred — must also appear in Open follow-ups]

---

## Phase 2 — [Name, e.g. "Backend API"]

### 2.1 [Task name]
...

---

## Phase 3 — [Name, e.g. "Frontend"]

### 3.1 [Task name]
...

---

## Phase 4 — [Name, e.g. "Tests & Polish"]

### 4.1 [Task name]
...

---

## Critical files

| File | Role in this feature |
|------|---------------------|
| `path/to/file` | [what it does] |

---

## Reusable pieces

| Name | Location | Used for |
|------|----------|----------|
| `[utility/hook/component]` | `path/to/file` | [how it's used] |

---

## Verification

1. [Step 1 — specific action and expected result]
2. [Step 2]
3. Run `[test command]` → expect all tests to pass
4. [Error path: action → expected error handling]

---

## Open follow-ups

- [ ] [Item — owner if known]
```

---

## Quality bar

Before saving, read the plan back and check:

- **No invented paths.** Every file path must have been found in the codebase during step 2, or be a new file with a name that follows the project's existing conventions.
- **Phases are orderable.** Later phases must not depend on things that haven't been built yet. If they do, reorder or split.
- **Decisions are justified.** Every "Decisions captured" entry has a "because" clause — not just what, but why.
- **Verification is testable.** Every verification step can be executed by following it literally — no vague "check that it works".
- **Snippets are shapes, not stubs.** Code in the plan shows types, field names, and signatures — not half-written logic with `// TODO` comments.
- **Scope respected.** If the spec marks something as Phase 2 or out of scope, it does not appear in the plan phases.
- **No orphaned schema.** If the plan changes the database, the Database cleanup subsection exists and lists what the new design replaces. Columns/tables/indexes/views/CHECKs/RLS snippets that are superseded must be explicitly dropped, updated, or justified as "left alone" — never silently abandoned.

If you're uncertain what a completed plan should look like, read `.claude/commands/references/tech_plan_template.md` for a fully worked example before starting.

---

## Handoff

After saving, remind the user:

> Plan saved to `_plans/[feature-slug]_tech.md`. Review it, resolve any open follow-ups, then run `/tech_implement _plans/[feature-slug]_tech.md` to begin implementation.
