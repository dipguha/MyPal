# Spec — Reminders

> **⚠️ DEPRECATED — 30-May-2026.** Reminders has been merged into the Tasks module. This spec is retained for historical reference only. Do not implement or extend it.

> UI reference: `_UI/mypal-app.jsx` → `LifeAdminScreen` component, "Reminders" tab

---

## 1. Overview (required)

**Feature name:** Reminders  
**Module / nav location:** Life Admin → Reminders  
**Author:** Dip  
**Status:** Draft  
**Last updated:** 2026-05-21

### Problem statement
Families and individuals need a lightweight way to remember recurring obligations, deadlines, and annual events — things that are not tasks to complete, but prompts to act. Without a dedicated reminders feature, important events (renewing insurance, booking school visits, servicing the car) get missed because there is no system to surface them at the right moment.

### User-facing goal
As a MyPal user, I want to set up reminders for myself and my family — with flexible frequencies and lead times — so that I am always notified in time to act on important dates and recurring obligations.

---

## 2. Scope (required)

### In scope
- My Reminders and Family Reminders tabs, each with four groups: Overdue, One-off, Recurring, Annual
- Fire-and-repeat model: reminders have no "completion" state — they fire (enter the Overdue group) and reset on acknowledgement
- One-off reminders disappear once their due date passes and the occurrence is acknowledged; overdue one-offs remain in the Overdue group until acknowledged
- Recurring reminders reappear in the Recurring group on the next scheduled occurrence once the current one is acknowledged; the Overdue occurrence replaces the upcoming occurrence (one entry per reminder at a time)
- Annual reminders behave like one-offs per occurrence: acknowledge → disappear; reappear on the next annual date
- Reactive summary strip at the top of the Reminders tab showing Overdue / One-off / Recurring / Annual counts for the active tab (My or Family)
- Category filter pills with per-category counts; selecting a pill filters all groups and hides empty ones; "All" is the default; switching tabs resets filter to "All"
- In-app banner on the Today screen: fires when lead time is reached; stays until actioned (does not auto-dismiss); visible to all relevant family members
- Lead time defaults by frequency (user can override per reminder): One-off 1 day, Daily 1 day, Weekly 1 day, Fortnightly 2 days, Monthly 3 days, Quarterly 7 days, Every 6 months 2 weeks, Annual 1 month
- Recurring frequency options: Weekly, Fortnightly, Monthly, Quarterly, Half Yearly, Annually
- The Annual UI group displays recurring reminders whose frequency is "Annually" — it is a display grouping, not a separate type; all annual reminders (birthdays, tax returns, renewals) are created as Recurring with Annually frequency
- Full CRUD — create, edit (all fields after creation), and delete reminders
- 17 default categories (shared with To-Dos): Admin, Bills, Car, Errands, Family, Finance, Food, Health, Home, Personal, Pets, School, Shopping, Social, Travel, Work, Other
- Web only in Phase 1

### Out of scope
- Push notifications and email notifications — Phase 2
- Snooze (delay acknowledgement) — Phase 2
- Native mobile — Phase 2
- Bulk actions — Phase 2
- Reminder history / past-occurrences log — Phase 2
- Create a to-do directly from a reminder row — Phase 2

### Dependencies
- `_specs/platform--access-control.md` — role definitions and visibility rules
- `_specs/to-dos.md` — category list and tab/group UI pattern are shared; Reminders spec assumes To-Dos is live

### Phasing

| Phase | What ships | When |
|-------|-----------|------|
| Phase 1 | Full CRUD, Overdue group, lead time defaults, in-app banner on Today screen, web only | Launch |
| Phase 2 | Push / email notifications, snooze, mobile native, create to-do from reminder | Post-launch |

---

## 3. Users & personas (required)

| Persona | Description | Primary need from this feature |
|---------|-------------|-------------------------------|
| Owner / Admin (Individual) | Sole account user | Never miss a personal deadline or recurring obligation |
| Owner (Family) | Family account owner | Set shared reminders for the family and assign individual ones |
| Adult Member | Family member with full access | Create and manage their own reminders; see family reminders |
| Teenager | Younger family member | See and acknowledge reminders assigned to them |

---

## 4. Roles & access (required)

> Refer to `_specs/platform--access-control.md` for full role definitions.

| Capability | Owner | Admin | Adult Member | Teenager | Children |
|------------|:-----:|:-----:|:------------:|:--------:|:--------:|
| View My Reminders (own) | ✓ | ✓ | ✓ | ✓ | ✗ |
| Create My Reminder | ✓ | ✓ | ✓ | ✗ | ✗ |
| Edit own My Reminder | ✓ | ✓ | ✓ | ✗ | ✗ |
| Delete own My Reminder | ✓ | ✓ | ✓ | ✗ | ✗ |
| View Family Reminders (all) | ✓ | ✓ | ✓ | ✓ | ✗ |
| Create Family Reminder | ✓ | ✓ | ✓ | ✗ | ✗ |
| Edit / delete any Family Reminder | ✓ | ✓ | ✓ | ✗ | ✗ |
| Assign a reminder to a family member | ✓ | ✓ | ✓ | ✗ | ✗ |
| Acknowledge (dismiss banner) | ✓ | ✓ | ✓ | ✓ | ✗ |

Children have no login and no access to the Reminders feature. Teenagers see all Family Reminders (not just those assigned to them) and can acknowledge any family reminder banner, but cannot create, edit, assign, or delete reminders.

---

## 5. Functional requirements (required)

Priority key: **P0** = must have at launch · **P1** = should have · **P2** = nice to have

| # | Requirement | Priority | Acceptance criteria |
|---|-------------|----------|---------------------|
| F-01 | Reminders tab displays two sub-tabs: My Reminders and Family Reminders, each showing items in four groups: Overdue, One-off, Recurring, Annual | P0 | Switching tabs shows only items for that tab; each group header shows correct item count |
| F-02 | Summary strip above the groups shows Overdue / One-off / Recurring / Annual counts and updates reactively when the active tab changes | P0 | Counts reflect only items in the currently selected tab |
| F-03 | Category filter pills with per-category counts appear between the sub-tabs and the groups; selecting a pill filters all groups and hides groups with zero matching items; "All" resets the filter; switching tabs resets filter to "All" | P0 | Counts are accurate; empty groups disappear when filter is active |
| F-04 | Creating a reminder requires: title, type (One-off / Recurring / Annual), due date or recurrence schedule, category, assignee, lead time (pre-filled with default; user can override) | P0 | All required fields validated; reminder appears in the correct group immediately after save |
| F-05 | When a reminder's lead time is reached, an in-app banner appears on the Today screen; the banner stays until the user acknowledges it and does not auto-dismiss | P0 | Banner visible for all applicable family members (for Family reminders); no banner disappears without user action |
| F-06 | Acknowledging a One-off or Annual reminder dismisses its banner and removes the entry from the list once the due date has passed; if the reminder is overdue, it is removed from Overdue immediately on acknowledgement | P0 | Entry no longer appears in the list after acknowledgement + due date passed; Annual reminder reappears in Annual group when the next annual date minus lead time is reached |
| F-07 | Acknowledging a Recurring reminder dismisses its banner; the reminder moves from Overdue back to the Recurring group and its next occurrence date is calculated from the frequency; only one entry per recurring reminder exists at a time | P0 | No duplicate entries created; next occurrence date is correct for each frequency option |
| F-08 | A reminder that has fired (lead time reached) and has not been acknowledged moves to the Overdue group; a Recurring reminder's Overdue entry replaces its Recurring group entry (not duplicated) | P0 | Overdue count increments; entry disappears from Recurring and appears in Overdue; acknowledging moves it back to Recurring with updated next date |
| F-09 | All reminder fields are editable after creation: title, description, type, date/schedule, lead time, category, assignee | P0 | Saving edits re-evaluates group placement and lead time; changes reflected immediately |
| F-10 | Deleting a reminder removes it permanently; no archive view in Phase 1 | P0 | Reminder disappears from all groups and no longer triggers banners |

---

## 5.1 User Stories

| # | As a… | I want to… | So that… |
|---|-------|-----------|---------|
| US-01 | User | Set a reminder with a lead time | I'm notified in time to act, not on the day it's due |
| US-02 | User | Set a recurring reminder (e.g. monthly, quarterly) | I never forget regular obligations without having to recreate the reminder each time |
| US-03 | User | See overdue reminders clearly flagged | I can quickly address anything I missed or ignored |
| US-04 | User | Acknowledge a reminder and have it reset to the next occurrence | I don't have to manage the schedule manually |
| US-05 | Family Owner / Admin | Assign a reminder to a specific family member | The right person is notified, not the whole family |
| US-06 | Family member | See a banner on the Today screen when a reminder is due | I notice it without having to navigate into Life Admin |
| US-07 | User | Edit a reminder's lead time after creation | I can tune how far in advance I'm reminded as my circumstances change |
| US-08 | Teenager | Acknowledge a banner for a reminder assigned to me | I can confirm I've seen it without needing full edit access |

---

## 6. Non-functional requirements

| # | Requirement | Target |
|---|-------------|--------|
| NF-01 | Performance | Reminders list loads in < 500ms; banner acknowledgement reflected in UI < 200ms |
| NF-02 | Accessibility | WCAG 2.1 AA; acknowledge action keyboard-operable; edit modal focus-trapped and Escape-closeable |
| NF-03 | Data retention | Deleted reminders removed immediately; no soft-delete or user-facing history in Phase 1 |
| NF-04 | Privacy enforcement | Private (My) reminders never returned in Family queries; visibility enforced server-side via RLS |
| NF-05 | Theme support | Both light mode (T_LIGHT) and dark mode (T_DARK) render correctly |

---

## 7. User flows (required)

### Happy path — create a recurring reminder
1. User navigates to Life Admin → Reminders → My Reminders tab
2. Clicks "+ Add reminder"
3. Selects type "Recurring", enters title "Pay council tax", sets frequency to Monthly, picks next due date (1st of next month), confirms lead time of 3 days, sets category to Bills
4. Reminder appears in the Recurring group
5. On the 28th of the month (3 days before), an in-app banner appears on the Today screen
6. User acknowledges → banner dismissed; reminder moves back to Recurring with next due date updated to the 1st of the following month

### Happy path — create a one-off reminder
1. User navigates to Family Reminders tab
2. Clicks "+ Add reminder"
3. Selects type "One-off", enters title "Book parents' evening", sets due date two weeks away, confirms 1-day lead time, assigns to Sarah
4. Reminder appears in the One-off group; visible to all family members
5. The day before the due date, a banner appears on the Today screen for Owner, Admin, Adult Members, and Teenager (Sarah)
6. User acknowledges → banner dismissed; entry disappears once the due date passes

### Happy path — overdue reminder
1. A recurring reminder fires (lead time reached) but user does not acknowledge
2. At the next check, the reminder moves from Recurring to Overdue
3. User opens Reminders → sees the item in Overdue group with the original due date highlighted in rose
4. User acknowledges → entry removed from Overdue; reappears in Recurring with next occurrence date

### Error / edge paths
- **Acknowledge recurring from Overdue:** Next occurrence date calculated from the original due date + frequency period, not from today. If the calculated next date is still in the past (e.g. multiple periods have been missed), advance by further full periods until the next future date is reached.
- **Edit frequency of a recurring reminder:** Next occurrence date recalculated from the current due date using the new frequency; lead time default updated to new frequency default unless user had manually overridden it
- **Delete a reminder with an active banner:** Banner dismissed immediately; reminder removed from list
- **Create reminder with blank title:** Submission blocked; title field retains focus
- **Teenager tries to create a reminder:** Create action not exposed in their UI; server rejects the request even if attempted directly

---

## 8. Data model

| Field | Description | Required? | Notes |
|-------|-------------|-----------|-------|
| `id` | Unique reminder identifier | Yes | UUID |
| `account_id` | Account this reminder belongs to | Yes | FK → `accounts` |
| `created_by_member_id` | Member who created the reminder | Yes | FK → `members` |
| `title` | Reminder title | Yes | Max 255 chars |
| `description` | Optional detail | No | Max 150 chars |
| `reminder_type` | Type of reminder | Yes | Enum: `one_off`, `recurring`; Annual is not a separate type — use `recurring` with `frequency = annually` |
| `due_date` | Next due date | Yes | ISO date; drives group placement and banner trigger |
| `frequency` | Recurrence frequency | No | Enum: `weekly`, `fortnightly`, `monthly`, `quarterly`, `half_yearly`, `annually`; required when `reminder_type = recurring`; UI Annual group = reminders where `frequency = annually` |
| `lead_time_days` | Days before due date the banner fires | Yes | Integer; default set by frequency (see lead time table); user-overridable |
| `category` | Reminder category | Yes | VARCHAR(50); default `Personal`; constrained to the 17 default values at launch |
| `visibility` | Who can see this reminder | Yes | Enum: `private` (My Reminders), `family` (Family Reminders) |
| `assigned_to_member_id` | Member the reminder is assigned to | No | FK → `members`; null = whole family for family reminders, self for private |
| `last_acknowledged_at` | Timestamp of most recent acknowledgement | No | Used to calculate whether current occurrence has been actioned |
| `next_occurrence_date` | Computed next due date after acknowledgement | No | Maintained server-side for recurring reminders |
| `created_at` | Creation timestamp | Yes | Set server-side |
| `updated_at` | Last updated timestamp | Yes | Updated on every edit |

### Lead time defaults

| Frequency | Default lead time |
|-----------|------------------|
| One-off | 1 day |
| Weekly | 1 day |
| Fortnightly | 3 days |
| Monthly | 3 days |
| Quarterly | 1 week |
| Half Yearly | 2 weeks |
| Annually | 1 month |

---

## 9. UI / UX considerations

**Reference:** `_UI/mypal-app.jsx` → `LifeAdminScreen`, "Reminders" tab

The Reminders screen mirrors the To-Dos layout so users encounter a familiar pattern. The two sub-tabs (My Reminders / Family Reminders), summary strip, category filter pills, and group card structure are identical in layout to To-Dos; only the group names and row content differ.

**Summary strip:** Compact inline card immediately below the Life Admin module tabs. Shows four stats: Overdue (rose), One-off (amber), Recurring (teal), Annual (warm) separated by vertical dividers. Header label ("My Reminders" / "Family Reminders") and counts update reactively with the active tab.

**Category filter pills:** Horizontally wrappable row of pills between the sub-tabs and the groups. Each pill shows category name and a plain-text count. Active pill highlighted in sky blue. Selecting "All" resets. Tab switch resets to "All".

**Reminder rows:** Single-line flex layout — square acknowledge tickbox (14×14px, 3px radius), title (flex:1, truncated), due-date badge (rose if overdue), frequency chip (e.g. "Monthly" for recurring; hidden when category filter active), category chip (hidden when filter active), acted-by ("Name · HH:MM" in teal, shown only when acknowledged). No hover-shift: rows do not use the global `.row` CSS class.

**Overdue group:** Card border in rose; row due badges and group header use rose accent. No "+ Add reminder" button in the Overdue group.

**+ Add reminder:** A dashed-border button at the bottom of each non-overdue group. Clicking opens the full create modal.

**Create / edit modal:** Full-width sheet, centred at 460px max. Fields: Title (text), Description (textarea, 150-char countdown), Type (segmented toggle: One-off / Recurring / Annual), Due Date / Start Date (date picker), Frequency (select; shown only when type = Recurring), Lead Time (number input with days label; pre-filled from default), Category (select), Assigned To (select). "Save" and "Cancel" buttons full-width.

**Acknowledge action:** Clicking the tickbox on any row acknowledges the reminder and shows acted-by. For Overdue items it removes the entry (one-off/annual) or resets to next occurrence (recurring). For non-overdue items that have fired their lead time, the banner on the Today screen is dismissed.

**Empty state:** When a tab has no reminders, show a centred illustration with "Nothing set up yet" and a "+ Add your first reminder" CTA.

**Implementation gaps to address in v2:** The existing `ReminderLists.tsx` component is missing My / Family sub-tabs, the Overdue group, and the summary strip. Snooze (built in the existing component) is Phase 2 — the snooze action should not be exposed in Phase 1 UI. Categories in the existing component should be updated to the shared 17-item list.

---

## 10. Integration points & platform constraints

| Integration | Availability | Notes |
|-------------|-------------|-------|
| RLS (Postgres) | Phase 1 | `private` reminders only returned for the owning member; `family` reminders returned for all account members |
| Today screen banner | Phase 1 | In-app only; banner fires at lead time (`due_date - lead_time_days`); stays until actioned |
| Push notifications | Phase 2 | Requires notification permission spec and device token management |
| Email notifications | Phase 2 | Requires transactional email provider integration |
| Native mobile | Phase 2 | Same data model; native notification surface to replace in-app banner |

---

## 11. Success metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Feature adoption | > 50% of active users create at least 1 reminder in their first month | Analytics: first `reminder_created` event within 30 days of `onboarding_complete` |
| Recurring reminder uptake | > 40% of all reminders created are Recurring type | Analytics: `reminder_type = recurring` / total reminders created |
| Acknowledgement rate | > 70% of banners acknowledged within 24 hours of firing | Analytics: time delta between banner fire and `last_acknowledged_at` |
| Overdue rate | < 20% of active reminders in the Overdue group at any given time | Analytics: snapshot of group distribution at day-end |
| Family reminder usage | > 25% of Family account users create at least 1 Family reminder | Analytics: `visibility = family` reminders by account type |

---

## 12. Definition of done

- [ ] All P0 functional requirements implemented and tested
- [ ] Private reminders never returned in Family queries — RLS verified
- [ ] Lead time defaults applied correctly per frequency; user override persists
- [ ] Recurring reminders advance to next occurrence on acknowledgement; Overdue entry replaces Recurring entry (no duplicates)
- [ ] One-off and Annual reminders removed from list after acknowledgement once due date has passed
- [ ] In-app banner fires at `due_date - lead_time_days`; remains until acknowledged; appears for all applicable family members
- [ ] Snooze action not exposed in Phase 1 UI (backend may retain the field)
- [ ] Edit modal pre-populates all fields from current reminder state
- [ ] Category filter correctly hides empty groups; resets on tab switch
- [ ] My Reminders / Family Reminders tabs wired up with correct visibility filtering
- [ ] Summary strip counts reactive to active tab
- [ ] Overdue group styled in rose; no "+ Add reminder" button in Overdue
- [ ] Empty state rendered when tab has no reminders
- [ ] Both light and dark themes verified visually
- [ ] WCAG 2.1 AA verified for acknowledge action, edit modal, and filter pills
- [ ] Open questions resolved or formally deferred

---

## 13. Open questions

- [x] Should the next occurrence date for a recurring reminder advance from the original due date or from today when the user acknowledges late? **Decision: original due date** — keeps the schedule intact regardless of when the user acknowledges.
- [x] Should Teenagers see the full Reminders list or only the Today screen banner for reminders assigned to them? **Decision: Teenagers see all Family Reminders** — same visibility as other family members; they just cannot create, edit, or assign.
- [x] Should users be able to create a to-do directly from a reminder row? **Decision: Phase 2** — confirmed deferred.

---

## 14. Revision history

| Version | Date | Author | Summary of changes |
|---------|------|--------|-------------------|
| 0.1 | 2026-05-21 | Dip | Initial draft — generated from design and discussion sessions; all core design decisions resolved inline; two open questions noted for confirmation; "create to-do from reminder" added as Phase 2 open question |
| 0.2 | 2026-05-21 | Dip | Collapsed Annual reminder type into Recurring — Annually is now a frequency option; Annual UI group is a display filter not a data type; updated data model and scope accordingly |
| 0.3 | 2026-05-21 | Dip | Resolved all open questions: next occurrence advances from original due date; Teenagers see all Family Reminders (not just assigned); create-to-do-from-reminder confirmed Phase 2; updated roles table, edge path wording, and lead time defaults table |
