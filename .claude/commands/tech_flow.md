---
name: tech_flow
description: Explain how an end-to-end feature flow works in the actual code — tier by tier, citing the real files, functions, and the data that moves through each step. Use this skill whenever the user runs /tech_flow, asks "how does X work", "explain the X flow", or "walk me through X end to end". It traces the real source (frontend, BFF, backend, services, models, migrations), grounds every claim in real paths/functions, draws the flow in both Mermaid and ASCII, and saves a learning-oriented walkthrough to docs/flows/.
argument-hint: a flow name, e.g. "sign up", "sign in", "create task"
allowed-tools: Read, Glob, Grep, Write, Bash(git status:*, git branch:*, ls:*, find:*, date:*, mkdir:*)
---

# tech_flow — End-to-end Flow Explainer (for learning)

You produce a **code-grounded walkthrough** of how one feature flow works end to end, so a developer can learn the codebase. The audience is someone who wants to understand *which file does what and how the data moves* — not a high-level summary.

**This is documentation of how the code works _now_, not how it was planned.** The **source code is the source of truth.** Every file path, function name, route, column, and status code you mention must be verified by reading/grepping the actual code. **Never invent** a path or function — if you can't find something, say so. If part of the flow isn't implemented yet, state that plainly rather than describing aspirational behaviour.

## Input

```
/tech_flow sign up
/tech_flow sign-in
/tech_flow create task
```

Derive a **slug** from the argument (lowercase, kebab-case, e.g. `sign up` → `sign-up`). If no argument is given, ask the user which flow. If the flow is ambiguous or you can't find an entry point, ask before guessing.

---

## Workflow

### 1. Locate the flow in the codebase
Use Glob/Grep to find the real entry points and follow the call chain. Typical trail for this stack:
- **Frontend page/component:** `frontend/src/app/**` (the screen that starts the flow).
- **BFF proxy / route handlers:** `frontend/src/app/api/**` and `frontend/auth.ts` / `frontend/src/lib/**`.
- **Backend routing:** `backend/config/routes.rb` → **controllers** `backend/app/controllers/**`.
- **Services / models / migrations:** `backend/app/services/**`, `backend/app/models/**`, `backend/db/migrate/**`.
- **External services:** Cognito, S3, etc. (where the code calls out).

Grep for the obvious anchors (route paths, action names, service classes, table names) and **read** each file you'll cite. Confirm function names exist before naming them.

### 2. Optional context — spec & plan (treat as secondary)
Read the matching `_specs/<area>--<module>.md` and `_plans/<slug>_tech.md` for vocabulary and intent **only**. The explanation describes the code; where the code diverges from the spec/plan, **note the drift** (this is valuable learning) — do not describe the plan as if it were the code.

### 3. Trace tier by tier
Walk the request(s) in order. For multi-step flows (e.g. a create call then a confirm call), cover each round-trip. At every hop capture: **which file**, **which function/action**, **what it does**, and **what data is passed/returned** (request body keys, params, return values, status codes).

### 4. Draw the flow — both formats
Per the project diagram convention, draw the flow as **a Mermaid block immediately followed by an equivalent ASCII block** (Mermaid renders on GitHub; ASCII renders in any editor). Keep the two in sync. A flowchart usually suits a flow; add a sequence diagram if the round-trips are complex.

### 5. Assemble the walkthrough
Use the Output template below. Be concrete and cite `path/to/file` (and `file:line` where it genuinely helps). Prefer naming the exact function/action over vague description.

### 6. Save
Run `mkdir -p docs/flows`, then write to `docs/flows/<slug>.md` using the doc header + revision-history convention used across the repo's docs. Confirm the saved path.

### 7. Report
Tell the user the saved path and give a 2–3 sentence summary of the flow. Note any gaps/drift you found.

---

## Output template

```markdown
# How <Flow Name> works

| | |
|---|---|
| **File** | `docs/flows/<slug>.md` |
| **Purpose** | Code-grounded, end-to-end walkthrough of the <flow> flow, for learning the codebase. Describes the code as it is now; the spec lives in `_specs/…`, the plan in `_plans/…`. |
| **Version** | 1.0 |
| **Updated by** | [name] |
| **Last updated** | [DD/MM/YYYY HH:MM UTC] |

**Maintaining this file.** Bump version, restamp `date -u`, set Updated by, append a revision-history row on every edit. This describes real code — if the code changes, update or regenerate (`/tech_flow <flow>`).

## Big picture
[2–4 sentences: the tiers involved and how many round-trips. One-line "the browser never talks to X directly" style framing if relevant.]

## Flow diagram
```mermaid
[flowchart/sequence]
```
```text
[equivalent ASCII]
```

## Stage-by-stage
### Stage 1 — [name]
**File:** `path` → `function/action`
[What happens, and the data in/out.]
… (repeat per stage)

## What data ends up where
[Table of tables/columns written, if the flow persists data. Omit if none.]

## Error handling / contract
[The error shape and the main failure branches.]

## Security properties
[Where secrets live, what's encrypted, auth/authorisation touchpoints.]

## File index
| File | Role in this flow |
|---|---|
| `path` | [one line] |

## Gaps / drift
[Anything not-yet-built, or where the code diverges from the spec/plan. "None" if clean.]

## Revision history
| Version | Updated by | Last updated (UTC) | Summary |
|---|---|---|---|
| 1.0 | [name] | [stamp] | Initial walkthrough. |
```

---

## Quality bar

Before saving, check:
- **No invented paths or functions.** Every cited file/function/route/column/status was confirmed by reading or grepping the code.
- **Code, not plan.** The walkthrough reflects what the code does now; divergence from spec/plan is flagged under "Gaps / drift", not presented as fact.
- **Honest about gaps.** Not-yet-built parts of the flow are called out, not described as working.
- **Data flow is concrete.** Real request-body keys, params, return values, and status codes — not "sends the data".
- **Both diagram formats present** and consistent with each other and the prose.
- **Header maintained** (version, `date -u` stamp, revision row).

## Handoff
After saving, remind the user the doc can be regenerated with `/tech_flow <flow>` whenever the code changes, and that it lives in `docs/flows/`.
