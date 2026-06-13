# Spec: Roles & Access Control

> Format: feature_spec_template.md (v3)  
> Template: [`.claude/commands/references/feature_spec_template.md`](../.claude/commands/references/feature_spec_template.md)  
> UI reference: `_UI/mypal-app.jsx` — `AccessTabContent`, `HMGConfirmDialog`, `NoteRecipientPicker`, `TIERS_AC`, `MOD_AC`

---

## 1. Overview

**Feature name:** Roles & Access Control  
**Module / nav location:** Cross-cutting — affects all modules  
**Author:** Dip  
**Status:** Draft  
**Last updated:** 2026-06-13 14:11 UTC (v0.20)

### Problem statement
A family app serving multiple household members needs clear, trust-appropriate access boundaries. Different members have different levels of maturity, responsibility, and privacy expectations. Without a well-designed role model, either everything is visible to everyone (a privacy problem) or everything is locked down (a usability problem). MyPal needs a model that defaults to openness within the family while giving individuals genuine control over sensitive personal data.

### User-facing goal
As a family member, I want my household data to be visible to the right people by default — with the ability to make anything private when I need to — so that MyPal feels both collaborative and trustworthy.

---

## 2. Scope

### In scope
- Six roles for Phase 1: Owner, Admin, Adult Member (18+), Grandparent (18+), Teenager (13 to under 18), Children (under 13)
- All six roles have independent login in Phase 1
- Two named groups:
  - **Household Managers Group (HMG):** Owner + Admin are always members; Owner/Admin can add trusted Adult Members or Grandparents
  - **Family group:** all household members automatically — cannot be manually modified; resolved at query time, no explicit DB rows
- Three visibility tiers on every item: Individual · HMG · Family (Self/Own removed — private items use `visible_to = individual` pointing at the creator)
- Two separate fields on every item: `assigned_to` (who is responsible for actioning it) and `visible_to` (who can see it) — these are no longer a single merged field
- Per-role constraints on what each role can set `assigned_to` and `visible_to` to
- Module-level access matrix defining what each role can see and do by default, with Owner/Admin overrides
- Finance access: no access for Adult Members and Grandparents unless explicitly granted by Owner/Admin; Teenagers and Children cannot be granted Finance access
- Health data: private by default for members 13+; Owner/Admin can view Children's health data; Teenager health is private even from HMG
- Journal: private by default (visible_to = individual:self) for all roles that have journal access; Teenager journal is private even from HMG
- Today / Briefing: personalised per user — each section has its own data source rule (see section 4.4)

### Out of scope (Phase 2+)
- Guest / Carer role (read-only, time-limited)
- Custody / cross-household sharing
- Granular per-field privacy (e.g. hide the amount on a bill but show the due date)
- Privacy audit log (who accessed what)
- Parental controls UI (manage Teenager / Children permissions from a dedicated screen)

### Dependencies
- Tasks module (assignment targets and visibility behaviour)
- Household Info module (visibility behaviour)
- Finance area (access grant applies to Overview, Budget Envelopes, Transactions, Bills & Subs sub-modules)

### Phasing

| Phase | What ships | When |
|-------|-----------|------|
| Phase 1 | Six roles (inc. Grandparent), HMG + Family groups, 3-tier visibility model (Individual/HMG/Family), separate `assigned_to` + `visible_to` fields, module access matrix, finance grant, health & journal privacy | Web launch |
| Phase 2 | Guest/Carer role, parental controls UI, cross-household, per-field privacy | Post-launch |

---

## 3. Users & personas

| Persona | Age | Description | Primary need |
|---------|-----|-------------|--------------|
| Owner | 18+ | Account creator; pays subscription | Full visibility and control; manage who has access to what |
| Admin | 18+ | Designated co-manager (e.g. partner/spouse) | Same operational control as Owner without billing responsibility |
| Adult Member | 18+ | Adult family member with full personal access | Access to shared family life; privacy over personal data; no finance access unless granted |
| Grandparent | 18+ | Extended family member — grandparent or trusted family elder with household access | Participate in family life and help manage household where needed; same personal privacy as Adult Member; can be added to HMG by Owner/Admin |
| Teenager | 13 to under 18 | Family member with age-appropriate access; can connect own inbox | Participate in shared family data; genuine privacy over health and journal even from HMG |
| Children | Under 13 | Family member with independent login; no privacy from Owner/Admin | Age-appropriate view of family life; all data visible to HMG |

---

## 4. Functional requirements

Priority key: **P0** = must have at launch · **P1** = should have · **P2** = nice to have

### Permission levels

Four levels apply consistently across all modules. Owner/Admin can override the default level for any member on any module (except where locked).

| Level | Meaning |
|---|---|
| **None** | Module not visible or accessible |
| **View** | Read-only — can see content, cannot create or edit |
| **Edit** | Read + write own items — can create, edit, and delete their own entries |
| **Manage** | Owner/Admin only — full access including others' items and module settings; cannot be granted to other roles |

Defaults are defined per role per module (see section 4.8). Owner/Admin can override any non-locked default via the Permissions screen (see section 4.9).

### 4.1 Role management

| # | Requirement | Priority | Acceptance criteria |
|---|-------------|----------|---------------------|
| R-01 | One Owner per account; cannot be removed or downgraded | P0 | No UI option to remove or change role of Owner; Owner field immutable |
| R-02 | Owner can designate up to one Admin from existing Adult Members | P0 | Owner sees "Make Admin" action on any Adult Member; only one Admin at a time |
| R-03 | Owner can add family members and assign role at invite time | P0 | Invite flow includes role selector: Adult Member, Grandparent, Teenager, Children |
| R-04 | Owner/Admin can change a member's role (except Owner role) | P1 | Role change takes effect immediately; member notified |
| R-05 | Owner/Admin can remove a member from the account | P0 | Member loses access; their private data is retained for 30 days then deleted; shared data remains |

### 4.2 Household Managers Group (HMG)

MyPal has two named groups: **HMG** and **Family**. Both are used as `assigned_to` and `visible_to` targets. HMG is manually managed; the Family group is automatic (see section 4.2b).

The Household Managers Group is a named group — distinct from individual roles — used as an assignment and visibility target across all content types (tasks, notes, reminders, etc.).

| # | Requirement | Priority | Acceptance criteria |
|---|-------------|----------|---------------------|
| G-01 | HMG is created automatically when the account is set up; Owner and Admin are default members | P0 | HMG exists from account creation; Owner always in HMG; Admin added to HMG on designation |
| G-02 | Only Owner or Admin can add a trusted Adult Member or Grandparent to the HMG | P0 | HMG management screen shows current members + option to add an eligible member; picker shows Adult Members and Grandparents only; only visible and actionable by Owner and Admin; confirmation required |
| G-03 | Only Owner or Admin can remove a non-Owner Adult Member from the HMG | P0 | Remove action available only to Owner and Admin; change takes effect immediately |
| G-04 | Owner cannot be removed from HMG | P0 | No remove action on Owner in HMG management UI |
| G-05 | Teenagers and Children cannot be added to HMG | P0 | HMG member picker shows only Adult Members and Grandparents; Teenager and Children roles are excluded |
| G-06 | If the Admin is removed from the household account, they are also removed from HMG | P0 | HMG membership cleared automatically on account removal |
| G-07 | Items with `assigned_to = hmg` or `visible_to = hmg` are accessible to all current HMG members | P0 | All active HMG members see HMG-targeted items; a member added to HMG later gains visibility of existing HMG-visible items |

### 4.2b Family group

The Family group is the second named group. Unlike HMG, it is not manually managed — all household members are automatically part of the Family group from the moment they join the account. It exists as a logical concept and a `visible_to` / `assigned_to` target; there are no explicit rows in the database for it.

| # | Requirement | Priority | Acceptance criteria |
|---|-------------|----------|---------------------|
| FG-01 | Every household member is automatically in the Family group | P0 | A member added to the account is immediately resolvable as a Family group member; no manual addition required |
| FG-02 | Family group membership cannot be removed manually | P0 | No UI option to remove a member from the Family group; membership ends only when the member is removed from the account entirely |
| FG-03 | Items with `visible_to = family` are visible to all current account members | P0 | Every member of the account passes the visibility gate when `visible_to = 'family'` |
| FG-04 | The Family group is virtual — no `group_members` rows are written | P0 | Queries resolve `visible_to = 'family'` as `account_id = :account_id`; no explicit group join required |

### 4.3 Assignment and visibility model

Every item carries three fields that together determine who created it, who is responsible for actioning it, and who can see it. Assignment and visibility are **separate and independently controlled**.

| Field | Column(s) | Purpose | Options |
|-------|-----------|---------|---------|
| **Created by** | `created_by_member_id` | Who created the record | Auto-set on write; immutable |
| **Assigned to** | `assigned_to` + `assigned_to_member_id?` | Who is responsible for actioning the item | `individual` · `hmg` · `family` |
| **Visible to** | `visible_to` + `visible_to_member_id?` | Who can see the item | `individual` · `hmg` · `family` |

The `_member_id` column is populated only when the field is set to `individual`; null otherwise.

**Default values on creation:**

| Module type | `assigned_to` default | `visible_to` default |
|---|---|---|
| All modules (standard) | `family` | `family` |
| Health | `individual` (creator) | `individual` (creator) |
| Journal | `individual` (creator) | `individual` (creator) |

**Visibility tiers:**

| Tier | Who passes the visibility gate |
|------|-------------------------------|
| **Individual** | The named member (`visible_to_member_id`) only. The creator always passes regardless. |
| **HMG** | All members where `is_hmg = true`. The creator always passes regardless. |
| **Family** | All members of the account (`account_id` match). |

**Core rules:**

1. `created_by` always passes the visibility gate — the creator can always see their own records regardless of `visible_to`.
2. `assigned_to` scope must not exceed `visible_to` scope. Scope order: `individual` < `hmg` < `family`. Assigning to a wider audience than can see the item is a validation error — rejected at API level.
3. Children's items: `visible_to` is forced to `hmg` at write time regardless of what is set (RC-04).
4. Teenager Health and Journal items: `visible_to` is forced to `individual` (creator) at write time — HMG cannot override (RC-10).

**Who can set each field, by role:**

| Role | Can set `assigned_to` to | Can set `visible_to` to |
|------|--------------------------|-------------------------|
| **Owner / Admin** | Individual (any member incl. Children) · HMG · Family | Individual · HMG · Family |
| **Adult Member** (non-HMG) | Individual (excl. Children) · HMG · Family | Individual · HMG · Family |
| **Grandparent** (non-HMG) | Individual (excl. Children) · HMG · Family | Individual · HMG · Family |
| **HMG-elevated Adult / Grandparent** | Individual (any member incl. Children) · HMG · Family | Individual · HMG · Family |
| **Teenager** | Individual (excl. Children) · HMG · Family | Individual · HMG · Family |
| **Children** | HMG only (hard-set; no picker shown) | HMG only (hard-set; cannot be lowered) |

| # | Requirement | Priority | Acceptance criteria |
|---|-------------|----------|---------------------|
| RC-01 | All items default to `assigned_to = family` and `visible_to = family` on creation, except Health and Journal which default both fields to `individual` (creator) | P0 | Newly created tasks and household items are visible to and assigned to all members by default; Health and Journal items are private to the creator by default |
| RC-02 | Creator can change `assigned_to` and `visible_to` independently at any time | P0 | Both fields have independent pickers; changes take effect immediately |
| RC-03 | `assigned_to` scope must not exceed `visible_to` scope; API rejects any combination where assigned scope is wider than visible scope | P0 | Attempting `assigned_to = family` with `visible_to = hmg` returns a 422; UI picker enforces this constraint before submit |
| RC-04 | Children's items have `visible_to` forced to `hmg` regardless of what is set | P0 | For records where `created_by_member_id` belongs to a Children-role member, `visible_to` is overwritten to `hmg` at write time; no UI picker shown for visibility on Children's items |
| RC-05 | Creator always sees their own items regardless of `visible_to` | P0 | Visibility query includes `OR created_by_member_id = :member_id`; creator is never locked out of their own records |
| RC-06 | When `visible_to = individual`, a named member must be specified | P0 | API rejects `visible_to = 'individual'` with a null `visible_to_member_id`; UI requires member selection before saving |
| RC-07 | When `assigned_to = individual`, a named member must be specified | P0 | API rejects `assigned_to = 'individual'` with a null `assigned_to_member_id` |
| RC-08 | Only HMG members (Owner, Admin, HMG-elevated Adults and Grandparents) can set `assigned_to_member_id` to a Children-role member | P0 | Individual member picker for `assigned_to` excludes Children profiles unless the current user is in HMG |
| RC-09 | Children can only set `assigned_to = hmg`; all other assignment options are unavailable | P0 | Children's item creation form shows no `assigned_to` picker — items are always directed to HMG; `assigned_to = 'hmg'` is hard-set on write |
| RC-10 | Teenager Health and Journal items have `visible_to` forced to `individual` (creator); neither the Teenager nor HMG can change this | P0 | On write, if `module IN ('health.*', 'journal')` and `created_by` is a Teenager-role member, `visible_to` is overwritten to `'individual'` and `visible_to_member_id` set to `created_by_member_id`; no visibility picker shown in UI for these items |

### 4.4 Today / Daily Briefing

Today / Briefing is personalised per user. Each section has its own data source rule — it is not a single "family vs personal" toggle. All roles with an independent login see the Today screen; content adapts by role.

| # | Requirement | Priority | Acceptance criteria |
|---|-------------|----------|---------------------|
| T-01 | Summary widgets (weather, travel time, next task, unread emails, top stories) are shown to all roles; content is personalised per user | P0 | Each user sees their own commute time, their own inbox count, their own news interests — not shared across members |
| T-02 | Today's priorities shows the user's own items + Family items + items individually assigned to them (excl. individual-private items created by others) | P0 | Items where `visible_to = individual` and `visible_to_member_id ≠ current member` are excluded; Children see only items assigned to them or Family items |
| T-03 | Top news is driven by each user's personal interest categories set during onboarding or preferences | P0 | Changing interests updates the feed immediately; Teenagers and Children see age-appropriate sources only; Children's interests can be set by Owner/Admin |
| T-04 | Inbox highlights shows messages from the user's own connected inbox(es) only — no cross-user inbox access | P0 | Owner/Admin cannot see another adult member's inbox highlights; Children's inbox is visible to Owner/Admin |
| T-05 | Teenagers can connect their own inbox (e.g. personal or school email account) | P0 | Teenager inbox highlights appear in their own Today view; not visible to Owner/Admin |
| T-06 | Upcoming tasks shows the user's own tasks + Family tasks + tasks individually assigned to them | P0 | Children see only tasks assigned to them or Family tasks |
| T-07 | On this day is account-wide — same content for all members in the household | P0 | All members with a login see household birthdays, anniversaries, and family milestones |
| T-08 | Items where `visible_to = individual` (creator only) appear in the creator's Today view with a lock icon | P1 | Creator can distinguish private items from shared ones at a glance |

### 4.5 Finance area access

Finance is a top-level area with six sub-modules: Overview, Budget Envelopes, Transactions, Bills & Subs, Finance Admin, and My Finance. Default permission levels by role are defined below. Owner/Admin can override defaults for individual members via the Permissions screen (section 4.9), subject to the locked rules below.

**Default permission levels:**

| Sub-module | Owner / Admin | Adult Member | Grandparent | Teenager | Children |
|---|---|---|---|---|---|
| Overview | Manage | View | View | View | None |
| Budget Envelopes | Manage | None | None | None | None |
| Transactions | Manage | Edit | Edit | Edit | None |
| Bills & Subs | Manage | Edit | Edit | View | None |
| Finance Admin | Manage | None | None | None | None |
| My Finance | Manage | Edit | Edit | None | None |

| # | Requirement | Priority | Acceptance criteria |
|---|-------------|----------|---------------------|
| F-01 | Finance is visible to Owner, Admin, Adult Members, and Teenagers by default; Children have no access | P0 | Finance nav item visible for all roles except Children; sub-module visibility adapts per defaults above |
| F-02 | Budget Envelopes defaults to None for Adult Members and Teenagers; Owner/Admin can grant View or Edit via the Permissions screen | P1 | Budget Envelopes hidden by default for non-HMG roles; becomes accessible immediately when a grant is applied |
| F-03 | Finance Admin sub-module is locked to Owner and Admin only — cannot be overridden via the Permissions screen | P0 | Finance Admin not shown to any other role regardless of permission overrides |
| F-04 | Children have no access to any Finance sub-module and this cannot be overridden | P0 | Finance area not shown in navigation for Children; no Finance options in the Permissions screen for Children |
| F-05 | My Finance is a personal sub-module showing the member's own financial picture; Teenagers and Children have no access | P0 | My Finance visible to Owner, Admin, and Adult Members only; hidden for Teenagers and Children |

### 4.6 Health data

Health follows the standard assignment and visibility model. Both `assigned_to` and `visible_to` default to `individual` (creator) on creation. Members can change these using the standard pickers — except Teenagers, whose health items are always `visible_to = individual:self` and cannot be changed (RC-10).

| # | Requirement | Priority | Acceptance criteria |
|---|-------------|----------|---------------------|
| H-01 | Health data defaults to `visible_to = individual` (creator) for all members | P0 | Health items are private to the creator on creation; `visible_to` picker available to change this to HMG or Family |
| H-02 | Children's health data is always visible to HMG — consistent with RC-04 | P0 | Owner/Admin can view and edit health records for any Child; `visible_to` is forced to `hmg` and no picker is shown |
| H-03 | `visible_to` on a Teenager's health items is forced to `individual` (creator) and cannot be changed by anyone, including HMG | P0 | Teenager controls their health data privacy; no parental or HMG override; consistent with Gillick competence |

### 4.7 Journal

Journal follows the standard assignment and visibility model. Both fields default to `individual` (creator) on creation. The author can change `visible_to` to HMG or Family using the standard picker — except Teenagers, whose journal items are always `visible_to = individual:self` and cannot be changed (RC-10). Journal data is stored in Postgres like all other content — no special encryption treatment.

| # | Requirement | Priority | Acceptance criteria |
|---|-------------|----------|---------------------|
| J-01 | Journal entries default to `visible_to = individual` (creator) for all roles | P0 | No journal entry is visible to any other member unless the author explicitly changes `visible_to` to HMG or Family |
| J-02 | Children do not have journal access in Phase 1 | P2 | Journal nav item not shown for Children role |

### 4.8 Module access summary

Default permission levels by role. All non-locked defaults can be overridden per member by Owner/Admin via the Permissions screen (section 4.9). **Locked** defaults cannot be changed regardless of overrides.

| Module / Area | Owner / Admin | Adult Member (18+) | Grandparent (18+) | Teenager (13–17) | Children (under 13) | Locked? |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| Today / Briefing | Manage | View | View | View | View (assigned + family only) | Yes |
| **Life Admin** | | | | | | |
| → Tasks | Manage | Edit | Edit | Edit | View (assigned only) | No |
| → Household Info | Manage | Edit | Edit | Edit | Edit | No |
| → Documents | Manage | Edit | Edit | Edit | View | No |
| → Cars & Home | Manage | Edit | Edit | View | None | No |
| → Pet Care | Manage | Edit | Edit | View | View | No |
| **Finance** | | | | | | |
| → Overview | Manage | View | View | View | None | No |
| → Budget Envelopes | Manage | None | None | None | None | No |
| → Transactions | Manage | Edit | Edit | Edit | None | No |
| → Bills & Subs | Manage | Edit | Edit | View | None | No |
| → Finance Admin | Manage | None | None | None | None | Yes |
| → My Finance | Manage | Edit | Edit | None | None | No |
| **Health** | | | | | | |
| → Medications | Manage | Edit | Edit | Edit | View | No |
| → Appointments | Manage | Edit | Edit | Edit | View | No |
| → Emergency Info | Manage | Edit | Edit | View | None | Yes |
| → Journal | Manage | Edit | Edit | Edit | None | No |
| **Recipes & Groceries** | | | | | | |
| → Library | Manage | Edit | Edit | Edit | View | No |
| → Meal Planner | Manage | Edit | Edit | Edit | View | No |
| → Grocery List | Manage | Edit | Edit | Edit | View | No |
| → Nutrition *(Phase 2)* | Manage | Edit | Edit | View | None | No |
| **Travel** *(Phase 2)* | | | | | | |
| → My Trips | Manage | Edit | Edit | Edit | View | No |
| → Packing Templates | Manage | Edit | Edit | Edit | View | No |
| → Travel Ready | Manage | Edit | Edit | View | None | No |

**Notes on locked rows:**
- Today / Briefing: content and visibility rules are hardcoded per role; individual overrides would break the personalisation model
- Finance Admin: always Owner/Admin only; no exceptions
- Emergency Info: sensitive enough to warrant locking at Owner/Admin level; no overrides permitted

**Notes on Health privacy:**
Health data follows the standard visibility model (default `visible_to = individual`). The permission levels above control whether a member can access the Health area at all — `visible_to` (Individual/HMG/Family) then controls item-level visibility within that access. See section 4.6 for Health-specific rules.

**Notes on area/module structure:**
- Hobbies & Interests is a preference under My Account → My Profile, not a permissionable module — no row needed
- My Account area (My Profile, Family Members, Preferences, Access, Security & Privacy) is Owner/Admin-managed infrastructure; it is not included in the per-member override matrix
- MyPal AI is no longer a standalone module; AI features are embedded inline per module and inherit the parent module's permission

### 4.9 Permissions management screen

Owner and Admin can override default permission levels for any household member on any non-locked module. Changes take effect immediately.

| # | Requirement | Priority | Acceptance criteria |
|---|-------------|----------|---------------------|
| PM-01 | Owner and Admin can access a Permissions screen for any household member | P0 | Settings → Family Members → [member] → Permissions shows a list of all modules with the current permission level for that member |
| PM-02 | For each non-locked module, Owner/Admin can set the permission level to None, View, or Edit | P0 | Dropdown or control per module row; Manage level is not selectable (Owner/Admin only by definition) |
| PM-03 | Locked modules are shown in the Permissions screen as read-only with a explanation of why they cannot be changed | P0 | Lock icon + tooltip on locked rows; no control rendered |
| PM-04 | The Permissions screen shows whether each level is the role default or a custom override | P1 | Visual distinction (e.g. "Default" badge) between unchanged defaults and explicit overrides |
| PM-05 | Owner/Admin can reset an individual module permission to its role default | P1 | "Reset to default" action per module row; restores the role-based default immediately |
| PM-06 | Permission changes are logged with actor, target member, module, before state, and after state | P0 | Every change recorded in access_log with full context |
| PM-07 | Children's Finance access cannot be enabled via the Permissions screen | P0 | Finance modules not shown in the Permissions screen for Children profiles |

### 4.10 Known edge cases and potential contradictions

The following scenarios arise from the interaction of roles, groups, and the two-field model. Each is flagged with a resolution rule or a decision needed before implementation.

---

**C-01 — `assigned_to` scope wider than `visible_to` scope**

Scenario: a task is created with `assigned_to = family` but `visible_to = hmg`. Family members are expected to action it but can't see it.

Resolution (RC-03): **This combination is invalid.** The API rejects it with a 422. The UI enforces the constraint by disabling `visible_to` options narrower than the current `assigned_to` value. Scope order enforced: `individual` < `hmg` < `family`.

---

**C-02 — Creator not in their own `visible_to` audience**

Scenario: Sarah creates a task and sets `visible_to = individual` (Tom). Can Sarah see her own task?

Resolution (RC-05): **Yes, always.** The visibility WHERE clause includes `OR created_by_member_id = :member_id`. The creator is never locked out of their own records, regardless of `visible_to`.

---

**C-03 — Grandparent in HMG sees all Children's data**

Scenario: A Grandparent is added to HMG. Children's items have `visible_to` forced to `hmg`. Therefore the Grandparent in HMG can see all Children's records.

Resolution: **This is the intended behaviour** — HMG membership grants access to Children's data; that is part of what HMG means. The HMG confirmation dialog (see section 9) must explicitly state this so Owner/Admin understand what they are granting when they add a Grandparent to HMG.

✅ **Decision confirmed:** Grandparents in HMG see Children's data in the same way as Owner/Admin — no additional restriction.  - Dip: yes

---

**C-04 — Grandparent in HMG cannot see Teenager's private Health/Journal**

Scenario: Grandparent is in HMG. A Teenager's health entry has `visible_to` forced to `individual` (creator). Does the Grandparent in HMG bypass this?

Resolution: **No.** RC-10 is a hard write-time override — it applies regardless of who is in HMG. Teenager Health and Journal items are always `visible_to = individual:self`. HMG membership does not grant access. Consistent with Gillick competence (see H-03).

---

**C-05 — Children's `assigned_to = family` conflicts with forced `visible_to = hmg`**

Scenario: If a Children item had `assigned_to = family`, the forced `visible_to = hmg` would mean Family members are "assigned" the item but can't see it — violating C-01.

Resolution: **Children can only set `assigned_to = hmg`** (RC-09). The combination `assigned_to = family` + `visible_to = hmg` never arises for Children because the `assigned_to` picker is hard-set to HMG. No validation conflict.

---

**C-06 — "Self/Own" tier removed — Health and Journal private default requires auto-population**

Scenario: Health and Journal items default to private. With `self` removed as a tier, private means `visible_to = individual` with `visible_to_member_id = created_by_member_id`. The API must auto-populate this on creation.

Resolution: **Handled at API write time.** For Health and Journal modules, if `visible_to` is not provided or is provided as `individual`, the API sets `visible_to_member_id = created_by_member_id`. No UI change needed for the default case. If the user changes `visible_to` to `hmg` or `family` later, `visible_to_member_id` is cleared.

⚠️ **Edge case:** If the member's account is later deleted, their `visible_to_member_id` points to a deleted member. The 30-day retention window covers active access; after deletion, those records become inaccessible to all (creator FK is gone). This is acceptable behaviour — confirm before implementing the deletion flow.

---

**C-07 — Grandparent default module permissions not explicitly defined**

The module access matrix (§4.8) proposes Grandparent defaults matching Adult Member. This is a design assumption, not a confirmed decision.

✅ **Decision confirmed:** Grandparent defaults in §4.8 match Adult Member across all modules — Finance defaults to None (grantable by Owner/Admin), Health defaults to Edit (own records, visibility controlled by `visible_to`). Dip: Same as adults

---

## 5. Functional requirements — acceptance criteria

### 5a. Requirements index

One row per requirement group. The Scenarios column names the Gherkin scenario(s) in §5b that prove it.

#### Role management (R-xx)

| # | Requirement | Priority | Scenarios |
|---|-------------|----------|-----------|
| R-01 | One Owner per account; cannot be removed or downgraded | P0 | `Owner role immutable` |
| R-02 | Owner can designate up to one Admin from existing Adult Members | P0 | `Owner designates Admin` |
| R-03 | Owner can add family members and assign role at invite time | P0 | `Owner adds family member with role` |
| R-04 | Owner/Admin can change a member's role (except Owner role) | P1 | `Admin changes member role` |
| R-05 | Owner/Admin can remove a member from the account | P0 | `Member removed from account` |

#### HMG management (G-xx)

| # | Requirement | Priority | Scenarios |
|---|-------------|----------|-----------|
| G-01 | HMG created automatically on account setup; Owner and Admin are default members | P0 | `HMG initialised on account setup`, `Owner always in HMG` |
| G-02 | Only Owner/Admin can add a trusted Adult Member or Grandparent to HMG | P0 | `Owner adds Adult Member to HMG`, `Owner adds Grandparent to HMG` |
| G-03 | Only Owner/Admin can remove a non-Owner Adult Member from HMG | P0 | `Owner removes HMG member` |
| G-04 | Owner cannot be removed from HMG | P0 | `Owner always in HMG` |
| G-05 | Teenagers and Children cannot be added to HMG | P0 | `Teenager excluded from HMG picker`, `Children excluded from HMG picker` |
| G-06 | If Admin is removed from the account, they are also removed from HMG | P0 | `Admin removed from account loses HMG membership` |
| G-07 | Items with `assigned_to = hmg` or `visible_to = hmg` are accessible to all current HMG members | P0 | `HMG-targeted item visible to HMG members`, `New HMG member sees existing HMG items` |

#### Family group (FG-xx)

| # | Requirement | Priority | Scenarios |
|---|-------------|----------|-----------|
| FG-01 | Every household member is automatically in the Family group | P0 | `Family group includes all members` |
| FG-02 | Family group membership cannot be removed manually | P0 | `Family group is immutable` |
| FG-03 | Items with `visible_to = family` are visible to all current account members | P0 | `Visibility gates by tier and role` |
| FG-04 | The Family group is virtual — no `group_members` rows written | P0 | `Family group resolved at query time` |

#### Assignment and visibility (RC-xx)

| # | Requirement | Priority | Scenarios |
|---|-------------|----------|-----------|
| RC-01 | All items default to `assigned_to = family` / `visible_to = family` except Health and Journal | P0 | `Default assigned_to and visible_to on creation` |
| RC-02 | Creator can change `assigned_to` and `visible_to` independently | P0 | `Creator changes visibility` |
| RC-03 | `assigned_to` scope must not exceed `visible_to` scope; API rejects invalid combinations | P0 | `API rejects assigned_to wider than visible_to`, `Valid assigned_to and visible_to combinations` |
| RC-04 | Children's items have `visible_to` forced to `hmg` at write time | P0 | `Children visible_to forced to hmg`, `Non-HMG cannot see Children item`, `HMG member can see Children item` |
| RC-05 | Creator always sees their own items regardless of `visible_to` | P0 | `Creator always sees own item` |
| RC-06 | When `visible_to = individual`, a named member must be specified | P0 | `API rejects individual without member ID` |
| RC-07 | When `assigned_to = individual`, a named member must be specified | P0 | `API rejects assigned_to individual without member ID` |
| RC-08 | Only HMG members can set `assigned_to_member_id` to a Children-role member | P0 | `Non-HMG cannot assign to Children` |
| RC-09 | Children can only set `assigned_to = hmg` | P0 | `Children assigned_to hard-set to hmg` |
| RC-10 | Teenager Health and Journal `visible_to` forced to `individual` (creator); HMG cannot override | P0 | `Teenager health visible_to forced to individual`, `HMG cannot see Teenager health`, `Owner cannot change Teenager health visibility` |

#### Today / Briefing (T-xx)

| # | Requirement | Priority | Scenarios |
|---|-------------|----------|-----------|
| T-01 | Summary widgets shown to all roles; content personalised per user | P0 | `Today content personalised per user` |
| T-02 | Today priorities shows user's own items + Family items + individually assigned items | P0 | `Individual-private items from others excluded from Today` |
| T-03 | Top news driven by each user's personal interest categories | P0 | `News respects user interest settings` |
| T-04 | Inbox highlights shows user's own connected inboxes only | P0 | `Owner cannot see Adult Member inbox` |
| T-05 | Teenagers can connect their own inbox | P0 | `Teenager inbox visible in their Today view only` |
| T-06 | Upcoming tasks shows user's own + Family + individually assigned tasks | P0 | `Today upcoming tasks visibility` |
| T-07 | On this day is account-wide for all members | P0 | `On this day same for all members` |
| T-08 | `visible_to = individual` items in creator's Today view show a lock icon | P1 | `Private items shown with lock icon` |

#### Finance (F-xx)

| # | Requirement | Priority | Scenarios |
|---|-------------|----------|-----------|
| F-01 | Finance visible to Owner, Admin, Adult Members, and Teenagers by default; Children have no access | P0 | `Children cannot access Finance` |
| F-02 | Budget Envelopes defaults to None for Adult Members and Teenagers | P1 | `Budget Envelopes hidden by default` |
| F-03 | Finance Admin locked to Owner/Admin only; cannot be overridden | P0 | `Non-Owner/Admin cannot access Finance Admin`, `Finance Admin locked in Permissions screen` |
| F-04 | Children have no Finance access and this cannot be overridden | P0 | `Children cannot access Finance`, `Finance hidden in Permissions screen for Children` |
| F-05 | My Finance is a personal sub-module; Teenagers and Children have no access | P0 | `Teenager cannot access My Finance` |

#### Health (H-xx)

| # | Requirement | Priority | Scenarios |
|---|-------------|----------|-----------|
| H-01 | Health data defaults to `visible_to = individual` (creator) for all members | P0 | `Health defaults to individual visibility` |
| H-02 | Children's health data always visible to HMG | P0 | `HMG member can see Children health record` |
| H-03 | Teenager health `visible_to` forced to `individual`; cannot be changed by anyone | P0 | `Teenager health visible_to forced to individual`, `Owner cannot change Teenager health visibility` |

#### Journal (J-xx)

| # | Requirement | Priority | Scenarios |
|---|-------------|----------|-----------|
| J-01 | Journal entries default to `visible_to = individual` (creator) for all roles | P0 | `Journal defaults to individual visibility` |
| J-02 | Children do not have journal access in Phase 1 | P2 | `Journal hidden for Children` |

#### Permissions management (PM-xx)

| # | Requirement | Priority | Scenarios |
|---|-------------|----------|-----------|
| PM-01 | Owner and Admin can access a Permissions screen for any household member | P0 | `Owner grants Adult Member Finance access` |
| PM-02 | For each non-locked module, Owner/Admin can set None, View, or Edit | P0 | `Owner sets module permission`, `Manage level not selectable` |
| PM-03 | Locked modules shown as read-only with explanation | P0 | `Finance Admin locked in Permissions screen` |
| PM-04 | Permissions screen shows whether each level is the role default or a custom override | P1 | `Permissions screen shows custom badge` |
| PM-05 | Owner/Admin can reset an individual module permission to its role default | P1 | `Owner resets permission to default` |
| PM-06 | Permission changes logged with actor, target, module, before, after | P0 | `Permission change recorded in access_log` |
| PM-07 | Children's Finance access cannot be enabled via the Permissions screen | P0 | `Finance hidden in Permissions screen for Children` |

---

### 5b. Gherkin acceptance criteria

```gherkin
# G-01: HMG initialisation
Feature: HMG group initialisation
  Scenario: HMG initialised on account setup
    Given a new MyPal account is created with Sarah as Owner
    Then an HMG group exists for the account
    And Sarah is a member of the HMG group

  Scenario: Owner always in HMG
    Given Sarah is the Owner and a member of HMG
    When an Admin attempts to remove Sarah from HMG
    Then the API returns 422
    And Sarah remains in the HMG group

# G-02 / G-05: HMG membership management
Feature: HMG membership management
  Scenario: Owner adds Adult Member to HMG
    Given Emma has the Adult Member role and is not in HMG
    When Sarah (Owner) adds Emma to HMG
    Then Emma's is_hmg is true
    And Emma can see items with visible_to "hmg"

  Scenario: Owner adds Grandparent to HMG
    Given a member has the Grandparent role and is not in HMG
    When Sarah (Owner) adds them to HMG
    Then their is_hmg is true

  Scenario: Teenager excluded from HMG picker
    Given Lily has the Teenager role
    When Sarah opens the HMG member picker
    Then Lily does not appear as an eligible option

  Scenario: Children excluded from HMG picker
    Given Max has the Children role
    When Sarah opens the HMG member picker
    Then Max does not appear as an eligible option

  Scenario: Admin removed from account loses HMG membership
    Given James (Admin) is in HMG by default
    When Sarah removes James from the household account
    Then James's HMG membership is cleared automatically
    And James cannot access HMG-targeted items

# G-07: HMG visibility
Feature: HMG-targeted item visibility
  Scenario: HMG-targeted item visible to HMG members
    Given an item with visible_to "hmg" exists
    And Emma (Adult Member) is in HMG
    When Emma requests the item list
    Then the item appears in Emma's response

  Scenario: New HMG member sees existing HMG items
    Given an item with visible_to "hmg" was created before Tom joined HMG
    When Sarah (Owner) adds Tom to HMG
    And Tom requests the item list
    Then the item appears in Tom's response

# RC-03: assigned_to scope constraint
Feature: assigned_to and visible_to scope consistency
  Scenario: API rejects assigned_to wider than visible_to
    Given Sarah is creating a task
    When she submits assigned_to "family" with visible_to "hmg"
    Then the API returns 422
    And no task is created

  Scenario Outline: Valid assigned_to and visible_to combinations
    Given Sarah creates a task with assigned_to "<at>" and visible_to "<vt>"
    Then the task is saved successfully

    Examples:
      | at         | vt         |
      | individual | individual |
      | individual | hmg        |
      | individual | family     |
      | hmg        | hmg        |
      | hmg        | family     |
      | family     | family     |

# RC-04: Children forced HMG visibility
Feature: Children item visibility
  Scenario: Children visible_to forced to hmg
    Given Max (Children) submits a task with visible_to "family"
    When the task is saved
    Then the task's visible_to is "hmg"

  Scenario: Non-HMG cannot see Children item
    Given Max (Children) created a task (visible_to is forced to hmg)
    And Tom (Adult Member, not in HMG) is authenticated
    When Tom requests the task list
    Then Max's task does not appear in the response

  Scenario: HMG member can see Children item
    Given Max (Children) created a task
    And Sarah (Owner, in HMG) is authenticated
    When Sarah requests the task list
    Then Max's task appears in the response

# RC-05: Creator always sees own items
Feature: Creator visibility
  Scenario: Creator always sees own item
    Given Sarah creates a note with visible_to "individual" targeting Tom
    When Sarah requests her notes
    Then the note appears in Sarah's response
    When Tom requests notes
    Then the note appears in Tom's response
    When Emma (not Tom, not Sarah) requests notes
    Then the note does not appear in Emma's response

# RC-10: Teenager health and journal privacy
Feature: Teenager health and journal privacy
  Scenario: Teenager health visible_to forced to individual
    Given Lily (Teenager) submits a health record with visible_to "family"
    When the record is saved
    Then the record's visible_to is "individual"
    And the record's visible_to_member_id is Lily's member ID

  Scenario: HMG cannot see Teenager health
    Given Lily (Teenager) has a health record
    And Sarah (Owner, in HMG) is authenticated
    When Sarah requests health records
    Then Lily's health record does not appear in the response

  Scenario: Owner cannot change Teenager health visibility
    Given Lily (Teenager) has a health record with visible_to "individual"
    When Sarah (Owner) attempts to PATCH the record's visible_to to "family"
    Then the API returns 422
    And the record's visible_to remains "individual"

  Scenario: Teenager journal visible_to forced to individual
    Given Lily (Teenager) creates a journal entry
    When the entry is saved
    Then the entry's visible_to is "individual"
    And Sarah (Owner) cannot see the entry via the API

# RC visibility matrix
Feature: Visibility tier access by role
  Scenario Outline: Visibility gates by tier and role
    Given an item created by Sarah with visible_to "<tier>" (visible_to_member_id = "<named>")
    When "<viewer>" requests the item
    Then the item is "<result>"

    Examples:
      | tier       | named | viewer                                | result      |
      | individual | Tom   | Tom                                   | visible     |
      | individual | Tom   | Sarah (creator)                       | visible     |
      | individual | Tom   | Emma (Adult Member, not named)        | not visible |
      | individual | Tom   | James (Admin, not named)              | not visible |
      | hmg        | —     | Sarah (Owner, HMG)                    | visible     |
      | hmg        | —     | Emma (Adult Member, in HMG)           | visible     |
      | hmg        | —     | Tom (Adult Member, not in HMG)        | not visible |
      | hmg        | —     | Lily (Teenager)                       | not visible |
      | hmg        | —     | Max (Children)                        | not visible |
      | family     | —     | Tom (Adult Member)                    | visible     |
      | family     | —     | Lily (Teenager)                       | visible     |
      | family     | —     | Max (Children)                        | visible     |

# F-03 / F-04: Finance Admin and Children
Feature: Finance Admin and Children access
  Scenario: Non-Owner/Admin cannot access Finance Admin
    Given Tom (Adult Member) is authenticated
    When Tom requests GET /api/v1/finance/admin
    Then the API returns 403

  Scenario: Finance Admin locked in Permissions screen
    Given Sarah opens the Permissions screen for Tom
    When she expands the Finance module group
    Then the Finance Admin row shows a lock icon
    And no permission control is rendered for Finance Admin

  Scenario: Children cannot access Finance
    Given Max (Children) is authenticated
    When Max requests GET /api/v1/finance/overview
    Then the API returns 403

  Scenario: Finance hidden in Permissions screen for Children
    Given Sarah opens the Permissions screen for Max (Children)
    When she views the Finance section
    Then no Finance modules appear in the Permissions screen

# PM-01 / PM-06: Permission overrides and audit log
Feature: Permissions management
  Scenario: Owner grants Adult Member Finance access
    Given Tom (Adult Member) has None permission for finance.budget_envelopes
    When Sarah (Owner) sets Tom's finance.budget_envelopes permission to View
    Then Tom can access GET /api/v1/finance/budget-envelopes
    And an access_log entry exists with actor Sarah, target Tom, module "finance.budget_envelopes", before "none", after "view"

  Scenario: Permission change recorded in access_log
    Given any module permission is changed by Owner or Admin
    Then an access_log entry is created with actor_id, target_id, module, before, after, and created_at

  Scenario: Manage level not selectable
    Given Sarah opens the Permissions screen for Tom
    When she attempts to POST /api/v1/permissions with permission "manage" for any module
    Then the API returns 422
    And no change is recorded
```

---

### 5.1 User stories

| # | As a… | I want to… | So that… |
|---|-------|-----------|---------|
| US-01 | Owner | manage which modules each family member can access | I can give the right people the right level of visibility without exposing sensitive data unnecessarily |
| US-02 | Admin | have the same operational access as the Owner | I can co-manage the household without asking the Owner for every change |
| US-03 | Adult Member | keep my personal Health and Journal data private by default | I have genuine privacy over sensitive information even within my own household |
| US-04 | Grandparent | be added to the Household Managers Group when the family trusts me | I can help manage household responsibilities without needing Owner-level access |
| US-05 | Teenager | have guaranteed privacy over my health and journal data, even from parents | I can record sensitive health information without worrying it will be read without my consent |
| US-06 | Children | send requests to household managers | I can ask for help or assign things to the adults in charge |
| US-07 | any member | trust that access rules are enforced on the server, not just in the UI | I know that hiding a UI element is not the only thing standing between me and data I should not see |

---

## 6. Non-functional requirements

| # | Requirement | Target |
|---|-------------|--------|
| NF-01 | Access checks must be enforced server-side | No module data returned by API unless the requesting user's role permits it — never rely solely on frontend hiding |
| NF-02 | Role change propagation | Access changes take effect within 1 request of the role change being saved — no stale sessions with old permissions |
| NF-04 | Performance | Permission checks add < 20ms to any API response |
| NF-05 | Auditability | Role changes (grants, revocations, member removal, HMG membership changes) logged with actor, timestamp, and before/after state |

> **Data storage principle:** All module data — including Health and Journal — is stored in Postgres using the same patterns as every other content type. No module receives special database treatment. Access control is enforced via RLS policies and the `assigned_to` / `visible_to` field model, not at the storage layer.

---

## 7. User flows

```gherkin
# Primary flow — Owner assigns task to a Child
Feature: Owner assigns task to a Child
  Scenario: Happy path — Owner assigns task to Child
    Given Sarah (Owner) is creating a new task
    When she opens the assigned_to picker and selects Individual
    Then Children profiles appear in the member list (Sarah is in HMG)
    When she selects Max (Children) and saves the task
    Then the task has assigned_to "individual" with assigned_to_member_id = Max
    And the task has visible_to "hmg" (forced by RC-04)
    And Max sees the task in their Tasks view (assigned items only)
    And Max cannot reassign or change visibility

  Scenario: Error path — Adult Member tries to assign task to Child
    Given Tom (Adult Member, not in HMG) is creating a task
    When he opens the assigned_to Individual picker
    Then Children profiles do not appear in the member list
    And Tom cannot assign the task to Max

# Flow — Teenager creates a private note
Feature: Teenager creates a private note
  Scenario: Happy path — Teenager changes note visibility to Individual
    Given Lily (Teenager) creates a new note with visible_to defaulting to "family"
    When she taps the visible_to control and selects "Individual" (herself)
    Then the note's visible_to is updated to "individual" with visible_to_member_id = Lily
    And the note no longer appears in any other member's list view
    And the note appears in Lily's Notes with a lock icon

  Scenario: Error path — Teenager accesses Finance via direct URL
    Given Lily (Teenager) is authenticated
    When Lily requests GET /api/v1/finance/overview
    Then the API returns 403
    And no Finance data is returned

# Flow — Child sends a request to HMG
Feature: Child sends request to HMG
  Scenario: Happy path — Child creates a task directed to HMG
    Given Max (Children) opens the task creation form
    Then the assigned_to field is hard-set to HMG (no picker shown)
    When Max saves the task
    Then the task has assigned_to "hmg" and visible_to "hmg"
    And all current HMG members see the task in their task list
    And an HMG member can action or reassign the task

# Flow — Owner adds Adult Member to HMG
Feature: Owner adds Adult Member to HMG
  Scenario: Happy path — Owner adds Adult Member to HMG
    Given Sarah navigates to My Account → Access → HMG card
    When she taps "Add member" and selects Emma (Adult Member)
    And confirms the HMG access dialog
    Then Emma's is_hmg is true
    And Emma immediately sees existing HMG-targeted items across all modules

  Scenario: Error path — Teenager excluded from HMG picker
    Given Sarah opens the HMG member picker
    Then Lily (Teenager) does not appear as an eligible option
    And no action can add Lily to HMG

# Flow — Owner grants Finance access to Adult Member
Feature: Owner grants Finance access to Adult Member
  Scenario: Happy path — Owner grants Finance View access
    Given Tom (Adult Member) has None permission on finance.budget_envelopes
    When Sarah navigates to My Account → Access → Permissions for Tom
    And sets Finance Budget Envelopes to View
    Then Tom's effective permission for Budget Envelopes is View
    And Tom can access the Finance Budget Envelopes page immediately
    And the change is recorded in access_log

  Scenario: Edge case — HMG member removed from household loses HMG access
    Given Emma (Adult Member) is in HMG
    When Sarah removes Emma from the household account
    Then Emma's is_hmg is false
    And Emma cannot access HMG-targeted items
    And the removal is recorded in access_log

  Scenario: Edge case — visible_to recipient changed removes previous recipient's access
    Given Sarah created a note with visible_to "individual" targeting Tom
    And Tom can currently see the note
    When Sarah changes visible_to_member_id to point at Emma instead
    Then Tom can no longer see the note
    And Emma can now see the note

  Scenario: Edge case — Admin removed from account loses HMG membership automatically
    Given James (Admin) is in HMG by default
    When Sarah removes James from the household account
    Then James's HMG membership is cleared
    And James's Admin role is removed
    And Sarah must designate a new Admin if desired
```

---

## 8. Data model

### `members` table additions

| Field | Description | Required? | Notes |
|-------|-------------|-----------|-------|
| `role` | Member's role in the household | Yes | Enum: `owner`, `admin`, `adult`, `grandparent`, `teenager`, `child` |

### `member_module_permissions` table

Stores only explicit overrides from the Permissions screen. If no row exists for a member + module combination, the role default applies. This keeps the table sparse and makes it easy to reset to defaults.

| Field | Description | Required? | Notes |
|-------|-------------|-----------|-------|
| `id` | Row identifier | Yes | |
| `member_id` | Reference to members | Yes | |
| `module` | Module identifier | Yes | e.g. `finance.budget_envelopes`, `life_admin.pet_care` |
| `permission` | Overridden permission level | Yes | Enum: `none`, `view`, `edit` |
| `set_by` | Member ID of Owner/Admin who set this | Yes | |
| `set_at` | Timestamp | Yes | UTC |

### `groups` table

Only the HMG group has rows here. The Family group is virtual and resolved at query time as `account_id = :account_id` — no rows needed.

| Field | Description | Required? | Notes |
|-------|-------------|-----------|-------|
| `id` | Group identifier | Yes | |
| `account_id` | The account this group belongs to | Yes | Replaces `household_id` — aligns with the account-scoped tenant model used everywhere else |
| `type` | Group type | Yes | Enum: `hmg`; extensible for future explicit groups |
| `created_at` | Timestamp | Yes | UTC |

### `group_members` table

| Field | Description | Required? | Notes |
|-------|-------------|-----------|-------|
| `group_id` | Reference to groups | Yes | |
| `member_id` | Reference to members | Yes | |
| `added_by` | Member ID who added this person | Yes | |
| `added_at` | Timestamp | Yes | UTC |

### Assignment and visibility columns on each item table

Assignment and visibility are stored directly on each item table — no separate join table. Every item type (tasks, notes, documents, journal entries) carries all five columns:

| Column | Type | Required? | Notes |
|--------|------|-----------|-------|
| `created_by_member_id` | `uuid` FK → members | Yes | Auto-set on insert; immutable |
| `assigned_to` | Enum: `individual`, `hmg`, `family` | Yes | Default `family`; Health and Journal default to `individual` |
| `assigned_to_member_id` | `uuid` FK → members | Conditional | Required when `assigned_to = 'individual'`; null otherwise |
| `visible_to` | Enum: `individual`, `hmg`, `family` | Yes | Default `family`; Health and Journal default to `individual` |
| `visible_to_member_id` | `uuid` FK → members | Conditional | Required when `visible_to = 'individual'`; null otherwise |

> **Self/Own removed:** The previous `self` tier is replaced by `visible_to = 'individual'` with `visible_to_member_id = created_by_member_id`. For Health and Journal, the API auto-populates this on creation. The creator always passes the visibility gate regardless of what `visible_to` is set to (see RC-05).
>
> **Principle:** A query for any item returns its full visibility and assignment context in the same row — no join required. The visibility WHERE clause is: `visible_to = 'family' OR (visible_to = 'hmg' AND :is_hmg) OR (visible_to = 'individual' AND visible_to_member_id = :member_id) OR created_by_member_id = :member_id`

### `access_log` (audit)

| Field | Description | Required? | Notes |
|-------|-------------|-----------|-------|
| `actor_id` | Member who made the change | Yes | |
| `action` | Type of change | Yes | Enum: `role_changed`, `finance_access_granted`, `member_removed`, `hmg_member_added`, `hmg_member_removed`, etc. |
| `target_id` | Member affected | Yes | |
| `before` | Previous state (JSON) | Yes | |
| `after` | New state (JSON) | Yes | |
| `created_at` | Timestamp | Yes | UTC |

---

## 9. UI / UX considerations

**Two separate pickers on every item:** `assigned_to` and `visible_to` are independent controls. They can be shown inline on the item card (compact pill form) or in an expanded item detail view. Recommended icons: person-check (Assigned to), eye (Visible to). For both pickers, three options are shown: Individual · HMG · Family. Selecting Individual advances to a member picker step.

**Assigned to picker:** Selects who is responsible for actioning the item. Member list for `individual` option: Owner/Admin and HMG members see all members including Children; Adult Members, Grandparents, and Teenagers see all members except Children. Children do not see this picker — their items are always assigned to HMG.

**Visible to picker:** Selects who can see the item. Same three options. When set to `individual`, opens a single-member picker. Rule enforced in UI: the visible_to scope must be ≥ assigned_to scope — if `assigned_to = family`, only `visible_to = family` is available; if `assigned_to = hmg`, `visible_to` can be `hmg` or `family`.

Children do not see either picker on items they create — both fields are hard-set to HMG. Teenager Health and Journal items show no `visible_to` picker — forced to individual:self.

**Access tab (My Account → Access):** The UI combines HMG management and per-member permissions into a single "Access" tab within the My Account screen — not two separate screens. The tab has two sections stacked vertically: (1) the HMG card at the top, and (2) the member permissions panel below it. This is a different IA than the earlier "Settings → Household Managers Group" and "Settings → Family Members → [member] → Permissions" model; the combined tab is the confirmed design.

**HMG card:** Compact card at the top of the Access tab. Shows current HMG members with name, role, and date added (Owner shows "Always in HMG", Admin shows "Default", added Adult Members show date). Add button visible only when eligible Adult Members exist; shows the count if more than one is eligible. Add/remove actions trigger a confirmation dialog before applying.

**HMG confirmation dialog:** Before adding, lists three things the member will gain: (1) see items assigned to HMG across every module; (2) HMG-level assignment rights — can direct items to Children; (3) see Children's items regardless of who they were assigned to. Before removing, lists three things they will lose. Requires explicit confirm button click.

**Member permissions panel:** Member chip strip lets Owner/Admin select any household member. For Owner/Admin the panel shows a read-only banner ("Every module is Manage by definition"). For all other roles, modules are displayed in five collapsible groups (Life Admin, Finance, Health, Recipes & Groceries, Travel) — all collapsed by default. Each group header shows a count of custom overrides. Expanding a group shows per-module rows with: module icon, name, a lock icon for locked rows, a "Custom" badge + "Reset" link when overridden, and either a read-only level badge (locked) or a None/View/Edit dropdown (unlocked). A "What do these mean?" toggle reveals a plain-English explanation of the four levels. Changes apply immediately. Finance group is hidden entirely when the selected member is a Child.

**Finance access indicator:** For Adult Members without Finance access, the Finance nav item should be visible but greyed with a tooltip "Ask your household admin for access" — not hidden entirely. Hiding creates confusion about whether Finance exists. Not yet designed in prototype; flagged as P1 in design brief.

**Role change / HMG removal confirmation:** Downgrading a role or removing someone from HMG requires an explicit confirmation step with a plain-English list of what they will lose access to.

**Note — recipient picker UI:** This component appears on every item type across all modules. A dedicated UI design (prototype/sketch) should be completed and agreed before implementation begins. Flag as design-before-build.

---

## 10. Integration points & platform constraints

| Integration | Availability | Notes |
|-------------|-------------|-------|
| Server-side permission checks | Web ✓ | All access control enforced at API layer; frontend is presentation only |
| Row-level security (RLS) | Web ✓ | Postgres RLS policies enforce visibility tiers at the database layer |
| Email notifications for role changes | Phase 2 | Notify affected member when their role or HMG membership changes |

---

## 11. Success metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Privacy adoption | ≥ 20% of active users set at least one item to `visible_to = individual` (private) within 30 days | `visible_to_changed` to `individual` events |
| HMG extension rate | Track ratio of households where a non-Owner/Admin Adult Member is added to HMG | `hmg_member_added` events per family account |
| Finance access grants | Track ratio of families where Owner grants Adult Member Finance access | `finance_access_granted` events per family account |
| Zero privilege escalation incidents | 0 cases of a member accessing data their role doesn't permit | Server-side 403 error rate on protected endpoints; security audit |
| Role setup completion | ≥ 70% of Family plan accounts have ≥ 2 members with roles assigned within 7 days of signup | Member count per account at day 7 |

---

## 12. Definition of done

- [ ] All P0 functional requirements implemented and §5b Gherkin scenarios passing (RSpec for API behaviour, Playwright for UI flows)
- [ ] `assigned_to` scope ≤ `visible_to` scope enforced at API level with 422 on violation (RC-03); UI enforces the same constraint before submit
- [ ] Children's `visible_to` forced to `hmg` at API write time — never frontend-only (RC-04)
- [ ] Teenager Health and Journal `visible_to` forced to `individual:self` at API write time; cannot be overridden by any actor including HMG (RC-10, H-03)
- [ ] Grandparent role added to all Pundit policies, role enum, and the module access matrix default resolver
- [ ] HMG and Family group visibility queries verified against Postgres RLS with `SET LOCAL app.member_id` active
- [ ] All locked modules (Finance Admin, Emergency Info, Today) return 403 for non-Owner/Admin regardless of any row in `member_module_permissions`
- [ ] `access_log` captures every role change, HMG membership change, and module permission override with actor, target, before, after, and UTC timestamp
- [ ] Permissions screen: locked rows show lock icon and tooltip; custom overrides show "Custom" badge + "Reset" link; Finance group hidden entirely for Children
- [ ] HMG confirmation dialog explicitly lists what the added member gains (including Children data visibility — C-03)
- [ ] C-01 through C-07 edge cases (§4.10) each resolved with a confirmed rule or formally deferred with a recorded decision
- [ ] WCAG 2.1 AA verified for the Access tab (HMG card, member permissions panel)
- [ ] Open questions in §13 resolved or deferred with a decision recorded

---

## 13. Open questions

- [x] **Child login:** Children can have their own login in Phase 1 if they have an email address; Owner/Admin sets them up on their behalf.
- [x] **Teenager age boundary:** Role assignment is always manual in Phase 1. Date of birth is not stored; no automatic role transitions.
- [x] **Owner succession:** Deferred to a later phase. No automatic succession in Phase 1; Owner must voluntarily transfer ownership before leaving. Full succession policy (soft-delete window, data export requirement, ownership transfer flow) to be addressed in a dedicated spec before Owner account deletion is implemented.
- [x] **Private items in search:** Yes — a user's own `visible_to = individual` (self) items surface in their personal search results. UI design and interaction deferred to the Search feature spec.
- [x] **Assignment notifications:** Not in Phase 1. Deferred to Phase 2 notifications work.
- [x] **Assignment and visibility picker UI:** Design updated to two separate pickers (`assigned_to` and `visible_to`). Each offers three tiers: Individual · HMG · Family. Selecting Individual opens a single-member picker step. Implemented in `_UI/mypal-app.jsx` — UI update required to reflect the two-field model (currently uses the merged `NoteRecipientPicker`). Flag as design-before-build for the updated two-picker component.
- [x] **HMG Adult Member targeting Children:** Confirmed — HMG Adult Members can target Children as recipients (same as Owner/Admin). The UI's `eligibleIndividualTargetsAC` function must check `inHMG === true` in addition to `role === "Owner"` or `role === "Admin"`. Flag as a pre-build fix before the recipient picker is implemented in production.
- [x] **HMG visibility in UI:** HMG membership is internal — non-HMG members are not shown who is in the group.

---

## 14. Terminology

All product terminology — roles, areas, modules, the `visible_to` model, HMG, permission levels, and writing conventions — is defined in [`_specs/terminology.md`](terminology.md). That file is the single source of truth. Do not redefine terms here.

**Implementation term specific to this spec:**

| Term | Definition |
|------|------------|
| **Finance access grant** | An explicit Owner/Admin action that overrides the default `None` permission for an Adult Member on one or more Finance modules (typically Budget Envelopes). Recorded in `member_module_permissions` and in `access_log` with action `finance_access_granted`. |

---

## 15. Revision history

| Version | Date | Author | Summary of changes |
|---------|------|--------|-------------------|
| 0.1 | 2026-05-18 | Dip | Initial draft based on product design decisions |
| 0.2 | 2026-05-18 | Dip | Added terminology section; linked to canonical terminology.md |
| 0.3 | 2026-05-20 | Dip | Renamed Young Person → Teenager, Child → Children; Children given independent login Phase 1; Teenagers can connect own inbox; Children have no privacy from Owner/Admin; Today/Briefing rules expanded to per-section model |
| 0.4 | 2026-05-22 | Dip | Added Household Managers Group (HMG) concept and group management requirements; replaced 3-tier visibility (family/private/shared) with 4-tier model (Self/HMG/Family/Individual); added per-role assignment rules matrix; updated data model with groups and group_members tables; updated user flows, UI considerations, and terminology |
| 0.5 | 2026-05-22 | Dip | Removed Reminders module (absorbed into Tasks); renamed To Dos → Tasks; moved Finance to top-level area with sub-modules (Overview, Budget Envelopes, Transactions, Bills & Subs, Admin); Finance Admin sub-module restricted to Owner/Admin only (not grantable); updated module access summary to reflect area/module hierarchy |
| 0.6 | 2026-05-22 | Dip | Updated Finance access: Teenagers get default view access to Overview and Transactions; Adult Members get default view access to Overview, Transactions, and Bills & Subs; Budget Envelopes remains grantable for Adult Members; Finance Admin remains Owner/Admin only |
| 0.7 | 2026-05-22 | Dip | Introduced four-level permission model (None/View/Edit/Manage); added Permissions management screen (section 4.10) allowing Owner/Admin to override defaults per member per module; standardised module access summary to use consistent permission levels across all areas; updated Transactions and Bills & Subs defaults to Edit for Adult Members; updated Transactions to Edit for Teenagers; removed finance_access field from members table (superseded by member_module_permissions); added member_module_permissions table to data model |
| 0.8 | 2026-05-22 | Dip | Corrected Finance defaults: Bills & Subs for Teenagers set to View (not Edit) |
| 0.9 | 2026-05-22 | Dip | Merged visibility and assignment into a single recipient model — "who is this for?" covers both; replaced sections 4.3 (visibility) and 4.4 (assignment) with merged section 4.3 (recipient model); renamed requirements V-xx and A-xx to RC-xx; renamed item_visibility to item_recipient in data model; renumbered sections 4.5–4.10 to 4.4–4.9; updated UI/UX picker description and terminology |
| 0.10 | 2026-05-22 | Dip | Health and Journal now follow the standard recipient model (default Self, changeable to HMG/Family/Individual); removed special-case sharing requirements — covered by recipient picker; simplified Health to 3 requirements; simplified Journal to 3 requirements; added encryption note to Journal regardless of recipient tier |
| 0.11 | 2026-05-22 | Dip | Removed all special database treatment for Journal and Health — all module data stored in Postgres using the same patterns; removed J-02 per-user encryption requirement, NF-02 journal encryption NFR, journal encryption integration point, and intro note in section 4.7; added data storage principle note in section 5 |
| 0.12 | 2026-05-23 08:20 | Dip | UI review against `_UI/mypal-app.jsx`: renamed "Notes" → "Household Info" in section 4.8 and Dependencies; fixed Bills & Subs Teenager default in section 4.8 (Edit → View, aligning with section 4.5 which was corrected in v0.8); updated section 8 UI/UX to reflect combined Access tab design (HMG management + permissions in one tab, groups collapsed by default, confirmed IA); added open question for HMG Adult Member targeting Children gap in UI logic; added UI reference to spec header |
| 0.13 | 2026-05-23 08:24 | Dip | Resolved open questions: Owner succession deferred to a later spec; assignment picker UI finalised (two-step inline dropdown as per NoteRecipientPicker in prototype); HMG Adult Member targeting Children confirmed — decision is they should have access, UI bug to fix before build |
| 0.14 | 2026-05-24 | Cowork | Structural update following area/module reorganisation: rewrote section 4.8 access matrix (removed Wellbeing and Lifestyle area groups; added Health, Recipes & Groceries, and Travel as top-level area groups; added Pet Care to Life Admin; added My Finance to Finance; removed MyPal AI standalone row; noted Hobbies dissolves into My Account preferences); added My Finance to section 4.5 Finance defaults table and added F-05 requirement; updated section 8 groups list from 4 to 5 groups; fixed module identifier example in section 7 (lifestyle.pet_care → life_admin.pet_care); updated section 8 groups list; closed HMG Adult Member targeting open question with implementation note |
| 0.15 | 2026-05-24 | Cowork | Data model: replaced `item_recipient` pseudo-table with `visible_to` and `visible_to_members` columns on each item table directly (no join required); section 8: renamed "Recipient picker" → "Visibility picker" and added `visible_to`/`visible_to_members` field references; section 12: trimmed to a pointer to terminology.md + one spec-local implementation term (Finance access grant); all role, visibility, and HMG definitions now live in terminology.md only |
| 0.16 | 2026-05-29 | Cowork | Section 4.8: merged Preventive Care row into Appointments (Health area now 6 modules, not 7); Appointments access unchanged (Manage/Edit/Edit/View); removed Preventive Care row |
| 0.17 | 2026-05-30 | Cowork | Section 4.8: removed Health Overview row — Overview is no longer a standalone module tab; it is now a persistent collapsible header panel above the Health tab strip (Health area now 5 modules: Profiles · Medications · Appointments · Emergency Info · Journal) |
| 0.18 | 2026-06-13 | Cowork | Added Grandparent as sixth role; formalised two groups (HMG manually managed, Family virtual/auto); split single recipient field into separate `assigned_to` + `visible_to` fields with three tiers each (Individual/HMG/Family — Self/Own removed); updated §4.2 (G-02, G-05), added §4.2b Family group (FG-01–FG-04), rewrote §4.3 with new field model and RC-01–RC-10, added Grandparent column to §4.8 module matrix and §4.5 Finance defaults, updated §7 data model (role enum, groups table `household_id` → `account_id`, replaced `visible_to` columns with five-column model), updated §8 UI/UX (two pickers), added §4.10 with seven contradictions/edge cases (C-01–C-07) |
| 0.20 | 2026-06-13 14:11 UTC | Dip | Closed C-03 (Grandparent in HMG sees Children's data — confirmed same as Owner/Admin) and C-07 (Grandparent module defaults confirmed to match Adult Member across all modules) |
| 0.19 | 2026-06-13 14:11 UTC | Cowork | Template v2 → v3 upgrade: added §5 (§5a requirements index with Scenarios column for all R/G/FG/RC/T/F/H/J/PM requirement groups, §5b Gherkin acceptance criteria for all key requirements including RC-03/RC-04/RC-05/RC-10 and visibility matrix Scenario Outline, §5.1 User Stories US-01–US-07); rewrote §7 user flows in Gherkin (5 happy paths + 4 error/edge scenarios); added §12 DoD (14 acceptance checkboxes); renumbered §5→§6 through §13→§15; format header updated to v3 |
