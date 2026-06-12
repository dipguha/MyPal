# Spec — Sign Up

> UI reference: `_UI/mypal-app.jsx` → `SignUp` component

---

## 1. Overview (required)

**Feature name:** Sign Up  
**Module / nav location:** Public → Sign Up  
**Author:** Dip  
**Status:** Draft  
**Last updated:** 2026-05-20

### Problem statement
New visitors who want to try MyPal have no way to create an account. Without a clear, trustworthy sign-up flow that confirms the plan, price, and trial terms upfront, users may abandon before completing registration.

### User-facing goal
As a prospective user, I want to create a MyPal account quickly and confidently — knowing exactly which plan I'm on, what it costs, and that I won't be charged for 14 days — so I can get to the app without hesitation or surprises.

---

## 2. Scope (required)

### In scope
- Plan selection screen: Individual (£2.99/mo) and Family (£4.99/mo) cards with pricing and 14-day free trial badge
- Google OAuth sign-up path (plan must be selected before or captured during OAuth)
- Email/password sign-up form: first name, last name, email, password with strength meter, phone (optional), terms agreement, marketing opt-in
- Plan and trial reminder shown on the details form
- Email verification screen after account creation
- Routing to Onboarding on successful verification

### Out of scope
- Facebook and Apple OAuth — Phase 2
- Phone number as a sign-up method (sign-in only) — Phase 2
- Email verification landing page (Cognito handles delivery; the screen confirms to the user to check their inbox)
- Forgot password (belongs to Sign In)
- Family member invitation flow — covered in a separate spec

### Dependencies
- `_specs/home-page.md` — all home page CTAs route here
- `_specs/onboarding.md` — sign-up routes to onboarding on completion
- `_specs/platform--access-control.md` — role definitions (Owner is created at sign-up)

### Phasing

| Phase | What ships | When |
|-------|-----------|------|
| Phase 1 | Email/password + Google OAuth, plan selection, email verification, web only | Launch |
| Phase 2 | Facebook and Apple OAuth, phone sign-up method | Post-launch |

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
| Sign up via Google | ✓ |

The user who completes sign-up becomes the account **Owner** — the only role that can invite other members and manage billing.

---

## 5. Functional requirements (required)

Priority key: **P0** = must have at launch · **P1** = should have · **P2** = nice to have

| # | Requirement | Priority | Acceptance criteria |
|---|-------------|----------|---------------------|
| F-01 | Plan selection screen shows Individual (£2.99/mo) and Family (£4.99/mo) cards, each with a "14 days free, no card needed" badge | P0 | Both cards render with correct prices and badge; clicking a card proceeds to the details form pre-set to that plan |
| F-02 | Details form header shows "Creating Individual account" or "Creating Family account" — never "Solo" | P0 | Label matches selected plan on all paths including Google OAuth |
| F-03 | Plan and trial reminder is visible on the details form: "Individual · £2.99/mo — 14 days free, no card needed" | P0 | Reminder strip renders beneath the back/label bar; copy matches selected plan |
| F-04 | Details form collects: first name, last name, email, password (with strength meter), phone (optional), terms agreement | P0 | All fields present; "Create account & continue" is disabled until terms are agreed; form submits only with valid email and password ≥ 8 chars |
| F-05 | Password field shows a strength meter (Weak / Fair / Good / Strong) updating in real time | P1 | Meter reflects score across 4 criteria: length ≥ 8, uppercase, number, special character |
| F-06 | Phone number field is optional, positioned below the password field, and explains its purpose ("optional — used for account recovery") | P1 | Field is not required for form submission; label includes the reason |
| F-07 | Google OAuth button on the plan selection screen proceeds to OAuth flow; plan selection must be captured before or after OAuth completes | P0 | Signing up via Google results in a user with the correct plan stored; no plan defaults silently to Individual |
| F-08 | After successful email/password account creation, user sees an email verification screen with options to open email app, resend the email, correct the email address, or sign in if already verified | P0 | All four actions available; resend triggers a new Cognito verification email; "wrong email" returns to the details form |
| F-09 | "Already have an account? Sign in" link is visible on the plan selection screen | P0 | Link routes to Sign In page |
| F-10 | On successful verification, user is routed to Onboarding | P0 | Verified user lands on the Onboarding screen, not Today or Home |

---

## 5.1 User Stories

| # | As a… | I want to… | So that… |
|---|-------|-----------|---------|
| US-01 | New visitor | See the plan price and trial terms before I enter any details | I know what I'm committing to with no surprises |
| US-02 | New visitor | Choose between Individual and Family before creating my account | My account is set up with the right plan from day one |
| US-03 | New visitor | Sign up with Google in fewer steps | I don't have to create and remember a new password |
| US-04 | New visitor | See a password strength indicator as I type | I can create a secure password without guessing the rules |
| US-05 | New visitor | See a verification screen after submitting my details | I know my account is being created and what to do next |
| US-06 | New visitor | Resend the verification email or correct my address if I made a mistake | I'm not stuck if I mistyped my email |
| US-07 | Returning visitor | Find the Sign In link immediately on the sign-up page | I can get to my account without going back to home |

---

## 6. Non-functional requirements

| # | Requirement | Target |
|---|-------------|--------|
| NF-01 | Performance | Plan selection and details form load in < 1s — fully static, no API calls before form submission |
| NF-02 | Accessibility | WCAG 2.1 AA; all form fields have correct labels and aria attributes; password strength communicated via text not colour alone |
| NF-03 | Theme support | Both light mode (T_LIGHT) and dark mode (T_DARK) render correctly |
| NF-04 | No pre-auth data collection | No cookies or tracking before the user submits the form |
| NF-05 | Security | Password never logged or stored in plain text; Cognito handles hashing; httpOnly cookie set on successful auth |

---

## 7. User flows (required)

### Happy path — email/password Individual sign-up
1. Visitor arrives at Sign Up (from home page CTA or direct URL)
2. Plan selection screen shows Individual and Family cards with pricing and trial badge
3. Visitor clicks Individual card → routed to details form
4. Form header reads "Creating Individual account"; reminder strip shows "Individual · £2.99/mo — 14 days free, no card needed"
5. Visitor fills in first name, last name, email, password; agrees to terms
6. Clicks "Create account & continue" → Cognito creates user, sends verification email
7. Email verification screen: "Check your inbox — james@example.com"
8. Visitor clicks link in email → account verified
9. Routed to Onboarding

### Happy path — Google Individual sign-up
1. Visitor arrives at Sign Up
2. Clicks "Continue with Google" on the plan selection screen
3. If plan not yet selected: prompt to confirm Individual or Family before OAuth redirect
4. Google OAuth flow completes → Cognito creates user with correct plan
5. Routed to Onboarding (no email verification step needed — Google email is pre-verified)

### Happy path — Family sign-up
1–4. Same as email/password flow above, with Family card selected
5. Form header reads "Creating Family account"; reminder strip shows "Family · £4.99/mo — 14 days free, no card needed"
6–9. Same as email/password flow

### Error / edge paths
- **Wrong email entered:** Verification screen shows "Wrong email? Go back and change it" → returns to details form pre-filled
- **Verification email not received:** "Resend email" triggers a new Cognito verification email; button disables briefly to prevent spam
- **Already verified, lands on sign-up:** "Already verified? Sign in" link on verification screen routes to Sign In
- **Duplicate email:** Form submission returns an inline error "An account with this email already exists — sign in instead"
- **Weak password submitted:** "Create account & continue" remains disabled until password score ≥ 1 (min 8 chars); Cognito also enforces server-side
- **Google OAuth cancelled:** User returned to plan selection screen with no error state

---

## 8. Data model

| Field | Description | Required? | Notes |
|-------|-------------|-----------|-------|
| `first_name` | User's first name | Yes | Stored in `members.display_name` split at onboarding |
| `last_name` | User's last name | Yes | Combined with first name at onboarding |
| `email` | Primary identifier and contact address | Yes | Stored in `users.email`; must be unique |
| `password` | Account password | Yes (email path) | Hashed and managed by Cognito; never stored in our DB |
| `phone` | Optional recovery phone number | No | Stored in `users` or `members`; not used for login at launch |
| `plan` | Selected plan tier | Yes | `"solo"` (Individual) or `"family"` (Family); stored in `accounts.plan` |
| `cognito_sub` | Cognito user identifier | System | Set by Cognito on user creation; stored in `users.cognito_sub` |
| `onboarding_complete` | Whether onboarding wizard has been completed | System | Defaults to `false`; set to `true` at end of onboarding |
| `marketing_opt_in` | Whether user agreed to marketing emails | No | Stored in `users` or `members`; defaults to `false` |

---

## 9. UI / UX considerations

**Reference:** `_UI/mypal-app.jsx` → `SignUp` function

**Plan selection screen:** Two cards in a `.g2` grid. Each card shows the plan name (Individual / Family), price (£2.99/mo / £4.99/mo), a one-line description, and a green "14 days free, no card needed" badge. Clicking a card immediately proceeds to the details form — no separate "Continue" button. Google OAuth button sits below the cards with a divider ("or continue with"). "Already have an account? Sign in" link at the bottom.

**Details form:** Back button (top left) returns to plan selection. "Creating Individual account" / "Creating Family account" label sits beside the back button as a pill. Plan reminder strip (warm-tinted, amber border) sits below the back bar. Fields in order: first name + last name (side by side), email, password (with real-time strength meter below), phone (optional). Terms checkbox (required) and marketing opt-in (optional) sit above the submit button. The submit button is disabled until terms are agreed.

**Email verification screen:** Centred layout. Large mail icon. "Check your inbox" heading. Email address shown in bold. Body copy explains the link expires in 24 hours. Four actions: "Open email app" (primary button), "Resend email" (link), "Wrong email? Go back and change it" (link, returns to details form), "Already verified? Sign in" (link, routes to Sign In).

**Empty / error states:** Inline validation errors appear below the relevant field. Duplicate email error appears below the email field after submission. Google OAuth cancellation returns to plan selection silently.

---

## 10. Integration points & platform constraints

| Integration | Availability | Notes |
|-------------|-------------|-------|
| Cognito (email/password) | Phase 1 | AdminCreateUser + email verification |
| Cognito (Google OAuth) | Phase 1 | Via Cognito Hosted UI; plan must be captured before or after OAuth |
| Cognito (Facebook OAuth) | Phase 2 | Requires separate Cognito identity provider setup |
| Cognito (Apple Sign In) | Phase 2 | Requires Apple Developer account configuration |
| Onboarding | Phase 1 | Sign-up routes here on successful verification |

---

## 11. Success metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Sign-up completion rate | > 60% of users who reach plan selection complete account creation | Analytics: plan selection → verification screen funnel |
| Email verification rate | > 80% of accounts verify email within 24 hours | Analytics: Cognito verification events |
| Google OAuth adoption | > 30% of new sign-ups use Google | Analytics: sign-up method breakdown |
| Plan split at sign-up | Track Individual vs Family ratio | Analytics: plan selected event |

---

## 12. Definition of done

- [ ] All P0 functional requirements implemented and tested
- [ ] Plan label reads "Individual" or "Family" — never "Solo" — on all screens and paths
- [ ] Google OAuth path captures plan before creating account
- [ ] Email verification screen includes all four actions (open app, resend, wrong email, sign in)
- [ ] Duplicate email returns inline error with a sign-in prompt
- [ ] Both light and dark themes verified visually
- [ ] WCAG 2.1 AA verified for form fields, password strength, and error messages
- [ ] Open questions resolved or formally deferred

---

## 13. Open questions

- [ ] For Google OAuth: should the plan selection happen before the OAuth redirect (user picks plan, then clicks Google) or after (OAuth completes, then a one-step plan prompt)? — User picks plan first
- [ ] Should phone number be stored in `users` or `members`? Clarify intended use (recovery only vs future 2FA) — Yes
- [ ] Is the marketing opt-in checkbox PECR-compliant as currently worded? — Legal - not worded yet, defer

---

## 14. Revision history

| Version | Date | Author | Summary of changes |
|---------|------|--------|-------------------|
| 0.1 | 2026-05-20 | Dip | Initial draft — generated from mypal-complete-v2.jsx SignUp component and design review |
