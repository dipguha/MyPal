# Spec: Family Members

> Format: feature_spec_template.md (v2)  
> Template: [`.claude/commands/references/feature_spec_template.md`](../.claude/commands/references/feature_spec_template.md)  
> UI reference: `_UI/mypal-app.jsx` — Family Members section within the My Account area (lines 5241–5391)

---

## 1. Overview

**Feature name:** Family Members  
**Module / nav location:** My Account → Family Members  
**Author:** Dip  
**Status:** Draft  
**Last updated:** 2026-05-27

### Problem statement

Household managers need a single place to see who has access to MyPal, adjust roles as family circumstances change, and control which trusted adults are in the Household Managers Group — without navigating into access control or permission screens for basic roster management.

### User-facing goal

As an Owner or Admin, I want to view and manage all household members in one place so that I can keep the household roster accurate and ensure the right people have the right level of access.

---

## 2. Scope

### In scope

- View all household members including the Owner
- Invite new members by email with a role assigned at invite time
- Change any member's role via an inline dropdown (Owner's own role is read-only)
- Toggle HMG membership for Adult Members via an inline checkbox
- Stage multiple role and HMG changes before committing with a single Save
- Remove a member from the household

### Out of scope

- Per-module permission overrides for individual members (→ My Account → Access tab; see `_specs/platform--access-control.md` section 4.9)
- HMG management screen (→ My Account → Access tab)
- Notification to affected member when their role or HMG status changes (Phase 2)
- Editing a member's personal profile details (→ My Account → My Profile)
- Owner succession / ownership transfer (deferred; see open questions in `_specs/platform--access-control.md`)

### Dependencies

- `_specs/platform--access-control.md` — authoritative role definitions, HMG rules, and permission model
- Cognito / auth service — invite flow triggers account creation or links to existing account
- Email service — invite email delivery

### Phasing

| Phase | What ships | When |
|-------|-----------|------|
| Phase 1 | Member list, role management, HMG toggle, invite, remove | Web launch |
| Phase 2 | Role change notifications to affected members | Post-launch |

---

## 3. Users & personas

| Persona | Description | Primary need from this feature |
|---------|-------------|-------------------------------|
| Owner | Account creator; full household control | See and manage everyone in the household; stays in control of who has what role |
| Admin | Co-manager (e.g. partner/spouse) | Same roster management as Owner; keep the member list accurate day-to-day |

No other role sees or accesses this module.

---

## 4. Roles & access

| Capability | Owner | Admin | Adult Member | Teenager | Children |
|------------|:-----:|:-----:|:------------:|:--------:|:--------:|
| View member list | ✓ | ✓ | ✗ | ✗ | ✗ |
| Change member role | ✓ | ✓ | ✗ | ✗ | ✗ |
| Toggle HMG membership | ✓ | ✓ | ✗ | ✗ | ✗ |
| Invite new member | ✓ | ✓ | ✗ | ✗ | ✗ |
| Remove member | ✓ | ✓ | ✗ | ✗ | ✗ |
| Change own role | ✗ | ✗ | ✗ | ✗ | ✗ |

**Access notes:**

- Family Members module is not visible in the My Account nav for Adult Member, Teenager, or Children roles.
- Neither Owner nor Admin can change their own role via this screen — their role is displayed as read-only text.
- The Owner role cannot be assigned to any member via the role dropdown; Owner is not an option in the dropdown.
- Only one Admin can exist at a time. If Admin role is assigned to a new member, the existing Admin is automatically downgraded to Adult Member (see F-05).
- Owner can remove any member except themselves. Admin can remove any member except the Owner and themselves.

---

## 5. Functional requirements

Priority key: **P0** = must have at launch · **P1** = should have · **P2** = nice to have

| # | Requirement | Priority | Acceptance criteria |
|---|-------------|----------|---------------------|
| F-01 | Member list displays all household members including the Owner | P0 | All members visible regardless of role; Owner appears in the list with their role shown as read-only |
| F-02 | Each member row shows: avatar, name, age (for Adult/Teen/Child), HMG checkbox, and role control | P0 | Row renders correctly for all five role types; "You" label shown on the viewer's own row |
| F-03 | Owner and Admin see a role dropdown on all rows except their own | P0 | Dropdown renders for all non-self rows; own row shows role as plain text with no control |
| F-04 | Role dropdown options are: Admin, Adult, Teen, Child (Owner is not selectable) | P0 | Owner option absent from dropdown; selecting any other option stages a role change |
| F-05 | Assigning Admin to a member automatically stages a downgrade of the current Admin to Adult Member | P0 | Only one Admin row ever has the Admin role selected at the same time; prior Admin row updates to Adult in the UI |
| F-06 | HMG checkbox shown on every non-self member row; Owner/Admin rows ticked and disabled; Adult rows toggleable; Teen/Child rows unticked and disabled | P0 | Checkbox state and disabled/enabled behaviour matches role; accentColor reflects warm theme token |
| F-07 | When a member's role is changed away from Adult, their HMG checkbox is automatically cleared | P0 | Changing a member from Adult to Teen or Child sets HMG to false in the staged state |
| F-08 | Role and HMG changes are staged — not applied to the server until Save is tapped | P0 | No API call made on dropdown change or checkbox toggle; changes held in local state only |
| F-09 | Rows with staged changes show a warm left border accent and subtle background highlight | P1 | Visual indicator present on any row where staged role or HMG differs from saved state |
| F-10 | A "Save changes" and "Discard" bar appears at the bottom of the card when any staged change is pending; disappears once saved or discarded | P0 | Bar absent when no changes; present as soon as any change is staged; Save commits all, Discard resets all |
| F-11 | Owner/Admin can invite a new member by email with a role assigned at invite time | P0 | Invite modal captures email address and role (Admin, Adult Member, Teenager, Child); sends invite email on submit; pending invite shown in member list |
| F-12 | Owner can remove any member; Admin can remove any member except the Owner | P0 | Remove button (🗑️) visible on rows the viewer is permitted to remove; not shown on viewer's own row or (for Admin) on the Owner row; removed members remain visible in the list with a "Removed" badge, dimmed styling, and no controls; card title shows active count with a "(N removed)" annotation |
| F-13 | Pending invites are shown below the active member list with name, email, role, sent date, status badge, and Resend / Cancel actions | P0 | Pending invites section visible when at least one invite exists; status badge shows "Pending" (teal) or "Expired" (amber); Resend resets sent date; Cancel removes the row |

---

## 5.1 User Stories

| # | As a… | I want to… | So that… |
|---|-------|-----------|---------|
| US-01 | Owner | See every household member in one list | I always know who currently has access to MyPal |
| US-02 | Owner | Change a member's role via a dropdown | Their access level stays accurate as family circumstances change |
| US-03 | Owner | Toggle HMG membership for a trusted adult | They can help manage the household without me going into a separate screen |
| US-04 | Owner | Stage multiple changes and save them together | I can review everything before it takes effect |
| US-05 | Owner / Admin | Invite a new family member by email | They can join the household and start using MyPal right away |
| US-06 | Admin | Remove a member who has left the household | Their access is revoked promptly and cleanly |

---

## 6. Non-functional requirements

| # | Requirement | Target |
|---|-------------|--------|
| NF-01 | Module visibility | Family Members nav item hidden for all roles except Owner and Admin; enforced server-side |
| NF-02 | Access enforcement | All save operations (role change, HMG change, remove) validated server-side; 403 returned if caller is not Owner or Admin |
| NF-03 | Audit logging | Every role change and HMG membership change written to `access_log` with actor, target, before state, after state, and timestamp (see `_specs/platform--access-control.md` data model) |
| NF-04 | Role change propagation | Changed permissions take effect within 1 request of Save — no stale sessions |
| NF-05 | Accessibility | WCAG 2.1 AA; role dropdowns and checkboxes are keyboard-navigable with visible focus states |

---

## 7. User flows

### Happy path — Change a member's role

1. Owner opens My Account → Family Members
2. Full member list shown; Owner identifies the member to change
3. Opens role dropdown on that member's row; selects new role
4. Row gets warm left border highlight (staged change)
5. If role changed from Adult: HMG checkbox auto-clears on that row
6. Owner reviews, taps "Save changes"
7. API call updates `members.role` (and `group_members` if HMG cleared); `access_log` entry created
8. Row highlights clear; Save bar disappears

### Happy path — Add an Adult Member to HMG

1. Owner finds an Adult Member row in the list
2. Ticks the HMG checkbox; row gets warm highlight
3. Owner taps "Save changes"
4. Member added to `group_members`; `access_log` entry created with action `hmg_member_added`
5. Member immediately gains HMG-level visibility and assignment rights

### Happy path — Invite a new member

1. Owner taps "+ Invite family member"
2. Invite modal opens: email field + role selector (Admin, Adult Member, Teenager, Child)
3. Owner enters email and selects role; taps Send invite
4. Invite email sent; pending row appears in member list with a "Pending" status badge
5. Invitee clicks link in email → Cognito account creation or account link flow
6. On acceptance, pending status clears; member row becomes active

### Happy path — Remove a member

1. Owner opens a member's row (or overflow menu on the row)
2. Selects Remove
3. Confirmation dialog lists what the member will lose access to and states the 30-day data retention window for their private data
4. Owner confirms
5. Member loses access immediately; `access_log` entry created; private data enters 30-day deletion window; shared/family data remains

### Error / edge paths

- **Inviting an email already associated with an account:** System detects the existing account and links the invite to it rather than creating a duplicate; user prompted to sign in if not already
- **Invite not accepted within expiry window:** Pending row shows "Expired" status with a Resend option for Owner/Admin
- **Removing a member with open tasks assigned to them:** Tasks remain; they become unassigned (or assigned back to Family); exact behaviour to be confirmed in Tasks module spec
- **Discarding changes after staging:** All staged role and HMG changes reset to last saved state; no API call made
- **Assigning Admin when one already exists:** Current Admin row auto-stages to Adult Member; user sees both changes highlighted before saving

---

## 8. Data model

All tables referenced here are defined in `_specs/platform--access-control.md`. No new tables required for Phase 1.

Key fields written or read by this module:

| Table | Field | Operation | Notes |
|-------|-------|-----------|-------|
| `members` | `role` | Read / Write | Updated on Save; enum: `owner`, `admin`, `adult`, `teenager`, `child` |
| `group_members` | `member_id`, `group_id`, `added_by`, `added_at` | Read / Write | Row inserted on HMG add; row deleted on HMG remove or role change away from Adult |
| `access_log` | All fields | Write | Written on every Save that changes role or HMG state |

**Invitations** (data model to be defined in the invite flow spec or onboarding spec):

| Field | Description | Required? | Notes |
|-------|-------------|-----------|-------|
| `email` | Invitee email address | Yes | Used to match existing Cognito account or create new one |
| `role` | Role assigned at invite time | Yes | Enum: `admin`, `adult`, `teenager`, `child` |
| `status` | Invite state | Yes | Enum: `pending`, `accepted`, `expired` |
| `expires_at` | Invite expiry timestamp | Yes | Duration TBD — see open questions |
| `invited_by` | Member ID of inviter | Yes | |
| `created_at` | Timestamp | Yes | UTC |

---

## 9. UI / UX considerations

The module renders as a single card within the My Account tab panel. Reference: Family Members section in `_UI/ui_working/mypal-app-working.jsx`.

**Member list** is shown in full — no pagination needed for Phase 1 (household capped at 6 members). Each row is: avatar · name + age subtitle · HMG checkbox + label · role dropdown or role text. The "You" label appears inline with the name on the viewer's own row.

**HMG checkbox** uses the warm theme accent colour when active. The label "HMG" sits beside the checkbox. For disabled states (Owner, Admin, Teen, Child), the label uses the secondary text colour to communicate non-interactivity without hiding the state.

**Role dropdown** is a native `<select>` styled to match the card. Options: Admin, Adult, Teen, Child. Owner is not an option. The viewer's own row shows plain text instead of a dropdown.

**Staged changes** are communicated with a warm left border accent and a subtle warm background tint on the affected row. The Save / Discard bar appears above the action buttons at the bottom of the card only when at least one staged change exists. "Save changes" is the primary warm button; "Discard" is a secondary outline button.

**Invite modal** opens from the "+ Invite family member" button. Captures email and role. Role defaults to Adult Member.

**Pending invite rows** appear below the active member list under a "Pending Invites" section header. Each row shows: envelope avatar, invitee name, email + role, sent date, a status badge (Pending in teal, Expired in amber), and Resend / Cancel buttons. Resend resets the sent date; Cancel removes the row immediately. The section is hidden when no pending invites exist.

**Remove button** is a small 🗑️ icon button at the far right of each row the viewer is permitted to remove. It does not appear on the viewer's own row, and for Admin it does not appear on the Owner row. Clicking opens a confirmation modal that lists exactly what the removal entails (immediate access revocation, 30-day private data retention window) and requires an explicit "Remove [Name]" button click to confirm. The modal can be dismissed with Cancel or the ✕ button.

**Removed member rows** remain in the list after removal — they are not hidden. The row is dimmed (reduced opacity), all controls (role dropdown, HMG checkbox, remove button) are hidden, and a rose-coloured "Removed" badge replaces them. The card title updates to show the active member count with a "(N removed)" annotation so the total picture is always visible.

**Empty state:** Not applicable in Phase 1 — the Owner always exists and is shown.

**Mobile:** At 375px, the row should stack name/age above the controls if needed, or truncate gracefully; role text and checkbox must remain accessible.

---

## 10. Integration points & platform constraints

| Integration | Availability | Notes |
|-------------|-------------|-------|
| Email invite delivery | Phase 1 | Requires a transactional email service (e.g. SES); invite template to be designed |
| Cognito user management | Phase 1 | Invite flow links to or creates a Cognito account; role stored in MyPal `members` table, not Cognito |
| Role change notifications | Phase 2 | Notify affected member by email when their role or HMG status changes |

---

## 11. Success metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Household completion | ≥ 60% of Family plan accounts have ≥ 2 active members within 7 days of signup | Active member count per account at day 7 |
| Invite acceptance rate | ≥ 70% of sent invites accepted within 7 days | `status = accepted` / `status = pending + accepted` |
| Role change activity | Track % of accounts with at least one role change in first 30 days | `role_changed` events in `access_log` |

---

## 12. Definition of done

- [ ] All P0 functional requirements implemented and tested
- [ ] Family Members nav item hidden for all roles except Owner and Admin (server-enforced)
- [ ] Save/Discard bar behaviour correct: appears on first change, clears on save or discard
- [ ] HMG auto-clear fires when role changes from Adult to any other role
- [ ] All role and HMG changes written to `access_log`
- [ ] Role change propagation tested: changed permissions active within 1 request of save
- [ ] Invite flow end-to-end tested (send → accept → active member)
- [ ] Remove member flow tested: access revoked immediately; 30-day retention window confirmed
- [ ] Mobile layout reviewed at 375px viewport
- [ ] WCAG 2.1 AA verified for dropdowns, checkboxes, and buttons
- [ ] Open questions below resolved or deferred with a decision recorded

---

## 13. Open questions

- [ ] **Invite expiry:** How many days before an invite expires? Can Owner/Admin resend? — 7 days
- [ ] **Invite for existing account:** If the email is already linked to a MyPal account, does the invite link the accounts or show an error? — Dip · Show an error
- [ ] **Remove member — task handling:** When a member is removed, what happens to tasks, reminders, and shared items assigned to them? (Unassigned? Returned to Family?) — Deffered, keep it open for next iteration
- [ ] **Role change confirmation dialog:** Should downgrading a significant role (e.g. Admin → Adult) require an explicit confirmation dialog listing what they will lose? `_specs/platform--access-control.md` section 8 recommends this — confirm whether it applies here or is handled in the Access tab — No explicit confirmation required, a message at the top/roaster should be fine.
- [x] **Remove action UI:** 🗑️ icon button at far right of each removable row; clicking opens a confirmation modal. Owner removes all except self; Admin removes all except Owner and self. — Resolved 2026-05-27
- [x] **Pending invite row design:** Name, email + role, sent date, status badge (Pending/Expired), Resend + Cancel buttons. Section hidden when no pending invites. — Resolved 2026-05-27

---

## 14. Revision history

| Version | Date | Author | Summary of changes |
|---------|------|--------|-------------------|
| 0.1 | 2026-05-27 | Cowork | Initial draft — member list, role dropdown, HMG checkbox, staged save/discard, invite, remove |
| 0.2 | 2026-05-27 | Cowork | Added F-13 (pending invite rows); added remove permission distinction (Owner vs Admin); updated section 4 access notes and section 9 UI/UX; closed open questions for remove action UI and pending invite row design |
| 0.3 | 2026-05-27 | Cowork | Removed members stay visible in roster with Removed badge and dimmed styling; card title shows active count + removed annotation; F-12 and section 9 updated accordingly |
