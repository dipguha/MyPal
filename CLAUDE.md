# CLAUDE.md

> **Version:** 1.1
> **Updated by:** Cowork
> **Last updated:** 12/06/2026 14:53 UTC

**Maintaining this file.** Every edit must: (1) bump the version (patch for wording, minor for new rule, major for restructure), (2) update **Last updated** to the current UTC time (`date -u +"%d/%m/%Y %H:%M UTC"`), (3) set **Updated by**, (4) append a row to the revision history. Target ≤200 lines. If an edit pushes past that, move the content to the correct subtree `CLAUDE.md` instead.

---

## Project

**MyPal** is a family digital assistant web app. It helps households manage health, finances, life admin, recipes, and travel in one place. The top-level tenant is an `account` (one per family). People within an account are `members` (up to 6); a `user` is the auth identity tied to a member. Children can have a `members` row without a `users` row (no login).

**Plan tiers:** the DB stores `"solo"` and `"family"`. In all user-facing copy, `"solo"` is labelled **Individual** (£2.99/mo) and `"family"` is **Family** (£4.99/mo). Never expose the raw enum value to users.

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js (App Router), TanStack Query, Zustand, Tailwind CSS v4 |
| Backend | Ruby on Rails (API-only), Pundit, Blueprinter, `jwt` gem |
| Database | PostgreSQL — migrations via `rails db:migrate` |
| Auth | AWS Cognito + NextAuth v5 (web BFF) |
| Infrastructure | AWS ECS Fargate, ALB, S3, RDS, Cognito — Terraform |
| CI/CD | GitHub Actions (OIDC → AWS role) |

---

## Locale & currency

MyPal is a UK product. Apply everywhere — UI copy, error messages, data formatting, generated code:

- **Currency:** GBP, symbol £ (e.g. £2.99/mo)
- **Date format:** DD/MM/YYYY
- **Language:** UK English (`authorise`, `organisation`, `colour`, etc.)

---

## Auth model

NextAuth v5 handles the browser ↔ Cognito OAuth flow on the Next.js server. The Cognito access + refresh tokens are stored in an encrypted **httpOnly session cookie** — never in the browser's JavaScript heap. Browser code calls `/api/<path>` on Next.js; the proxy at `frontend/src/app/api/[...path]/route.ts` reads the access token from the NextAuth session and forwards the request to Rails with `Authorization: Bearer <token>`. Rails verifies the JWT against Cognito's JWKS endpoint via `app/lib/cognito_jwt_verifier.rb` (using the `jwt` gem), then resolves the Cognito subject to a `users → members` row and sets the current member on the request. Authorisation is enforced by Pundit policies in `app/policies/`.

For implementation detail see `backend/CLAUDE.md`. For the ADR see `docs/adrs.md` (ADR-010, ADR-015).

---

## Branch naming

All feature branches follow `claude/feature/<area>--<module>` regardless of which tool creates them (Cowork or Claude Code).

```
claude/feature/health--overview
claude/feature/life-admin--tasks
claude/feature/finance--budget-envelopes
```

The `<area>--<module>` slug must match the spec filename in `_specs/`. See `_specs/CLAUDE.md` for the area-slug table.

---

## Commit convention

Use conventional commits on all feature branches. Commit after each verified phase — not at the end of the whole feature.

```
feat(<slug>): short description
fix(<slug>): short description
chore(<slug>): short description
```

Examples:
```
feat(health--overview): add member scope picker to summary cards
fix(life-admin--tasks): correct overdue badge logic for recurring tasks
chore(recipes--library): add RSpec request specs for recipe CRUD
```

---

## Context map

A fresh agent should be able to answer "which file do I read for X?" in one hop from here.

| Topic | File |
|---|---|
| This file (orientation + global rules) | `CLAUDE.md` (root) |
| File ownership contract + enforcement rules | `CONTEXT_CONTRACT.md` |
| Developer quickstart (run locally) | `README.md` |
| Cowork→Code→GitHub workflow | `_workflow/workflow.md` |
| System architecture, request flow | `docs/architecture.md` |
| Architecture decisions (ADR log) | `docs/adrs.md` |
| Colour tokens, component catalogue, design rules | `docs/design-system.md` |
| UI primitive props + usage examples (read before building UI) | `docs/ui-components.md` |
| Rules for editing the UI prototype | `_UI/CLAUDE.md` |
| Prototype file structure and SUBNAV map | `_UI/ui-prototype.md` |
| Spec naming convention, area slugs, spec index | `_specs/CLAUDE.md` |
| Product vocabulary (roles, terms, plan labels) | `_specs/terminology.md` |
| Rails conventions, JWT, Pundit, RSpec, gems | `backend/CLAUDE.md` |
| Tailwind rules, BFF contract, NextAuth, ui/ primitives | `frontend/CLAUDE.md` |
| Terraform layout, tagging, state, OIDC | `infrastructure/CLAUDE.md` |

---

## Revision history

| Version | Updated by | Last updated (UTC) | Summary |
|---|---|---|---|
| 1.0 | Cowork | 12/06/2026 14:53 UTC | Initial version for new MyPal repo (Rails + Next.js). Slim root — global rules and context map only. |
| 1.1 | Cowork | 12/06/2026 UTC | Added docs/ui-components.md to context map. |
