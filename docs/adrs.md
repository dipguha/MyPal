# MyPal — Architecture Decision Records

| | |
|---|---|
| **File** | `docs/adrs.md` |
| **Purpose** | Authoritative log of product and infrastructure decisions. When you wonder "why is it done this way?", this is the first place to look. |
| **Version** | 1.2 |
| **Updated by** | Claude Code |
| **Last updated** | 14/06/2026 16:18 UTC |

**Maintaining this file.** Every edit must: (1) bump the version, (2) update **Last updated**, (3) set **Updated by**, (4) append a revision history row. To add a new ADR: copy the template at the bottom, assign the next number, fill it in, and add it to the index.

---

## Index

| ADR | Title | Status | Date |
|---|---|---|---|
| [ADR-001](#adr-001) | Multi-tenant account model | Accepted | 2026-05-28 |
| [ADR-003](#adr-003) | Plan tiers — two values only; account_types table removed | Accepted | 2026-06-12 |
| [ADR-002](#adr-002) | Application-layer authorisation via Pundit (not Postgres RLS) | Accepted | 2026-06-12 |
| [ADR-010](#adr-010) | Web BFF auth pattern — NextAuth v5 + httpOnly session cookie | Accepted | 2026-05-28 |
| [ADR-011](#adr-011) | FreqLeadPair lead time — default + max, always user-overridable | Accepted | 2026-06-02 |
| [ADR-012](#adr-012) | Tasks module — one-off items only; no recurring tasks | Accepted | 2026-06-02 |
| [ADR-013](#adr-013) | Key Dates aggregates all recurring events; owns "Others" | Accepted | 2026-06-02 |
| [ADR-014](#adr-014) | Tasks has two sub-types: Simple and Appointment | Accepted | 2026-06-02 |
| [ADR-015](#adr-015) | Rails API-only backend (replacing FastAPI/Python) | Accepted | 2026-06-12 |
| [ADR-016](#adr-016) | AWS deployment topology — ECS Fargate, ALB-public/private tiers, ephemeral envs | Accepted | 2026-06-14 |

---

## ADR-001

**Title:** Multi-tenant account model

**Status:** Accepted

**Date:** 2026-05-28

### Context

MyPal is a household product. Multiple people in a family share data but the family is isolated from other families. We needed a tenancy model that cleanly separates household data, supports multiple members (up to 6), and handles children who use the product but cannot log in.

### Decision

Top-level tenant is `accounts` (one per household). Everyone in the household is a `members` row scoped to that account. A `users` row (holding the Cognito `sub`) is only created for people who can log in — children can have a `members` row with no `users` row.

All feature tables carry an `account_id` FK. All queries in services are scoped to `current_member.account_id`. Cross-account data access is not possible by construction.

Role hierarchy: `admin` → `partner` → `member` → `child` / `grandparent`. Roles are defined in the `member_roles` lookup table; `members.role_id` points to it. `members.is_admin` is a convenience flag (true for the account creator and any promoted member).

### Consequences

- Clean isolation: a bug cannot expose another family's data because every query includes the account scope.
- Children are first-class household members without requiring a login or Cognito entry.
- Services must never call `Model.find(id)` without an account scope — always `Model.find_by!(id: id, account_id: current_member.account_id)`.

---

## ADR-002

**Title:** Application-layer authorisation via Pundit (not Postgres RLS)

**Status:** Accepted

**Date:** 2026-06-12

### Context

MyDigitalPals (the prior project) used Postgres Row-Level Security (RLS), setting a `SET LOCAL app.member_id` on each DB connection. This tied authorisation to the database layer and required FastAPI-specific session-setting plumbing.

MyPal uses Rails. Rails's connection pool reuses connections across requests, making per-request `SET LOCAL` fragile. Pundit is the idiomatic Rails authorisation library.

### Decision

Authorisation is enforced at the application layer via Pundit policies in `app/policies/`. Every controller action that accesses a resource calls `authorize record`. Policies receive `current_member` (not `current_user`) as the actor.

All data isolation is achieved by account-scoped queries (ADR-001) combined with Pundit permission checks. Postgres RLS is not used.

### Consequences

- Authorisation is testable in isolation via `spec/policies/`.
- No RLS setup needed in migrations.
- Developers must not forget `authorize` — Pundit's `verify_authorized` after_action can enforce this in dev.
- `pundit_user` in ApplicationController returns `current_member`.

---

## ADR-003

**Title:** Plan tiers — two values only; `account_types` table removed

**Status:** Accepted

**Date:** 2026-06-12

### Context

The initial schema had three plan values (`'free'`, `'solo_pro'`, `'family'`) stored in `accounts.plan`, plus a separate `account_types` lookup table also holding the tier and a `max_members` limit. CLAUDE.md described two tiers only (`'solo'` and `'family'`). The two sources were inconsistent.

Two questions needed resolving before writing the baseline migration:
1. What are the real plan values?
2. Should plan be stored in `accounts.plan` (string column) or via `account_type_id FK → account_types`?

### Decision

**Plan values:** Two tiers only — `'solo'` and `'family'`. No `'free'` tier. No `'solo_pro'`. The stored DB value is `'solo'`; the UI label is "Individual" (£2.99/mo). The stored DB value is `'family'`; the UI label is "Family" (£4.99/mo). Raw enum values are never exposed to users.

**Single source of truth:** `accounts.plan` VARCHAR with a CHECK constraint. The `account_types` lookup table is dropped. The member limit (1 for solo, 6 for family) is enforced in Rails application logic, not a DB lookup row.

**`social_logins` also dropped:** Cognito is the identity provider and owns OAuth connections. We do not mirror provider links in our DB. If the My Account → Security & Privacy screen needs to show linked providers, it will query Cognito's admin API, not a local table.

### Consequences

- Schema is simpler — one column, one constraint, no FK to a lookup table.
- Adding a new plan tier requires a migration to widen the CHECK constraint plus a code change in any limit-enforcement logic. This is intentional — plan changes should be deliberate.
- `account_types` must not be recreated in future migrations without revisiting this ADR.
- `social_logins` must not be recreated without an ADR explaining why local storage is needed.

---

## ADR-010

**Title:** Web BFF auth pattern — NextAuth v5 + httpOnly session cookie

**Status:** Accepted

**Date:** 2026-05-28

### Context

The web client needs to call the Rails API with a Cognito JWT. Options considered:

1. **Token in localStorage** — XSS vulnerable; any injected script can exfiltrate the token.
2. **Token in memory (React state)** — lost on page refresh; poor UX.
3. **BFF pattern with httpOnly cookie** — Next.js acts as a Backend-For-Frontend. The Cognito token never touches the browser's JavaScript heap.

### Decision

NextAuth v5 handles the browser ↔ Cognito OAuth code exchange on the Next.js server. The Cognito access + refresh tokens are encrypted and stored in an **httpOnly `__Secure-next-auth.session-token` cookie** — the browser's JavaScript cannot read it.

Browser code calls `/api/<path>` on Next.js. The API proxy at `frontend/src/app/api/[...path]/route.ts` reads the access token from the NextAuth session (server-side) and forwards the request to Rails with `Authorization: Bearer <token>`.

Mobile clients (future, Phase 2) will use a separate public Cognito app client, obtain tokens via Amplify or the native SDK, store them in Keychain/Keystore, and call Rails directly — bypassing the BFF entirely.

### Consequences

- XSS cannot steal the token (it is not accessible to JavaScript).
- All authenticated web requests must go through the BFF proxy — no direct Rails calls from browser code.
- Session management (refresh, logout) is handled by NextAuth on the server.
- Mobile clients need a separate Cognito app client (public, no secret).

---

## ADR-011

**Title:** FreqLeadPair lead time — default + max, always user-overridable

**Status:** Accepted

**Date:** 2026-06-02

### Context

Recurring items (Key Dates, Pet Care reminders, etc.) need a lead time: how many days/weeks before the anchor date the user is reminded. Two questions arose: (1) should a sensible default be pre-filled? (2) should there be a maximum to prevent nonsensical values (e.g. a 6-month lead time on a weekly event)?

### Decision

Each frequency has a **default** (pre-filled in the form on frequency selection) and a **max** (the highest selectable value in the lead time dropdown). The user can always adjust up to the max — the default is a starting point, not a constraint.

| Frequency | Default | Max |
|---|---|---|
| Weekly | 1 day | 3 days |
| Every 2 Weeks | 2 days | 1 week |
| Monthly | 3 days | 2 weeks |
| Quarterly | 1 week | 1 month |
| Half Yearly | 2 weeks | 3 months |
| 9 Months | 2 weeks | 3 months |
| Yearly | 1 month | 3 months |
| 18 Months+ | 1 month | 3 months |

In the UI, lead time options beyond the max are shown disabled with `(max: X)` appended to their label.

### Consequences

- Reduces configuration friction for the common case.
- Prevents obviously wrong values (e.g. 3-month lead for a weekly event).
- The max values are not enforced at the DB level — they are a UI constraint. API validation should still reject lead times that exceed the max for the given frequency.

---

## ADR-012

**Title:** Tasks module — one-off items only; no recurring tasks

**Status:** Accepted

**Date:** 2026-06-02

### Context

Early designs included recurring tasks in the Tasks module. Recurring items appear in multiple modules (Bills, Medications, Pet Care, etc.) and the recurring schedule logic needed a single owner to avoid duplication.

### Decision

The Tasks module handles **one-off items only** (Simple tasks and Appointments). Recurring tasks are not a feature of the Tasks module.

All recurring events across the app are aggregated in the **Key Dates** module (ADR-013), which is the single place where recurring schedules are managed and visualised.

### Consequences

- Tasks UI is simpler — no frequency/lead time fields.
- Recurring reminders for task-like things go through Key Dates → "Others" category.
- Users who want a recurring task must use Key Dates.

---

## ADR-013

**Title:** Key Dates aggregates all recurring events; owns "Others"

**Status:** Accepted

**Date:** 2026-06-02

### Context

Recurring events appear in many modules: Bills (renewal dates), Pet Care (vaccinations), Medications (refills), Vehicles (MOT, service), etc. Users need one place to see all upcoming recurring events and to add ad-hoc recurring reminders that don't fit any specific module.

### Decision

The **Key Dates** module (5th tab in Life Admin) is the single view for all recurring events across the app. It aggregates events from every module in read-only summary rows. It also owns an **"Others"** category for recurring reminders that don't belong to any specific module.

Module-specific recurring events (e.g. a vehicle MOT schedule) are managed in their home module. Key Dates shows them but does not let the user edit them — editing takes place in the originating module.

### Consequences

- Users have one calendar-like view for all upcoming recurring events.
- No duplication of recurring schedule data — each event is stored once in its module.
- Key Dates must query across multiple tables to build its aggregated view.
- The "Others" category in Key Dates is the catch-all for truly miscellaneous recurring reminders.

---

## ADR-014

**Title:** Tasks has two sub-types: Simple and Appointment

**Status:** Accepted

**Date:** 2026-06-02

### Context

One-off tasks come in two meaningfully different shapes: a plain to-do (a thing to do by a date) and an appointment (a thing happening at a specific time and place). Combining them in one undifferentiated row would leave half the fields empty for either type.

### Decision

The Tasks module has two sub-types, selected in the add/edit form:

- **Simple** — title, due date, priority, notes. No time or location.
- **Appointment** — title, date + time, duration, location, notes.

Both live in the same `todo_items` table, distinguished by a `task_type` column. The UI renders different form fields based on sub-type selection.

### Consequences

- A single table covers both types; simpler schema.
- The form must branch on `task_type` to show/hide fields.
- API validation must enforce that Appointment items have a time; Simple items do not require one.

---

## ADR-015

**Title:** Rails API-only backend (replacing FastAPI/Python)

**Status:** Accepted

**Date:** 2026-06-12

### Context

The first iteration of MyDigitalPals used FastAPI (Python) as the backend. MyPal is a ground-up rebuild. We chose the backend stack for the new repo.

Criteria: strong conventions (reduces decision fatigue), mature auth and authorisation ecosystem, good test tooling, team familiarity.

### Decision

**Ruby on Rails in API-only mode** (`rails new --api`). Key library choices:

- **Pundit** for authorisation — simple, policy-per-model, easy to test.
- **Blueprinter** for serialisation — explicit field lists, no magic, fast.
- **`jwt` gem** for Cognito JWT verification via JWKS.
- **RSpec** for testing — request specs as the primary layer.
- **Rubocop** for linting.

FastAPI, SQLAlchemy, Alembic, and Pydantic are not used in this project.

### Consequences

- Rails conventions (thin controllers, fat services/models, migrations, strong params) apply everywhere — see `backend/CLAUDE.md`.
- The Alembic migration history from MyDigitalPals does not carry over; migrations start fresh.
- `db/mypal-schema.sql` is the schema reference document; `db/migrate/` is the migration source.
- The BFF proxy in Next.js was adjusted to point to Rails (`RAILS_INTERNAL_URL`) instead of FastAPI.

---

## ADR-016

**Title:** AWS deployment topology — ECS Fargate, ALB-public/private tiers, ephemeral environments

**Status:** Accepted

**Date:** 2026-06-14

### Context

We need to run MyPal on AWS to test it end-to-end before launch. Constraints and goals: minimal cost, but a **production-shaped** layout (for fidelity and as a learning exercise). Expected usage is bursty — ~2 hours, ~8 times/month — with the environment torn down between sessions. The domain `mydigitalpals.com` is a Route 53 hosted zone in the target account (`382888552064`, eu-west-1); a `mypal-dev-users` Cognito pool already exists there.

Options considered: (A) one Fargate task with both containers in public subnets, no NAT — cheapest/simplest; (B) two services in public subnets with Service Connect + SG isolation, no NAT; (C) two services with the ALB public and the app + data tiers in **private** subnets behind a NAT Gateway — the real production pattern. Because the environment is destroyed after each session, per-hour resources (incl. NAT) bill only for the ~16 hours/month used, so cost is no longer the deciding factor (~$3–4/month for any option).

### Decision

Adopt **Option C**. One VPC; ALB (HTTPS) and a single NAT Gateway in public subnets; **frontend and backend ECS Fargate services and RDS in private subnets**; isolation enforced by security groups (alb→frontend→backend→rds). Frontend↔backend over **ECS Service Connect** (`RAILS_INTERNAL_URL=http://backend:3001`). **RDS PostgreSQL** `db.t4g.micro` single-AZ. **Reuse** the existing `mypal-dev-users` Cognito pool for now.

Environments use subdomains of `mydigitalpals.com`: **`dev.`** (build first), `uat.` (later), apex for production. A single **wildcard ACM cert** `*.mydigitalpals.com` covers all.

Terraform is split into a persistent **base** (VPC, subnets, ACM cert, ECR, Secrets Manager) and an **ephemeral** stack (NAT, ALB, ECS, RDS) that is `apply`/`destroy`-ed per session, so spin-up/teardown is fast and only hourly-billed resources churn.

### Consequences

- A production-faithful topology (public/private tiers, NAT, service-to-service discovery) at ~$3–4/month under the ephemeral usage model.
- `RAILS_INTERNAL_URL` changes from `localhost` to the Service Connect name; backend in a private subnet reaches Cognito (no PrivateLink) and ECR/Secrets via the NAT.
- More moving parts than A/B → more to learn, and more that can snag on `destroy`; single-AZ NAT/RDS are **not HA** (acceptable for test).
- Reusing one Cognito pool across environments is a temporary convenience; a separate `mypal-prod-users` pool is required before production.
- Detailed design, resource inventory, env/secret matrix, cost, and the runbook live in `infrastructure/deployment-architecture.md`.

---

## ADR template

```markdown
## ADR-XXX

**Title:** Short decision title

**Status:** Proposed | Accepted | Superseded by ADR-YYY | Deprecated

**Date:** YYYY-MM-DD

### Context

What is the problem? What constraints or forces are at play? What alternatives were considered?

### Decision

What did we decide and why? Be concrete — name the specific technology, pattern, or rule chosen.

### Consequences

What does this decision enable? What does it constrain? What must other developers know as a result?
```

---

## Revision history

| Version | Updated by | Last updated (UTC) | Summary |
|---|---|---|---|
| 1.0 | Cowork | 12/06/2026 18:25 UTC | Initial ADR log. Eight ADRs: multi-tenant model (001), Pundit vs RLS (002), BFF auth (010), FreqLeadPair lead time (011), Tasks one-off only (012), Key Dates aggregation (013), Task sub-types (014), Rails backend (015). |
| 1.1 | Cowork | 12/06/2026 20:35 UTC | Added ADR-003: two plan tiers only ('solo'/'family'), account_types table removed, social_logins dropped. Documents decisions made ahead of baseline migration. |
| 1.2 | Claude Code | 14/06/2026 16:18 UTC | Added ADR-016: AWS deployment topology (ECS Fargate Option C — ALB-public / app+data private + NAT, Service Connect, RDS, reuse dev Cognito, dev/uat/prod subdomains, ephemeral base/stack split). Detail in infrastructure/deployment-architecture.md. |
