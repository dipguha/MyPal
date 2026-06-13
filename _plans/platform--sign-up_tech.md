# Plan: Sign Up

> Spec: `_specs/platform--sign-up.md`
> Branch: `claude/feature/platform--access-control` (recommend moving this work to `claude/feature/platform--sign-up`)

---

## Context

Sign Up lets a new visitor create a MyPal account: pick a plan (Individual/Family), submit their details, verify their email with a 6-digit code, and land on onboarding. The web frontend for this is **already fully built** (`frontend/src/app/(public)/sign-up/page.tsx` and `.../sign-up/verify/page.tsx`). What does not exist yet is the **Rails backend** (the `backend/` directory contains only `CLAUDE.md` — no Rails app), the **Cognito sign-up integration**, and the **account-bootstrap transaction**. This plan stands up the Rails API from zero, wires the three already-expected auth endpoints, and integrates Cognito (SignUp / ConfirmSignUp / ResendConfirmationCode) plus the DB bootstrap that creates the first member as **Owner** and auto-creates the HMG group (access-control G-01).

---

## Decisions captured

> All decisions below confirmed by Dip 2026-06-13.

- **Rails owns the auth endpoints; Cognito is called server-side from Rails — not from the Next.js BFF.** ✅ Confirmed. The built frontend posts to `/api/public/auth/sign-up|confirm|resend-verification`; no dedicated Next route handlers exist, so these fall through `frontend/src/app/api/public/[...path]/route.ts` to Rails `/api/v1/auth/*`. Keeping Cognito + the DB bootstrap together in Rails makes the "create user then create rows" sequence atomic in one place (spec §10). (The existing `frontend/src/lib/cognito-auth.ts` calls Cognito directly, but that is only for the NextAuth **sign-in** Credentials provider, which needs tokens inside Next; sign-up needs no tokens.)
- **Confirmation is a 6-digit code, not an email link.** ✅ Confirmed (6-digit code). The built `verify/page.tsx` submits a `code` to `/confirm`. The Cognito user pool must be configured to email a confirmation **code** (`ConfirmSignUp`), overriding the spec prototype's "click the link" wording (§9).
- **Pull only the foundational slice of access-control into Phase 0** — ✅ Confirmed. The canonical role set (so `owner` exists) and the `groups`/`group_members` tables (so HMG can be created at sign-up). The full access-control feature (permissions matrix, `assigned_to`/`visible_to`, Pundit visibility, RLS-vs-Pundit reconciliation) is **out of scope** here; it gets its own plan.
- **Reseed `member_roles` to the canonical enum** ✅ Confirmed: `owner, admin, adult, grandparent, teenager, child` (ADR-001 hierarchy preserved). The baseline migration seeded `admin, partner, member, child, grandparent` — there is no `owner`, which sign-up requires. Pre-launch, reseed rather than version.
- **Cognito calls require SECRET_HASH** — *constraint, not a choice.* The dev app client is confidential (has a secret per `.env.example` `COGNITO_CLIENT_SECRET`), so Cognito rejects `SignUp`/`ConfirmSignUp`/`ResendConfirmationCode` unless they include `Base64(HMAC_SHA256(username + clientId, clientSecret))` — same shape as `cognito-auth.ts:secretHash`. Action item: Rails needs `COGNITO_CLIENT_ID` + `COGNITO_CLIENT_SECRET` in its env (see 1.6).
- **Rails migrations live in `backend/db/migrate/`** ✅ Confirmed (move to the right location). The existing baseline migration at repo-root `db/migrate/20260612000001_create_baseline.rb` is moved into the Rails app; `db/mypal-schema.sql` stays at repo root as the reference document (ADR-015). ADR-015's "`db/migrate/`" wording is updated to `backend/db/migrate/` (see follow-ups).
- **`onboarding_complete` lives on `members`** (per-member) ✅ Confirmed, since `/api/v1/auth/me` returns it for the signed-in member.

---

## High-level flow

```mermaid
sequenceDiagram
  participant B as Browser (sign-up/page.tsx)
  participant P as Next BFF (public/[...path])
  participant R as Rails /api/v1/auth
  participant C as AWS Cognito
  participant D as PostgreSQL

  B->>P: POST /api/public/auth/sign-up {first_name,…,account_type}
  P->>R: POST /api/v1/auth/sign-up (no token; cookie/host stripped)
  R->>C: SignUp(email,password,phone,SECRET_HASH)
  alt UsernameExistsException
    C-->>R: error
    R-->>B: 422 {detail:{code:"email_taken"}}
  else created (sub returned, code emailed)
    C-->>R: UserSub
    R->>D: TX: accounts+users+members(owner)+settings+HMG
    D-->>R: ok
    R-->>B: 201 {email}
    B->>B: router.push(/sign-up/verify?email=…)
  end
  B->>P: POST /api/public/auth/confirm {email,code}
  P->>R: POST /api/v1/auth/confirm
  R->>C: ConfirmSignUp(email,code,SECRET_HASH)
  R-->>B: 200 → /sign-in?verified=1&callbackUrl=/onboarding
```

---

## Phase 0 — Rails app scaffold + access-control foundations + env rename

### 0.1 Scaffold the Rails API app
**Dir:** `backend/`

`rails new` an API-only app **into `backend/`** (it currently holds only `CLAUDE.md` — preserve that file). Target the layout in `backend/CLAUDE.md`:

```
backend/app/{controllers,models,policies,serializers,services,lib}
backend/config/{routes.rb,initializers}
backend/db/migrate
backend/spec/{requests,models,policies,services,factories}
backend/Gemfile  backend/.env.example
```

Generate with `--api -T -d postgresql` (skip default test; RSpec added next).

### 0.2 Gemfile — exact gem set from `backend/CLAUDE.md`
**File:** `backend/Gemfile`

Add: `pundit`, `blueprinter`, `jwt`, `rack-cors`, and group `:development, :test` → `rspec-rails`, `factory_bot_rails`, `faker`, `database_cleaner-active_record`, `rubocop-rails`, `dotenv-rails`. No `devise`/`jbuilder`/`active_model_serializers`. Run `bundle install`, `rails g rspec:install`.

### 0.3 Base application wiring
**Files:** `backend/app/controllers/application_controller.rb`, `backend/app/lib/cognito_jwt_verifier.rb`, `backend/app/policies/application_policy.rb`, `backend/app/serializers/base_serializer.rb`, `backend/config/initializers/cors.rb`

Copy the shapes verbatim from `backend/CLAUDE.md`:
- `CognitoJwtVerifier.verify(token)` — JWKS fetch (cached) + decode; raises `JWT::DecodeError`.
- `ApplicationController` — `authenticate_request!` resolves `cognito_sub → User → member`, sets `@current_member`; `pundit_user = current_member`; `rescue_from` Pundit→403, JWT→401.
- CORS allows `ALLOWED_ORIGINS`.

> Note: auth endpoints in Phase 1 are **public** (pre-auth) — they `skip_before_action :authenticate_request!`. Only `/auth/me` authenticates.

### 0.4 Move the baseline migration into the Rails app
**From:** `db/migrate/20260612000001_create_baseline.rb` → **To:** `backend/db/migrate/`

Move the file; configure `backend/config/database.yml` to read `DATABASE_URL`. `rails db:create db:migrate` must reproduce the 7 baseline tables.

### 0.5 Reseed roles to the canonical access-control set
**File:** `backend/db/migrate/<ts>_reseed_member_roles.rb`

Replace the baseline seed (`admin, partner, member, child, grandparent`) with the access-control enum (access-control §8). Keep the hierarchy (ADR-001):

```ruby
# owner(1) → admin(2) → adult(3) → { grandparent(4), teenager(5), child(6) }
execute <<~SQL
  DELETE FROM member_roles;
  INSERT INTO member_roles (id, code, display_name, parent_role_id, sort_order) VALUES
    (1,'owner','Owner',NULL,1),
    (2,'admin','Admin',1,2),
    (3,'adult','Adult Member',2,3),
    (4,'grandparent','Grandparent',3,4),
    (5,'teenager','Teenager',3,5),
    (6,'child','Children',3,6);
  SELECT setval('member_roles_id_seq', 10);
SQL
```

Gotcha: do this before any `members` rows exist (it does — greenfield). FK `members.role_id → member_roles` stays valid.

### 0.6 Add `groups` + `group_members` (HMG foundation)
**File:** `backend/db/migrate/<ts>_create_groups.rb`

Per access-control §8 (account-scoped, not `household_id`):

```ruby
create_table :groups, id: :uuid do |t|
  t.references :account, type: :uuid, null: false, foreign_key: { on_delete: :cascade }
  t.string :type, null: false              # 'hmg' (extensible)
  t.datetime :created_at, null: false, default: -> { "NOW()" }
end
execute "ALTER TABLE groups ADD CONSTRAINT chk_groups_type CHECK (type IN ('hmg'));"
add_index :groups, [:account_id, :type], unique: true

create_table :group_members, id: :uuid do |t|
  t.references :group,  type: :uuid, null: false, foreign_key: { on_delete: :cascade }
  t.references :member, type: :uuid, null: false, foreign_key: { on_delete: :cascade }
  t.references :added_by, type: :uuid, foreign_key: { to_table: :members, on_delete: :nullify }
  t.datetime :added_at, null: false, default: -> { "NOW()" }
end
add_index :group_members, [:group_id, :member_id], unique: true
```

### 0.7 Add sign-up columns
**File:** `backend/db/migrate/<ts>_add_signup_fields.rb`

```ruby
add_column :users,   :marketing_opt_in,    :boolean, null: false, default: false
add_column :members, :onboarding_complete, :boolean, null: false, default: false
```

### 0.8 Models
**Files:** `backend/app/models/{account,user,member,member_role,group,group_member,account_setting,member_setting}.rb`

ActiveRecord associations: `Account has_many :members, :users, has_one :account_settings, has_many :groups`; `Member belongs_to :account, :user (optional), :member_role; has_one :member_settings`; `Group has_many :group_members`. `Member#owner?`/`#is_hmg?` helpers (`is_hmg?` = exists in any `group_members` for the account's HMG group).

### 0.9 Rename FASTAPI → RAILS across the frontend/BFF (ADR-015 cleanup)
**Files:** `frontend/src/app/api/[...path]/route.ts`, `frontend/src/app/api/public/[...path]/route.ts`, `frontend/auth.ts`, `frontend/.env.example`, `frontend/.env.local`, `frontend/Dockerfile` (and any `docker-compose.yml`)

Rename env var `FASTAPI_INTERNAL_URL` → `RAILS_INTERNAL_URL`, the `FASTAPI` const → `RAILS`, default `http://localhost:8000` → `http://localhost:3001` (Rails dev port per `backend/CLAUDE.md`), and update the "FastAPI" comments. Verify with `grep -rni fastapi frontend/` → zero hits.

### 0.X Database cleanup — remove or update obsolete objects

| Object | Type | Why obsolete | Replaced by |
|---|---|---|---|
| `member_roles` seed `partner`, `member`, `child` codes | seed rows | Baseline seed predates the access-control role model; sign-up needs `owner` | Reseeded set `owner/admin/adult/grandparent/teenager/child` (0.5) |

**Updates (not removals):**
- `db/mypal-schema.sql` — reference doc still shows the old `member_roles` hierarchy comment (`admin → partner → member → child`) and lacks `groups`/`group_members` and the two new columns. Update the reference to match migrations (low priority; migrations are authoritative per ADR-015).
- `frontend/auth.ts` + both proxy routes — still reference `FASTAPI_INTERNAL_URL`/"FastAPI" (0.9).

**Left alone (with justification):**
- `members.is_admin`, `role_permissions` — still valid under the new model; untouched by sign-up.
- All feature tables in `db/mypal-schema.sql` (finance, health, etc.) — not part of sign-up; added by their own migrations later.

**Out of scope for this migration:** the full access-control schema (`member_module_permissions`, `access_log`, item visibility columns) — deferred to the access-control plan (Open follow-ups).

---

## Phase 1 — Cognito integration + Rails auth endpoints

### 1.1 Cognito client service (server-side, SECRET_HASH)
**File:** `backend/app/services/cognito_service.rb`

Plain Ruby service wrapping the three unauthenticated Cognito IDP actions over REST (no AWS SDK needed — mirrors `frontend/src/lib/cognito-auth.ts`). Reads `AWS_REGION`, `COGNITO_CLIENT_ID`, `COGNITO_CLIENT_SECRET`.

```ruby
class CognitoService
  Error = Class.new(StandardError) { attr_reader :cognito_code }
  def self.sign_up(email:, password:, phone: nil)  # → sub (String); raises Error(cognito_code:)
  def self.confirm(email:, code:)                  # → true
  def self.resend(email:)                          # → true
  def self.admin_delete(email:)                    # AdminDeleteUser — rollback cleanup (best-effort)
  def self.secret_hash(username) = Base64.strict_encode64(OpenSSL::HMAC.digest("SHA256", SECRET, username + CLIENT_ID))
end
```

`X-Amz-Target` values: `AWSCognitoIdentityProviderService.SignUp`, `.ConfirmSignUp`, `.ResendConfirmationCode`. SignUp `UserAttributes`: `email`, and `phone_number` when present. Map `__type` → `cognito_code` (e.g. `UsernameExistsException`, `CodeMismatchException`, `ExpiredCodeException`, `InvalidPasswordException`).

### 1.2 Account bootstrap service (the transaction)
**File:** `backend/app/services/account_bootstrap_service.rb`

```ruby
# Called AFTER CognitoService.sign_up returns a sub.
def self.call(sub:, email:, first_name:, last_name:, phone:, marketing_opt_in:, account_type:)
  ActiveRecord::Base.transaction do
    account  = Account.create!(plan: account_type, family_name: nil)          # 'solo' | 'family'
    AccountSetting.create!(account:)                                          # GBP/Europe-London defaults
    user     = User.create!(account:, cognito_sub: sub, email:, phone:, marketing_opt_in:)
    member   = Member.create!(account:, user:, role_id: OWNER_ROLE_ID,
                              display_name: first_name, first_name:, last_name:, is_admin: true)
    MemberSetting.create!(member:)
    hmg      = Group.create!(account:, type: "hmg")                           # G-01
    GroupMember.create!(group: hmg, member:, added_by: member)               # Owner always in HMG
    account
  end
end
```

Gotcha (ordering): Cognito user is created **before** this transaction. **Decided:** if the transaction raises, the rescue calls `CognitoService.admin_delete(email)` (best-effort) so the same email can be retried cleanly. Note `AdminDeleteUser` is an **admin** Cognito action — unlike the unsigned SignUp/Confirm/Resend calls, it requires AWS IAM credentials (SigV4-signed request, or the `aws-sdk-cognitoidentityprovider` gem). Provision Rails with an IAM role/keys scoped to `cognito-idp:AdminDeleteUser` on the pool. `account_type` maps directly to the `accounts.plan` CHECK (`solo`/`family`).

### 1.3 Routes
**File:** `backend/config/routes.rb`

```ruby
namespace :api do
  namespace :v1 do
    post "auth/sign-up",            to: "auth#sign_up"
    post "auth/confirm",           to: "auth#confirm"
    post "auth/resend-verification", to: "auth#resend"
    get  "auth/me",                to: "auth#me"
    get  "ping",                   to: "health#ping"
  end
end
get "/healthz", to: "health#healthz"
```

### 1.4 AuthController
**File:** `backend/app/controllers/api/v1/auth_controller.rb`

`skip_before_action :authenticate_request!, only: %i[sign_up confirm resend]`. Thin: parse strong params → call services → render. Error contract must match what the **built frontend** parses (`sign-up/page.tsx` reads `body.detail.code`):

```ruby
def sign_up
  sub = CognitoService.sign_up(email: p[:email], password: p[:password], phone: p[:phone])
  AccountBootstrapService.call(sub:, **bootstrap_params)
  render json: { email: p[:email] }, status: :created
rescue CognitoService::Error => e
  render json: { detail: cognito_error(e) }, status: :unprocessable_entity
rescue ActiveRecord::RecordNotUnique
  render json: { detail: { code: "email_taken", detail: "An account with this email already exists — sign in instead" } }, status: :unprocessable_entity
end
```

`cognito_error` mapping → `{code,detail}`: `UsernameExistsException`→`email_taken`; `InvalidPasswordException`→`weak_password`; `CodeMismatchException`/`ExpiredCodeException`→`invalid_code`; else generic. `me` returns `{ onboarding_complete: current_member.onboarding_complete, account_type: current_member.account.plan }` (snake_case — `auth.ts:fetchAuthMe` reads `onboarding_complete`/`account_type`).

Strong params: `sign_up` permits `first_name,last_name,email,password,phone,marketing_opt_in,account_type`; `confirm` permits `email,code`; `resend` permits `email`.

### 1.5 HealthController
**File:** `backend/app/controllers/api/v1/health_controller.rb` — `ping`/`healthz` (skip auth). Lets you smoke-test the proxy chain before Cognito is wired.

### 1.6 Backend env
**File:** `backend/.env.example`

Add to the `backend/CLAUDE.md` set: `COGNITO_CLIENT_ID`, `COGNITO_CLIENT_SECRET` (needed for SECRET_HASH), alongside `AWS_REGION`, `COGNITO_USER_POOL_ID`, `DATABASE_URL`, `ALLOWED_ORIGINS`, `SECRET_KEY_BASE`. **Source of truth for the Cognito creds is Secrets Manager** (`mypal-<env>/cognito/web-bff` → `client_id`/`client_secret`/`issuer`/`user_pool_id`), per the IaC. In dev, copy them into `.env`; in deployed envs, inject from Secrets Manager (don't bake into the image). Also note `AdminDeleteUser` (1.2) needs IAM creds — give the Rails task role `cognito-idp:AdminDeleteUser` on the pool.

---

## Phase 2 — Frontend reconciliation (mostly verification, minimal edits)

The sign-up UI is already built. Tasks here are confirmation + small gaps, not a rebuild.

### 2.1 Confirm the API contract end-to-end
Verify the built request/response shapes (`frontend/src/app/(public)/sign-up/page.tsx` L146–178, `verify/page.tsx` L50–107) match Phase 1: `POST /api/public/auth/sign-up` body keys, the `{detail:{code,detail}}` error envelope, and the `/confirm` + `/resend-verification` paths. No change expected if Phase 1 follows the contract above.

### 2.2 Verify the post-confirm route
`verify/page.tsx` routes to `/sign-in?verified=1&callbackUrl=/onboarding` (not directly to `/onboarding`). Confirm this satisfies F-09 (verified user reaches onboarding via sign-in). If product wants direct entry, that's a sign-in change — out of scope here; note it.

### 2.3 Plan-label guard
Confirm no "Solo" string is user-visible (spec §12). Built UI uses `PLAN_LABEL = {solo:"Individual", family:"Family"}` — verify the details header, reminder strip, and plan cards all use it. (Grep `frontend/src/app/(public)/sign-up` for the literal "Solo".)

---

## Phase 3 — Tests & polish

### 3.1 Request specs — map every §5b / §7 scenario to a named `it`
**File:** `backend/spec/requests/api/v1/sign_up_spec.rb`

Translate intent (not Gherkin steps). Stub `CognitoService` (don't hit AWS in specs). Cover:

§5b: `Plan selection screen renders both cards`*, `Clicking a plan card navigates to details`* (frontend/Playwright — note as UI), `Header label matches selected plan`*, `Reminder strip shows correct plan and price`*, `Submit disabled without terms agreement`*, `Submit enabled after terms agreed`*, `Server rejects duplicate email`, `Strength label updates as password is typed`*, `Form submits without a phone number`, `Sign in link visible on plan selection screen`*, `Verification screen shows four actions`*, `Resend triggers new verification email`, `Wrong email returns to details form`*, `Verified user lands on Onboarding`.

§7: `Happy path — Individual email/password sign-up`, `Happy path — Family email/password sign-up`, `Error — duplicate email`, `Error — wrong email entered`*, `Error — verification email not received` (resend).

`*` = pure UI scenarios → cover in a Playwright spec (Open follow-up: Playwright not yet set up) or assert at component level; the rest are Rails request specs. Each gets a `# Given/When/Then` comment.

Key backend assertions:
- Happy path: `CognitoService.sign_up` called once; one `accounts`(plan), `users`(cognito_sub, marketing_opt_in), `members`(role owner, is_admin), `account_settings`, `member_settings`, `groups`(hmg), `group_members`(owner) created; `201 {email}`.
- Duplicate: `UsernameExistsException` → `422 {detail:{code:"email_taken"}}`; **no DB rows created**.
- Transaction rollback: if bootstrap raises mid-way, no partial rows remain (and Cognito cleanup invoked per 1.2 decision).
- `confirm`: valid code → `200`; `CodeMismatchException` → error envelope.
- Phone omitted → success, no phone attribute sent to Cognito.

### 3.2 Service + model specs
**Files:** `backend/spec/services/account_bootstrap_service_spec.rb` (transaction atomicity, owner+HMG creation), `backend/spec/services/cognito_service_spec.rb` (SECRET_HASH value, `__type`→code mapping, request shape via WebMock), `backend/spec/models/member_spec.rb` (`is_hmg?`, `owner?`).

### 3.3 Lint & smoke
`bundle exec rubocop -a`; `bundle exec rspec`; manual smoke per Verification below.

---

## Critical files

| File | Role in this feature |
|------|---------------------|
| `backend/app/controllers/api/v1/auth_controller.rb` | The three public auth endpoints + `/me`; error envelope the frontend parses |
| `backend/app/services/cognito_service.rb` | Server-side Cognito SignUp/Confirm/Resend with SECRET_HASH |
| `backend/app/services/account_bootstrap_service.rb` | The accounts+users+members(owner)+settings+HMG transaction (spec §10, G-01) |
| `backend/db/migrate/<ts>_reseed_member_roles.rb` | Makes `owner` role exist (canonical access-control set) |
| `backend/db/migrate/<ts>_create_groups.rb` | HMG `groups`/`group_members` foundation |
| `backend/app/controllers/application_controller.rb` | JWT verify + `current_member` (powers `/auth/me` and all future endpoints) |
| `frontend/src/app/(public)/sign-up/page.tsx` | Built UI; defines the request contract (read-only reference) |
| `frontend/src/app/(public)/sign-up/verify/page.tsx` | Built code-entry UI; defines `/confirm` + `/resend` contract |
| `frontend/src/app/api/public/[...path]/route.ts` | BFF passthrough to Rails for the pre-auth auth endpoints |

---

## Reusable pieces

| Name | Location | Used for |
|------|----------|----------|
| `secretHash` pattern | `frontend/src/lib/cognito-auth.ts` | Exact SECRET_HASH shape to mirror in `CognitoService` |
| Cognito client (port reference) | `~/Documents/MyDigitalPals/backend/app/integrations/cognito.py` | Working Python impl of SignUp/Confirm/Resend/SECRET_HASH/admin_create_user/change_password — the model for the Rails `CognitoService` |
| Cognito Terraform module | `~/Documents/MyDigitalPals/infrastructure/modules/cognito/main.tf` | Proven pool+client config (auth flows, generate_secret, CONFIRM_WITH_CODE, SES DEVELOPER mode) to port into MyPal's stub module |
| `ApplicationController`/`CognitoJwtVerifier`/`ApplicationPolicy`/`BaseSerializer` shapes | `backend/CLAUDE.md` | Copy-in base classes for 0.3 |
| Baseline migration | `db/migrate/20260612000001_create_baseline.rb` | The 7 identity tables; move into `backend/db/migrate/` |
| `pwdScore`, `PWD_LABELS` | `frontend/src/lib/password-strength.ts` | Already powering the built strength meter — no change |
| Public BFF proxy | `frontend/src/app/api/public/[...path]/route.ts` | Already routes `/api/public/auth/*` → Rails `/api/v1/auth/*` |

---

## Verification

1. **Backend up:** `cd backend && rails db:create db:migrate && rails server` (port 3001). `GET http://localhost:3001/healthz` → 200.
2. **Roles seeded:** `rails runner 'puts MemberRole.order(:id).pluck(:code).inspect'` → `["owner","admin","adult","grandparent","teenager","child"]`.
3. **Proxy chain:** with `RAILS_INTERNAL_URL=http://localhost:3001` and `npm run dev`, `curl -XPOST localhost:3000/api/public/auth/sign-up -H 'content-type: application/json' -d '{...}'` reaches Rails.
4. **Happy path (Individual):** at `/sign-up`, click **Individual**, fill valid details + strong password, tick terms, submit → redirected to `/sign-up/verify?email=…`; in DB: one `accounts(plan='solo')`, `users`, `members(role_id=owner, is_admin=true)`, `account_settings`, `member_settings`, `groups(type='hmg')`, `group_members(owner)`. Cognito emails a 6-digit code.
5. **Verify:** enter the code → `200` → land on `/sign-in?verified=1&callbackUrl=/onboarding`; signing in reaches `/onboarding`.
6. **Family path:** repeat picking **Family** → `accounts.plan='family'`.
7. **Duplicate email:** submit an existing email → inline error under email "An account with this email already exists — sign in instead"; **no new rows**.
8. **Weak password:** Cognito `InvalidPasswordException` → inline error under password.
9. **Phone omitted:** submit with blank phone → success, no phone error, `users.phone` null.
10. **Resend:** on verify screen click "Resend email" → new code emailed; link briefly disabled.
11. **Wrong email:** click "Wrong email? Go back" → details form restored from `sessionStorage` draft.
12. **Rollback:** force a DB error in bootstrap (temp) → confirm zero partial rows and Cognito user cleaned up/unconfirmed.
13. `cd backend && bundle exec rspec` → all green; `bundle exec rubocop` clean.

---

## Open follow-ups

**Resolved (Dip 2026-06-13):**
- [x] **Confirmation design:** 6-digit code (not link) — confirmed; the built UI is the intended design.
- [x] **Migrations location:** `backend/db/migrate/`. Action: update ADR-015's "`db/migrate/`" wording to `backend/db/migrate/` when scaffolding (eng).
- [x] **`onboarding_complete` location:** on `members` — confirmed.
- [x] **Access-control scope:** foundational slice (roles + HMG groups) only; full feature deferred.
- [x] **Cognito rollback policy:** **decided — `AdminDeleteUser` on bootstrap failure** (clean retry; avoids an orphaned unconfirmed user blocking the same email). Implemented in 1.2. Reversible if it proves noisy.

**Cognito pool check — done (verified against MyDigitalPals IaC, 2026-06-13):**
- [x] `USER_PASSWORD_AUTH` enabled — `ALLOW_USER_PASSWORD_AUTH` in the pool client's `explicit_auth_flows`.
- [x] App client secret available — `generate_secret = true`; creds in **Secrets Manager** `mypal-<env>/cognito/web-bff` (`client_id`/`client_secret`/`issuer`/`user_pool_id`). Rails reads these from Secrets Manager, not plain env (adjust 1.6).
- [x] Confirmation is code-based — pool template `default_email_option = "CONFIRM_WITH_CODE"`. Corroborates our decision.

**Still open (pre-implementation):**
- [ ] **SES sender not wired:** `YourDigitalPal@mydigitals` is a TODO in the IaC (`ses_from_identity_arn` defaults to `null` → Cognito's default sender, 50/day sandbox). **Dev:** build/test on the default sender, but SES sandbox only emails **pre-verified recipient addresses** — add your test inboxes as verified identities. **Before prod:** verify the SES identity and set `ses_from_identity_arn` — Dip/ops.
- [ ] **Confirm live MyPal pool matches the IaC** — MyPal's own `modules/cognito` is still a stub; verify the existing dev pool's flows/secret against AWS (or port the MyDigitalPals module) — eng.
- [ ] **Branch:** move this work onto `claude/feature/platform--sign-up` (currently on the access-control branch) — Dip.
- [ ] **Playwright:** pure-UI §5b scenarios (`*`) need an E2E runner; none is set up yet. Add Playwright or scope these to component tests — eng.
- [ ] **Full access-control** (permissions matrix, `assigned_to`/`visible_to`, Pundit visibility, **RLS-vs-ADR-002 conflict**) — needs its own `/tech_spec` after sign-up — Dip.
- [ ] **`db/mypal-schema.sql` reference sync:** add `groups`/`group_members`, the two new columns, and the reseeded roles to the reference doc — eng (low priority).
