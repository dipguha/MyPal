# User Sign Up

## Overview

Allow a new user to create a MyDigitalPal account using email and password. The registering user can choose between a **Solo** account (just themselves) or a **Family** account (up to 6 members). The signing-up user automatically becomes the **Admin** of the new account.

---

## Goals

- Provide a simple, low-friction sign-up flow for new users.
- Support two account types at registration: Solo and Family.
- Establish the registering user as the account Admin from the moment the account is created.
- Authenticate via email + password only (no social login in this iteration).

## Non-Goals

- Social / OAuth sign-in (Google, Apple, etc.) — out of scope for this spec.
- Inviting additional family members during sign-up — handled by a separate "Invite Member" flow.
- Mobile native sign-up — this spec covers the web (Next.js BFF) flow only.

---

## User Stories

| # | As a… | I want to… | So that… |
|---|-------|-----------|---------|
| 1 | New visitor | Sign up with my email and a password | I can access MyDigitalPal |
| 2 | New visitor | Choose "Solo" or "Family" during sign-up | My account reflects how I intend to use the app |
| 3 | New user | Be automatically set as Admin | I can manage my account and, later, invite family members |

---

## Functional Requirements

### Sign-Up Form

- Fields:
  - **Full name** (required) — becomes the user's member profile name.
  - **Email address** (required) — must be a valid email format; used as the Cognito username.
  - **Password** (required) — must meet Cognito password policy (min 8 chars, upper, lower, number, symbol).
  - **Confirm password** (required) — must match the password field.
  - **Account type** (required) — radio or toggle selection:
    - **Solo** — single-person account; `account_type = 'solo'`.
    - **Family** — multi-person account (up to 6 members); `account_type = 'family'`.
- A clear explanation of the difference between Solo and Family should be displayed near the account type selector.
- Submit button labelled **"Create Account"**.

### Validation

- All fields are validated on submit (and inline on blur for a better UX).
- Email uniqueness is checked server-side; a friendly error is shown if the email is already registered.
- Password and confirm-password mismatch is caught client-side before submission.

### Sign-Up Flow

1. User fills in the form and submits.
2. Frontend sends the registration request to the Next.js BFF API route.
3. BFF calls Cognito to create the user (email + password) and retrieves the `cognito_sub`.
4. BFF calls the FastAPI backend to:
   a. Create an `accounts` row (`account_type` set per selection).
   b. Create a `users` row (`cognito_sub`, `account_id`).
   c. Create a `members` row for the registering user (`role = 'admin'`).
5. On success, the user is automatically signed in and redirected to the authenticated home/dashboard.
6. On failure at any step, a meaningful error message is shown and no partial data is persisted (rollback).

### Email Verification

- After Cognito account creation, Cognito sends a verification email.
- The user must verify their email before they can sign in. Unverified users who try to sign in see a prompt to check their inbox and a **"Resend verification email"** option.

### Account Type Behaviour

| Account Type | Max Members | Notes |
|---|---|---|
| Solo | 1 | Only the Admin member exists; "Invite" features are hidden |
| Family | 6 | Admin can invite up to 5 additional members after sign-up |

---

## UX / UI Requirements

- The sign-up page lives at `/sign-up` in the `(auth)` route group (public, no authentication required).
- Design follows the existing palette tokens in `src/lib/theme.ts` and the visual reference in `_UI/mypal-app.jsx`.
- The page should be responsive (mobile-first) and accessible (WCAG AA).
- A link to `/sign-in` ("Already have an account? Sign in") is shown below the form.
- Password field has a show/hide toggle.
- Loading state on the submit button while the request is in flight.
- Clear, human-readable error messages (avoid exposing raw Cognito error codes).
- Use frontend-design skills

---

## Error States

| Scenario | Message shown to user |
|---|---|
| Email already registered | "An account with this email already exists. Sign in instead?" |
| Weak password | "Password must be at least 8 characters and include upper, lower, number, and symbol." |
| Passwords don't match | "Passwords do not match." |
| Network / server error | "Something went wrong. Please try again." |
| Cognito service unavailable | "We're having trouble creating your account right now. Please try again shortly." |

---

## Security Requirements

- Passwords are never logged or stored outside Cognito.
- The BFF API route must not expose the Cognito client secret to the browser.
- Rate limiting should be applied to the sign-up endpoint to prevent abuse.
- CSRF protection is handled by the existing NextAuth / httpOnly cookie setup.

---

## Out of Scope

- Changing account type after sign-up.
- Admin transferring ownership to another member.
- Deleting an account.
- GDPR / data-deletion flows.

---

## Open Questions

1. Should we enforce a maximum number of sign-ups per IP address / time window, and if so what threshold? Not at the moment
2. Do we want to collect any additional profile information at sign-up (e.g. date of birth, timezone) or keep it minimal and allow profile completion later? Not at the moment
3. What is the desired email sender name and address for the Cognito verification email? YourDigitalPal@mydigitals
4. Should "Solo" accounts be upgradeable to "Family" accounts later, and if so should we surface that option on the sign-up page? Yes
