# Plan Template Reference

This file is a fully worked example of what a completed tech_spec plan looks like. Use it as a quality benchmark when writing new plans.

Annotations in `<!-- comments -->` explain the intent behind each section — read them before writing your first plan.

---

# Plan: User Sign-Up & Onboarding

<!-- Save this file to: _plans/user-signup-onboarding_tech.md -->
<!-- Branch is the current feature branch — already created by Cowork /feature_spec. Never invent a branch name here. -->

> Spec: `_specs/user-signup.md`
> Branch: `claude/feature/user-signup-onboarding`

---

## Context

<!-- 2–4 sentences. Write for someone who hasn't read the spec — what does this do, who is it for, why does it matter? -->

New users need a frictionless way to create a MyPal account and reach their first value moment (a populated Today view) within 2 minutes. Sign-up supports email/password and Google OAuth. After account creation, a brief 3-step onboarding wizard collects household size and primary use case, then seeds the user's data with sensible defaults.

---

## Decisions captured

<!-- Every entry must have a "because" clause — not just what was chosen, but why. Future implementers (and future Claude) need to understand the intent to make good edge-case decisions. -->

- **Cognito over custom auth** — AWS Cognito handles password hashing, MFA, and token rotation without us maintaining that logic. The tradeoff is vendor lock-in, but at this stage operational simplicity wins.
- **JWT stored in httpOnly cookie, not localStorage** — Mitigates XSS token theft. The API gateway validates the cookie on every request.
- **Onboarding wizard is a separate `/onboarding` route, not a modal** — Keeps the auth flow simple and makes it easy to skip/resume if the user closes mid-flow.
- **Google OAuth via Cognito Hosted UI** — Avoids implementing the OAuth dance ourselves; Cognito handles the callback and issues our standard JWT.
- **Postgres `users` table, not Cognito as the user store** — Cognito is authoritative for credentials; our DB is authoritative for profile data and preferences. Sync happens at first login.

---

## Out of scope (Phase 1)

<!-- Call out anything the spec explicitly deferred. This prevents scope creep during implementation and makes the plan's boundaries explicit. -->

- Google OAuth frontend CTA — Cognito is wired for it, but the button is not built at launch (deferred to Phase 2 pending team decision)
- Email verification landing page — Cognito sends the email automatically; `/verify-email` page is not yet spec'd
- Rate limiting on `/auth/signup` — deferred; WAF rules to be decided separately

---

## High-level flow

<!-- ASCII or Mermaid. Show components and interactions for the happy path only — keep it high-level. This is orientation, not implementation detail. -->

```
Browser                  Next.js API Route         FastAPI             Cognito             Postgres
   |                           |                      |                   |                   |
   |-- POST /api/auth/signup -->|                      |                   |                   |
   |                           |-- AdminCreateUser --->|                   |                   |
   |                           |                      |<-- UserSub + JWT --|                   |
   |                           |-- INSERT user --------|------------------>|                   |
   |                           |<-- 201 {userId} ------|                   |                   |
   |<-- Set-Cookie: token ------|                      |                   |                   |
   |                           |                      |                   |                   |
   |-- GET /onboarding ------->|                      |                   |                   |
   |<-- onboarding wizard ---- |                      |                   |                   |
   |                           |                      |                   |                   |
   |-- POST /api/onboarding -->|                      |                   |                   |
   |                           |-- PATCH user prefs -->|                   |                   |
   |<-- redirect /today -------|                      |                   |                   |
```

---

## Phase 1 — Infrastructure & Config

<!-- Phases must be independently deployable or testable. Infrastructure and config always comes first — later phases depend on it. -->

### 1.1 Cognito User Pool
**File:** `infra/cognito.tf`

Create a User Pool with email/password and Google as an identity provider. Enable the hosted UI for OAuth flows.

```hcl
resource "aws_cognito_user_pool" "mypal" {
  name = "mypal-${var.env}"

  password_policy {
    minimum_length    = 8
    require_uppercase = true
    require_numbers   = true
  }

  schema {
    name                = "email"
    attribute_data_type = "String"
    required            = true
    mutable             = true
  }

  auto_verified_attributes = ["email"]
}

resource "aws_cognito_user_pool_client" "web" {
  name         = "mypal-web"
  user_pool_id = aws_cognito_user_pool.mypal.id

  allowed_oauth_flows  = ["code"]
  allowed_oauth_scopes = ["email", "openid", "profile"]
  callback_urls        = ["https://${var.domain}/api/auth/callback"]
  logout_urls          = ["https://${var.domain}/logout"]

  generate_secret = false
}
```

### 1.2 Environment variables
**File:** `.env.local` (local), `infra/ssm.tf` (prod)

Add:
```
COGNITO_USER_POOL_ID=
COGNITO_CLIENT_ID=
COGNITO_CLIENT_SECRET=
COGNITO_DOMAIN=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
```

---

## Phase 2 — Database

<!-- Database before API — the API will reference these models. Migration must run before any API calls are made. -->

### 2.1 Users table migration
**File:** `backend/alembic/versions/0001_create_users.py`

```python
def upgrade():
    op.create_table(
        "users",
        sa.Column("id", sa.UUID(), primary_key=True, default=uuid4),
        sa.Column("cognito_sub", sa.String(64), nullable=False, unique=True),
        sa.Column("email", sa.String(255), nullable=False, unique=True),
        sa.Column("display_name", sa.String(100)),
        sa.Column("plan", sa.Enum("solo", "family"), default="solo"),
        sa.Column("onboarding_complete", sa.Boolean(), default=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=func.now()),
    )
    op.create_index("ix_users_cognito_sub", "users", ["cognito_sub"])
```

### 2.2 SQLAlchemy model
**File:** `backend/app/models/user.py`

```python
class User(Base):
    __tablename__ = "users"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    cognito_sub: Mapped[str] = mapped_column(String(64), unique=True)
    email: Mapped[str] = mapped_column(String(255), unique=True)
    display_name: Mapped[str | None]
    plan: Mapped[Literal["solo", "family"]] = mapped_column(default="solo")
    onboarding_complete: Mapped[bool] = mapped_column(default=False)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
```

### 2.3 Database cleanup — remove or update obsolete objects

<!-- ALWAYS include this subsection when the feature changes the database, even for a single column. Pre-launch features carry zero migration cost, so superseded objects should be dropped in the same migration rather than left dangling. See tech_spec.md step 3a for the discovery process. -->

<!-- Worked example: the access-control feature replaced 2-tier `visibility` with a 4-tier recipient model and merged assignee into recipients. The table below is what that cleanup looks like — concrete rows, not vague pointers. -->

The new design supersedes the following existing schema elements. They are pre-launch and dropped in the same migration rather than deprecated.

| Object | Type | Why obsolete | Replaced by |
|---|---|---|---|
| `members.legacy_password_hash` | column | Cognito now owns credentials | (removed — Cognito sub identifies user) |
| `auth_sessions` | table | Session state lived in DB; now in httpOnly cookie | (removed) |
| `idx_auth_sessions_user` | index | Index on dropped table | (removed with table) |
| `users.role` | column + CHECK | Two-value enum superseded by 5-role lookup | `users.role_id` → `member_roles` |
| Schema view `v_user_session_summary` | view | Joined `auth_sessions` | Re-create against the new shape, or drop |

**Updates (not removals):**
- `audit_log` payload shapes change from `{role: "admin"}` to `{role_id: 2}` — update the writer at `backend/app/services/audit.py`.
- `backend/app/api/v1/onboarding.py` previously read `users.role`; switch to `users.role_id` resolved through the lookup.

**Left alone (with justification):**
- `member_roles.parent_role_id` — self-referential hierarchy is harmless under the new flat model and not worth churning.

**Out of scope for this migration:**
- The illustrative RLS snippets at `mypal-schema.sql` lines ~1379, ~1386 still reference the old `visibility` column. They are comments, not active policies — tracked as a follow-up (see Open follow-ups).

---

## Phase 3 — Backend API

<!-- Routers thin, services fat — per CLAUDE.md convention. HTTP + Pydantic validation in routers; business logic in app/services/. -->

### 3.1 Auth endpoints
**File:** `backend/app/routers/auth.py`

Create two endpoints:
- `POST /auth/signup` — validates payload, calls Cognito `AdminCreateUser`, inserts `users` row, returns `userId`
- `POST /auth/login` — exchanges credentials for Cognito tokens, sets httpOnly cookie

```python
class SignUpRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    display_name: str = Field(max_length=100)

class SignUpResponse(BaseModel):
    user_id: UUID
    redirect_to: str  # always "/onboarding" for new users
```

IAM permissions needed on the ECS task role:
- `cognito-idp:AdminCreateUser`
- `cognito-idp:AdminInitiateAuth`
- `cognito-idp:AdminGetUser`

### 3.2 Onboarding endpoint
**File:** `backend/app/routers/onboarding.py`

`PATCH /onboarding` — accepts household preferences, marks `onboarding_complete = true`, returns redirect URL.

```python
class OnboardingPayload(BaseModel):
    household_size: int = Field(ge=1, le=10)
    primary_use: Literal["family", "solo", "couple"]
    timezone: str  # e.g. "Europe/London"
```

---

## Phase 4 — Frontend

<!-- Frontend last — depends on API contracts being defined in Phase 3. Use (auth) route group for public pages per CLAUDE.md conventions. -->

### 4.1 Sign-up page
**File:** `app/(auth)/signup/page.tsx`

Form fields: email, password, display name. Submits to `POST /api/auth/signup`. On success, router.push to `/onboarding`.

Reuse `<Input>` and `<Button>` from `components/ui/` (these already exist — see Reusable pieces below).

### 4.2 Next.js API route (BFF layer)
**File:** `app/api/auth/signup/route.ts`

Thin proxy: validates with Zod, forwards to FastAPI, sets the httpOnly cookie from the response, returns 201.

```typescript
const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().max(100),
})
```

### 4.3 Onboarding wizard
**File:** `app/(auth)/onboarding/page.tsx`

3-step wizard using local component state (not a form library — too simple to warrant it):
1. Household size (1–6 members, "+ add family plan" prompt if >1)
2. Primary use case (family coordination / personal / couple)
3. Confirm + "Let's go" CTA → POST /api/onboarding → redirect /today

### 4.4 Auth middleware
**File:** `middleware.ts` (project root)

Protect all routes except `/(auth)/**` and `/api/auth/**`. If no valid JWT cookie, redirect to `/login`.

```typescript
export const config = {
  matcher: ["/((?!_next|api/auth|login|signup).*)"],
}
```

---

## Phase 5 — Tests & Polish

<!-- Tests last, but not optional. Cover happy path, duplicate/invalid input, and auth failure at minimum. -->

### 5.1 Backend unit tests
**File:** `backend/tests/test_auth.py`

Cover:
- `POST /auth/signup` happy path → 201 + userId
- Duplicate email → 409
- Weak password → 422
- Cognito unavailable → 503 (mock boto3 client)

### 5.2 Frontend E2E
**File:** `e2e/signup.spec.ts` (Playwright)

```typescript
test("new user signs up and completes onboarding", async ({ page }) => {
  await page.goto("/signup")
  // fill form, submit, check redirect to /onboarding
  // complete wizard, check redirect to /today
  // verify /today loads without auth errors
})
```

---

## Critical files

<!-- The files a reviewer would check first, or that a new contributor must understand to work on this feature. -->

| File | Role in this feature |
|------|---------------------|
| `infra/cognito.tf` | Provisions the User Pool and OAuth client |
| `backend/app/routers/auth.py` | Core sign-up and login endpoints |
| `backend/app/models/user.py` | User ORM model and DB schema |
| `app/(auth)/signup/page.tsx` | Sign-up UI |
| `app/(auth)/onboarding/page.tsx` | Onboarding wizard |
| `middleware.ts` | Route protection — wrong config here breaks all auth |
| `backend/alembic/versions/0001_create_users.py` | DB migration — must run before any API calls |

---

## Reusable pieces

<!-- Utilities, hooks, and components that already exist in the codebase and must be used here — not re-invented. All paths verified during codebase exploration in step 2. -->

| Name | Location | Used for |
|------|----------|----------|
| `<Input>` | `components/ui/Input.tsx` | All form fields in sign-up and onboarding |
| `<Button>` | `components/ui/Button.tsx` | Submit CTAs |
| `authFetch()` | `lib/authFetch.ts` | Authenticated API calls (attaches cookie automatically) |
| `useCurrentUser()` | `hooks/useCurrentUser.ts` | Reading user context in any component |
| Zod schemas | `lib/schemas/auth.ts` | Shared validation between API route and form |

---

## Verification

<!-- Every step must be executable literally — no "check that it works". Cover happy path, error paths, and edge cases from the spec. Include automated test commands. -->

1. Navigate to `/signup` → form renders with email, password, display name fields
2. Submit with valid data → redirected to `/onboarding`
3. Complete all 3 wizard steps → redirected to `/today`
4. `/today` shows the user's display name in the header
5. Open a new browser tab and navigate to `/today` → still authenticated (cookie persists)
6. Clear cookies and navigate to `/today` → redirected to `/login`
7. Submit sign-up with an already-registered email → error "This email is already in use"
8. Submit with a password under 8 characters → inline validation error (no network request made)
9. Run `uv run pytest backend/tests/test_auth.py -v` → all tests pass
10. Run `npx playwright test e2e/signup.spec.ts` → passes

---

## Open follow-ups

<!-- Tag each item with an owner if known. Unresolved items here should have been surfaced in the pre-flight check and confirmed with the user before the plan was written. -->

- [ ] Confirm whether Google OAuth frontend CTA is in scope for launch or Phase 2 — Cognito is wired but the button isn't built — Dip
- [ ] Legal to review privacy policy link placement on sign-up page before launch — Legal
- [ ] Decide rate limiting strategy for `/auth/signup` — Cognito has built-in throttling but WAF rules may be needed — Dip / Infra
- [ ] Email verification landing page: Cognito sends the email automatically, but `/verify-email` is not yet spec'd — Dip
