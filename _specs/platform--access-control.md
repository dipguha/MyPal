# Spec: Roles & Access Control

> Format: feature_spec_template.md (v2)  
> Template: [`.claude/commands/references/feature_spec_template.md`](../.claude/commands/references/feature_spec_template.md)  
> UI reference: `_UI/mypal-app.jsx` — `AccessTabContent`, `HMGConfirmDialog`, `NoteRecipientPicker`, `TIERS_AC`, `MOD_AC`

---

## 1. Overview

**Feature name:** Roles & Access Control  
**Module / nav location:** Cross-cutting — affects all modules  
**Author:** Dip  
**Status:** Draft  
**Last updated:** 2026-05-24 (v0.15)

### Problem statement
A family app serving multiple household members needs clear, trust-appropriate access boundaries. Different members have different levels of maturity, responsibility, and privacy expectations. Without a well-designed role model, either everything is visible to everyone (a privacy problem) or everything is locked down (a usability problem). MyPal needs a model that defaults to openness within the family while giving individuals genuine control over sensitive personal data.

### User-facing goal
As a family member, I want my household data to be visible to the right people by default — with the ability to make anything private when I need to — so that MyPal feels both collaborative and trustworthy.

---

## 2. Scope

### In scope
- Five roles for Phase 1: Owner, Admin, Adult Member (18+), Teenager (13 to under 18), Children (under 13)
- All five roles have independent login in Phase 1
- Household Managers Group (HMG): a named group defaulting to Owner + Admin, extensible to trusted Adult Members
- Four visibility tiers: Self · HMG · Family/All · Individual
- Per-role assignment rules: who each role can assign items to
- Module-level access matrix defining what each role can see and do
- Finance access: no access for Adult Members unless explicitly granted by Owner/Admin; Teenagers and Children cannot be granted access
- Health data: private by default for members 13+; Owner/Admin can view Children's health data
- Journal: strictly private by default for all roles that have journal access; can be shared with named individuals
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
| Phase 1 | Five roles, HMG group, 4-tier visibility model, assignment rules, module access matrix, finance grant, health & journal privacy | Web launch |
| Phase 2 | Guest/Carer role, parental controls UI, cross-household, per-field privacy | Post-launch |

---

## 3. Users & personas

| Persona | Age | Description | Primary need |
|---------|-----|-------------|--------------|
| Owner | 18+ | Account creator; pays subscription | Full visibility and control; manage who has access to what |
| Admin | 18+ | Designated co-manager (e.g. partner/spouse) | Same operational control as Owner without billing responsibility |
| Adult Member | 18+ | Adult family member with full personal access | Access to shared family life; privacy over personal data; no finance access unless granted |
| Teenager | 13 to under 18 | Family member with age-appropriate access; can connect own inbox | Participate in shared family data; genuine privacy over health and journal even from parents |
| Children | Under 13 | Family member with independent login; no privacy from Owner/Admin | Age-appropriate view of family life; all data visible to parents |

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
| R-03 | Owner can add family members and assign role at invite time | P0 | Invite flow includes role selector: Adult Member, Teenager, Children |
| R-04 | Owner/Admin can change a member's role (except Owner role) | P1 | Role change takes effect immediately; member notified |
| R-05 | Owner/Admin can remove a member from the account | P0 | Member loses access; their private data is retained for 30 days then deleted; shared data remains |

### 4.2 Household Managers Group (HMG)

The Household Managers Group is a named group — distinct from individual roles — used as an assignment and visibility target across all content types (tasks, notes, reminders, etc.).

| # | Requirement | Priority | Acceptance criteria |
|---|-------------|----------|---------------------|
| G-01 | HMG is created automatically when the account is set up; Owner and Admin are default members | P0 | HMG exists from account creation; Owner always in HMG; Admin added to HMG on designation |
| G-02 | Only Owner or Admin can add a trusted Adult Member to the HMG | P0 | HMG management screen shows current members + option to add an Adult Member; only visible and actionable by Owner and Admin; confirmation required |
| G-03 | Only Owner or Admin can remove a non-Owner Adult Member from the HMG | P0 | Remove action available only to Owner and Admin; change takes effect immediately |
| G-04 | Owner cannot be removed from HMG | P0 | No remove action on Owner in HMG management UI |
| G-05 | Teenagers and Children cannot be added to HMG | P0 | HMG member picker excludes Teenager and Children roles |
| G-06 | If the Admin is removed from the household account, they are also removed from HMG | P0 | HMG membership cleared automatically on account removal |
| G-07 | Items assigned to HMG are visible to all current HMG members | P0 | All active HMG members see HMG-targeted items; a member added to HMG later gains visibility of existing HMG items |

### 4.3 Recipient model

Every item (task, note, document, journal entry) has a single recipient setting that controls both who can see it and who it is for. These are not separate — the person or group an item is directed to is the same as who can see it. Four tiers apply consistently across all content types.

| Tier | Who this item is for |
|------|---------------------|
| **Self** | Creator only. Exception: items created by Children are always visible to HMG regardless of this setting. |
| **HMG** | All current Household Managers Group members |
| **Family/All** | All household members including Children — shared, anyone can action it |
| **Individual** | One or more specific named members — they see it and action it |

**Who can use each tier, by role:**

| Role | Can set recipient to |
|------|---------------------|
| **HMG member** | Self · HMG · Family/All · any named individual (including Children) |
| **Adult Member** (non-HMG) | Self · HMG · Family/All · any named individual *except Children* |
| **Teenager** | Self · HMG · Family/All · any named individual *except Children* |
| **Child** | HMG only — Self, Family/All, and individual targeting are not available |

**Core principles:**

- Visibility and responsibility are the same — there is no separate assignee field
- Self is genuinely private for all non-Child profiles — even HMG cannot see another adult's or teen's Self items
- Children have no privacy from HMG — their items are always visible to HMG regardless of the recipient setting
- Creator always sees their own items regardless of recipient changes
- Only HMG members can target Children as recipients; no other role can direct items to a Child
- Children can only target HMG — they make requests upward, they do not delegate

**Default recipient tier for newly created items:** Family/All (exceptions: Health and Journal default to Self)

| # | Requirement | Priority | Acceptance criteria |
|---|-------------|----------|---------------------|
| RC-01 | All items default to Family/All on creation, except Health and Journal which default to Self | P0 | Newly created tasks and notes are visible to all household members by default |
| RC-02 | Creator can change the recipient tier at any time | P0 | Recipient picker available on all item types; change takes effect immediately |
| RC-03 | Owner, Admin, Adult Member, and Teenager can set items to Self | P0 | Self items are visible only to the creator; inaccessible to all other members including Owner/Admin |
| RC-04 | Children's items are always visible to HMG regardless of the recipient setting | P0 | No effective privacy for Children; HMG always sees their items |
| RC-05 | When recipient = Individual, creator must name at least one person | P0 | Recipient picker requires ≥1 named member when Individual is selected; empty list not valid |
| RC-06 | When recipient is changed to Self, any existing named individuals are cleared | P0 | Switching to Self immediately removes all named recipients; prior recipients lose access |
| RC-07 | HMG members can set recipient to any household member including Children | P0 | Recipient picker for HMG members includes all roles |
| RC-08 | Adult Members and Teenagers can set recipient to any individual except Children | P0 | Recipient picker for these roles excludes Children profiles |
| RC-09 | Children can only set recipient to HMG | P0 | Recipient picker for Children shows the HMG option only; Self, Family/All, and individual members are not available |
| RC-10 | Creator always sees their own items regardless of recipient changes | P0 | Creator's items always appear in their own view even if not in the named recipient group |

### 4.4 Today / Daily Briefing

Today / Briefing is personalised per user. Each section has its own data source rule — it is not a single "family vs personal" toggle. All roles with an independent login see the Today screen; content adapts by role.

| # | Requirement | Priority | Acceptance criteria |
|---|-------------|----------|---------------------|
| T-01 | Summary widgets (weather, travel time, next task, unread emails, top stories) are shown to all roles; content is personalised per user | P0 | Each user sees their own commute time, their own inbox count, their own news interests — not shared across members |
| T-02 | Today's priorities shows the user's own items + Family/All items + items individually assigned to them (excl. Self items created by others) | P0 | Self items created by others are excluded; Children see only items assigned to them or Family/All items |
| T-03 | Top news is driven by each user's personal interest categories set during onboarding or preferences | P0 | Changing interests updates the feed immediately; Teenagers and Children see age-appropriate sources only; Children's interests can be set by Owner/Admin |
| T-04 | Inbox highlights shows messages from the user's own connected inbox(es) only — no cross-user inbox access | P0 | Owner/Admin cannot see another adult member's inbox highlights; Children's inbox is visible to Owner/Admin |
| T-05 | Teenagers can connect their own inbox (e.g. personal or school email account) | P0 | Teenager inbox highlights appear in their own Today view; not visible to Owner/Admin |
| T-06 | Upcoming tasks shows the user's own tasks + Family/All tasks + tasks individually assigned to them | P0 | Children see only tasks assigned to them or Family/All tasks |
| T-07 | On this day is account-wide — same content for all members in the household | P0 | All members with a login see household birthdays, anniversaries, and family milestones |
| T-08 | Items marked Self appear in the creator's Today view with a lock icon | P1 | Creator can distinguish Self items from shared ones at a glance |

### 4.5 Finance area access

Finance is a top-level area with six sub-modules: Overview, Budget Envelopes, Transactions, Bills & Subs, Finance Admin, and My Finance. Default permission levels by role are defined below. Owner/Admin can override defaults for individual members via the Permissions screen (section 4.9), subject to the locked rules below.

**Default permission levels:**

| Sub-module | Owner / Admin | Adult Member | Teenager | Children |
|---|---|---|---|---|
| Overview | Manage | View | View | None |
| Budget Envelopes | Manage | None | None | None |
| Transactions | Manage | Edit | Edit | None |
| Bills & Subs | Manage | Edit | View | None |
| Finance Admin | Manage | None | None | None |
| My Finance | Manage | Edit | None | None |

| # | Requirement | Priority | Acceptance criteria |
|---|-------------|----------|---------------------|
| F-01 | Finance is visible to Owner, Admin, Adult Members, and Teenagers by default; Children have no access | P0 | Finance nav item visible for all roles except Children; sub-module visibility adapts per defaults above |
| F-02 | Budget Envelopes defaults to None for Adult Members and Teenagers; Owner/Admin can grant View or Edit via the Permissions screen | P1 | Budget Envelopes hidden by default for non-HMG roles; becomes accessible immediately when a grant is applied |
| F-03 | Finance Admin sub-module is locked to Owner and Admin only — cannot be overridden via the Permissions screen | P0 | Finance Admin not shown to any other role regardless of permission overrides |
| F-04 | Children have no access to any Finance sub-module and this cannot be overridden | P0 | Finance area not shown in navigation for Children; no Finance options in the Permissions screen for Children |
| F-05 | My Finance is a personal sub-module showing the member's own financial picture; Teenagers and Children have no access | P0 | My Finance visible to Owner, Admin, and Adult Members only; hidden for Teenagers and Children |

### 4.6 Health data

Health follows the standard recipient model. The default tier is Self, but a member can change it to HMG, Family/All, or Individual using the same recipient picker as any other item. No special sharing mechanism is needed.

| # | Requirement | Priority | Acceptance criteria |
|---|-------------|----------|---------------------|
| H-01 | Health data defaults to Self for Adult Members and Teenagers | P0 | Health items are visible only to the creator on creation; recipient picker available to change this to HMG, Family/All, or Individual |
| H-02 | Children's health data is always visible to HMG — consistent with the Children recipient rule | P0 | Owner/Admin can view and edit health records for any Child; no recipient picker available on Children's health items |
| H-03 | Owner/Admin cannot override the recipient setting on a Teenager's health items | P0 | Teenager controls their own health data recipient setting; no parental override; consistent with Gillick competence |

### 4.7 Journal

Journal follows the standard recipient model. The default tier is Self. The author can change it to HMG, Family/All, or Individual using the same recipient picker. Journal data is stored in the database like all other content — no special encryption treatment.

| # | Requirement | Priority | Acceptance criteria |
|---|-------------|----------|---------------------|
| J-01 | Journal entries default to Self for all roles | P0 | No journal entry is visible to any other member unless the author explicitly changes the recipient tier |
| J-02 | Children do not have journal access in Phase 1 | P2 | Journal nav item not shown for Children role |

### 4.8 Module access summary

Default permission levels by role. All non-locked defaults can be overridden per member by Owner/Admin via the Permissions screen (section 4.9). **Locked** defaults cannot be changed regardless of overrides.

| Module / Area | Owner / Admin | Adult Member (18+) | Teenager (13–17) | Children (under 13) | Locked? |
|---|:---:|:---:|:---:|:---:|:---:|
| Today / Briefing | Manage | View | View | View (assigned + family only) | Yes |
| **Life Admin** | | | | | |
| → Tasks | Manage | Edit | Edit | View (assigned only) | No |
| → Household Info | Manage | Edit | Edit | Edit | No |
| → Documents | Manage | Edit | Edit | View | No |
| → Cars & Home | Manage | Edit | View | None | No |
| → Pet Care | Manage | Edit | View | View | No |
| **Finance** | | | | | |
| → Overview | Manage | View | View | None | No |
| → Budget Envelopes | Manage | None | None | None | No |
| → Transactions | Manage | Edit | Edit | None | No |
| → Bills & Subs | Manage | Edit | View | None | No |
| → Finance Admin | Manage | None | None | None | Yes |
| → My Finance | Manage | Edit | None | None | No |
| **Health** | | | | | |
| → Medications | Manage | Edit | Edit | View | No |
| → Appointments | Manage | Edit | Edit | View | No |
| → Emergency Info | Manage | Edit | View | None | Yes |
| → Journal | Manage | Edit | Edit | None | No |
| **Recipes & Groceries** | | | | | |
| → Library | Manage | Edit | Edit | View | No |
| → Meal Planner | Manage | Edit | Edit | View | No |
| → Grocery List | Manage | Edit | Edit | View | No |
| → Nutrition *(Phase 2)* | Manage | Edit | View | None | No |
| **Travel** *(Phase 2)* | | | | | |
| → My Trips | Manage | Edit | Edit | View | No |
| → Packing Templates | Manage | Edit | Edit | View | No |
| → Travel Ready | Manage | Edit | View | None | No |

**Notes on locked rows:**
- Today / Briefing: content and visibility rules are hardcoded per role; individual overrides would break the personalisation model
- Finance Admin: always Owner/Admin only; no exceptions
- Emergency Info: sensitive enough to warrant locking at Owner/Admin level; no overrides permitted

**Notes on Health privacy:**
Health data follows the standard recipient model (default Self). The permission levels above control whether a member can access the Health area at all — recipient tier (Self/HMG/Family/Individual) then controls item-level visibility within that access. See section 4.6 for Health-specific rules.

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

---

## 5. Non-functional requirements

| # | Requirement | Target |
|---|-------------|--------|
| NF-01 | Access checks must be enforced server-side | No module data returned by API unless the requesting user's role permits it — never rely solely on frontend hiding |
| NF-02 | Role change propagation | Access changes take effect within 1 request of the role change being saved — no stale sessions with old permissions |
| NF-04 | Performance | Permission checks add < 20ms to any API response |
| NF-05 | Auditability | Role changes (grants, revocations, member removal, HMG membership changes) logged with actor, timestamp, and before/after state |

> **Data storage principle:** All module data — including Health and Journal — is stored in Postgres using the same patterns as every other content type. No module receives special database treatment. Access control is enforced via RLS policies and the recipient model, not at the storage layer.

---

## 6. User flows

### Happy path — Owner assigns a task to a Child
1. Owner creates a new task and opens the assignment picker
2. Picker shows all household members including Children
3. Owner selects a Child profile → task is assigned; visibility automatically includes the Child
4. Child sees the task in their Tasks view (Assigned only)
5. Child cannot reassign or change visibility

### Happy path — Teenager creates a private note
1. Teenager creates a new note; default visibility is Family/All
2. Teenager taps the visibility control and selects "Self"
3. Note immediately disappears from all other members' views, including Owner/Admin
4. Note appears in Teenager's Notes with a lock icon

### Happy path — Child sends a request to HMG
1. Child creates a new task or note
2. Assignment picker shows only: Admin, Owner, HMG
3. Child selects HMG → all current HMG members see the item
4. An HMG member can act on or reassign the item

### Happy path — Owner adds an Adult Member to HMG
1. Owner navigates to Settings → Household Managers Group
2. Current members listed (e.g. Owner, Admin)
3. Owner taps "Add member" → picker shows eligible Adult Members only
4. Owner selects a member → confirmation dialog explains what HMG access means
5. Adult Member is added; they immediately gain HMG-level visibility and assignment rights

### Happy path — Owner grants Finance view access to Adult Member
1. Owner navigates to Settings → Family Members → [member name]
2. Taps "Manage access" → Finance section shows "No access" with a change option
3. Selects "View only" → confirms
4. Adult Member's Finance nav item becomes active immediately; they see balances and bills but cannot edit

### Error / edge paths
- **Adult Member tries to assign a task to a Child:** Child is not listed in their assignment picker; no workaround
- **Teenager tries to access Finance directly via URL:** API returns 403; frontend redirects to dashboard with "You don't have access to this section"
- **Item set to Individual with named recipients, then switched to Self:** Named recipients list is cleared; prior recipients lose access immediately
- **HMG member is removed from the household account:** Automatically removed from HMG; HMG-targeted items they could see are no longer accessible
- **Admin is removed from the account:** Admin role reverts; automatically removed from HMG; Owner must designate a new Admin if desired; Admin's Self (private) data enters 30-day retention window
- **Teenager turns 18:** System does not auto-upgrade role; Owner/Admin must manually change to Adult Member (age is not stored or tracked by the system)

---

## 7. Data model

### `members` table additions

| Field | Description | Required? | Notes |
|-------|-------------|-----------|-------|
| `role` | Member's role in the household | Yes | Enum: `owner`, `admin`, `adult`, `teenager`, `child` |

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

| Field | Description | Required? | Notes |
|-------|-------------|-----------|-------|
| `id` | Group identifier | Yes | |
| `household_id` | The household this group belongs to | Yes | |
| `type` | Group type | Yes | Enum: `hmg` (Household Managers Group); extensible for future group types |
| `created_at` | Timestamp | Yes | UTC |

### `group_members` table

| Field | Description | Required? | Notes |
|-------|-------------|-----------|-------|
| `group_id` | Reference to groups | Yes | |
| `member_id` | Reference to members | Yes | |
| `added_by` | Member ID who added this person | Yes | |
| `added_at` | Timestamp | Yes | UTC |

### `visible_to` — columns on each item table

Visibility is not a separate table. Every item type (tasks, notes, documents, journal entries) carries these two columns directly on its own table:

| Column | Type | Required? | Notes |
|--------|------|-----------|-------|
| `visible_to` | Enum: `self`, `hmg`, `family`, `individual` | Yes | Default `family`; Health and Journal default to `self` |
| `visible_to_members` | `uuid[]` | Conditional | Required when `visible_to = 'individual'`; null otherwise; must contain ≥ 1 member ID |

> **Principle:** A query for any item returns its visibility in the same row — no join required. Individual module data models define the full column list for each table. See `_specs/terminology.md` for the definition of each tier.

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

## 8. UI / UX considerations

**Visibility picker:** A single control on every item that sets the `visible_to` field — combining visibility and responsibility into one "who is this for?" choice. Four options: Self · HMG · Family/All · Individual. Recommended icons: lock (Self), shield (HMG), globe (Family/All), person+ (Individual). Selecting Individual advances to a second step: a scrollable member list with multi-select checkboxes and an Apply button, which populates `visible_to_members`. Should be a single tap on the item, not buried in settings.

The picker filters available options based on the creator's role — HMG members see all household members including Children; Adult Members and Teenagers see all members except Children; Children see HMG only. This filtering must be enforced both in the UI and on the server. Children do not see the recipient picker on items they create — their items are always directed to HMG.

**Access tab (My Account → Access):** The UI combines HMG management and per-member permissions into a single "Access" tab within the My Account screen — not two separate screens. The tab has two sections stacked vertically: (1) the HMG card at the top, and (2) the member permissions panel below it. This is a different IA than the earlier "Settings → Household Managers Group" and "Settings → Family Members → [member] → Permissions" model; the combined tab is the confirmed design.

**HMG card:** Compact card at the top of the Access tab. Shows current HMG members with name, role, and date added (Owner shows "Always in HMG", Admin shows "Default", added Adult Members show date). Add button visible only when eligible Adult Members exist; shows the count if more than one is eligible. Add/remove actions trigger a confirmation dialog before applying.

**HMG confirmation dialog:** Before adding, lists three things the member will gain: (1) see items assigned to HMG across every module; (2) HMG-level assignment rights — can direct items to Children; (3) see Children's items regardless of who they were assigned to. Before removing, lists three things they will lose. Requires explicit confirm button click.

**Member permissions panel:** Member chip strip lets Owner/Admin select any household member. For Owner/Admin the panel shows a read-only banner ("Every module is Manage by definition"). For all other roles, modules are displayed in five collapsible groups (Life Admin, Finance, Health, Recipes & Groceries, Travel) — all collapsed by default. Each group header shows a count of custom overrides. Expanding a group shows per-module rows with: module icon, name, a lock icon for locked rows, a "Custom" badge + "Reset" link when overridden, and either a read-only level badge (locked) or a None/View/Edit dropdown (unlocked). A "What do these mean?" toggle reveals a plain-English explanation of the four levels. Changes apply immediately. Finance group is hidden entirely when the selected member is a Child.

**Finance access indicator:** For Adult Members without Finance access, the Finance nav item should be visible but greyed with a tooltip "Ask your household admin for access" — not hidden entirely. Hiding creates confusion about whether Finance exists. Not yet designed in prototype; flagged as P1 in design brief.

**Role change / HMG removal confirmation:** Downgrading a role or removing someone from HMG requires an explicit confirmation step with a plain-English list of what they will lose access to.

**Note — recipient picker UI:** This component appears on every item type across all modules. A dedicated UI design (prototype/sketch) should be completed and agreed before implementation begins. Flag as design-before-build.

---

## 9. Integration points & platform constraints

| Integration | Availability | Notes |
|-------------|-------------|-------|
| Server-side permission checks | Web ✓ | All access control enforced at API layer; frontend is presentation only |
| Row-level security (RLS) | Web ✓ | Postgres RLS policies enforce visibility tiers at the database layer |
| Email notifications for role changes | Phase 2 | Notify affected member when their role or HMG membership changes |

---

## 10. Success metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Privacy adoption | ≥ 20% of active users mark at least one item Self within 30 days | `visibility_changed` to `self` events |
| HMG extension rate | Track ratio of households where a non-Owner/Admin Adult Member is added to HMG | `hmg_member_added` events per family account |
| Finance access grants | Track ratio of families where Owner grants Adult Member Finance access | `finance_access_granted` events per family account |
| Zero privilege escalation incidents | 0 cases of a member accessing data their role doesn't permit | Server-side 403 error rate on protected endpoints; security audit |
| Role setup completion | ≥ 70% of Family plan accounts have ≥ 2 members with roles assigned within 7 days of signup | Member count per account at day 7 |

---

## 11. Open questions

- [x] **Child login:** Children can have their own login in Phase 1 if they have an email address; Owner/Admin sets them up on their behalf.
- [x] **Teenager age boundary:** Role assignment is always manual in Phase 1. Date of birth is not stored; no automatic role transitions.
- [x] **Owner succession:** Deferred to a later phase. No automatic succession in Phase 1; Owner must voluntarily transfer ownership before leaving. Full succession policy (soft-delete window, data export requirement, ownership transfer flow) to be addressed in a dedicated spec before Owner account deletion is implemented.
- [x] **Self items in search:** Yes — a user's own Self items surface in their personal search results. UI design and interaction deferred to the Search feature spec.
- [x] **Assignment notifications:** Not in Phase 1. Deferred to Phase 2 notifications work.
- [x] **Assignment picker UI:** Design finalised. The recipient picker is a two-step inline dropdown: step 1 selects the tier (Self / HMG / Family / Individual); selecting Individual advances to step 2 (scrollable member list with multi-select checkboxes and an Apply button). Implemented in `_UI/mypal-app.jsx` as `NoteRecipientPicker`. No modal or bottom sheet — single tap opens an inline popover anchored to the control.
- [x] **HMG Adult Member targeting Children:** Confirmed — HMG Adult Members can target Children as recipients (same as Owner/Admin). The UI's `eligibleIndividualTargetsAC` function must check `inHMG === true` in addition to `role === "Owner"` or `role === "Admin"`. Flag as a pre-build fix before the recipient picker is implemented in production.
- [x] **HMG visibility in UI:** HMG membership is internal — non-HMG members are not shown who is in the group.

---

## 12. Terminology

All product terminology — roles, areas, modules, the `visible_to` model, HMG, permission levels, and writing conventions — is defined in [`_specs/terminology.md`](terminology.md). That file is the single source of truth. Do not redefine terms here.

**Implementation term specific to this spec:**

| Term | Definition |
|------|------------|
| **Finance access grant** | An explicit Owner/Admin action that overrides the default `None` permission for an Adult Member on one or more Finance modules (typically Budget Envelopes). Recorded in `member_module_permissions` and in `access_log` with action `finance_access_granted`. |

---

## 13. Revision history

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
