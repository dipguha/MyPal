# Plan: Platform — Onboarding

> Spec: `_specs/platform--onboarding.md`
> Branch: `claude/feature/platform--onboarding`

---

## Context

Every new MyPal member — Owner, Admin, Adult Member, Grand Parent, Teenager or Child — lands in an empty app on their first sign-in. Onboarding is a fast, role-aware wizard: Family-plan Owners/Admins can invite and configure family members, and **all** members set up a daily briefing and interests. Each step persists server-side on "Continue" so partial progress survives a closed browser; on the Done screen "Enter MyPal" flips `onboarding_complete` and routes to Today. This plan covers the Phase-1 web flow with Cognito email invitations.

**No profile-setup step in onboarding** (kept deliberately fast — see Decisions): display name comes from sign-up, and avatar selection lives in My Account → My Profile, not the onboarding journey.

A working onboarding **frontend** already exists at `frontend/src/app/(app)/onboarding/page.tsx` (built against an older spec: branches only on `account_type`, includes a Profile step, has no Grand Parent role). The **Rails backend has zero onboarding endpoints** — `config/routes.rb` only has auth. So this feature is: build the backend from scratch + rework the existing frontend to be role-aware and drop the Profile step.

---

## Decisions captured

- **Onboarding has no Profile step.** Per Dip: profile setup (display name + avatar) belongs to My Account → My Profile, kept out of onboarding to keep the journey fast. `display_name` is already set at sign-up (`AccountBootstrapService` → `display_name: first_name`); `avatar_emoji` is set later in My Profile (`useProfile.ts` already exposes it). The approved prototype confirms this — its onboarding has no Profile step (`_UI/mypal-app.jsx:1456`). The v3 spec's Profile step (§2/§4/F-02/§7/§9) is therefore dropped here and the spec needs correcting — see Open follow-ups.
- **Child onboarding mirrors Teenager.** Per Dip: a Child is no longer a special short journey — Child sees the same steps as Teenager (Welcome → Briefing → Interests → Done). This removes the Child 3-step flow and the "Child does not see Briefing/Interests" rules from the spec.
- **Only two step shapes remain:** Owner/Admin on Family plan → `Welcome, Family, Briefing, Interests, Done` (5); every other member (Owner on Individual, Adult, Grand Parent, Teenager, Child) → `Welcome, Briefing, Interests, Done` (4). The only role-gated step is **Family** (Owner/Admin + Family plan).
- **Briefing + interests persist as columns/arrays on `member_settings`** (not the design-reference `briefing_settings`/`interests`/news-junction tables), per Dip's choice and spec §8. One additive migration, no new models. The dedicated tables in `db/mypal-schema.sql` remain the documented-but-unbuilt target for `today-daily-brief` — see Open follow-ups.
- **`onboarding_complete` lives on `members`, not `users`.** Spec §8/F-09 say "users record", but the live schema (`backend/db/schema.rb:97`) and `auth#me` (`current_member.onboarding_complete`) already use `members`. We follow the code.
- **Role codes are `owner, admin, adult, grandparent, teenager, child`** (from `ReseedMemberRoles`), not the spec §8 enum `adult_member`. The frontend "Adult Member" label maps to code `adult`; "Children" display maps to code `child`.
- **`members.avatar_emoji` is NOT added by this feature.** With the Profile step gone, onboarding never writes it. The column is My Profile's responsibility — see Open follow-ups.
- **Step set is computed server-side** by `OnboardingStatusService` from `(role, plan)` and returned in `/onboarding/status`; the frontend mirrors the same function. Single source of truth.
- **Per-step completion is derived from data presence**, not explicit skip flags — skipped optional steps save nothing, so "no data ⇒ dash, data ⇒ checkmark" satisfies F-07 and the F-10 resume logic with no extra schema.
- **Family invitations use Cognito `AdminCreateUser`** (sends the built-in invitation email) via a new `CognitoService.admin_create_user`, mirroring the existing `admin_delete` admin-SDK path. Invitations fire once, on Family-step "Continue"; a delivery failure is logged and surfaced as a non-blocking Done-screen warning (NF-06).
- **`complete` is `PATCH /api/v1/onboarding/complete`** per spec F-09 (the existing frontend POSTs — we change it to PATCH). Family-members route is `family_members` (underscore) to match spec §5b.

---

## High-level flow

```
                                   ┌───────────────────────────────────────────┐
  Browser (/onboarding)            │  Next.js BFF /api/[...path]/route.ts        │
  ──────────────────────           │  reads Cognito access token from session,   │
  OnboardingPage                   │  forwards to Rails /api/v1/onboarding/*      │
   GET  status ───────────────────▶│────────────────────────────────────────────▶ Api::V1::OnboardingController
   POST  family_members            │                                              │   #status   → OnboardingStatusService → role, plan,
   PATCH briefing                  │                                              │              steps[], *_complete flags
   PATCH interests                 │                                              │   #family_members → OnboardingPolicy (owner/admin+family)
   PATCH complete                  │                                              │              → FamilyMemberInvitationService
                                   └──────────────────────────────────────────────┘                 ├─ Member.create! (+ MemberSetting)
                                                                                                      └─ CognitoService.admin_create_user → User
   on Done "Enter MyPal":                                                             #briefing / #interests → OnboardingService
     PATCH complete → members.onboarding_complete = true                                                      (member_settings, all roles)
     useSession().update() → auth#me refresh → router.push('/today')                  #complete  → members.onboarding_complete = true
```

---

## Phase 1 — Database & Models

### 1.1 Migration — add onboarding fields to `member_settings`
**File:** `backend/db/migrate/<ts>_add_onboarding_fields_to_member_settings.rb` (generate with `rails g migration AddOnboardingFieldsToMemberSettings`)

```ruby
class AddOnboardingFieldsToMemberSettings < ActiveRecord::Migration[7.2]
  def change
    add_column :member_settings, :home_postcode, :string,  limit: 10
    add_column :member_settings, :work_address,  :text
    add_column :member_settings, :commute_mode,  :string,  limit: 10
    add_column :member_settings, :news_topics,   :string,  array: true, default: [], null: false
    add_column :member_settings, :interests,     :string,  array: true, default: [], null: false

    add_check_constraint :member_settings,
      "commute_mode IS NULL OR commute_mode IN ('drive','transit','cycle','walk')",
      name: "chk_member_settings_commute_mode"
  end
end
```
- `commute_mode` enum uses the spec §8 / frontend values `drive/transit/cycle/walk` (diverges from the design-ref `briefing_settings` enum — acceptable since we are not building that table).
- `news_topics` / `interests` are Postgres `text[]`. Interests cap (max 5) is enforced in the service, not the DB.

Run `rails db:migrate`, then commit the regenerated `backend/db/schema.rb`.

### 1.2 Model updates
**File:** `backend/app/models/member.rb`
Add the helper the Family policy needs (mirrors existing `owner?`/`admin?`):
```ruby
def can_manage_family? = owner? || admin?
```

**File:** `backend/app/models/member_setting.rb`
Make the new arrays first-class and guard the interests cap:
```ruby
class MemberSetting < ApplicationRecord
  belongs_to :member
  validates :interests, length: { maximum: 5 }
  # news_topics / interests are text[]; Rails maps to Ruby arrays automatically.
end
```

### 1.3 Database cleanup — remove or update obsolete objects

This feature only **adds** columns; it supersedes nothing in the live schema.

| Object | Type | Why obsolete | Replaced by |
|---|---|---|---|
| — | — | No existing live column/table/index is replaced by this design | — |

**Updates (not removals):** none — `member_settings.briefing_prefs` (unrelated feature toggles) and `members.avatar_url` (Phase-2 photo slot) are untouched.

**Left alone (with justification):** the design-reference tables `briefing_settings`, `interests`, `member_news_categories`, `news_categories` in `db/mypal-schema.sql` are **not built** and not dropped — they remain the documented target for the briefing/feed subsystems. We deliberately store onboarding's briefing+interests on `member_settings` instead (Dip's decision); reconciling the two is `today-daily-brief`'s job. See Open follow-ups.

**Out of scope for this migration:** `members.avatar_emoji` (owned by My Profile — see follow-ups); building/seeding `news_categories` + junctions (owned by `today-daily-brief`).

### 1.4 Factories
**File:** `backend/spec/factories/members.rb`
Add a `grandparent` trait used by the stepper specs:
```ruby
trait :grandparent do
  role_id { 4 }
  is_admin { false }
end
```
(Existing traits `:admin`, `:adult`, `:teenager`, `:child` already match role ids 2/3/5/6.)

---

## Phase 2 — Backend API

### 2.1 Routes
**File:** `backend/config/routes.rb` — add under `namespace :v1`:
```ruby
get   "onboarding/status",         to: "onboarding#status"
post  "onboarding/family_members", to: "onboarding#family_members"
patch "onboarding/briefing",       to: "onboarding#briefing"
patch "onboarding/interests",      to: "onboarding#interests"
patch "onboarding/complete",       to: "onboarding#complete"
```
All are authenticated (no `skip_before_action`), so an unauthenticated call returns 401 via `authenticate_request!` (satisfies F-09 unauthenticated scenario).

### 2.2 Pundit policy (headless)
**File:** `backend/app/policies/onboarding_policy.rb`
Family is the only role-gated step.
```ruby
class OnboardingPolicy < ApplicationPolicy
  # record is the symbol :onboarding (headless policy)
  def family_members? = current_member.can_manage_family? && current_member.account.plan == "family"
end
```
Call from the controller with `authorize :onboarding, :family_members?`. `Pundit::NotAuthorizedError` is already rescued to **403** in `ApplicationController#forbidden`. Briefing/interests are open to every authenticated member — no policy method needed.

### 2.3 Status service
**File:** `backend/app/services/onboarding_status_service.rb`
Single source of truth for the step set + completion. Returns a plain hash the serializer renders.
```ruby
class OnboardingStatusService
  def self.call(member)
    s = member.member_setting
    {
      role:    member.role_code,                 # 'owner' | 'admin' | 'adult' | 'grandparent' | 'teenager' | 'child'
      plan:    member.account.plan,              # 'solo' | 'family'
      steps:   steps_for(member),                # ordered StepId array
      family_complete:    member.account.members.where.not(id: member.id).exists?,
      briefing_complete:  s && (s.home_postcode.present? || s.work_address.present? || s.commute_mode.present? || s.news_topics.any?),
      interests_complete: s && s.interests.any?,
      onboarding_complete: member.onboarding_complete,
      invitation_warning:  false # reported false here; the family_members response carries the real count (see Phase 3.3)
    }
  end

  def self.steps_for(member)
    steps = %w[welcome]
    steps << "family" if member.can_manage_family? && member.account.plan == "family"
    steps += %w[briefing interests]            # all roles, incl. Child
    steps << "done"
    steps
  end
end
```
- `family_complete` proxy = "this account has any other member". Acceptable for the Done summary/resume; noted as a known approximation in follow-ups.
- `briefing_complete`/`interests_complete` derive from data presence so skip ⇒ false ⇒ dash on the Done screen (F-07).

### 2.4 Onboarding service (self-serve steps)
**File:** `backend/app/services/onboarding_service.rb`
```ruby
class OnboardingService
  def self.briefing(member, home_postcode:, work_address:, commute_mode:, news_topics:)
    member.member_setting.update!(
      home_postcode: home_postcode, work_address: work_address,
      commute_mode: commute_mode, news_topics: Array(news_topics)
    )
  end

  def self.interests(member, interests:)
    member.member_setting.update!(interests: Array(interests).first(5)) # hard cap per F-06
  end

  def self.complete(member)
    member.update!(onboarding_complete: true)
  end
end
```

### 2.5 Cognito — invitation send
**File:** `backend/app/services/cognito_service.rb` — add an admin op next to `admin_delete`:
```ruby
# Creates a Cognito user and sends the built-in invitation email.
# @return [String] the new user's sub
def admin_create_user(email:, name:)
  resp = admin_client.admin_create_user(
    user_pool_id: ENV.fetch('COGNITO_USER_POOL_ID'),
    username: email,
    user_attributes: [
      { name: 'email', value: email },
      { name: 'email_verified', value: 'true' },
      { name: 'name', value: name }
    ],
    desired_delivery_mediums: ['EMAIL'] # triggers the invitation email with a temp password
  )
  resp.user.attributes.find { |a| a.name == 'sub' }&.value
end
```
Requires IAM creds (same as `admin_delete`). Wrap caller in rescue so a failure is logged + counted, not raised (NF-06).

### 2.6 Family invitation service
**File:** `backend/app/services/family_member_invitation_service.rb`
Creates member rows and fires invitations on Family-step Continue (F-03/F-04).
```ruby
class FamilyMemberInvitationService
  ROLE_IDS = { "admin" => 2, "adult" => 3, "grandparent" => 4, "teenager" => 5, "child" => 6 }.freeze
  Result = Struct.new(:created, :invited, :failures, keyword_init: true)

  def self.call(owner:, members:)
    created = invited = failures = 0
    members.each do |m|
      role_id = ROLE_IDS.fetch(m[:role])               # reject unknown role → 422 upstream
      member = Member.create!(
        account: owner.account, role_id: role_id,
        display_name: m[:name], first_name: m[:name],
        is_admin: m[:role] == "admin", onboarding_complete: false
      )
      MemberSetting.create!(member: member)
      created += 1

      email = m[:email].presence
      next if email.nil?                                # Child without email → no invite (F-04)
      begin
        sub  = CognitoService.admin_create_user(email: email, name: m[:name])
        user = User.create!(account: owner.account, cognito_sub: sub, email: email)
        member.update!(user: user)
        invited += 1
      rescue StandardError => e
        Rails.logger.warn("[Onboarding] invite failed for #{email}: #{e.message}")
        failures += 1
      end
    end
    Result.new(created: created, invited: invited, failures: failures)
  end
end
```
- Wrapped per-member (not one big transaction) so one invite failure doesn't roll back the others (NF-06).
- Caller enforces the **member cap** (≤5 additional) before calling — see 2.7.
- **HMG group membership** for added Admins is intentionally *not* handled here (belongs to `platform--access-control`) — see Open follow-ups.

### 2.7 Controller
**File:** `backend/app/controllers/api/v1/onboarding_controller.rb`
```ruby
module Api::V1
  class OnboardingController < ApplicationController
    def status
      render json: OnboardingStatusSerializer.render(OnboardingStatusService.call(current_member))
    end

    def family_members
      authorize :onboarding, :family_members?
      rows = params.permit(members: [:name, :role, :email]).fetch(:members, [])
      return render_422("Too many members", "member_cap") if current_member.account.members.count + rows.size > 6
      result = FamilyMemberInvitationService.call(owner: current_member, members: rows.map(&:to_h).map(&:symbolize_keys))
      render json: { created: result.created, invited: result.invited, invitation_failures: result.failures }, status: :created
    end

    def briefing
      p = params.permit(:home_postcode, :work_address, :commute_mode, news_topics: [])
      OnboardingService.briefing(current_member, **p.to_h.symbolize_keys)
      head :no_content
    end

    def interests
      OnboardingService.interests(current_member, interests: params.permit(interests: []).fetch(:interests, []))
      head :no_content
    end

    def complete
      OnboardingService.complete(current_member)
      head :no_content
    end

    private

    def render_422(error, code) = render(json: { error:, code: }, status: :unprocessable_content)
  end
end
```
Note: 6 = Owner + 5 additional (spec §4: "6 members including Owner"). Briefing/interests have no `authorize` — every member may set them.

### 2.8 Serializer
**File:** `backend/app/serializers/onboarding_status_serializer.rb`
```ruby
class OnboardingStatusSerializer < Blueprinter::Base
  fields :role, :plan, :steps,
         :family_complete, :briefing_complete, :interests_complete,
         :onboarding_complete, :invitation_warning
end
```

---

## Phase 3 — Frontend (rework existing page: role-aware, no Profile step)

> Reworking `frontend/src/app/(app)/onboarding/page.tsx` in place — the route, middleware gate, session wiring, and sign-in redirect already exist and work. Visual contract: `_UI/mypal-app.jsx → Onboarding` (which is `Welcome → Family → Briefing → Interests → Done` — i.e. exactly the Owner/Family journey, so the prototype is now an accurate reference). Re-read `docs/design-system.md` + `frontend/src/components/ui/*` before editing (mandatory pre-flight).

### 3.1 Remove the Profile step
**File:** same
- Delete `StepProfile` and the `AVATAR_EMOJIS` constant, drop `"profile"` from `StepId`, and remove the `initialName`/session-name plumbing that fed it.
- Onboarding no longer calls `/api/onboarding/profile` (the endpoint is gone).

### 3.2 Make step selection role + plan aware
**File:** same
- Extend `OnboardingStatus` to include `role: "owner"|"admin"|"adult"|"grandparent"|"teenager"|"child"` and `steps: StepId[]`, and rename `account_type` → `plan` (matching the serializer).
- Replace `INDIVIDUAL_STEPS`/`FAMILY_STEPS` + the `accountType === "family"` branch with the server-provided `status.steps`, falling back to a local `computeSteps(role, plan)` that mirrors `OnboardingStatusService.steps_for`:
  ```ts
  function computeSteps(role: Role, plan: "solo" | "family"): StepId[] {
    const canFamily = (role === "owner" || role === "admin") && plan === "family";
    return ["welcome", ...(canFamily ? ["family"] as const : []), "briefing", "interests", "done"];
  }
  ```
  This delivers F-01's two stepper shapes (5 with Family for Owner/Admin on Family; 4 for everyone else, **Child included**).
- `firstIncompleteStep` resumes in order: `family?` → `briefing` → `interests` → `done` (no profile check).

### 3.3 Family-step role dropdown, Child optional email, invitation warning
**File:** same — `StepFamily` + `ROLE_OPTIONS`
- `ROLE_OPTIONS` becomes the full assignable set (spec §4): `admin → "Admin"`, `adult → "Adult Member"`, `grandparent → "Grand Parent"`, `teenager → "Teenager"`, `child → "Children"` (currently missing **Admin** and **Grand Parent**).
- Child email: change from *hidden* to *optional with hint* "Leave blank if the child does not have an email address" (F-03). Keep "all non-Child roles require an email" in local validation; include `email` for a Child only when provided.
- Member-cap message: "Maximum of 5 additional members reached (6 including you)".
- `StepFamily.onSaved` passes the POST response `{ invitation_failures }` up; store `invitationWarning = failures > 0` in **page-level** `useState` (survives step changes) and pass into `StepDone`. Render a non-blocking warning row on Done: "Some invitations couldn't be sent — retry in My Account" (F-04 / error path).

### 3.4 Align API paths to the Rails routes
**File:** same
- `/api/onboarding/family-members` → `/api/onboarding/family_members` (underscore, matches route + spec §5b).
- `complete`: `fetch("/api/onboarding/complete", { method: "POST" })` → `method: "PATCH"` (F-09).
- Briefing body: the page currently sends `postcode` — rename the key to `home_postcode` to match the service param. `commute_mode`, `work_address`, `news_topics` already match.

### 3.5 Welcome + Done screens — contextual by role
**File:** same
- `StepWelcome` tiles: drop the "Set up your profile" tile; show `[family?, briefing, interests]` based on the member's `steps`.
- `StepDone` already maps over real `*_complete` flags (no hardcoded rows — satisfies F-07). Ensure rows are filtered to the member's actual `steps`: Owner/Admin Family shows Family/Briefing/Interests; everyone else shows Briefing/Interests. Append the invitation-warning row from 3.3 when present.

### 3.6 Reuse `ui/` primitives (style-drift fix)
**File:** same
The page hand-rolls `PrimaryButton`, `SecondaryButton`, inputs, and pill/tag buttons — `frontend/CLAUDE.md` forbids hand-rolled buttons/inputs. Migrate:
- CTAs → `Button` (`variant="primary"`/`"secondary"`, `loading`, `fullWidth`).
- Text fields (postcode, work address, member name/email) → `Input` (`label`, `hint`, `error`).
- Commute pills, news-category pills, interest tags → `Chip` (`label`, `selected`, `onClick`, `disabled`).
- Keep the bespoke `StepBar` (no primitive exists); the active dot already sets `aria-current="step"` (NF-02).

### 3.7 My Account surfacing (F-08)
**Files:** `frontend/src/app/(app)/account/preferences/page.tsx`, `frontend/src/app/(app)/account/family-members/page.tsx`
- Preferences: when briefing or interests are incomplete (reuse `/api/onboarding/status`), show a prompt "Finish setting up your Daily Briefing / interests".
- Family Members: section always present for Family-plan Owner/Admin (F-08 / skip-Family flow) so members can be added post-onboarding.
- These pages are owned by separate `account--*` specs; **only add the completion prompts here** and confirm their current state during `/tech_implement`. If they are bare placeholders, scope the minimal prompt and note the rest as follow-up.

---

## Phase 4 — Tests & polish

### 4.1 Request specs (primary layer)
**File:** `backend/spec/requests/api/v1/onboarding_spec.rb`
Translate spec §5b + §7 **intent** into RSpec (Given/When/Then comments), adjusted for the dropped Profile step and Child = Teenager:

**`GET /onboarding/status` (F-01):**
- Owner on Family plan → `steps == [welcome,family,briefing,interests,done]`
- Admin on Family plan → 5 steps incl. family
- Owner on Individual (solo) plan → `[welcome,briefing,interests,done]`
- Adult / Grand Parent / Teenager → 4 steps, no family
- **Child → 4 steps, same as Teenager** (`[welcome,briefing,interests,done]`)

**`POST /onboarding/family_members` (F-03/F-04):**
- Owner adds Adult Member → 201, member row created with role + name
- Admin adds member → 201
- non-Owner/Admin (Adult, Grand Parent, Teenager, Child) → 403, no member created
- 6th member (cap) → 422, no member created
- pending list of 2 Adults+email, 1 Child+email, 1 Child no-email → exactly 3 `admin_create_user` calls (stub Cognito), Child-no-email gets none
- Cognito failure on one member → others created, response `invitation_failures: 1`, owner not blocked

**`PATCH /onboarding/briefing` (F-05):**
- each role incl. **Child** saves → 204, `member_settings` updated
- skip (empty body) → 204, nothing persisted

**`PATCH /onboarding/interests` (F-06):**
- select 3 tags → 204, saved
- submit 6 tags → only 5 persisted (service cap)
- **Child** can save (no 403)

**`PATCH /onboarding/complete` (F-09):**
- authenticated → 204, `members.onboarding_complete == true`
- unauthenticated (no Bearer) → 401, flag unchanged

> Mock Cognito: stub `CognitoService.admin_create_user` — never hit AWS. Per `backend/CLAUDE.md`, do **not** mock the DB; member/user rows are really created.
> Dropped from the original spec's scenarios: all F-02 Profile cases; the Child 3-step stepper; the "Child does not see Briefing/Interests" 403 cases.

### 4.2 Policy spec
**File:** `backend/spec/policies/onboarding_policy_spec.rb`
- `family_members?` true for owner+family / admin+family; false for adult/grandparent/teenager/child and for owner on solo plan.

### 4.3 Service spec
**File:** `backend/spec/services/family_member_invitation_service_spec.rb`
- counts created/invited/failures correctly; creates a `MemberSetting` per new member; links `user` only when an invite succeeds; isolates a single failure.

### 4.4 Frontend / cross-cutting verification (manual + tooling)
UI behaviours (no frontend test harness in repo) — verify manually per Verification: stepper rendering per role, member-cap form disable, Child email-optional hint, back-navigation data preservation, mid-flow resume (F-10), light/dark themes, 375px layout, WCAG AA. Run `npm run typecheck` + `npm run lint`.

---

## Critical files

| File | Role in this feature |
|------|---------------------|
| `backend/app/controllers/api/v1/onboarding_controller.rb` *(new)* | The 5 onboarding endpoints; param parsing + Pundit authorise (Family only) + cap guard |
| `backend/app/services/onboarding_status_service.rb` *(new)* | Computes the role/plan step set + completion flags — single source of truth |
| `backend/app/services/family_member_invitation_service.rb` *(new)* | Creates member rows + fires Cognito invitations on Family Continue |
| `backend/app/services/cognito_service.rb` *(edit)* | `admin_create_user` → invitation email |
| `backend/app/policies/onboarding_policy.rb` *(new)* | Family step gating (owner/admin + family plan) |
| `backend/db/migrate/<ts>_add_onboarding_fields_to_member_settings.rb` *(new)* | briefing + interests columns/arrays + commute CHECK |
| `backend/config/routes.rb` *(edit)* | Onboarding routes |
| `frontend/src/app/(app)/onboarding/page.tsx` *(edit)* | Remove Profile step; role-aware stepper; Family roles; Child = Teenager; API path/method fixes; primitive reuse |
| `frontend/auth.ts` | Already feeds `onboardingComplete`/`accountType` into the session via `auth#me` — no change needed |

---

## Reusable pieces

| Name | Location | Used for |
|------|----------|----------|
| `Button`, `Input`, `Chip`, `Card` | `frontend/src/components/ui/` | Replace hand-rolled CTAs/inputs/pills (3.6) |
| `api<T>(path, init?)` | `frontend/src/lib/api.ts` | Typed BFF fetcher (optionally wrap onboarding calls) |
| BFF proxy | `frontend/src/app/api/[...path]/route.ts` | Forwards `/api/onboarding/*` → Rails with Bearer token (no change) |
| `AccountBootstrapService` pattern | `backend/app/services/account_bootstrap_service.rb` | Reference for creating member + MemberSetting + role_id mapping |
| `CognitoService.admin_delete` / `admin_client` | `backend/app/services/cognito_service.rb` | Admin-SDK pattern to copy for `admin_create_user` |
| `ApplicationController` 401/403 rescues | `backend/app/controllers/application_controller.rb` | Auth + Pundit error mapping already wired |
| `sign_in_as` request-spec helper + factories | `backend/spec/` | Authenticated request specs |

---

## Verification

1. **Migrate & boot:** `cd backend && rails db:migrate && bundle exec rspec spec/requests/api/v1/onboarding_spec.rb` → all green.
2. **Individual Owner happy path (§7):** sign up on Individual plan → sign in → land on `/onboarding`; stepper shows **4** dots (Welcome, Briefing, Interests, Done) — no Profile step. Fill postcode/work/commute/news → Continue; pick 3 interests → Finish setup → Done shows ✓ Briefing/Interests. "Enter MyPal" → `/today`; sign out + in again → straight to `/today` (F-09).
3. **Family Owner with members (§7):** sign up on Family plan → stepper shows **5** dots (incl. Family). Add 2 Adult Members (with emails) + 1 Child (no email) → Continue → 2 invitation emails sent, Child none; Done shows "Family — 3 members added ✓".
4. **Child (same as Teenager):** Child first sign-in → stepper shows **4** dots (Welcome, Briefing, Interests, Done); Child can save briefing + interests; Done shows Briefing/Interests rows.
5. **Server auth (NF-04):** as an Adult Member, `curl -X POST .../api/v1/onboarding/family_members` → **403**. As a Child, `PATCH .../onboarding/briefing` and `.../interests` → **204** (allowed). `PATCH .../onboarding/complete` with no Bearer → **401**.
6. **Skip flow (§7):** on Briefing click "Skip for now", on Interests "Skip — personalise later" → Done shows muted dashes + "set up any time in My Account"; My Account → Preferences shows completion prompts (F-08).
7. **Invitation failure (NF-06):** stub a Cognito failure for one member → Owner still advances; Done shows the non-blocking warning; server log records the failure.
8. **Mid-flow resume (F-10):** save Briefing, close the tab; sign in again → routed to `/onboarding` at the first incomplete step with prior data preserved; `onboarding_complete` still false.
9. **Back navigation:** from Interests click Back → Briefing fields still populated.
10. **Polish:** `npm run typecheck` + `npm run lint` clean; verify light (T_LIGHT) + dark (T_DARK) at 375px and desktop; stepper announces `aria-current="step"`.

---

## Open follow-ups

- [x] **Spec correction — drop Profile step + Child = Teenager.** Done in spec **v1.3** (2026-06-15): Profile step removed (F-02 retired), Child journey now mirrors Teenager, stepper counts 5/4, NF-04 + §12 access wording corrected, §8 role enum corrected to canonical codes. `_specs/platform--onboarding.md` now matches this plan.
- [ ] **`members.avatar_emoji` column ownership.** Onboarding no longer adds or writes it, but `useProfile.ts` already references it and the live schema lacks it. My Account → My Profile must add the column + the avatar picker. (Recorded in spec v1.3 §8 note.) — *owner: My Profile spec author / Dip*
- [ ] **Briefing/interests data-model divergence.** Stored on `member_settings`, but `db/mypal-schema.sql` models them as `briefing_settings` + `interests` + news junctions. `today-daily-brief` must decide whether to migrate onboarding's columns into those tables or update the reference. — *owner: today-daily-brief author / Dip*
- [x] **Spec §8/F-09 — `onboarding_complete` location & role enum:** corrected in spec v1.3 — `users.onboarding_complete` → `members.onboarding_complete` (§8 + F-09), and `adult_member` → canonical codes. Spec now matches the live schema and this plan.
- [ ] **`family_complete` is a proxy** ("account has other members"), not a true "Owner completed the Family step" signal. Fine for Done/resume now; revisit if it causes confusing summaries. — *owner: Dip*
- [x] **HMG group membership for added Admins** — resolved: `FamilyMemberInvitationService` now adds admin-role members to the account HMG group (access-control G-01); non-admins stay manual (G-02). Existing admins backfilled. Service specs added.
- [ ] **My Account surfacing (F-08)** depth depends on the current state of `account/preferences` + `account/family-members` (owned by `account--*` specs). Confirm scope during implementation; build only the prompts here. — *owner: Dip*
- [ ] **Invitation acceptance journey** (invited member clicking the Cognito link → first sign-in) is a separate, not-yet-written Family Invitation spec. — *owner: Dip*
