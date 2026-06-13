# Spec — Sign Up

> Format: feature_spec_template.md (v3)
> UI reference: `_UI/mypal-app.jsx` → `SignUp` component

---

## 1. Overview (required)

**Feature name:** Sign Up
**Module / nav location:** Public → Sign Up
**Author:** Dip
**Status:** Draft
**Last updated:** 2026-06-13 00:00 UTC

### Problem statement
New visitors who want to try MyPal have no way to create an account. Without a clear, trustworthy sign-up flow that confirms the plan, price, and trial terms upfront, users may abandon before completing registration.

### User-facing goal
As a prospective user, I want to create a MyPal account quickly and confidently — knowing exactly which plan I'm on, what it costs, and that I won't be charged for 14 days — so I can get to the app without hesitation or surprises.

---

## 2. Scope (required)

### In scope
- Plan selection screen: Individual (£2.99/mo) and Family (£4.99/mo) cards with pricing and 14-day free trial badge
- Email/password sign-up form: first name, last name, email, password with strength meter, phone (optional), terms agreement, marketing opt-in
- Plan and trial reminder shown on the details form
- Email verification screen after account creation
- Routing to Onboarding on successful verification

### Out of scope
- Google OAuth sign-up — Phase 2
- Facebook and Apple OAuth — Phase 2
- Phone number as a sign-up method (sign-in only) — Phase 2
- Email verification landing page (Cognito handles delivery; the screen confirms to the user to check their inbox)
- Forgot password (belongs to Sign In)
- Family member invitation flow — covered in a separate spec

### Dependencies
- `_specs/home-page.md` — all home page CTAs route here
- `_specs/onboarding.md` — sign-up routes to onboarding on completion
- `_specs/platform--access-control.md` — role definitions (Owner is created at sign-up; HMG auto-created per G-01)

### Phasing

| Phase | What ships | When |
|-------|-----------|------|
| Phase 1 | Email/password sign-up, plan selection, email verification, web only | Launch |
| Phase 2 | Google OAuth, Facebook OAuth, Apple Sign In, phone sign-up method | Post-launch |

---

## 3. Users & personas (required)

| Persona | Description | Primary need from this feature |
|---------|-------------|-------------------------------|
| New visitor (Individual) | No account; wants a personal MyPal account | Create an account quickly with clear pricing and no commitment risk |
| New visitor (Family) | No account; wants a shared family account | Choose the Family plan and understand what's included before committing |
| Returning visitor | Has an account; landed on sign-up by mistake | Fast, visible path to Sign In without having to go back to home |

---

## 4. Roles & access (required)

Sign-up creates the account's first member as **Owner**. No other roles are involved at this stage.

| Capability | Public visitor |
|------------|:--------------:|
| View sign-up page | ✓ |
| Select Individual plan and create account | ✓ |
| Select Family plan and create account | ✓ |

The user who completes sign-up becomes the account **Owner** — the only role that can invite other members and manage billing.

---

## 5. Functional requirements (required)

Priority key: **P0** = must have at launch · **P1** = should have · **P2** = nice to have

**5a. Requirements index.**

| # | Requirement | Priority | Scenarios |
|---|-------------|----------|-----------|
| F-01 | Plan selection screen shows Individual (£2.99/mo) and Family (£4.99/mo) cards, each with a "14 days free, no card needed" badge | P0 | Plan selection screen renders both cards; Clicking a plan card navigates to details |
| F-02 | Details form header shows "Creating Individual account" or "Creating Family account" — never "Solo" | P0 | Details header reflects selected plan |
| F-03 | Plan and trial reminder is visible on the details form | P0 | Plan reminder strip visible on details form |
| F-04 | Details form collects required fields; submit disabled until terms agreed; server rejects duplicate email | P0 | Submit disabled without terms; Submit enabled after terms agreed; Server rejects duplicate email |
| F-05 | Password field shows a strength meter (Weak / Fair / Good / Strong) updating in real time | P1 | Password strength meter updates in real time |
| F-06 | Phone number field is optional and labelled with its purpose | P1 | Phone field is optional |
| F-07 | "Already have an account? Sign in" link is visible on the plan selection screen | P0 | Sign in link visible on plan selection |
| F-08 | After successful account creation, user sees email verification screen with four actions | P0 | Verification screen shows four actions; Resend triggers new verification email; Wrong email returns to details form |
| F-09 | On successful verification, user is routed to Onboarding | P0 | Verified user lands on Onboarding |

**5b. Acceptance criteria — Gherkin scenarios.**

```gherkin
# F-01: Plan selection screen
Feature: Plan selection screen renders both cards
  Scenario: Plan selection screen renders both cards
    Given a visitor navigates to /sign-up
    Then they see an "Individual" card showing "£2.99" and "/mo"
    And they see a "Family" card showing "£4.99" and "/mo"
    And both cards show a "14 days free, no card needed" badge

  Scenario: Clicking a plan card navigates to details
    Given a visitor is on the plan selection screen
    When they click the "Individual" card
    Then they are taken to the details form
    And the selected plan is "Individual"

# F-02: Details form header
Feature: Details header reflects selected plan
  Scenario Outline: Header label matches selected plan
    Given a visitor has selected the "<plan>" plan
    When they are on the details form
    Then the header shows "Creating <label> account"

    Examples:
      | plan   | label      |
      | solo   | Individual |
      | family | Family     |

# F-03: Plan reminder strip
Feature: Plan reminder strip visible on details form
  Scenario Outline: Reminder strip shows correct plan and price
    Given a visitor has selected the "<plan>" plan
    When they are on the details form
    Then the reminder strip shows "<copy>"

    Examples:
      | plan   | copy                                                    |
      | solo   | Individual · £2.99/mo — 14 days free, no card needed   |
      | family | Family · £4.99/mo — 14 days free, no card needed       |

# F-04: Details form validation and submission
Feature: Submit button gating and server-side rejection
  Scenario: Submit disabled without terms agreement
    Given a visitor has filled in all required fields
    But they have not ticked the terms checkbox
    Then the "Create account & continue" button is disabled

  Scenario: Submit enabled after terms agreed
    Given a visitor has filled in all required fields
    And they tick the terms checkbox
    Then the "Create account & continue" button is enabled

  Scenario: Server rejects duplicate email
    Given an account already exists for "james@example.com"
    When a visitor submits the sign-up form with email "james@example.com"
    Then the Rails API returns an error
    And an inline error appears: "An account with this email already exists — sign in instead"
    And no new account is created

# F-05: Password strength meter
Feature: Password strength meter updates in real time
  Scenario Outline: Strength label updates as password is typed
    Given a visitor is on the details form
    When they type a password matching "<criteria>"
    Then the strength meter shows "<label>"

    Examples:
      | criteria                               | label  |
      | 8+ chars only                          | Weak   |
      | 8+ chars + uppercase                   | Fair   |
      | 8+ chars + uppercase + number          | Good   |
      | 8+ chars + uppercase + number + symbol | Strong |

# F-06: Phone field is optional
Feature: Phone field is optional
  Scenario: Form submits without a phone number
    Given a visitor fills in all required fields but leaves phone blank
    And they tick the terms checkbox
    When they submit the form
    Then the account is created successfully
    And no validation error appears for the phone field

# F-07: Sign in link on plan selection
Feature: Sign in link visible on plan selection
  Scenario: Sign in link visible on plan selection screen
    Given a visitor is on the plan selection screen
    Then they see an "Already have an account? Sign in" link
    When they click it
    Then they are taken to /sign-in

# F-08: Email verification screen
Feature: Email verification screen shows four actions
  Scenario: Verification screen renders after account creation
    Given a visitor has successfully submitted the details form
    Then they see the email verification screen
    And the screen shows "Check your inbox"
    And their submitted email address is displayed
    And four actions are present: "Open email app", "Resend email", "Wrong email? Go back and change it", "Already verified? Sign in"

  Scenario: Resend triggers new verification email
    Given a visitor is on the verification screen
    When they click "Resend email"
    Then Cognito sends a new verification email to their address
    And the "Resend email" link is briefly disabled to prevent spam

  Scenario: Wrong email returns to details form
    Given a visitor is on the verification screen
    When they click "Wrong email? Go back and change it"
    Then they return to the details form pre-filled with their previous entries

# F-09: Route to Onboarding on verification
Feature: Verified user lands on Onboarding
  Scenario: Verified user lands on Onboarding
    Given a visitor has completed sign-up via email/password
    And they have verified their email via the Cognito link
    When they are redirected back to the app
    Then they land on /onboarding
    And they do not land on /today or /
```

---

## 5.1 User Stories

| # | As a… | I want to… | So that… |
|---|-------|-----------|---------|
| US-01 | New visitor | See the plan price and trial terms before I enter any details | I know what I'm committing to with no surprises |
| US-02 | New visitor | Choose between Individual and Family before creating my account | My account is set up with the right plan from day one |
| US-03 | New visitor | See a password strength indicator as I type | I can create a secure password without guessing the rules |
| US-04 | New visitor | See a verification screen after submitting my details | I know my account is being created and what to do next |
| US-05 | New visitor | Resend the verification email or correct my address if I made a mistake | I'm not stuck if I mistyped my email |
| US-06 | Returning visitor | Find the Sign In link immediately on the sign-up page | I can get to my account without going back to home |

---

## 6. Non-functional requirements

| # | Requirement | Target |
|---|-------------|--------|
| NF-01 | Performance | Plan selection and details form load in < 1s — fully static, no API calls before form submission |
| NF-02 | Accessibility | WCAG 2.1 AA; all form fields have correct labels and aria attributes; password strength communicated via text not colour alone |
| NF-03 | Theme support | Both light mode (T_LIGHT) and dark mode (T_DARK) render correctly |
| NF-04 | Privacy enforcement | No cookies or tracking before the user submits the form; access rules enforced server-side |
| NF-05 | Security | Password never logged or stored in plain text; Cognito handles hashing; httpOnly cookie set on successful auth |

---

## 7. User flows (required)

```gherkin
# Primary flow — email/password sign-up
Feature: Email/password sign-up end-to-end
  Scenario: Happy path — Individual email/password sign-up
    Given a visitor arrives at /sign-up
    When they click the "Individual" card
    And they fill in first name, last name, email, and a strong password
    And they tick the terms checkbox
    And they click "Create account & continue"
    Then Cognito creates the user and sends a verification email
    And the BFF calls the Rails API to create an accounts row with plan "solo"
    And the Rails API creates a users row and a members row with role "owner"
    And the visitor is shown the email verification screen
    When the visitor clicks the verification link in their email
    Then their Cognito account is confirmed
    And they are routed to /onboarding

  Scenario: Happy path — Family email/password sign-up
    Given a visitor arrives at /sign-up
    When they click the "Family" card
    And they fill in first name, last name, email, and a strong password
    And they tick the terms checkbox
    And they click "Create account & continue"
    Then the accounts row is created with plan "family"
    And the verification and onboarding routing follow the Individual path

  Scenario: Error — duplicate email
    Given an account already exists for "james@example.com"
    When a visitor submits the details form with email "james@example.com"
    Then an inline error appears under the email field
    And no new account or member row is created

  Scenario: Error — wrong email entered
    Given a visitor is on the email verification screen
    When they click "Wrong email? Go back and change it"
    Then they return to the details form with their previous entries pre-filled

  Scenario: Error — verification email not received
    Given a visitor is on the email verification screen
    When they click "Resend email"
    Then Cognito sends a new verification email
    And the "Resend email" link is briefly disabled
```

---

## 8. Data model

| Field | Description | Required? | Notes |
|-------|-------------|-----------|-------|
| `first_name` | User's first name | Yes | Stored in `members.display_name`; combined with last name at onboarding |
| `last_name` | User's last name | Yes | Combined with first name at onboarding |
| `email` | Primary identifier and contact address | Yes | Stored in `users.email`; must be unique |
| `password` | Account password | Yes (email path) | Hashed and managed by Cognito; never stored in our DB |
| `users.phone` | Recovery/2FA phone number | No | Stored on `users`; only for members with a login; not used for login at launch |
| `members.phone` | Household contact phone number | No | Stored on `members`; visible within the family; can be set for children with no `users` row |
| `plan` | Selected plan tier | Yes | `"solo"` (Individual) or `"family"` (Family); stored in `accounts.plan` |
| `cognito_sub` | Cognito user identifier | System | Set by Cognito on user creation; stored in `users.cognito_sub` |
| `onboarding_complete` | Whether onboarding wizard has been completed | System | Defaults to `false`; set to `true` at end of onboarding |
| `marketing_opt_in` | Whether user agreed to marketing emails | No | Stored in `users`; defaults to `false` |

---

## 9. UI / UX considerations

**Reference:** `_UI/mypal-app.jsx` → `SignUp` function

**Plan selection screen:** Two cards in a `.g2` grid. Each card shows the plan name (Individual / Family), price (£2.99/mo / £4.99/mo), a one-line description, and a green "14 days free, no card needed" badge. Clicking a card immediately proceeds to the details form — no separate "Continue" button. "Already have an account? Sign in" link at the bottom. (Note: Google OAuth button shown in the prototype is Phase 2 — omit from Phase 1 build.)

**Details form:** Back button (top left) returns to plan selection. "Creating Individual account" / "Creating Family account" label sits beside the back button as a pill. Plan reminder strip (warm-tinted, amber border) sits below the back bar. Fields in order: first name + last name (side by side), email, password (with real-time strength meter below), phone (optional). Terms checkbox (required) and marketing opt-in (optional) sit above the submit button. The submit button is disabled until terms are agreed.

**Email verification screen:** Centred layout. Large mail icon. "Check your inbox" heading. Email address shown in bold. Body copy explains the link expires in 24 hours. Four actions: "Open email app" (primary button), "Resend email" (link), "Wrong email? Go back and change it" (link, returns to details form), "Already verified? Sign in" (link, routes to Sign In).

**Empty / error states:** Inline validation errors appear below the relevant field. Duplicate email error appears below the email field after submission.

---

## 10. Integration points & platform constraints

| Integration | Availability | Notes |
|-------------|-------------|-------|
| Cognito (email/password) | Phase 1 | User creation and email verification; httpOnly session cookie issued via NextAuth BFF on confirmed sign-in (ADR-010) |
| Rails API — account creation | Phase 1 | BFF calls Rails API after Cognito user creation; Rails creates `accounts`, `users`, and `members` (role: owner) rows in a single transaction; HMG group auto-created per access-control spec G-01 |
| Onboarding | Phase 1 | Sign-up routes to `/onboarding` on successful verification; onboarding sits in the `(app)` route group (authenticated) per ADR-001 |
| Cognito (Google OAuth) | Phase 2 | Via Cognito Hosted UI |
| Cognito (Facebook OAuth) | Phase 2 | Requires separate Cognito identity provider setup |
| Cognito (Apple Sign In) | Phase 2 | Requires Apple Developer account configuration |

---

## 11. Success metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Sign-up completion rate | > 60% of users who reach plan selection complete account creation | Analytics: plan selection → verification screen funnel |
| Email verification rate | > 80% of accounts verify email within 24 hours | Analytics: Cognito verification events |
| Plan split at sign-up | Track Individual vs Family ratio | Analytics: plan selected event |

---

## 12. Definition of done

- [ ] All P0 functional requirements implemented and tested
- [ ] Plan label reads "Individual" or "Family" — never "Solo" — on all screens and paths
- [ ] Email verification screen includes all four actions (open app, resend, wrong email, sign in)
- [ ] Duplicate email returns inline error with a sign-in prompt
- [ ] Rails API creates accounts/users/members rows in a single transaction; partial failures roll back cleanly
- [ ] Both light and dark themes verified visually
- [ ] WCAG 2.1 AA verified for form fields, password strength, and error messages
- [ ] All Gherkin scenarios in §5b and §7 have corresponding automated tests
- [ ] Open questions resolved or formally deferred

---

## 13. Open questions

- [x] Phone number storage — stored at **both** levels with different purposes: `users.phone` for account recovery/2FA (only for members with a login); `members.phone` for household contact details (can be set for children who have no `users` row). Confirmed by Dip 2026-06-13.
- [x] Is the marketing opt-in checkbox PECR-compliant as currently worded? — Legal review deferred to pre-launch
- [x] SES sender name and address for Cognito verification email — confirmed: `YourDigitalPal@mydigitals`

---

## 14. Revision history

| Version | Date | Author | Summary of changes |
|---------|------|--------|-------------------|
| 0.1 | 2026-05-20 00:00 UTC | Dip | Initial draft — generated from SignUp component and design review |
| 0.2 | 2026-06-13 00:00 UTC | Cowork | Renamed to platform--sign-up.md; upgraded to template v3 (§5a requirements index + §5b Gherkin, §7 flows in Gherkin); integration section updated: FastAPI replaced by Rails API; Cognito retained per ADR-010; ADR-001 reference added; deleted superseded user-sign-up.md |
| 0.3 | 2026-06-13 00:00 UTC | Cowork | Google OAuth moved to Phase 2 (removed from §2 in scope, §5a F-07 renumbered, §5b, §7, §9, §10, §11, §12); SES sender confirmed and closed; phone storage question updated with Cowork recommendation pending Dip's decision |
| 0.4 | 2026-06-13 00:00 UTC | Cowork | Phone storage confirmed: both `users.phone` (recovery/2FA) and `members.phone` (contact detail); data model updated; open question closed |
