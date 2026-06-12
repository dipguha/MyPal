# _specs/ — Directory Context

> **Version:** 1.2
> **Updated by:** Dip
> **Last updated:** 01/06/2026 18:02 UTC

This directory contains feature specs for MyPal. Each spec drives one or more Claude Code implementation cycles (`/tech_spec` → `/tech_implement`). Read this file before working with any spec.

**Maintaining this file.** Whenever you change this file, you must in the same edit: (1) bump the **Version** in the header (patch for small wording/clarifications, minor for a new rule or section, major for a structural rewrite), (2) set **Last updated** to the current UTC time in `dd/mm/yyyy hh24:mi UTC` format (get it with `date -u +"%d/%m/%Y %H:%M UTC"` — never guess), (3) set **Updated by** to whoever requested the change, and (4) append a row to the Revision history table at the bottom. The header and the latest revision-history row must always agree.

---

## Naming convention

New specs follow the pattern `[area]--[module].md` — double-hyphen between area and module, single hyphens within each slug, all lowercase.

| Area | Slug | Example |
|---|---|---|
| Life Admin | `life-admin` | `life-admin--pet-care.md` |
| Finance | `finance` | `finance--budget-envelopes.md` |
| Health | `health` | `health--medications.md` |
| Recipes & Groceries | `recipes` | `recipes--meal-planner.md` |
| Travel | `travel` | `travel--my-trips.md` |
| Today | `today` | `today--daily-briefing.md` |
| My Account | `account` | `account--my-profile.md` |
| Platform (cross-cutting) | `platform` | `platform--task-engine.md` |

**Note:** Existing specs in this folder predate this convention and use inconsistent naming (e.g. `life-admin-to-dos.md`, `today-daily-brief.md`). Do not rename them — apply the new pattern only to new specs.

---

## Cross-cutting dependencies — read these for every tech spec

Three specs apply across all features. Always read them before writing a tech plan, even if they are not explicitly referenced in the feature spec you have been handed.

| Spec | Why it matters |
|---|---|
| `terminology.md` | Canonical definitions for all product terms: roles, areas, modules, the `visible_to` model (Self/HMG/Family/Individual), HMG, permission levels, and writing conventions. Read this first. |
| `platform--access-control.md` | Defines role management requirements, HMG group rules, the `visible_to` recipient model behaviour, per-module permission defaults (section 4.8), and the `member_module_permissions` data model. Every module has an access row in section 4.8. Every item type must carry `visible_to` and `visible_to_members` columns. RLS and `access_log` are defined here. |
| `platform--task-engine.md` | Defines the Schedule Template + Task Instance two-layer model. Any module that has recurring events (Cars, Home, Pets, Health, Finance) must define its templates against this spec. Read before writing any module tech plan that involves recurring tasks or appointments. |

---

## Spec status index

| Spec file | Feature | Tech plan | Status |
|---|---|---|---|
| `platform--task-engine.md` | Task Engine — Schedule Templates & Instances | — | Approved — no tech plan yet |
| `platform--access-control.md` | Roles & Access Control | `_plans/platform--access-control_tech.md` | Draft v0.14 — tech plan exists; implementation pending |
| `home-page.md` | Home / Marketing page | `_plans/home-page_tech.md` | Tech plan exists |
| `sign-in.md` | Sign In | `_plans/sign-in_tech.md` | Tech plan exists |
| `sign-up.md` | Sign Up | `_plans/sign-up_tech.md` | Tech plan exists |
| `user-sign-up.md` | User sign-up flow | — | Draft |
| `onboarding.md` | Onboarding | `_plans/onboarding_tech.md` | Tech plan exists |
| `today-daily-brief.md` | Today — Daily Briefing | `_plans/today-daily-brief_tech.md` | Tech plan exists |
| `life-admin-to-dos.md` | Life Admin — To Dos *(now: Tasks)* | `_plans/life-admin-to-dos_tech.md` | Tech plan exists — note module renamed Tasks |
| `life-admin-reminders.md` | Life Admin — Reminders *(absorbed into Tasks)* | `_plans/life-admin-reminders_tech.md` | Superseded — Reminders merged into Tasks module |
| `life-admin-bills-subs.md` | Life Admin — Bills & Subs | `_plans/life-admin-bills-subs_tech.md` | Tech plan exists |
| `reminders.md` | Reminders *(standalone, pre-merge)* | `_plans/reminders_tech.md` | Superseded — absorbed into Tasks |
| `bills-and-subscriptions.md` | Bills & Subscriptions | — | Draft |
| `terminology.md` | Terminology reference | — | Stable reference — not a feature spec |

**Specs still to be written** (design approved in prototype, no spec yet):

| Area | Module(s) |
|---|---|
| Life Admin | Household Info, Documents, Cars & Home, Pet Care |
| Health | Profiles, Medications, Appointments, Emergency Info, Journal *(Overview is a persistent header panel — no spec needed; Preventive Care merged into Appointments 2026-05-29)* |
| Finance | Overview, Budget Envelopes, Transactions, My Finance |
| Recipes & Groceries | Library, Meal Planner, Grocery List |
| My Account | My Profile, Family Members, Preferences, Security & Privacy |
| Today | Daily Briefing (update for current design) |

---

## Key constraints to carry into every tech plan

- **Auth:** Web uses NextAuth v5 + httpOnly session cookie (BFF pattern). FastAPI verifies JWT from Cognito. See `architecture_decisions.md` ADR-010.
- **RLS:** All sensitive tables have Postgres Row-Level Security enforced via `SET LOCAL app.member_id`. New endpoints must use the existing RLS dependency in `app/api/deps.py`.
- **Recipient model:** Every item type (task, note, document, journal entry) must store `recipient_tier` + `recipients[]`. Default is `family` except Health and Journal which default to `self`.
- **Currency:** GBP (£). **Date format:** DD/MM/YYYY in API/DB; `dd-Mon-yyyy` in UI display.
- **No third-party UI components:** Tailwind v4 only — no shadcn, Radix, Headless UI, etc. See `CLAUDE.md` styling rules.

---

## Revision history

| Version | Updated by | Last updated (UTC) | Summary of changes |
|---------|------------|--------------------|--------------------|
| 1.0 | Dip | 28/05/2026 11:26 | Added document header (version / updated by / last updated), the "Maintaining this file" rule, and this revision history. |
| 1.1 | Cowork | 30/05/2026 15:43 | Specs still to be written: removed Overview from Health (now a persistent header panel, not a module spec); removed Preventive Care from Health (merged into Appointments 2026-05-29). |
| 1.2 | Dip | 01/06/2026 18:02 | Added `platform` area slug; registered `platform--task-engine.md` in spec status index and cross-cutting dependencies; promoted to three required cross-cutting reads. |
