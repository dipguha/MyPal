# Spec — Onboarding

> UI reference: `_UI/mypal-app.jsx` → `Onboarding` component

---

## 1. Overview (required)

**Feature name:** Onboarding  
**Module / nav location:** Public → Onboarding (post sign-up)  
**Author:** Dip  
**Status:** Draft  
**Last updated:** 2026-05-20

### Problem statement
New users who complete sign-up land in an empty, unconfigured app. Without a guided setup flow they won't have a daily briefing, a personalised interests feed, or (for Family plan users) any family members connected. First-run drop-off and low day-one engagement are the risk without a clear, skippable onboarding journey.

### User-facing goal
As a new MyPal user, I want to be guided through setting up my profile, briefing, and interests — and optionally inviting my family — so that my account feels personal and useful from the very first day.

---

## 2. Scope (required)

### In scope
- Welcome screen previewing what the onboarding covers
- Profile step: display name and emoji avatar (both plans)
- Family members step: add members with roles, capture emails, fire invitation emails (Family plan only)
- Daily Briefing step: home postcode, work address, commute mode, news topics (both plans, skippable)
- Interests step: tag-based interest picker (both plans, skippable)
- Done screen: contextual summary of what was set up vs. skipped
- Stepper adapts to plan — Individual shows 5 steps, Family shows 6
- All skipped items surfaced in My Account for completion later
- Family plan users who skipped family members can add them any time from My Account

### Out of scope
- Photo / image avatar upload — Phase 2
- Facebook and Apple OAuth flows — Phase 2
- What happens after an invited member clicks their invitation link — covered in a separate Family Invitation spec
- Editing existing members' roles or profiles post-onboarding — covered in My Account spec
- Push notification permission prompts — Phase 2

### Dependencies
- `_specs/sign-up.md` — sign-up routes to onboarding on successful verification
- `_specs/sign-in.md` — users with `onboarding_complete = false` are routed here on sign-in
- `_specs/platform--access-control.md` — roles assigned during onboarding (Admin, Adult Member, Teenager, Children)
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
| New user (Individual) | Just signed up for an Individual plan | Set up profile, briefing, and interests quickly |
| New user (Family — Owner) | Just signed up for a Family plan | Set up their own profile and invite family members with the right roles |
| Returning user (incomplete) | Signed in but never finished onboarding | Complete or skip remaining steps from My Account |

---

## 4. Roles & access (required)

Onboarding is only shown to the account Owner immediately after sign-up. The Owner assigns roles to all other members during this flow.

| Capability | Owner (during onboarding) |
|------------|:------------------------:|
| Set own display name and avatar | ✓ |
| Add family members (Family plan) | ✓ |
| Assign roles to family members | ✓ |
| Send invitation emails to members | ✓ |
| Configure daily briefing | ✓ |
| Select interests | ✓ |
| Skip any step | ✓ |

Roles that can be assigned to family members during onboarding: **Admin, Adult Member, Teenager, Children**.  
Children do not receive an email invitation — their profile is created by the Owner.  
All other roles (Admin, Adult Member, Teenager) receive an email invitation.

---

## 5. Functional requirements (required)

Priority key: **P0** = must have at launch · **P1** = should have · **P2** = nice to have

| # | Requirement | Priority | Acceptance criteria |
|---|-------------|----------|---------------------|
| F-01 | Onboarding stepper shows 5 steps for Individual (Welcome, Profile, Briefing, Interests, Done) and 6 for Family (Welcome, Profile, Family, Briefing, Interests, Done) | P0 | Stepper renders the correct steps based on the plan stored at sign-up; Individual never sees a Family step |
| F-02 | Profile step collects a display name (pre-filled from sign-up first name) and an emoji avatar picker | P0 | Both fields present; display name is editable; avatar selection is required before continuing; selected avatar persists through the rest of onboarding |
| F-03 | Family step (Family plan only) allows the Owner to add members with name, role, and email; Children have no email field | P0 | Role dropdown shows Admin, Adult Member, Teenager, Children; email field hides when Children is selected; up to 5 members can be added (Owner counts as 1 of 6) |
| F-04 | Submitting the Family step fires invitation emails to all members with an email address | P0 | One Cognito invitation email sent per member with an email; Children receive no email; invite fires on "Continue" not on individual member add |
| F-05 | Daily Briefing step collects home postcode, work address, commute mode (Drive / Transit / Cycle / Walk), and news topics | P0 | All four fields present; step is skippable; saved values used to power the daily briefing on Today |
| F-06 | Interests step shows a tag cloud; user can select up to 5 tags | P1 | Tags are selectable/deselectable; selection capped at 5 (further taps ignored until one is deselected); step is skippable; selected interests stored and used to personalise the content feed |
| F-07 | Done screen shows a contextual summary: completed items show a green checkmark and a short description; skipped items show a muted dash and "set up any time in My Account" | P0 | Summary reflects actual state — no hardcoded completion items; Family row only appears on Family plan |
| F-08 | All skipped onboarding items are accessible and completable from My Account | P0 | My Account surfaces incomplete onboarding sections (briefing, interests, family members) with a prompt to complete them |
| F-09 | Family plan users who added no family members during onboarding can add them at any time from My Account | P0 | My Account → Family section is available regardless of whether members were added during onboarding |
| F-10 | On completing onboarding ("Enter MyPal"), `onboarding_complete` is set to `true` and the user is routed to Today | P0 | Flag set server-side; subsequent sign-ins route directly to Today |

---

## 5.1 User Stories

| # | As a… | I want to… | So that… |
|---|-------|-----------|---------|
| US-01 | New user | See what onboarding will cover before I start | I can decide whether to go through it or skip it |
| US-02 | New user | Set a display name and pick an avatar | My profile feels personal from day one |
| US-03 | New user (Family) | Add my family members and assign their roles | Everyone has the right level of access when they join |
| US-04 | New user (Family) | Send invitation emails during onboarding | My family can join without me having to find a separate invite option |
| US-05 | New user | Set up my daily briefing with my commute and news preferences | My first morning summary is relevant to my life |
| US-06 | New user | Skip any step I'm not ready for | I can get into the app quickly and come back to setup later |
| US-07 | New user | See a clear summary of what I set up | I leave onboarding knowing exactly what's ready and what still needs attention |

---

## 6. Non-functional requirements

| # | Requirement | Target |
|---|-------------|--------|
| NF-01 | Performance | Each onboarding step loads in < 500ms; no full-page reloads between steps |
| NF-02 | Accessibility | WCAG 2.1 AA; stepper communicates current step via aria-current; all form fields labelled correctly |
| NF-03 | Theme support | Both light mode (T_LIGHT) and dark mode (T_DARK) render correctly across all steps |
| NF-04 | Data persistence | Onboarding data (profile, members, briefing, interests) is saved server-side on each step's "Continue" — not only at the end; partial completion is recoverable |
| NF-05 | Invitation reliability | Invitation emails sent via Cognito; failures logged but do not block the Owner from completing onboarding |

---

## 7. User flows (required)

### Happy path — Individual plan
1. User completes sign-up and email verification → routed to Onboarding
2. Welcome screen: previews Profile, Briefing, Interests steps → "Let's go"
3. Profile: enters display name, picks emoji avatar → "Continue"
4. Daily Briefing: enters postcode, work address, commute mode, news topics → "Continue"
5. Interests: selects interest tags → "Finish setup"
6. Done screen: all three items show green checkmarks → "Enter MyPal"
7. `onboarding_complete` set to `true` → routed to Today

### Happy path — Family plan
1–3. Same as Individual up to and including Profile step
4. Family members: adds members with names, roles, emails; Children added without email → "Continue" fires invitation emails
5. Daily Briefing → "Continue"
6. Interests → "Finish setup"
7. Done screen: profile, family (N members invited), briefing, interests → "Enter MyPal"
8. `onboarding_complete` set to `true` → routed to Today

### Skip path
- User clicks "Skip — set up later" on any skippable step (Family, Briefing, Interests)
- Done screen shows those items as dashed with "set up any time in My Account"
- `onboarding_complete` still set to `true` on "Enter MyPal"

### Error / edge paths
- **Invitation email fails to send:** Error is logged; Owner sees a non-blocking warning on the Done screen ("Some invitations couldn't be sent — retry in My Account"); onboarding continues
- **User navigates back:** Data entered in previous steps is preserved; no data loss on back navigation
- **User closes the browser mid-onboarding:** `onboarding_complete` remains `false`; next sign-in routes back to Onboarding at the last completed step
- **Family plan — 0 members added, skipped:** Done screen shows "No members added — set up any time in My Account"; My Account → Family is available immediately

---

## 8. Data model

| Field | Description | Required? | Notes |
|-------|-------------|-----------|-------|
| `display_name` | User-chosen name shown throughout the app | Yes | Stored in `members.display_name`; pre-filled from sign-up `first_name` |
| `avatar_emoji` | Selected emoji character | Yes | Stored in `members`; chosen from a fixed set in Phase 1 |
| `member.name` | Family member's full name | Yes (per member) | Stored in `members.display_name` |
| `member.role` | Family member's role | Yes (per member) | Enum: `admin`, `adult_member`, `teenager`, `children`; stored in `members.role` |
| `member.email` | Email for invitation | Conditional | Required for Admin, Adult Member, Teenager; absent for Children; stored in `users.email` on acceptance |
| `briefing.postcode` | Home postcode for weather | No | Stored in `member_settings` |
| `briefing.work_address` | Work address for commute | No | Stored in `member_settings` |
| `briefing.commute_mode` | Preferred commute mode | No | Enum: `drive`, `transit`, `cycle`, `walk`; stored in `member_settings` |
| `briefing.news_topics` | Selected news categories | No | Array stored in `member_settings` |
| `interests` | Selected interest tags (max 5) | No | Array stored in `member_settings` or a `member_interests` table |
| `onboarding_complete` | Whether onboarding has been finished | System | Stored in `users`; defaults to `false`; set to `true` on "Enter MyPal" |

---

## 9. UI / UX considerations

**Reference:** `_UI/mypal-app.jsx` → `Onboarding` function

**Stepper:** Persistent at the top of all steps. Dots show completed (✓), active, and upcoming states. Labels sit below each dot. Individual plan: 5 dots. Family plan: 6 dots. The stepper does not allow clicking back to previous steps directly — use the Back button.

**Welcome step:** Large emoji (🎉), Playfair Display heading, short subtitle, preview rows showing what each step covers. Single "Let's go" CTA. No skip option on this step.

**Profile step:** Display name input pre-filled with sign-up first name. Emoji avatar grid (12 options in Phase 1). Avatar selection required — "Continue" is disabled until an avatar is chosen. No skip option on this step.

**Family step (Family plan only):** Owner shown greyed-out at the top with "Owner" badge. Members listed below with name, role badge, and email (or "No invitation" for Children). Add member form: name, role dropdown, conditional email field (hidden for Children). Up to 5 additional members. "Skip — add later" available.

**Daily Briefing step:** Home postcode, work address (text inputs), commute mode (4-option pill selector), news topics (multi-select tags). "Skip for now" available.

**Interests step:** Full tag cloud with toggle behaviour. Count shown below ("N selected"). "Skip — personalise later" available.

**Done screen:** Centred success icon. Contextual rows — completed items have a green check and descriptive sub-text; skipped items have a muted dash and "set up any time in My Account". Single "Enter MyPal →" CTA.

**Back navigation:** Back button available from step 2 onwards. Data is preserved on back navigation.

**My Account integration:** All incomplete onboarding sections surface in My Account with a prompt. Family plan users always see a Family section in My Account regardless of whether they added members during onboarding.

---

## 10. Integration points & platform constraints

| Integration | Availability | Notes |
|-------------|-------------|-------|
| Cognito (invitation emails) | Phase 1 | Cognito sends invitation email per member with email; fires on Family step "Continue" |
| Daily Briefing | Phase 1 | Postcode and commute saved here power the Today briefing strip |
| My Account | Phase 1 | Surfaces incomplete onboarding items; Family section always visible for Family plan |
| Family Invitation (acceptance flow) | Phase 1 | Separate spec — covers what happens after an invited member clicks their link |
| Photo avatar upload | Phase 2 | Requires S3 presigned URL upload and image processing pipeline |

---

## 11. Success metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Onboarding completion rate | > 70% of users who start onboarding reach the Done screen | Analytics: Welcome view → Done screen funnel |
| Profile step completion | > 95% | Analytics: near-mandatory step — low skip expected |
| Briefing setup rate | > 60% | Analytics: briefing step "Continue" vs. "Skip" |
| Family invitation rate (Family plan) | > 75% of Family plan owners add at least 1 member | Analytics: family step members added event |
| Day-1 return rate | > 50% of users who complete onboarding return the next day | Analytics: DAU cohort by onboarding_complete date |

---

## 12. Definition of done

- [ ] All P0 functional requirements implemented and tested
- [ ] Stepper renders 5 steps for Individual, 6 for Family — never shows Family step to Individual users
- [ ] Children role hides email field; no invitation email sent for Children
- [ ] Invitation emails fire on Family step "Continue", not on individual member add
- [ ] Done screen is fully contextual — no hardcoded completion items
- [ ] All skipped items accessible and completable in My Account
- [ ] `onboarding_complete` set server-side on "Enter MyPal", not client-side
- [ ] Back navigation preserves entered data across all steps
- [ ] Both light and dark themes verified visually across all 5/6 steps
- [ ] WCAG 2.1 AA verified for stepper, form fields, and avatar picker
- [ ] Open questions resolved or formally deferred

---

## 13. Open questions

- [x] Should the briefing settings (postcode, commute, news topics) be stored on the `members` table or in a dedicated `briefing_settings` table? — **Resolved:** Store in a dedicated `member_settings` table to keep member-specific settings separate from identity data.
- [x] What is the maximum number of interest tags a user can select? — **Resolved:** Maximum 5 interests at launch.
- [x] If an invitation email bounces or the invited member never accepts, how does the Owner retry or remove the pending invite? — **Resolved:** If the invited member has not signed up within 10 days, flag it to the inviting Owner (via My Account or a notification). Retry and remove flows are in scope for the My Account spec.

---

## 14. Revision history

| Version | Date | Author | Summary of changes |
|---------|------|--------|-------------------|
| 0.1 | 2026-05-20 | Dip | Initial draft — generated from brainstorm session and mypal-complete-v2.jsx Onboarding component review |
| 0.2 | 2026-05-20 | Dip | Resolved all open questions: briefing settings in `member_settings` table; interests capped at 5; pending invites flagged after 10 days |
