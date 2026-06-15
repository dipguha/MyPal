# Spec — Platform: Onboarding

> UI reference: `_UI/mypal-app.jsx` → `Onboarding` component

---

## 1. Overview (required)

**Feature name:** Onboarding
**Module / nav location:** Platform → Onboarding (post sign-up)
**Author:** Dip
**Status:** Draft
**Last updated:** 2026-06-15 10:01

### Problem statement

Every new MyPal member — whether they are the account Owner or an invited family member — lands in an empty, unconfigured app after their first sign-in. Without a guided setup flow they will not have a display name, a daily briefing, or a personalised interests feed. First-run drop-off and low day-one engagement are the risk without a clear, skippable onboarding journey for every role. Owners and Admins additionally need to invite and configure family members before the account is useful as a shared household tool.

### User-facing goal

As a new MyPal member, I want to be guided through setting up my profile, daily briefing, and interests — and, if I am an Owner or Admin, optionally inviting family members — so that my account feels personal and useful from the very first day.

---

## 2. Scope (required)

### In scope

- Welcome screen previewing what the onboarding covers
- Profile step: display name and emoji avatar — all roles on all plans
- Family members step: add members with roles, capture emails, fire invitation emails — Owner and Admin on Family plan only
- Daily Briefing step: home postcode, work address, commute mode, news topics — all roles, skippable
- Interests step: tag-based interest picker, max 5 tags — all roles, skippable
- Done screen: contextual summary of what was set up vs. skipped
- Stepper adapts to role and plan — Owner/Admin on Family plan see 6 steps; all other members see 5 steps
- All skipped items surfaced in My Account for completion later
- Family plan Owners and Admins who skipped the Family step can add members any time from My Account → Family Members

### Out of scope

- Photo / image avatar upload — Phase 2
- Facebook and Apple OAuth flows — Phase 2
- The acceptance journey for an invited member clicking their invitation link — covered in a separate Family Invitation spec
- Editing existing members' roles or profiles post-onboarding — covered in `_specs/account--family-members.md`
- Push notification permission prompts — Phase 2

### Dependencies

- `_specs/platform--sign-up.md` — sign-up routes to onboarding on successful verification
- `_specs/sign-in.md` — members with `onboarding_complete = false` are routed here on sign-in
- `_specs/platform--access-control.md` — roles assigned during onboarding (Owner, Admin, Adult Member, Teenager, Child)
- Family Invitation spec (not yet written) — covers the invited member's acceptance journey

### Phasing

| Phase | What ships | When |
|-------|-----------|------|
| Phase 1 | Full onboarding flow, emoji avatars, family invitations by email, web only | Launch |
| Phase 2 | Photo avatar upload, mobile native onboarding | Post-launch |

---

## 3. Users & personas (required)

| Persona | Description | Primary need from this feature |
|---------|-------------|-------------------------------|
| New member (Individual — Owner) | Just signed up for an Individual plan | Set up profile, briefing, and interests quickly |
| New member (Family — Owner) | Just signed up for a Family plan | Set up their own profile, invite family members, configure briefing and interests |
| New member (Family — Admin) | Accepted an invitation; first sign-in | Set up own profile, optionally add further family members, configure briefing and interests |
| New member (Adult Member / Grand Parent) | Accepted an invitation; first sign-in | Set up own profile, configure briefing and interests |
| New member (Teenager) | Accepted an invitation; first sign-in | Set up own profile, configure briefing and interests |
| New member (Child) | Profile created by Owner; first sign-in | Set up own display name and avatar |
| Returning member (incomplete) | Signed in but never finished onboarding | Complete or skip remaining steps from My Account |

---

## 4. Roles & access (required)

Every member goes through their own onboarding journey on first sign-in. The steps shown depend on the member's role and the account plan.

| Capability | Owner | Admin | Adult Member | Grand Parent | Teenager | Child |
|------------|:-----:|:-----:|:------------:|:------------:|:--------:|:-----:|
| Set own display name and avatar | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Configure own daily briefing | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |
| Select own interests | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |
| Add family members (Family plan) | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| Assign roles to family members | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| Send invitation emails | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| Skip any skippable step | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

**Stepper by role and plan:**
- Owner or Admin on Family plan: Welcome → Profile → Family → Briefing → Interests → Done (6 steps)
- Owner on Individual plan: Welcome → Profile → Briefing → Interests → Done (5 steps)
- All other roles (Adult Member, Grand Parent, Teenager): Welcome → Profile → Briefing → Interests → Done (5 steps)
- Child: Welcome → Profile → Done (3 steps — no Briefing or Interests)

Roles assignable to added family members: **Admin, Adult Member, Grand Parent, Teenager, Child**.
Child members do not receive an invitation email — their profile is created by the Owner or Admin.
All other roles (Admin, Adult Member, Grand Parent, Teenager) each receive a Cognito invitation email.

---

## 5. Functional requirements (required)

> Aim for 10 or fewer requirements. Requirements describe what the **system** does.
> User stories (§5.1) describe **why** a member cares. Avoid duplicating the same point in both.

Priority key: **P0** = must have at launch · **P1** = should have · **P2** = nice to have

**5a. Requirements index.**

| # | Requirement | Priority | Scenarios |
|---|-------------|----------|-----------|
| F-01 | Onboarding stepper adapts to role and plan: Owner/Admin on Family plan see 6 steps; Owner on Individual plan and all other roles see 5 steps; Child sees 3 steps | P0 | Stepper — Owner/Admin Family plan; Stepper — Owner Individual plan; Stepper — non-Owner member; Stepper — Child |
| F-02 | Profile step is shown to every role; collects display name (pre-filled from sign-up first name) and requires an emoji avatar selection before continuing | P0 | Profile step — happy path; Profile step — continue blocked without avatar; Profile step — server rejects missing avatar |
| F-03 | Family step is shown to Owner and Admin on Family plan only; allows adding members with name, role, and email; Child members have no email field; maximum 5 additional members | P0 | Family step — add member; Family step — Child hides email; Family step — member cap enforced; Family step — non-Owner/Admin rejected |
| F-04 | Submitting the Family step fires one Cognito invitation email per member with an email address; fires on "Continue", not on individual member add | P0 | Family step — invitations fire on Continue; Child receives no invitation; invitation failure does not block onboarding |
| F-05 | Daily Briefing step is shown to all roles except Child; collects home postcode, work address, commute mode, and news topics; step is skippable | P0 | Briefing step — save; Briefing step — skip; Child does not see Briefing step |
| F-06 | Interests step is shown to all roles except Child; displays a tag cloud; members can select up to 5 tags; further taps ignored until a tag is deselected; step is skippable | P1 | Interests step — select tags; Interests step — cap at 5; Interests step — skip; Child does not see Interests step |
| F-07 | Done screen shows a contextual summary: completed items show a green checkmark; skipped items show a muted dash and "set up any time in My Account" | P0 | Done screen — all completed; Done screen — partial completion |
| F-08 | All skipped onboarding items are accessible and completable from My Account | P0 | My Account surfaces incomplete onboarding items |
| F-09 | On completing onboarding, `onboarding_complete` is set to `true` server-side and the member is routed to Today | P0 | Onboarding complete — flag set server-side; subsequent sign-in routes to Today |
| F-10 | If a member closes the browser mid-onboarding, `onboarding_complete` remains `false`; their next sign-in routes back to Onboarding at the last completed step | P0 | Mid-flow abandonment — state preserved |

**5b. Acceptance criteria — Gherkin scenarios.**

```gherkin
# F-01: Stepper adapts to role and plan
Feature: Onboarding stepper renders correct steps based on role and plan
  Background:
    Given a member has completed sign-up or accepted an invitation and signs in for the first time

  Scenario: Owner or Admin on Family plan sees 6-step stepper
    Given the member's role is "<role>" and the account plan is "Family"
    When the member lands on the Onboarding flow
    Then the stepper shows exactly 6 steps: Welcome, Profile, Family, Briefing, Interests, Done

    Examples:
      | role  |
      | Owner |
      | Admin |

  Scenario: Owner on Individual plan sees 5-step stepper
    Given the member's role is "Owner" and the account plan is "Individual"
    When the member lands on the Onboarding flow
    Then the stepper shows exactly 5 steps: Welcome, Profile, Briefing, Interests, Done
    And no Family step is present

  Scenario Outline: Non-Owner/Admin member sees 5-step stepper (no Family step)
    Given the member's role is "<role>"
    When the member lands on the Onboarding flow
    Then the stepper shows exactly 5 steps: Welcome, Profile, Briefing, Interests, Done
    And no Family step is present

    Examples:
      | role         |
      | Adult Member |
      | Grand Parent |
      | Teenager     |

  Scenario: Child sees 3-step stepper
    Given the member's role is "Child"
    When the member lands on the Onboarding flow
    Then the stepper shows exactly 3 steps: Welcome, Profile, Done
    And no Family, Briefing, or Interests step is present


# F-02: Profile step
Feature: Profile step collects display name and emoji avatar for every role
  Background:
    Given a member is on the Profile step of their onboarding flow

  Scenario: Profile step — happy path
    Given the display name field is pre-filled with the member's first name
    When the member selects an emoji avatar and clicks "Continue"
    Then the display name and avatar are saved to members.display_name and members.avatar_emoji
    And the member advances to the next step

  Scenario: Profile step — continue blocked without avatar
    Given the member has entered a display name but has not selected an avatar
    When they click "Continue"
    Then the button remains disabled
    And no data is submitted to the server

  Scenario: Profile step — server rejects missing avatar
    Given a POST to /api/v1/onboarding/profile with no avatar_emoji
    Then the server responds with 422 Unprocessable Entity
    And members.avatar_emoji is not updated


# F-03: Family step
Feature: Family step is shown to Owner and Admin on Family plan only
  Background:
    Given the member is on the Family step of a Family plan account

  Scenario Outline: Family step — Owner and Admin can add members
    Given the member's role is "<role>"
    And they enter a name, select role "Adult Member", and enter an email
    When they click "Add member"
    Then the member appears in the pending list with their name, role badge, and email

    Examples:
      | role  |
      | Owner |
      | Admin |

  Scenario: Family step — Child hides email field
    Given the member selects role "Child" in the add member form
    Then the email field is hidden
    And the "No invitation" label is shown in its place

  Scenario: Family step — member cap enforced
    Given 5 family members have already been added
    When they attempt to add a 6th member
    Then the add member form is disabled
    And a message states the account is at capacity (6 members including Owner)

  Scenario Outline: Family step — non-Owner/Admin roles are rejected server-side
    Given the authenticated member has role "<role>"
    When a POST is made to /api/v1/onboarding/family_members
    Then the server responds with 403 Forbidden
    And no member record is created

    Examples:
      | role         |
      | Adult Member |
      | Grand Parent |
      | Teenager     |
      | Child        |


# F-04: Family invitations
Feature: Invitation emails fire on Family step Continue
  Background:
    Given an Owner or Admin is on the Family step and has added members to the pending list

  Scenario: Family step — invitations fire on Continue
    Given the pending list includes 2 members with email addresses and 1 Child
    When the member clicks "Continue"
    Then exactly 2 Cognito invitation emails are sent
    And the Child receives no invitation email

  Scenario: Child receives no invitation
    Given a member with role "Child" has been added with no email
    When the member clicks "Continue"
    Then no invitation email is sent for that Child

  Scenario: Invitation send failure does not block onboarding
    Given a Cognito email delivery failure occurs for one member
    When the member clicks "Continue"
    Then the Owner or Admin advances to the next step
    And a non-blocking warning is shown on the Done screen: "Some invitations couldn't be sent — retry in My Account"
    And the failure is logged server-side


# F-05: Daily Briefing step
Feature: Daily Briefing step is shown to all roles except Child
  Scenario Outline: Briefing step — save
    Given a member with role "<role>" is on the Daily Briefing step
    And they enter a home postcode, work address, commute mode "Transit", and select 2 news topics
    When they click "Continue"
    Then all four values are saved to member_settings for that member
    And the member advances to the next step

    Examples:
      | role         |
      | Owner        |
      | Admin        |
      | Adult Member |
      | Grand Parent |
      | Teenager     |

  Scenario: Briefing step — skip
    Given a member is on the Daily Briefing step
    When they click "Skip for now"
    Then no briefing data is saved
    And the member advances to the next step
    And the Briefing row on the Done screen shows a muted dash

  Scenario: Child does not see Briefing step
    Given the member's role is "Child"
    Then the Briefing step is not present in their onboarding flow
    And a direct GET to the Briefing step route responds with 403 Forbidden


# F-06: Interests step
Feature: Interests step is shown to all roles except Child; capped at 5 tags
  Scenario: Interests step — select tags
    Given a member is on the Interests step
    And they tap 3 interest tags
    When they click "Finish setup"
    Then the 3 selected interests are saved to member_settings
    And a count label shows "3 selected"

  Scenario: Interests step — cap at 5
    Given a member has already selected 5 tags
    When they tap a 6th tag
    Then the tap is ignored
    And the count label still shows "5 selected"

  Scenario: Interests step — skip
    When the member clicks "Skip — personalise later"
    Then no interests are saved
    And the Interests row on the Done screen shows a muted dash

  Scenario: Child does not see Interests step
    Given the member's role is "Child"
    Then the Interests step is not present in their onboarding flow
    And a direct GET to the Interests step route responds with 403 Forbidden


# F-07: Done screen
Feature: Done screen shows a contextual completion summary
  Scenario: Done screen — all completed (Family plan Owner)
    Given an Owner on a Family plan completed Profile, Family, Briefing, and Interests steps
    When they reach the Done screen
    Then each row shows a green checkmark and a descriptive summary
    And no hardcoded or placeholder rows are shown

  Scenario: Done screen — partial completion (Individual plan, briefing and interests skipped)
    Given an Owner on an Individual plan completed the Profile step only
    When they reach the Done screen
    Then the Profile row shows a green checkmark
    And the Briefing row shows a muted dash and "set up any time in My Account"
    And the Interests row shows a muted dash and "set up any time in My Account"
    And no Family row is shown

  Scenario: Done screen — Child (Profile only)
    Given a member with role "Child" completed the Profile step
    When they reach the Done screen
    Then only the Profile row is shown with a green checkmark
    And no Briefing, Interests, or Family row is shown


# F-08: My Account surfaces incomplete onboarding items
Feature: Skipped onboarding items are accessible in My Account
  Scenario: My Account surfaces incomplete briefing
    Given a member completed onboarding with the Briefing step skipped
    When they navigate to My Account → Preferences
    Then a prompt is shown to complete the Daily Briefing setup

  Scenario: My Account surfaces incomplete interests
    Given a member completed onboarding with the Interests step skipped
    When they navigate to My Account → Preferences
    Then a prompt is shown to personalise their interests

  Scenario: My Account Family section always available on Family plan for Owner and Admin
    Given a Family plan Owner or Admin skipped the Family step during onboarding
    When they navigate to My Account → Family Members
    Then the Family Members section is accessible and they can add members


# F-09: Onboarding completion flag
Feature: onboarding_complete is set server-side on "Enter MyPal"
  Scenario: Onboarding complete — flag set server-side
    Given any member is on the Done screen
    When they click "Enter MyPal"
    Then a PATCH to /api/v1/onboarding/complete sets onboarding_complete = true on the users record
    And the member is redirected to Today

  Scenario: Subsequent sign-in routes to Today
    Given a member with onboarding_complete = true signs in
    Then they are routed directly to Today, not to Onboarding

  Scenario: Server rejects unauthenticated completion attempt
    Given an unauthenticated PATCH to /api/v1/onboarding/complete
    Then the server responds with 401 Unauthorised
    And onboarding_complete is not updated


# F-10: Mid-flow abandonment
Feature: Onboarding state is preserved if member abandons mid-flow
  Scenario: Mid-flow abandonment — state preserved
    Given a member has completed the Profile step and is on the next step
    When they close the browser without clicking "Continue"
    Then onboarding_complete remains false
    And on next sign-in the member is routed to Onboarding at the step they left
    And data entered on the Profile step is preserved
```

---

## 5.1 User Stories

| # | As a… | I want to… | So that… |
|---|-------|-----------|---------|
| US-01 | New member | See what onboarding will cover before I start | I can decide whether to go through it or skip it |
| US-02 | New member | Set my own display name and pick an avatar | My profile feels personal from day one |
| US-03 | New member (Family Owner or Admin) | Add family members and assign their roles | Everyone has the right level of access when they join |
| US-04 | New member (Family Owner or Admin) | Send invitation emails during onboarding | My family can join without me having to find a separate invite option |
| US-05 | New member (all roles except Child) | Set up my own daily briefing with my commute and news preferences | My first morning summary is relevant to my life |
| US-06 | New member (all roles except Child) | Select my own interests | My content feed is personalised to me from day one |
| US-07 | New member | Skip any step I'm not ready for | I can get into the app quickly and come back to setup later |
| US-08 | New member | See a clear summary of what I set up | I leave onboarding knowing exactly what's ready and what still needs attention |

---

## 6. Non-functional requirements

| # | Requirement | Target |
|---|-------------|--------|
| NF-01 | Performance | Each onboarding step loads in < 500ms; no full-page reloads between steps |
| NF-02 | Accessibility | WCAG 2.1 AA; stepper communicates current step via aria-current; all form fields correctly labelled |
| NF-03 | Theme support | Both light (T_LIGHT) and dark (T_DARK) modes render correctly across all steps |
| NF-04 | Privacy enforcement | Access rules enforced server-side — never frontend-only; only the Owner can access or submit onboarding endpoints |
| NF-05 | Data persistence | Onboarding data is saved server-side on each step's "Continue" — not only at the end; partial completion is recoverable on re-entry |
| NF-06 | Invitation reliability | Invitation emails sent via Cognito; failures logged but do not block the Owner from completing onboarding |

---

## 7. User flows (required)

```gherkin
# Primary flow — Individual plan Owner
Feature: Individual plan Owner onboarding end-to-end
  Scenario: Happy path — Individual plan Owner
    Given a new Owner has completed sign-up on an Individual plan
    When they land on Onboarding
    Then the Welcome screen previews Profile, Briefing, and Interests steps
    When they click "Let's go"
    And enter a display name and select an emoji avatar on the Profile step and click "Continue"
    And enter home postcode, work address, commute mode, and news topics on the Briefing step and click "Continue"
    And select 3 interest tags on the Interests step and click "Finish setup"
    Then the Done screen shows green checkmarks for Profile, Briefing, and Interests
    When they click "Enter MyPal"
    Then onboarding_complete is set to true server-side
    And the Owner is redirected to Today


# Primary flow — Family plan Owner
Feature: Family plan Owner onboarding end-to-end
  Scenario: Happy path — Family plan Owner with members added
    Given a new Owner has completed sign-up on a Family plan
    When they complete the Welcome and Profile steps
    And add 2 Adult Members and 1 Child on the Family step and click "Continue"
    Then 2 Cognito invitation emails are sent and the Child receives no email
    When they complete the Briefing and Interests steps
    Then the Done screen shows: Profile ✓, Family (3 members added) ✓, Briefing ✓, Interests ✓
    When they click "Enter MyPal"
    Then onboarding_complete is set to true and the Owner is redirected to Today


# Primary flow — invited member (non-Owner/Admin)
Feature: Invited member onboarding end-to-end
  Scenario Outline: Happy path — invited member sets up profile, briefing, and interests
    Given a new member with role "<role>" has accepted an invitation and signs in for the first time
    When they land on Onboarding
    Then the stepper shows 5 steps: Welcome, Profile, Briefing, Interests, Done
    When they complete the Profile step
    And complete the Briefing step
    And complete the Interests step
    Then the Done screen shows green checkmarks for Profile, Briefing, and Interests
    When they click "Enter MyPal"
    Then onboarding_complete is set to true and the member is redirected to Today

    Examples:
      | role         |
      | Admin        |
      | Adult Member |
      | Grand Parent |
      | Teenager     |


# Primary flow — Child
Feature: Child member onboarding end-to-end
  Scenario: Happy path — Child sets up profile only
    Given a Child member signs in for the first time
    When they land on Onboarding
    Then the stepper shows 3 steps: Welcome, Profile, Done
    When they complete the Profile step
    Then the Done screen shows a green checkmark for Profile only
    When they click "Enter MyPal"
    Then onboarding_complete is set to true and the Child is redirected to Today


# Skip flow
Feature: Member skips optional steps during onboarding
  Scenario: Owner skips Briefing and Interests
    Given an Owner on an Individual plan completes the Profile step
    When they click "Skip for now" on the Briefing step
    And click "Skip — personalise later" on the Interests step
    Then the Done screen shows: Profile ✓, Briefing — (set up in My Account), Interests — (set up in My Account)
    When they click "Enter MyPal"
    Then onboarding_complete is set to true
    And My Account → Preferences shows prompts to complete Briefing and Interests

  Scenario: Family plan Owner skips Family step
    Given an Owner on a Family plan completes the Profile step
    When they click "Skip — add later" on the Family step
    Then the Done screen shows Family — (set up in My Account)
    And My Account → Family Members is accessible immediately


# Error / edge paths
Feature: Onboarding edge cases and error handling
  Scenario: Invitation email fails to send
    Given an Owner or Admin submits the Family step with 2 members
    And one Cognito invitation email fails to deliver
    Then the member is not blocked from continuing
    And the Done screen shows a non-blocking warning: "Some invitations couldn't be sent — retry in My Account"
    And the failure is logged server-side

  Scenario: Back navigation preserves data
    Given a member has completed the Profile step and is on the next step
    When they click "Back"
    Then they return to the Profile step
    And the display name and avatar they entered are still populated

  Scenario: Browser closed mid-onboarding — re-entry at last completed step
    Given a member has completed the Profile step and closed the browser
    When they sign in again
    Then they are routed to Onboarding at the step after Profile
    And their Profile data is preserved
```

---

## 8. Data model

| Field | Description | Required? | Notes |
|-------|-------------|-----------|-------|
| `members.display_name` | Member's chosen display name | Yes | Pre-filled from sign-up first_name; editable during onboarding |
| `members.avatar_emoji` | Selected emoji character | Yes | Chosen from a fixed set in Phase 1; required before Profile step can continue |
| `members.role` | Role assigned to a family member | Yes (per added member) | Enum: `owner`, `admin`, `adult_member`, `teenager`, `child` |
| `users.email` | Email address for invitation | Conditional | Required for Admin, Adult Member, Teenager; absent for Child; stored on users record created at invitation acceptance |
| `member_settings.home_postcode` | Home postcode for weather | No | Saved on Briefing step Continue |
| `member_settings.work_address` | Work address for commute | No | Saved on Briefing step Continue |
| `member_settings.commute_mode` | Preferred commute mode | No | Enum: `drive`, `transit`, `cycle`, `walk` |
| `member_settings.news_topics` | Selected news categories | No | Array; saved on Briefing step Continue |
| `member_settings.interests` | Selected interest tags | No | Array; max 5 entries; saved on Interests step Continue |
| `users.onboarding_complete` | Whether onboarding has been finished | System | Defaults to `false`; set to `true` server-side on "Enter MyPal" click |

---

## 9. UI / UX considerations

**Reference:** `_UI/mypal-app.jsx` → `Onboarding` function

**Stepper:** Persistent at the top of all steps. Dots indicate completed (✓), active, and upcoming states with labels below each dot. Dot count varies by role and plan — see §4 for the full breakdown. Navigation between steps uses Back/Continue buttons only — the stepper dots are not clickable.

**Welcome step:** Large emoji (🎉), Playfair Display heading, short subtitle, preview rows showing the steps relevant to this member's role. Single "Let's go" CTA. No skip option on this step.

**Profile step:** Shown to every role. Display name input pre-filled with the member's first name. Emoji avatar grid (12 options in Phase 1). Avatar selection is required — "Continue" is disabled until an avatar is chosen. No skip option on this step.

**Family step (Owner and Admin on Family plan only):** The current member is shown greyed out at the top with their role badge. Added members are listed below with name, role badge, and email (or "No invitation" for Child). Add member form: name, role dropdown, conditional email field (hidden when Child is selected). Up to 5 additional members. "Skip — add later" available.

**Daily Briefing step (all roles except Child):** Home postcode and work address (text inputs), commute mode (4-option pill selector: Drive / Transit / Cycle / Walk), news topics (multi-select tags). "Skip for now" available.

**Interests step (all roles except Child):** Full tag cloud with toggle behaviour. Count shown below ("N selected"). "Skip — personalise later" available.

**Done screen:** Centred success icon. Contextual rows matching the steps shown to that member's role — completed items show a green checkmark with descriptive sub-text; skipped items show a muted dash and "set up any time in My Account". Single "Enter MyPal →" CTA.

**Back navigation:** Back button available from step 2 onwards. Data is preserved on back navigation.

**My Account integration:** All incomplete onboarding sections surface in My Account → Preferences with a prompt to complete them. Family Members section is always present in My Account for Family plan Owners and Admins regardless of whether members were added during onboarding.

---

## 10. Integration points & platform constraints

| Integration | Availability | Notes |
|-------------|-------------|-------|
| Cognito (invitation emails) | Phase 1 | One invitation email per member with an email address; fires on Family step "Continue" |
| Daily Briefing (Today) | Phase 1 | Postcode and commute mode saved here power the Today briefing strip |
| My Account — Preferences | Phase 1 | Surfaces incomplete Briefing and Interests items with completion prompts |
| My Account — Family Members | Phase 1 | Always visible for Family plan; Owner can add members here after skipping onboarding Family step |
| Family Invitation (acceptance flow) | Phase 1 | Separate spec — covers what happens after an invited member clicks their link |
| Photo avatar upload | Phase 2 | Requires S3 presigned URL upload and image processing pipeline |

---

## 11. Success metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Onboarding completion rate | > 70% of members who start onboarding reach the Done screen | Analytics: Welcome view → Done screen funnel |
| Profile step completion | > 95% | Analytics: near-mandatory step — low skip expected |
| Briefing setup rate | > 60% | Analytics: Briefing step "Continue" vs. "Skip" |
| Family invitation rate (Family plan) | > 75% of Family plan Owners add at least 1 member | Analytics: Family step members-added event |
| Day-1 return rate | > 50% of members who complete onboarding return the next day | Analytics: DAU cohort by onboarding_complete date |

---

## 12. Definition of done

- [ ] All P0 functional requirements implemented and tested
- [ ] Access rules enforced server-side for all five roles — only the Owner can access onboarding endpoints
- [ ] Stepper renders 5 steps for Individual, 6 for Family — Individual plan never sees the Family step
- [ ] Child role hides the email field; no invitation email sent for Child members
- [ ] Invitation emails fire on Family step "Continue", not on individual member add
- [ ] Done screen is fully contextual — no hardcoded completion items
- [ ] All skipped items accessible and completable in My Account
- [ ] `onboarding_complete` set server-side on "Enter MyPal", not client-side
- [ ] Back navigation preserves entered data across all steps
- [ ] Mid-flow abandonment re-routes member to last completed step on next sign-in
- [ ] Mobile layout reviewed at 375px viewport
- [ ] Both light (T_LIGHT) and dark (T_DARK) themes verified visually across all steps
- [ ] WCAG 2.1 AA verified for stepper, form fields, and avatar picker
- [ ] Open questions resolved or formally deferred

---

## 13. Open questions

*No open questions — all resolved in v0.2 of the previous spec.*

---

## 14. Revision history

| Version | Date | Author | Summary of changes |
|---------|------|--------|-------------------|
| 0.1 | 2026-05-20 00:00 | Dip | Initial draft — generated from brainstorm session and mypal-complete-v2.jsx Onboarding component review |
| 0.2 | 2026-05-20 00:00 | Dip | Resolved all open questions: briefing settings in member_settings table; interests capped at 5; pending invites flagged after 10 days |
| 1.0 | 2026-06-15 09:36 | Cowork | Rewritten to spec template v3: renamed platform--onboarding.md; §5 split into §5a requirements index + §5b Gherkin scenarios; §7 user flows converted to Gherkin; terminology updated to canonical terms (member not user, Child not Children); date format updated to YYYY-MM-DD HH24:MI; NF-04 privacy enforcement added; §12 DoD updated to v3 standard |
| 1.1 | 2026-06-15 10:01 | Cowork | Added Grand Parent role throughout; every role now has their own onboarding journey (Profile, Briefing, Interests); Family step restricted to Owner and Admin only; Child onboarding reduced to 3 steps (Welcome, Profile, Done); stepper logic updated by role and plan; §3 personas, §4 roles table, §5a/§5b, §5.1, §7, §9 all updated |
