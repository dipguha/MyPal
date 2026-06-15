# MyPal — Context File Contract

| | |
|---|---|
| **File** | `CONTEXT_CONTRACT.md` |
| **Purpose** | Single reference for which file owns which context. One job per file — no overlap, no duplication. Used by Cowork, Claude Code, and human contributors to decide where a rule or fact lives and where to read it. |
| **Version** | 1.1 |
| **Last updated** | 2026-06-15 UTC |

---

## The principle

Every fact lives in exactly one place. Everything else points to it.

When you need to add a rule, update a decision, or document a convention, this table tells you which file owns it. If none fits, either extend the closest match or raise it for discussion before adding to root `CLAUDE.md`.

---

## Ownership table

| File | Owns | Must NOT contain |
|---|---|---|
| **`CLAUDE.md`** (root) | Project orientation. Global rules that apply in every context: product name, locale/currency, branch + commit conventions, auth model summary (one paragraph), and the **context map** — pointers to every file below. Target ≤200 lines. | UI component catalogue. Backend/frontend-specific detail. Anything restated from another file. |
| **`README.md`** | Human-facing quickstart: what MyPal is, how to run locally (≤5 commands), links to `_workflow/workflow.md` and `docs/`. | A parallel workflow narrative. Stack detail. Any rule duplicated from CLAUDE.md. |
| **`_workflow/workflow.md`** | The complete Cowork→Code→GitHub process: step sequence, branch strategy, parallel feature rules, rebase steps, 6-step Cowork loop, approval phrases, team roles (who reviews, who merges). | Stack-specific tooling. Design rules. |
| **`docs/architecture.md`** | System architecture narrative: request flow diagram, services overview, data model summary, app layout, phased delivery plan. | ADR rationale (lives in adrs.md). Design tokens or component specs. |
| **`docs/adrs.md`** | ADR register — product and infrastructure-level decisions only. Each ADR: context, decision, consequences. Implementation-specific decisions (e.g. which gem, which library) belong in the relevant subtree CLAUDE.md, not here. | Re-explaining architecture narratively. UI or workflow rules. |
| **`docs/design-system.md`** | Single source of visual and UX truth: colour tokens, typography, spacing, and the **full component catalogue** (ScopePicker, ForPicker, GroupHeader, fldLbl/fldInp, modal anatomy, WrapRow, DataRow, ForVisPair, FreqLeadPair, RowModalSync, ItemRow, Badge). | Workflow. Backend conventions. Anything not visual/UX. |
| **`docs/flows/*`** | Code-grounded, end-to-end walkthroughs of how a feature flow works — the files, functions, and data through each tier. Generated/refreshed by `/tech_flow`; describes the code as it is now. | Forward-looking plans (→ `_plans/`). Decision rationale (→ `adrs.md`). System-level architecture narrative (→ `architecture.md`). |
| **`_UI/CLAUDE.md`** | Rules for working inside the prototype directory: the working-vs-canonical copy rule, the `T.xxx` inline-style convention (vs Tailwind in production), file naming under `_UI/`. Points to `docs/design-system.md` for the catalogue — never repeats it. | A copy of the component catalogue. Workflow steps. |
| **`_UI/ui-prototype.md`** | How `mypal-app.jsx` is structured: NAV/SUBNAV map, screen-component naming pattern, CSS class conventions used in the prototype, current module inventory. | Design contract or component specs (those live in design-system.md). |
| **`_specs/CLAUDE.md`** | Spec naming convention, area-slug table, the cross-cutting "always read these before implementing" list, spec status index. | Design rules. Backend conventions. |
| **`_specs/terminology.md`** | Canonical product vocabulary: roles (member, user, HMG), areas, `visible_to` values, plan tier labels, and any term that must be used consistently across UI, code, and docs. | Implementation detail. |
| **`backend/CLAUDE.md`** | All Rails-specific conventions: app layout (`controllers/api/v1/`, `services/`, `policies/`, `serializers/`), Cognito JWT verification pattern (`CognitoJwtVerifier`), Pundit authorisation rules, service/controller split rule, RSpec naming and commands, migration rules, Rubocop, gem choices with rationale. | UI rules. Workflow. Frontend conventions. |
| **`frontend/CLAUDE.md`** | All frontend-specific conventions: Tailwind-only styling rules, `components/ui/` primitives (what exists and when to use them), BFF proxy contract (`/api/[...path]/route.ts`), area sub-nav scaffolding rule (`layout.tsx` + `<Area>Tabs`), theme token usage, NextAuth session pattern. | Backend rules. Component catalogue (→ design-system.md). |
| **`infrastructure/CLAUDE.md`** | Terraform conventions: module/environment layout, mandatory default tags, S3+DynamoDB remote state, OIDC federation for GitHub Actions, how to add a new module. | App-layer rules. |
| **`.claude/commands/*.md`** | One slash command per file. Unique `name:` frontmatter — no two files share the same name. | Business logic or product rules (those belong in the files above). |
| **`.claude/commands/references/*`** | Fill-in templates only: feature spec, tech plan, changelog entry. Templates are inert until a command uses them. | Actual decisions or rules. |
| **`_changelog/*`** | Dated record of what changed in each implementation session: files added, modified, deleted, and why. | Forward-looking plans or specs. |

---

## Enforcement rules

Apply these checks whenever a file is created or edited.

**Before adding a rule to any file:**
1. Does this rule already exist somewhere? If yes, update that file — do not duplicate.
2. Does this rule belong in the file you're editing, per the ownership table above? If no, find the correct file.
3. If the rule is global (applies in every context), it goes in root `CLAUDE.md`. If it's local to one subtree, it goes in that subtree's `CLAUDE.md`.

**Before adding content to root `CLAUDE.md`:**
- Ask: does this only matter when working in `backend/`, `frontend/`, `_UI/`, or `_specs/`? If yes, it belongs in that subtree's file, not root.
- Root `CLAUDE.md` must stay ≤200 lines. If an edit pushes it over, something needs to move out.

**When you discover a rule is documented in two places:**
- Designate one as the owner (per the table above).
- Replace the duplicate with a one-line pointer: `See [file] for X.`
- Do this in the same edit — do not leave the duplicate in place.

**When adding a new slash command:**
- Check `.claude/commands/` for any existing `name:` that matches your intended command name.
- A collision means one command will silently shadow the other — fix it before committing.

---

## Quick lookup — "where do I find X?"

| Looking for | Read this file |
|---|---|
| What MyPal is / global conventions | `CLAUDE.md` (root) |
| How to run locally | `README.md` |
| How Cowork and Claude Code divide the work | `_workflow/workflow.md` |
| System architecture and request flow | `docs/architecture.md` |
| How a feature flow works end-to-end (files + data) | `docs/flows/` |
| Why we made a product or infra decision | `docs/adrs.md` |
| Colour tokens, component specs, design rules | `docs/design-system.md` |
| Rules for editing the UI prototype | `_UI/CLAUDE.md` |
| Spec naming convention and area slugs | `_specs/CLAUDE.md` |
| What a product term means | `_specs/terminology.md` |
| Rails conventions, JWT, Pundit, RSpec | `backend/CLAUDE.md` |
| Tailwind rules, BFF contract, NextAuth | `frontend/CLAUDE.md` |
| Terraform layout, tagging, state | `infrastructure/CLAUDE.md` |
| Available slash commands | `.claude/commands/` |
| What changed in a past implementation | `_changelog/` |
