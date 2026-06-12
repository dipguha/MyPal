# Spec — To-Dos

> UI reference: `_UI/mypal-app.jsx` → `LifeAdminScreen` component, "To Dos" tab

---

## 1. Overview (required)

**Feature name:** To-Dos  
**Module / nav location:** Life Admin → To Dos  
**Author:** Dip  
**Status:** Draft  
**Last updated:** 2026-05-21

### Problem statement
Families and individuals need a lightweight way to capture, assign, and track tasks across personal and shared contexts. Without a dedicated to-do feature, tasks get buried in messages or forgotten entirely, causing missed deadlines and coordination overhead.

### User-facing goal
As a MyPal user, I want to capture, organise, and complete tasks for myself and my family — with clear ownership, due dates, and categories — so that nothing important gets missed and everyone knows what they're responsible for.

---

## 2. Scope (required)

### In scope
- My To-Dos and Family To-Dos tabs, each with time-based groups: Overdue, Today, This Week, Later
- Compact single-line rows: tickbox, title, due date, category chip, assignee (where applicable), done-by (when completed)
- Square checkbox to mark an item complete; completion records timestamp and member who ticked it
- Completed items remain visible in their group (dimmed, struck-through) until their due date passes, then archived automatically; overdue items are archived immediately on completion
- Reopening a completed item (untick) re-evaluates the due date and moves the item to the correct group (Overdue / Today / This Week / Later)
- Backend audit trail for all state changes (created, completed, reopened, archived, edited) — Phase 1; no user-facing archive view in Phase 1
- Reactive summary strip at the top of the To-Dos tab showing Overdue / Today / This Week / Later counts for the active tab (My or Family)
- Category filter pills with per-category counts; selecting a pill filters all groups and hides empty ones; "All" is the default
- 17 default categories: Admin, Bills, Car, Errands, Family, Finance, Food, Health, Home, Personal, Pets, School, Shopping, Social, Travel, Work, Other
- "+ Add to-do" button (dashed, prominent) at the bottom of each non-overdue group; expands to an inline input on click; Enter submits, Escape cancels
- Edit modal: Title, Description (max 150 chars), Due Date, Assigned To, Category, Priority (Low / Normal / High)
- My To-Do defaults on creation: Assigned To = Self, visibility = private, due date = based on group (Today → today; This Week → tomorrow; Later → next Monday), Category = Personal, Priority = Normal
- Family To-Do defaults on creation: Assigned To = Family (all), visibility = family, same due date logic, Category = Personal, Priority = Normal
- Reassigning a My to-do to a family member automatically moves it to the Family tab
- Assigned To options in modal: "Self (me)" appears only when editing a My (private) to-do; otherwise options are Family (all), Sarah, James, Lily, Tom

### Out of scope
- Delete action — Phase 2
- User-facing archive view and archive search — Phase 2
- Push / email notifications for overdue items — Phase 2
- Bulk actions (bulk complete, bulk reassign) — Phase 2
- Sorting or reordering items within a group — Phase 2
- Recurring to-dos — Phase 2
- Sub-tasks — Phase 2

### Dependencies
- `_specs/platform--access-control.md` — role definitions and visibility rules
- `_specs/onboarding.md` — incomplete onboarding surfaces the To-Dos section prompt in My Account

### Phasing

| Phase | What ships | When |
|-------|-----------|------|
| Phase 1 | Full to-do CRUD, completion with audit trail, category filter, web only | Launch |
| Phase 2 | Delete, archive view, notifications, recurring todos, bulk actions, native mobile | Post-launch |

---

## 3. Users & personas (required)

| Persona | Description | Primary need from this feature |
|---------|-------------|-------------------------------|
| Owner / Admin (Individual) | Sole account user | Capture and track personal tasks by category and due date |
| Owner (Family) | Family account owner | Manage their own tasks and assign tasks to family members |
| Adult Member | Family member with full access | View family tasks, create and complete their own and assigned tasks |
| Teenager | Younger family member | See tasks assigned to them and mark them done |

---

## 4. Roles & access (required)

> Refer to `_specs/platform--access-control.md` for full role definitions.

| Capability | Owner | Admin | Adult Member | Teenager | Children |
|------------|:-----:|:-----:|:------------:|:--------:|:--------:|
| View My To-Dos (own) | ✓ | ✓ | ✓ | ✓ | ✗ |
| Create My To-Do | ✓ | ✓ | ✓ | ✓ | ✗ |
| Edit / complete own My To-Do | ✓ | ✓ | ✓ | ✓ | ✗ |
| View Family To-Dos | ✓ | ✓ | ✓ | ✓ | ✗ |
| Create Family To-Do | ✓ | ✓ | ✓ | ✗ | ✗ |
| Edit / complete any Family To-Do | ✓ | ✓ | ✓ | Own only | ✗ |
| Reassign a Family To-Do | ✓ | ✓ | ✓ | ✗ | ✗ |

Children have no login and no access to the To-Dos feature. Teenagers can complete Family to-dos assigned to them but cannot create or reassign Family tasks.

---

## 5. Functional requirements (required)

Priority key: **P0** = must have at launch · **P1** = should have · **P2** = nice to have

| # | Requirement | Priority | Acceptance criteria |
|---|-------------|----------|---------------------|
| F-01 | To-Dos tab displays two sub-tabs: My To-Dos and Family To-Dos, each showing items grouped into Overdue, Today, This Week, and Later | P0 | Switching tabs shows only items belonging to that tab; group headers show correct counts |
| F-02 | Summary strip above the groups shows Overdue / Today / This Week / Later counts and updates reactively when the active tab changes | P0 | Counts reflect only the items in the currently selected tab (My or Family) |
| F-03 | Category filter pills with per-category item counts appear between the tabs and the groups; selecting a pill filters all groups and hides groups with zero matching items; "All" resets the filter | P0 | Counts next to each pill are accurate; empty groups disappear when a filter is active; switching tabs resets filter to "All" |
| F-04 | Each to-do row is a single line displaying: square tickbox, title (truncated), due-date badge, category chip (hidden when a category filter is active), assignee (hidden when done), done-by with timestamp (shown when done) | P0 | All elements present and correctly conditional; row does not wrap or shift on hover |
| F-05 | Clicking the tickbox marks the item complete: checkbox fills, title strikes through, done-by shows member name and time; state is saved server-side | P0 | Completion recorded with `completed_at` timestamp and `completed_by_member_id`; visible immediately without page reload |
| F-06 | Completed items remain in their group (dimmed, struck-through) until their due date passes, at which point they are archived automatically; overdue completed items are archived immediately on completion | P0 | Item not removed from UI the moment it is ticked; archived items no longer appear in any group |
| F-07 | Unticking a completed item (reopen) re-evaluates the due date and moves the item to the correct group; if the due date is in the past the item moves to Overdue | P0 | Item reappears in correct group with no done-by shown; audit trail records the reopen event |
| F-08 | "+ Add to-do" button at the bottom of each non-overdue group expands to an inline input on click; submitting creates an item with correct defaults for the active tab and group | P0 | My defaults: Self, private, due by group, Personal, Normal; Family defaults: Family, family visibility, due by group, Personal, Normal; Enter submits, Escape cancels |
| F-09 | Clicking anywhere on a row (except the tickbox) opens the edit modal with all current item values pre-populated: title, description, due date, assigned to, category, priority | P0 | No field shows a default if the item already has a saved value; date input shows the correct ISO date |
| F-10 | Reassigning a My to-do to a family member changes its visibility to "family" and moves it to the Family To-Dos tab | P0 | Item no longer appears in My To-Dos after save; appears in Family To-Dos with the correct assignee |

---

## 5.1 User Stories

| # | As a… | I want to… | So that… |
|---|-------|-----------|---------|
| US-01 | User | Quickly add a to-do to the right time group | I don't have to manually set a due date every time |
| US-02 | User | See my tasks grouped by urgency (overdue first, then today, week, later) | I can triage what needs attention first |
| US-03 | User | Filter to-dos by category | I can focus on one area (e.g. Finance, Health) without scrolling through everything |
| US-04 | User | Tick a task as done and see who completed it and when | I have a clear record of completed work |
| US-05 | Family Owner / Admin | Assign a task to a specific family member | Everyone knows who is responsible for what |
| US-06 | Family member | See tasks assigned specifically to me | I know what I need to do without wading through everyone else's tasks |
| US-07 | User | Reopen a completed task if I ticked it by mistake | I don't lose the task or have to recreate it |
| US-08 | User | Edit a to-do's details after creating it | I can correct the due date, category, or assignee as plans change |

---

## 6. Non-functional requirements

| # | Requirement | Target |
|---|-------------|--------|
| NF-01 | Performance | To-Dos list loads in < 500ms; completion state update reflected in UI < 200ms |
| NF-02 | Accessibility | WCAG 2.1 AA; tickbox keyboard-operable; edit modal focus-trapped and Escape-closeable |
| NF-03 | Data retention | Archived items retained in DB indefinitely as audit trail; no user-facing purge in Phase 1 |
| NF-04 | Privacy enforcement | Private (My) to-dos never returned in Family queries; visibility enforced server-side via RLS |
| NF-05 | Theme support | Both light mode (T_LIGHT) and dark mode (T_DARK) render correctly |

---

## 7. User flows (required)

### Happy path — create and complete a My to-do
1. User navigates to Life Admin → To Dos → My To-Dos tab
2. Clicks "+ Add to-do" at the bottom of the Today group
3. Types a title, presses Enter → item appears with defaults (Self, private, today's date, Personal, Normal)
4. User ticks the checkbox → item shows struck-through with "You · HH:MM"; status saved as completed
5. Item remains visible in Today (dimmed) until midnight; archived automatically the following day

### Happy path — create and assign a Family to-do
1. User switches to Family To-Dos tab
2. Clicks "+ Add to-do" in the This Week group
3. Title entered, item created with defaults (Family, family visibility, tomorrow's date, Personal, Normal)
4. User opens edit modal → changes Assigned To from "Family (all)" to "Sarah" → saves
5. Row now shows "→ Sarah"; item visible to all family members

### Happy path — edit an existing to-do
1. User clicks a to-do row (not the tick) → modal opens with all fields pre-populated
2. User changes due date and category → clicks "Save changes"
3. If due date moves item to a different group, it re-renders in the correct group immediately

### Error / edge paths
- **Reopen completed item:** User unticks → due date re-evaluated; item moves to correct group (or Overdue if past due); audit trail records the reopen event
- **Overdue item completed:** User ticks an overdue item → item archived immediately (no future due date to wait for)
- **My to-do reassigned to family member:** Visibility changes to "family"; item disappears from My To-Dos and appears in Family To-Dos with the specified assignee
- **Category filter active when adding:** The "+ Add to-do" button is still shown in filtered groups; new item is created with the standard defaults (not the filtered category pre-selected)
- **Add to-do with blank title:** Submission blocked; input retains focus

---

## 8. Data model

| Field | Description | Required? | Notes |
|-------|-------------|-----------|-------|
| `id` | Unique to-do identifier | Yes | UUID |
| `account_id` | Account this to-do belongs to | Yes | FK → `accounts` |
| `created_by_member_id` | Member who created the item | Yes | FK → `members` |
| `title` | Task title | Yes | Max 255 chars |
| `description` | Optional detail | No | Max 150 chars |
| `due_date` | Date the task is due | No | ISO date; drives group placement (Overdue / Today / This Week / Later) |
| `priority` | Task urgency | Yes | Enum: `low`, `normal`, `high`; default `normal` |
| `category` | Task category | Yes | VARCHAR(50); default `Personal`; constrained to the 17 default values at launch |
| `visibility` | Who can see this task | Yes | Enum: `private` (My To-Dos), `family` (Family To-Dos) |
| `assigned_to_member_id` | Member the task is assigned to | No | FK → `members`; null = assigned to whole family for family todos, self for private |
| `status` | Current task state | Yes | Enum: `open`, `completed`, `archived`; default `open` |
| `completed_at` | Timestamp of completion | No | Set on tick; cleared on reopen |
| `completed_by_member_id` | Member who completed the task | No | FK → `members`; set on tick; cleared on reopen |
| `created_at` | Creation timestamp | Yes | Set server-side |
| `updated_at` | Last updated timestamp | Yes | Updated on every edit |

### Audit trail (`todo_audit`)

| Field | Description |
|-------|-------------|
| `id` | UUID |
| `todo_item_id` | FK → `todo_items` |
| `action` | Enum: `created`, `completed`, `reopened`, `archived`, `edited` |
| `actor_member_id` | FK → `members` |
| `snapshot` | JSONB — full item state at the time of the action |
| `created_at` | Timestamp of the event |

---

## 9. UI / UX considerations

**Reference:** `_UI/mypal-app.jsx` → `LifeAdminScreen`, "To Dos" tab

**Summary strip:** A compact card immediately below the Life Admin module tabs. Shows four inline stats (Overdue in rose, Today in amber, This Week in teal, Later in muted) separated by vertical dividers. The header label ("My To-Dos" / "Family To-Dos") and counts update reactively when the active sub-tab changes. Total open count shown top-right.

**Category filter pills:** A horizontally wrappable row of pills between the sub-tabs and the groups. Each pill shows the category name and a plain-text count badge. The active pill is highlighted in sky blue. Selecting "All" resets. Switching between My and Family tabs resets the filter to "All". When a filter is active, the category chip is hidden from individual rows (redundant).

**To-do rows:** Single-line flex layout — square tickbox (14×14px, 3px radius), title (flex:1, truncated with ellipsis), due-date badge (rose tint if overdue), category chip (sky blue, hidden when filtering), assignee ("→ Name", hidden when done), done-by ("Name · HH:MM" in teal, shown only when done). No hover-shift: row does not use the global `.row` CSS class.

**Overdue group:** Card border in rose; row ticks, due badges, and group header all use rose accent. Overdue items cannot have new tasks added via inline input (no "+ Add to-do" in the Overdue group).

**+ Add to-do:** A dashed-border button row at the bottom of Today, This Week, and Later groups. Hovering turns border and label amber. Clicking expands to an inline input with an "Add" button and an "✕" dismiss. Focus is set automatically. Pressing Enter submits; Escape collapses without saving.

**Edit modal:** Full-width sheet, centred at 460px max. Fields: Title (text), Description (textarea, 150-char countdown), Due Date (date picker), Assigned To (select), Category (select), Priority (three-segment toggle: Low / Normal / High). "Assigned To" shows "Self (me)" as first option only when the item's visibility is `private`. "Save changes" and "Cancel" buttons span the full width.

**Empty state:** When a tab has no to-dos, show a centred illustration with "Nothing here yet" and a "+ Add your first to-do" CTA.

**Back navigation / persistence:** Navigating away from and back to the To-Dos tab preserves the active sub-tab, active category filter, and group open/closed states for the session.

---

## 10. Integration points & platform constraints

| Integration | Availability | Notes |
|-------------|-------------|-------|
| RLS (Postgres) | Phase 1 | `private` todos only returned for the owning member; `family` todos returned for all members of the account |
| Archival job | Phase 1 | Server-side scheduled job (or trigger) moves completed items to `archived` status once due date has passed |
| My Account | Phase 1 | If user skipped onboarding, My Account surfaces a prompt to explore To-Dos |
| Push notifications (overdue) | Phase 2 | Daily digest of overdue items; requires notification permission spec |
| Native mobile | Phase 2 | Same data model; native gesture for tick (swipe to complete) considered post-launch |

---

## 11. Success metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Feature adoption | > 60% of active users create at least 1 to-do in their first week | Analytics: first `todo_created` event within 7 days of `onboarding_complete` |
| Weekly active usage | > 40% of users who have created todos interact with them at least once per week | Analytics: WAU on To-Dos tab |
| Completion rate | > 50% of created to-dos are marked complete within 7 days of their due date | Analytics: `completed` / `created` ratio, 7-day window |
| Family assignment rate | > 30% of Family to-dos have a specific member assigned (not "Family (all)") | Analytics: `assigned_to_member_id` not null on Family todos |
| Overdue rate | < 25% of open items are in the Overdue group at any given time | Analytics: snapshot of group distribution at day-end |

---

## 12. Definition of done

- [ ] All P0 functional requirements implemented and tested
- [ ] Private todos never returned in Family queries — RLS verified
- [ ] Completion records `completed_at` and `completed_by_member_id` server-side
- [ ] Audit trail written for all state changes: created, completed, reopened, archived, edited
- [ ] Archival job tested: completed items archived after due date passes; overdue items archived immediately on completion
- [ ] Reopen moves item to correct group based on due date re-evaluation
- [ ] Reassigning My todo to a family member moves it to Family tab
- [ ] Edit modal pre-populates all fields from current item state
- [ ] Category filter correctly hides empty groups; resets on tab switch
- [ ] "+ Add to-do" inline input dismissed on Escape, submitted on Enter
- [ ] Summary strip counts are reactive to active tab
- [ ] Empty state rendered when tab has no items
- [ ] Both light and dark themes verified visually
- [ ] WCAG 2.1 AA verified for tickbox, edit modal, and filter pills
- [ ] Open questions resolved or formally deferred

---

## 13. Open questions

All open questions resolved before initial draft.

---

## 14. Revision history

| Version | Date | Author | Summary of changes |
|---------|------|--------|-------------------|
| 0.1 | 2026-05-21 | Dip | Initial draft — generated from design and discussion sessions with mypal-complete-v2.jsx To-Dos component review; all design decisions resolved inline |
