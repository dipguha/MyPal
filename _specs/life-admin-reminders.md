# Life Admin — Reminders

> **⚠️ DEPRECATED — 30-May-2026.** Reminders has been merged into the Tasks module. Recurrence is now a property of a task (see `_specs/terminology.md` → Tasks module). This spec is retained for historical reference only. Do not implement or extend it.

## 1. Overview

**Feature name:** Life Admin — Reminders
**Module / nav location:** Life Admin → Reminders
**Author:** Chandradip Guha
**Status:** Draft
**Last updated:** 2026-05-18 15:30

### Problem statement
Families forget the recurring, the annual, and the once-in-a-while things that
keep household life running — birthdays, MOT renewals, school photo days,
medication, bin days, anniversaries. A To-Do list captures *what to do today*,
but not *what to remember next month or every Tuesday*. We need a dedicated
Reminders surface that lives alongside To-Dos in Life Admin, captures these
forward-looking events with their categories and cadence, and quietly promotes
them into the user's daily attention (To-Dos / Today screen) when they're due.

### User-facing goal
As a family member, I want to capture all the recurring and upcoming events I
need to remember in one place, so that the right thing surfaces on the right
day without me having to think about it again.

---

## 2. Scope

### In scope
- A **Reminders** tab inside the Life Admin screen, listing reminders grouped
  by section (Upcoming · Recurring · Annual · Past).
- Reminder **categories** with colour and icon: `Birthday`, `Anniversary`,
  `Appointment` (medical, dental, school), `Bill / Renewal` (MOT, insurance,
  TV licence, subscription), `Bin day`, `Medication`, `School` (parent's
  evening, sports day, term dates), `Travel`, `Personal`, `Other`.
- Reminder **types / cadence**:
  - **One-off** — single date (e.g. "Maya's parents' evening — 12 June").
  - **Annual** — repeats every year on the same date (birthdays,
    anniversaries, MOT due).
  - **Recurring** — fixed cadence (`Daily`, `Weekly on X`, `Monthly on Nth`,
    `Every N days`, `Custom`).
- **Lead time** per reminder — how many days before the event the user wants
  to be nudged (default 1, configurable: same-day, 1d, 3d, 7d, 14d, 30d).
- Quick-add (title-only) **and** detailed add (modal) — same modal as To-Dos
  but tuned for reminder fields.
- Auto-**promote to To-Do**: at `event_date − lead_time`, the system creates a
  corresponding row in the family's To-Do list so it shows up under Today /
  This Week on the To-Dos tab and the Today screen. The link between the
  reminder and the promoted to-do is preserved so completion / dismissal can
  flow back.
- Edit, delete, snooze, and mark-as-done on a reminder.
- Today screen integration — the existing "Reminders This Week" card on the
  Daily Briefing tab reads from this feature once it ships.

### Out of scope
- Push / email / SMS notifications (this iteration surfaces reminders
  in-app only via the To-Dos list and the Today screen).
- Calendar (`.ics`) export or two-way sync with Google Calendar / iCloud.
- Shared editing across families that aren't on the same account.
- Holiday-calendar templates ("import UK bank holidays") — future phase.
- AI-suggested reminders from emails ("MOT due, want to add a reminder?") —
  handled by the MyPal AI feature stream separately.
- Native push from a mobile app — Phase 2.

### Phasing
| Phase | What ships | When |
|-------|-----------|------|
| Phase 1 | Web MVP — CRUD, categories, recurrence, lead-time → To-Do promotion, Today card integration | Launch |
| Phase 2 | Notifications (push / email), calendar export, AI-suggested reminders | Post-launch |

---

## 3. Users & personas

| Persona | Description | Primary need from this feature |
|---------|-------------|-------------------------------|
| Family admin | The household's organiser; owns most life-admin work | Capture and trust that nothing slips — bins, MOTs, birthdays |
| Family member | Adult or older child with their own member profile | Set their own reminders (gym, work events, study deadlines) |
| Time-poor parent | Juggling kids' appointments and school admin | Recurring + annual reminders that surface a few days ahead |

---

## 4. Functional requirements

Priority key: **P0** = must have at launch · **P1** = should have · **P2** = nice to have

| # | Requirement | Priority | Acceptance criteria |
|---|-------------|----------|---------------------|
| F-01 | List reminders grouped into Upcoming (next 30 days), Recurring, Annual, Past (last 30 days) | P0 | Each section shows count; sections collapse / expand; empty sections show friendly message |
| F-02 | Quick-add a reminder with title only (defaults to Personal · one-off · today + 7d · 1d lead) from any section | P0 | Hitting Enter creates the reminder and clears the input |
| F-03 | Open a Reminder Details Modal to edit title, description, category, type (one-off / annual / recurring), date(s), recurrence rule, lead time, assignee | P0 | Save persists; cancel discards (with dirty-check confirm); delete shows confirm prompt |
| F-04 | Categories drive colour-coded pills and icons consistent with the To-Dos screen | P0 | Each reminder renders with a category pill |
| F-05 | Annual reminders auto-roll to the next year after the event date passes | P0 | An annual reminder dated 12 June 2026 becomes 12 June 2027 after 13 June 2026 |
| F-06 | Recurring reminders generate the next occurrence after the current one passes (rule-driven) | P0 | A "Weekly on Tuesday" reminder always shows the next Tuesday as the upcoming date |
| F-07 | Lead time creates a To-Do `(event_date − lead_time)` days before, linked to the reminder | P0 | A reminder for 12 June with 3d lead produces a To-Do dated 9 June; the To-Do's `category` matches the reminder's |
| F-08 | Marking the promoted To-Do as done marks the underlying reminder occurrence as done; that completion is visible in the reminder row | P0 | Tick the To-Do → reminder's occurrence shows as completed; for annual/recurring this only affects the current occurrence |
| F-09 | Snooze a reminder by +1d / +1w / pick date — defers the next promotion | P1 | Snooze updates the "next promotion" timestamp; UI shows a "Snoozed until …" hint |
| F-10 | Delete a reminder — for recurring/annual, optionally "delete this occurrence only" vs "delete the whole series" | P1 | Confirm dialog asks the scope; default is "this occurrence only" for series |
| F-11 | Today screen's "Reminders This Week" card reads real data from this feature | P0 | The mock data is replaced with a real query; tiles match the next 4 reminders due |
| F-12 | A reminder is account-scoped and visible to all members of the family; assignee is optional and defaults to the creator | P0 | Family members see the same list; assignee dropdown sources from members |
| F-13 | Filter by category and search by title | P1 | Filter chips at the top; search bar narrows visible rows |
| F-14 | Mark a one-off reminder as done (without going via the To-Do) | P1 | Tick on the reminder row → completed; row dims and falls into Past section |
| F-15 | A "Today" count badge on the Life Admin sidebar entry includes both due to-dos *and* due reminder-driven items | P2 | Badge value reflects union of the two sources |
| F-16 | Bin day reminders support a per-week colour rota (e.g. green / black / blue) | P2 | Bin day reminders can pick a colour; the colour shows on the row and in Today |

---

## 4.1 User Stories

| # | As a… | I want to… | So that… |
|---|-------|-----------|---------|
| 1 | Family admin | See all upcoming reminders in one place | I trust nothing important is missed |
| 2 | Family admin | Add a one-off reminder by typing a title and hitting Enter | I can capture things on the fly without breaking flow |
| 3 | Family member | Pick a category for each reminder | The list is scannable and colour-coded |
| 4 | Family admin | Set annual reminders for birthdays and anniversaries | I don't have to re-create them every year |
| 5 | Family admin | Set recurring reminders for bin day, gym, medication, weekly meetings | The cadence is enforced by the app |
| 6 | Family member | Configure a lead time so I'm nudged in advance | I have time to act, not just be told the day of |
| 7 | Family admin | See reminder-driven nudges show up in my To-Dos list automatically | I work from one to-do list, not two |
| 8 | Family member | Snooze a reminder | I can defer something that came too early |
| 9 | Family admin | Delete a single occurrence of a recurring reminder without killing the whole series | Exceptions don't break the cadence |
| 10 | Time-poor parent | See the next week's reminders on the Today screen | I get a glanceable preview without leaving the home screen |
| 11 | Family member | Mark a reminder as done | The list reflects reality and stale items don't pile up |

---

## 5. Non-functional requirements

| # | Requirement | Target |
|---|-------------|--------|
| NF-01 | List load performance | Reminders list renders in < 500ms for up to 500 reminders per account |
| NF-02 | Promotion job latency | A reminder promoted to a To-Do appears in the user's list within 5 minutes of its scheduled promotion time |
| NF-03 | Day-rollover correctness | Annual / recurring reminders roll to the next occurrence within 1 hour of local midnight |
| NF-04 | Accessibility | WCAG 2.1 AA — keyboard navigation across rows; modal traps focus; labels associated |
| NF-05 | Data retention | Soft-delete; completed-and-past reminders retained indefinitely (filtered from default views) |
| NF-06 | RLS | Reminders are scoped to the account; RLS enforces no cross-account reads |
| NF-07 | Timezone | All date arithmetic uses the user's local timezone (sent as a query param from the client) |

---

## 6. User flows

### Happy path — Create a one-off reminder via quick-add
1. User opens **Life Admin → Reminders**.
2. The page shows four sections: Upcoming (default expanded), Recurring,
   Annual, Past.
3. User types "Maya's parents' evening" into the Upcoming section's quick-add
   input and presses Enter.
4. A row appears under Upcoming with the title, due date = today + 7d (default
   for "Upcoming" quick-add), category = Personal, lead time = 1 day, and a
   toast "Reminder added".
5. The user can click the row to refine in the modal.

### Happy path — Create an annual birthday
1. User clicks **+ Add reminder** in the Annual section.
2. Modal opens with type pre-selected = Annual.
3. User enters "Sarah's birthday", date = 12 July, category = Birthday,
   lead time = 7 days. Saves.
4. Row appears under Annual showing "Sarah's birthday — 12 Jul (next: this
   year)".
5. On 5 July (12 Jul − 7d), the system creates a To-Do "Sarah's birthday on
   12 Jul" dated 5 July, category = Birthday, linked to this reminder.
6. The To-Do appears under **Today** on the To-Dos tab and on the Today
   screen's "Reminders This Week" card.

### Happy path — Mark a promoted To-Do as done
1. The user sees "Sarah's birthday on 12 Jul" in their Today to-dos.
2. User ticks the To-Do.
3. The linked reminder's current-year occurrence is marked done; the row in
   Reminders shows the green check.
4. The annual reminder automatically rolls forward to next year's 12 July.

### Edge paths
- **Recurrence + lead-time stacking:** A weekly reminder with a 3-day lead
  generates one To-Do per occurrence, not multiple in flight at once. If a
  To-Do is still open when the next promotion fires, the existing To-Do is
  *not* duplicated; instead the existing one is updated (or skipped) — final
  behaviour confirmed in Open Questions.
- **Past-due unpromoted:** If the user comes back after the lead-time
  window has elapsed (e.g. opening the app a week after the event), the
  reminder still surfaces in **Upcoming** with an "Overdue" tag rather than
  being silently moved to Past, so the user can decide whether to act.
- **Deletion of the underlying reminder while a promoted To-Do is open:**
  The To-Do remains (user can still tick or delete it independently), but the
  link to the reminder is severed and the To-Do shows a small "(orphaned)"
  hint.
- **Annual with `Feb 29`:** Falls back to `Feb 28` in non-leap years (UK
  convention). Documented in modal copy.
- **Snooze past the next occurrence:** Disallowed for recurring reminders
  (the next occurrence wins); allowed for one-off and annual.

---

## 7. Data model

| Field | Description | Required? | Notes |
|-------|-------------|-----------|-------|
| `id` | Reminder UUID | Yes | |
| `account_id` | Owning account | Yes | RLS scope |
| `created_by` | Creating member | Yes | |
| `assigned_to` | Member who owns this (optional; defaults to creator) | No | |
| `title` | Short title | Yes | Max 200 chars |
| `description` | Long description | No | Max 2000 chars |
| `category` | One of the fixed categories | Yes | See §2 (`birthday`, `anniversary`, `appointment`, `bill`, `bin_day`, `medication`, `school`, `travel`, `personal`, `other`) |
| `reminder_type` | `one_off` / `annual` / `recurring` | Yes | |
| `event_date` | The date of the event | Yes for one-off / annual | For annual this stores the month-day; year is the upcoming year |
| `event_time` | Time of day | No | Optional |
| `recurrence_rule` | RRULE-like definition for recurring | Yes for recurring | e.g. `FREQ=WEEKLY;BYDAY=TU` |
| `lead_time_days` | Days before the event to promote to To-Do | Yes | Default 1 |
| `next_promotion_at` | Computed timestamp when the next To-Do is created | Yes | Maintained by the system |
| `last_promoted_at` | Last time a To-Do was created from this reminder | No | |
| `next_occurrence_date` | Computed date of the next occurrence | Yes | Maintained by the system |
| `snoozed_until` | If set, promotion is paused until this date | No | |
| `bin_colour` | Optional bin-day colour | No | Only meaningful for `category = bin_day` |
| `created_at`, `updated_at`, `deleted_at` | Timestamps | Yes | Soft-delete |

A linked-occurrence table tracks individual occurrences and their promotion / completion state, so completing one occurrence doesn't end a series:

| Field | Description | Required? | Notes |
|-------|-------------|-----------|-------|
| `id` | Occurrence UUID | Yes | |
| `reminder_id` | FK to the parent reminder | Yes | |
| `occurrence_date` | Date this occurrence falls on | Yes | |
| `promoted_to_todo_id` | FK to the created `todo_items` row | No | Null until promotion |
| `completed_at` | When the occurrence was marked done | No | |
| `completed_via` | `todo` / `reminder` / `system` | No | How completion was recorded |

---

## 8. UI / UX considerations

- Lives at `/life-admin?tab=reminders` and as the second tab in the Life Admin
  tab strip (visible position already exists in the design).
- Page layout mirrors the To-Dos tab: a centred max-width column, four
  sections (Upcoming · Recurring · Annual · Past), each with a quick-add
  input and a list of compact single-line rows.
- Each reminder row is single-line and compact, matching the To-Do row:
  - Checkbox on the left (tick = mark current occurrence done).
  - Title prominent, truncates with hover tooltip.
  - Right-aligned meta: next occurrence date · cadence summary (e.g.
    "Weekly Tue", "Annual", "—") · lead time (`+3d`) · assignee (if any) ·
    category pill (coloured).
  - Hover reveals a `×` delete affordance and a snooze icon.
- The Reminder Details Modal reuses the To-Dos modal's **light/white**
  surface for contrast against the dark shell. It has:
  - Title, description.
  - Type segmented control: `One-off` · `Annual` · `Recurring`.
  - Date / time pickers; recurrence rule builder when type = Recurring.
  - Lead time segmented control: `Same day` · `1d` · `3d` · `7d` · `14d` ·
    `30d` · `Custom`.
  - Assignee dropdown.
  - Category dropdown / chip selector.
  - Save / Cancel / Delete.
- Past section is collapsed by default and dim.
- Empty-state messages are friendly: "No reminders this month — nice and
  quiet." / "No recurring reminders yet. Add one to set the rhythm."
- Loading shows skeleton rows; errors show a retry button.
- Mobile-first; sections stack; modal becomes a bottom sheet on narrow
  viewports.
- Use the frontend-design skill for the visual implementation.

---

## 9. Integration points & platform constraints

| Integration | Availability | Notes |
|-------------|-------------|-------|
| To-Dos (`todo_items` / Life Admin → To-Dos) | Web ✓ | Reminders create linked rows in `todo_items` via the promotion job; ticking the To-Do reflects back |
| Today screen — "Reminders This Week" card | Web ✓ | Replaces the mock data from the today-daily-brief feature with a real query keyed off `next_occurrence_date` |
| `useTodosStore` (Zustand) | Web ✓ | Promoted to-dos participate in the same store, so toggles still mirror between Life Admin → To-Dos and the Today screen |
| Members (`/api/v1/members`) | Web (pending) | Assignee dropdown will switch from the mock `MEMBERS` to the real endpoint once it ships |
| Notifications (push / email) | — | Out of scope for Phase 1 |
| Calendar export (`.ics`) | — | Out of scope for Phase 1 |
| Background promotion job | Web ✓ | Need a scheduled task (e.g. APScheduler tick or external cron) to materialise upcoming `todo_items` from `next_promotion_at` |

---

## 10. Success metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Reminder creation rate | 60% of active users create ≥1 reminder in their first week | Backend event log |
| Reminder completion rate (one-off) | ≥ 70% of one-off reminders marked done before or on their event date | Query `reminder_occurrences.completed_at` |
| Recurring reminder retention | ≥ 80% of recurring reminders survive 4 cycles without being deleted | Cohort analysis on `recurrence_rule` survival |
| Promoted-to-do action rate | ≥ 75% of promoted to-dos are ticked or dismissed within 2 days of their due date | Cross-table join `reminders ↔ todo_items` |
| Today card engagement | "Reminders This Week" tile click-through rate | Front-end analytics |

---

## 11. Open questions

- [ ] Should ticking the linked To-Do for a recurring reminder offer to "also dismiss the next 3 occurrences" (vacation mode), or is single-occurrence-only sufficient? — single occasion is fine
- [ ] If a recurring reminder fires again while the previous occurrence's To-Do is still open and unticked, do we (a) skip promotion, (b) replace the existing To-Do, or (c) stack a second To-Do? — *Owner: product / UX*
- [ ] Should the Today screen's "Reminders This Week" card list the *reminder occurrences* or the *promoted to-dos*? They overlap once promotion fires. — *Owner: design*
- [ ] Lead time defaults per category — should birthdays default to 7 days, bills to 14 days, bin day to "evening before"? Or is a single global default fine? — *Owner: product*
- [ ] Should we expose a "view past occurrences" history per reminder? Useful for "did Tom take his medication on Tuesday?" use cases. — *Owner: product*
- [ ] Snooze for recurring reminders — do we snooze just the next occurrence, or the cadence as a whole? — *Owner: product / UX*
- [ ] Should annual reminders that pass mid-day automatically roll to next year, or wait until tomorrow? — *Owner: product*
- [ ] Promotion mechanism: APScheduler in-process tick vs an AWS EventBridge schedule → Lambda → API call. Affects infra cost and reliability. — *Owner: platform*

---

## 12. Revision history

| Version | Date | Author | Summary of changes |
|---------|------|--------|-------------------|
| 0.1 | 2026-05-18 | Chandradip Guha | Initial draft |
