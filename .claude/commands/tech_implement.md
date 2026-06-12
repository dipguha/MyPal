---
name: tech_implement
description: Implement a feature from a technical plan file. Use this skill whenever the user runs /tech_implement, asks Claude to "implement this plan", "build this feature", "execute the tech spec", or references a file in _plans/. The skill reads the plan, implements changes phase by phase, verifies each phase before moving on, then updates the architecture document and README with any relevant changes.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash(git status:*, git branch:*, git log:*, git add:*, git commit:*, git diff:*, uv:*, npm:*, npx:*, pytest:*, ruff:*, mypy:*, alembic:*)
---

# tech_implement — Feature Implementation Agent

You are implementing a feature end-to-end from a technical plan. Your job is to write real, working code — not placeholders, not stubs with `// TODO`, but production-quality implementations that follow the project's existing conventions. Move carefully and verify as you go.

## Input

The user provides (or implies) a plan file path, e.g.:

```
/tech_implement _plans/expense-capture_tech.md
/tech_implement _plans/user-signup_tech.md
```

If `_plans/` path is not provided, add it (i.e. `/tech_implement expense-capture_tech.md` becomes `/tech_implement _plans/expense-capture_tech.md`).

If no path is given, look for the most recently modified file in `_plans/` that ends in `_tech.md` and confirm with the user before proceeding.

---

## Pre-flight

Before writing a single line of code, complete these checks in order. Stop and report to the user if any are blocking.

### Check 1 — Feature branch
Run `git branch --show-current`. If the current branch is `main` or `master`, **abort**. Implementation must happen on a `claude/feature/*` branch. Tell the user to switch to the correct branch before proceeding.

### Check 2 — Clean working tree
Run `git status --short`. If there are uncommitted changes unrelated to this feature, note them to the user — suggest they stash or commit first before continuing.

### Check 3 — Read CLAUDE.md
Read `CLAUDE.md` in the project root before doing anything else. This file defines the conventions you must follow throughout implementation:
- Backend: routers thin / services fat, async SQLAlchemy session, `uv run` for all Python commands
- Frontend: App Router route groups `(auth)` and `(app)`, `src/lib/api.ts` for all API calls, TanStack Query for server state
- Infrastructure: Terraform tag conventions, state file location
- Test commands: `uv run pytest`, `npm run typecheck`, `npm run lint`

### Check 3.5 — UI prototype (frontend phases only)
If the plan includes any frontend phase (pages, components, or UI changes), read `_UI/mypal-app.jsx` **before reading the plan**. Identify the screen(s) relevant to this feature and note:
- Layout structure and component hierarchy
- Copy (labels, placeholders, empty states, error messages)
- Interaction patterns (what happens on tap/click, loading states, transitions)

The prototype is the visual contract. Implementation must match it. If the plan describes something that conflicts with the prototype, follow the prototype and note the discrepancy in the completion report.

### Check 4 — Read the plan
Read the plan file in full. Extract:
- The spec file it was generated from (for traceability)
- The list of phases and tasks
- All file paths the plan references
- Any explicit dependencies or ordering constraints
- Open follow-ups flagged as "must be resolved before implementation"

### Check 5 — Verify the codebase matches the plan
The plan was written at a point in time. Before trusting its file paths:
- Check that files the plan says to *extend* actually exist
- Check that files the plan says to *create* don't already exist (if they do, read them first — the feature may be partially implemented)
- If paths have drifted, use the plan's intent to find the correct real paths

### Check 6 — Identify test commands
Confirm the test runner commands from CLAUDE.md apply to this feature:
- Backend: `uv run pytest`
- Frontend: `npm run typecheck`, `npm run lint`
- E2E: `npx playwright test` (if E2E tests are in the plan)

Note which commands are relevant to each phase so you can run the right ones after each.

---

## Implementation

Work through the plan's phases in order. **Complete and verify each phase before starting the next.** Partial implementations cause more problems than they solve.

### For each phase

#### Step A — Read before you write
For every file you're about to modify, read it first. Never edit blind. Pay attention to:
- Existing naming conventions (camelCase vs snake_case, file naming patterns)
- Import style (named vs default exports, path aliases)
- Error handling patterns
- Existing types/interfaces you should extend rather than duplicate

#### Step B — Implement the tasks
Follow the plan's tasks in order. For each task:
1. Make the change (create or edit the file)
2. Keep the code consistent with the surrounding codebase — match indentation, style, and patterns you observed in Step A and CLAUDE.md
3. If the plan's snippet shows a shape (types, function signature), use it exactly — it was deliberate
4. If you encounter a gotcha the plan didn't anticipate, handle it conservatively: implement the minimal fix and note it in your completion report

#### Step B.1 — Database migrations (backend phases only)
If the phase creates an Alembic migration file, run it immediately after writing it — don't wait until the end:
```bash
uv run alembic upgrade head
```
Verify the migration applied cleanly before continuing. If it fails, fix the migration before moving to the next task.

**Execute the plan's Database cleanup subsection in full.** If the plan lists obsolete tables/columns/indexes/views/CHECKs under "Database cleanup" for the phase, drop or update every entry in the same migration — do not silently skip rows. If a row turns out to be in use somewhere the plan missed, stop and surface it rather than leaving the dead object behind.

#### Step C — Verify the phase
After completing all tasks in a phase:
1. Run the relevant test command(s) for the affected area
2. Run the linter/type-checker:
   - Backend: `uv run ruff check .` and `uv run mypy app`
   - Frontend: `npm run typecheck` and `npm run lint`
3. If the phase produces a runnable artifact (a new API endpoint, a new page), verify it manually by describing what you'd expect to see and checking the output

Only move to the next phase once the current phase is clean.

#### Step D — Commit the phase
Once a phase is verified, commit with a conventional commit message:

```
feat(<feature-slug>): <short description of what this phase adds>
```

Examples:
```
feat(home-page): add Cognito user pool terraform config
feat(home-page): add users table migration and SQLAlchemy model
feat(home-page): add signup and onboarding API endpoints
feat(home-page): add signup page, BFF route, and auth middleware
feat(home-page): add backend unit tests and Playwright E2E spec
```

Use `fix(...)` for bug fixes, `chore(...)` for config/tooling changes.

### Handling plan gaps
Plans are written before implementation. You will encounter gaps. Apply this hierarchy:

1. **The plan is explicit** → follow it
2. **The plan is ambiguous** → follow the project's existing pattern for similar things (check CLAUDE.md first)
3. **The existing pattern is also ambiguous** → make the simplest reasonable choice, implement it, and note it in the completion report
4. **The gap is a blocker** (e.g., a missing secret, an unresolved architectural question flagged in Open follow-ups) → stop, report to the user, wait for resolution before continuing

---

## Updating the architecture document

After all phases are implemented, update the architecture document if needed. Check these paths in order:

1. `MyDigitalPal_architecture.md` ← this project's actual architecture file
2. `ARCHITECTURE.md`
3. `docs/ARCHITECTURE.md`
4. `docs/architecture.md`

If none exists, note it in the completion report — do not create it yourself.

### What to add
Only update the architecture document if the feature introduces something genuinely new at the architectural level. The bar is: "would a new engineer need to know this exists to understand how the system works?"

Add entries for:
- A new service, layer, or significant module that didn't exist before
- A new external dependency or third-party integration (API, queue, storage)
- A new database table or schema section with a non-obvious relationship
- A new auth/security boundary
- A platform constraint that affects future decisions

**Do not add:**
- Implementation details that belong in code comments
- Every new file or function
- Anything already implied by existing architecture entries
- Internal refactors that don't change the external shape of the system

### How to add it
Read the existing document first. Match its style, heading depth, and level of detail. Add a new subsection under the most relevant existing section. If there's a changelog or decision log section, append an entry there with the date and the feature name.

Keep additions concise — two to five sentences per new concept, plus a code block or diagram only if the concept is hard to express in prose.

---

## Updating README.md

Find `README.md` at the project root. Read it before making any changes.

### What to update
Update README only for things a developer setting up or using the project needs to know. The bar is: "would someone following the README get stuck without this?"

Update for:
- **New environment variables** — add them to the `.env` example block or the "Environment variables" section
- **New setup steps** — if the feature requires a new one-time action (running a migration, enabling an API, installing a system dependency)
- **New npm/pip/other package dependencies** that require manual steps beyond `npm install` or `uv sync`
- **New CLI commands** added by the feature
- **Changed ports, URLs, or service names**

**Do not update for:**
- Internal implementation details
- Things already covered by running the standard install/setup steps
- Temporary or dev-only scaffolding

### How to update it
Match the README's existing style and formatting exactly. Prefer adding to existing sections over creating new ones. If a new section is genuinely needed, place it where it makes logical sense in the reading flow.

---

## Completion report

After all phases are done and both documents are updated, write a brief completion report in the chat:

```
## Implementation complete: [Feature Name]

**Spec:** `_specs/[spec-filename].md`
**Plan:** `_plans/[plan-filename].md`
**Branch:** `[current branch]`

**Phases completed:** X of X
**Files created:** list
**Files modified:** list

**Architecture doc:** [updated / no changes needed / not found at expected path]
**README:** [updated / no changes needed]

**Deviations from plan:**
- [Any place you did something different from the plan, and why]

**Notes for follow-up:**
- [Anything the plan left open that you resolved, or that still needs a decision]
- [Any technical debt introduced under time pressure]
```

If any phase was skipped or left incomplete, say so explicitly and explain why.

---

## Recording the changelog

**Do not write the changelog as part of `/tech_implement`.** The implementation is normally followed by a test-and-iterate discussion with the user, and changes made then must be captured too. Writing the changelog now would snapshot the feature too early and miss that later work.

The changelog is produced **separately, on demand**, once the feature is actually finished, by running `/change_log` (`.claude/commands/change_log.md`). Because that command records the whole branch (`git diff main...HEAD`), a single run when the work is done captures the implementation *and* all follow-up changes in one accurate entry.

So: end `/tech_implement` at the completion report. If the user signals the feature is complete and asks for the changelog (or you reach a clear "done" point with no pending follow-ups), suggest running `/change_log` — don't run it automatically.

---

## Guardrails

**Don't break existing tests.** If your implementation causes a previously passing test to fail, fix it before moving on — don't comment it out or mark it skip.

**Don't invent patterns.** If the plan calls for an auth middleware and the project already has one for a different route, extend it — don't write a second one. When in doubt, check CLAUDE.md.

**Don't over-engineer.** Implement what the plan specifies. If you see an obvious improvement opportunity, note it in the completion report rather than building it — scope creep is how implementations never finish.

**Don't guess at secrets or config values.** If a new environment variable is needed and you don't know its value, add it to `.env.example` with a placeholder and note it in the completion report.

**Don't skip the migration run.** Writing an Alembic migration file is not the same as applying it. Always run `uv run alembic upgrade head` immediately after creating a migration, and verify it succeeded before continuing.

**Commit phase by phase.** After each phase verifies cleanly, commit it. This makes it easy to bisect if something breaks later, and gives you a clean rollback point.
