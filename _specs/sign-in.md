# Spec — Sign In

> UI reference: `_UI/mypal-app.jsx` → `SignIn` component

---

## 1. Overview (required)

**Feature name:** Sign In  
**Module / nav location:** Public → Sign In  
**Author:** Dip  
**Status:** Draft  
**Last updated:** 2026-05-20

### Problem statement
Existing users need a fast, trustworthy way to get back into their MyPal account. The previous design hid the email form behind a toggle and included Facebook and Apple OAuth (not available at launch), creating unnecessary friction and false expectations.

### User-facing goal
As an existing user, I want to sign in to my MyPal account quickly — using Google or email/password — so I can get back to my day without friction or confusion.

---

## 2. Scope (required)

### In scope
- Main sign-in screen: Google OAuth and email/password form visible by default
- Inline error state for incorrect credentials with a contextual "Forgot your password?" link
- Forgot password flow: email entry → reset link sent confirmation screen
- "Sign in with phone — coming soon" Phase 2 signpost (non-interactive)
- Routing to Today on successful sign-in (or Onboarding if not yet complete)
- "← Back to home" navigation on the main sign-in screen
- "New to MyPal? Create account" link routing to Sign Up

### Out of scope
- Facebook and Apple OAuth — Phase 2
- Phone number sign-in — Phase 2
- Remember this device / persistent sessions — Phase 2
- Sign-up (covered in `_specs/sign-up.md`)
- Account lockout and brute-force protection — backend concern, not in UI scope

### Dependencies
- `_specs/home-page.md` — home page Sign In CTA routes here
- `_specs/sign-up.md` — "New to MyPal? Create account" link routes there
- `_specs/onboarding.md` — users who haven't completed onboarding are routed there on sign-in
- `_specs/platform--access-control.md` — role resolved on sign-in determines what the user sees

### Phasing

| Phase | What ships | When |
|-------|-----------|------|
| Phase 1 | Google OAuth + email/password, forgot password flow, web only | Launch |
| Phase 2 | Phone sign-in, Facebook and Apple OAuth, remember this device | Post-launch |

---

## 3. Users & personas (required)

| Persona | Description | Primary need from this feature |
|---------|-------------|-------------------------------|
| Returning user (Individual) | Has an account; signs in regularly | Fast access with minimal steps |
| Returning user (Family — Owner) | Account owner managing a family account | Reliable sign-in; quick access to family dashboard |
| Returning user (Family — Member) | Non-owner family member | Sign in without friction; clear path if they forget their password |
| New visitor | Landed on sign-in by mistake | Immediate, visible path to Sign Up |

---

## 4. Roles & access (required)

Sign-in does not create or modify roles — it resolves the existing role from Cognito and the database.

| Capability | Public visitor |
|------------|:--------------:|
| View sign-in page | ✓ |
| Sign in via Google | ✓ |
| Sign in via email/password | ✓ |
| Trigger forgot password flow | ✓ |

On successful sign-in, the user's role (Owner, Admin, Adult Member, Teenager, Child) is resolved and determines what they can see and do in the app.

---

## 5. Functional requirements (required)

Priority key: **P0** = must have at launch · **P1** = should have · **P2** = nice to have

| # | Requirement | Priority | Acceptance criteria |
|---|-------------|----------|---------------------|
| F-01 | Main sign-in screen shows a Google OAuth button and an email/password form visible by default — no toggle required | P0 | Email and password fields render immediately on page load; no extra tap needed to reveal them |
| F-02 | Incorrect credentials show an inline error strip with a contextual "Forgot your password?" link | P0 | Error strip appears below the "or sign in with email" divider after a failed attempt; link routes to the forgot password screen |
| F-03 | "Forgot password?" link below the password field always routes to the forgot password screen | P0 | Link is visible at all times, not only after an error |
| F-04 | Forgot password screen collects an email address and sends a Cognito reset link that expires in 1 hour | P0 | Submitting a valid email triggers a Cognito password reset email; copy on screen and in the confirmation screen reads "expires in 1 hour" |
| F-05 | Reset link sent confirmation screen shows: 📬 icon, "Check your inbox" heading, expiry copy, "Open email app" button, "Resend email" link, "Back to sign in" link | P0 | All five elements present; "Resend email" triggers a new Cognito reset email; button disables briefly to prevent spam |
| F-06 | Google OAuth sign-in routes the user to Today (or Onboarding if not complete) on success | P0 | Verified Google user lands on the correct screen; no extra steps required |
| F-07 | Email/password sign-in routes the user to Today (or Onboarding if not complete) on success | P0 | Verified user with correct credentials lands on the correct screen |
| F-08 | "← Back to home" button on the main sign-in screen routes to the home page | P0 | Clicking the button returns the user to the public home page |
| F-09 | "New to MyPal? Create account" link is visible on the main sign-in screen and routes to Sign Up | P0 | Link is present at the bottom of the screen; routes correctly |
| F-10 | "Sign in with phone" is shown as a non-interactive "coming soon" signpost | P1 | Text is visually muted and non-clickable; badge reads "coming soon" |

---

## 5.1 User Stories

| # | As a… | I want to… | So that… |
|---|-------|-----------|---------|
| US-01 | Returning user | See the email form immediately without having to select a method | I can sign in in the fewest steps possible |
| US-02 | Returning user | Sign in with Google | I don't need to remember a separate password |
| US-03 | Returning user | See a clear error message if my credentials are wrong | I know what went wrong and what to do next |
| US-04 | Returning user | Reset my password without leaving the sign-in flow | I can recover access without searching for a reset option |
| US-05 | Returning user | Know the reset link expires in 1 hour | I act promptly and am not surprised if the link stops working |
| US-06 | New visitor | Find the "Create account" link immediately | I can get to sign-up without going back to the home page |

---

## 6. Non-functional requirements

| # | Requirement | Target |
|---|-------------|--------|
| NF-01 | Performance | Sign-in screen loads in < 1s — fully static before form submission |
| NF-02 | Accessibility | WCAG 2.1 AA; all form fields labelled correctly; error state communicated via text not colour alone |
| NF-03 | Theme support | Both light mode (T_LIGHT) and dark mode (T_DARK) render correctly |
| NF-04 | Security | Password never logged; Cognito handles auth; httpOnly session cookie set on successful sign-in (ADR-010) |
| NF-05 | No pre-auth tracking | No cookies or analytics events fired before successful sign-in |

---

## 7. User flows (required)

### Happy path — Google sign-in
1. User arrives at Sign In (from home page CTA, direct URL, or redirect after accessing a protected route)
2. Clicks "Continue with Google"
3. Google OAuth flow completes → Cognito resolves the session
4. If onboarding complete → routed to Today; if not → routed to Onboarding

### Happy path — email/password sign-in
1. User arrives at Sign In
2. Enters email and password; clicks "Sign in"
3. Cognito verifies credentials → session cookie set
4. If onboarding complete → routed to Today; if not → routed to Onboarding

### Happy path — forgot password
1. User clicks "Forgot password?" (either inline in error strip or below the password field)
2. Enters email address; clicks "Send reset link"
3. Confirmation screen: 📬 "Check your inbox" — reset link expires in 1 hour
4. User clicks link in email → Cognito password reset page
5. After resetting, user is directed back to Sign In

### Error / edge paths
- **Wrong credentials:** Inline error strip appears with contextual "Forgot your password?" link; fields remain populated
- **Unregistered email on forgot password:** Cognito responds silently (no account enumeration); confirmation screen shows regardless
- **Reset link expired:** Cognito returns an error on the reset page; user directed back to forgot password to request a new link
- **Google OAuth cancelled:** User returned to main sign-in screen with no error state
- **Already signed in, lands on sign-in:** Redirected to Today (handled by auth middleware)

---

## 8. Data model

Sign-in does not create new records. It resolves existing ones.

| Field | Description | Required? | Notes |
|-------|-------------|-----------|-------|
| `email` | User's email address | Yes (email path) | Looked up in `users.email` |
| `password` | Account password | Yes (email path) | Verified by Cognito; never touches our DB |
| `cognito_sub` | Cognito user identifier | System | Resolved on successful auth; used to look up `users` and `members` |
| `onboarding_complete` | Whether onboarding has been completed | System | Read from `users` or `members` to determine post-sign-in routing |

---

## 9. UI / UX considerations

**Reference:** `_UI/mypal-app.jsx` → `SignIn` function

**Main sign-in screen:** "← Back to home" button (top left). "Welcome back" heading with "Sign in to your MyPal account" subtitle. Single Google social button. "or sign in with email" divider. Email and password fields visible by default — no toggle. "Forgot password?" right-aligned link below the password field. "Sign in" primary button (amber-to-rose gradient). "Sign in with phone — coming soon" muted signpost below the button. "New to MyPal? Create account" link at the bottom.

**Inline error state:** A rose-tinted strip appears between the divider and the email field after a failed attempt. Copy: "Incorrect email or password." followed by a warm-coloured "Forgot your password?" link. The strip does not replace the fields — both error strip and fields are visible simultaneously.

**Forgot password screen:** Back button returns to main sign-in. Playfair Display heading "Reset password". Muted copy explaining the 1-hour expiry. Single email field. "Send reset link" primary button.

**Reset link sent screen:** Centred layout. 📬 icon. "Check your inbox" heading. Body copy confirms expiry in 1 hour. "Open email app" primary button. "Resend email" and "Back to sign in" text links below.

**Empty / error states:** Inline validation on the email field (invalid format). No toast notifications — all feedback is inline. Google OAuth cancellation returns to main sign-in silently.

---

## 10. Integration points & platform constraints

| Integration | Availability | Notes |
|-------------|-------------|-------|
| Cognito (email/password) | Phase 1 | Standard auth flow; httpOnly session cookie via NextAuth v5 BFF |
| Cognito (Google OAuth) | Phase 1 | Via Cognito Hosted UI; same session cookie pattern |
| Cognito (password reset) | Phase 1 | Cognito sends reset email; link expires in 1 hour |
| Cognito (Facebook OAuth) | Phase 2 | Separate identity provider setup required |
| Cognito (Apple Sign In) | Phase 2 | Apple Developer account configuration required |
| Onboarding | Phase 1 | Post-sign-in routing checks `onboarding_complete`; routes to Onboarding if false |

---

## 11. Success metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Sign-in completion rate | > 80% of users who reach sign-in complete sign-in | Analytics: sign-in screen view → successful auth event |
| Google OAuth adoption | > 40% of sign-ins use Google | Analytics: sign-in method breakdown |
| Forgot password recovery rate | > 70% of reset emails result in a successful sign-in within 1 hour | Analytics: reset email sent → successful auth within 60 min |
| Drop-off to sign-up | Track users who leave sign-in for sign-up | Analytics: "Create account" link click event |

---

## 12. Definition of done

- [ ] All P0 functional requirements implemented and tested
- [ ] Email form visible by default — no toggle required
- [ ] Google OAuth only — no Facebook or Apple buttons
- [ ] Forgot password expiry copy reads "1 hour" on all screens
- [ ] Reset sent screen includes all five elements: icon, heading, expiry copy, "Open email app", resend link, back link
- [ ] Inline error state renders correctly and includes contextual forgot password link
- [ ] "Sign in with phone — coming soon" is muted and non-interactive
- [ ] Both light and dark themes verified visually
- [ ] WCAG 2.1 AA verified for form fields and error messages
- [ ] Post-sign-in routing verified for onboarding-complete and onboarding-incomplete users
- [ ] Open questions resolved or formally deferred

---

## 13. Open questions

- [x] Should failed sign-in attempts be rate-limited at the UI level (e.g. disable "Sign in" button after 5 attempts), or is Cognito's built-in throttling sufficient? — **Resolved:** Cognito's built-in throttling is sufficient for Phase 1. UI-level disable is deferred to a later phase.
- [x] When a user signs in via Google but their Cognito account was originally created with email/password, should they see a "you already have an account — sign in with email" prompt, or does Cognito handle account linking automatically? — **Resolved:** Cognito handles account linking automatically.

---

## 14. Revision history

| Version | Date | Author | Summary of changes |
|---------|------|--------|-------------------|
| 0.1 | 2026-05-20 | Dip | Initial draft — generated from mypal-complete-v2.jsx SignIn component and design review |
| 0.2 | 2026-05-20 | Dip | Resolved both open questions: Cognito throttling sufficient for Phase 1; account linking handled automatically by Cognito |
