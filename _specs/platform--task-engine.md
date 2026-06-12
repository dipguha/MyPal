# Platform — Task Engine

## 1. Overview (required)

**Feature name:** Task Engine — Schedule Templates & Task Instances  
**Module / nav location:** Cross-cutting platform — consumed by all modules; managed via Life Admin → Tasks  
**Author:** Dip  
**Status:** Approved  
**Last updated:** 2026-06-01 18:18

### Problem statement

MyPal has recurring obligations spread across multiple modules (Cars, Home, Pets, Health, Finance, etc.). Without a shared engine, every module would independently track its own due dates with no unified view, no consistent lifecycle, and no history trail. Users would miss renewals, forget bookings, and have no audit record of what was done and when.

### User-facing goal

As a household manager, I want all recurring obligations across every area of my life captured as schedule templates — so that the Tasks module can surface the right action at the right time, and every completion is reflected in history automatically.

---

## 2. Scope (required)

### In scope

- **Schedule Template** schema and lifecycle — created and owned by each module (Cars, Home, Pets, Health, Finance, etc.)
- **Task Instance** generation — lazy spawn when `today ≥ due_date − lead_time`
- **Two instance types** — Simple (tick when done) and Appointment (requires booking)
- **Full instance state machine** for both types, including terminal states that trigger the next instance
- **Two cadence modes** — Fixed (anchor-based) and Rolling (completion-date-based) as a template-level flag
- **One-off tasks** — created directly in the Tasks module with no parent template
- **History write-back** — completing an Appointment instance prompts a history log entry in the source module
- **Cancellation handling** — cancelled instances trigger next instance per cadence rules, with a reschedule-from choice for rolling cadence
- Backend API contract for templates and instances; Tasks module frontend consumes it

### Out of scope

- Push / email / SMS notifications (governed by ADR-007; Phase 2)
- The Tasks module UI itself — covered by `_specs/life-admin-to-dos.md` (note: module renamed Tasks)
- Module-specific template UIs (e.g. the Key Dates panel in Cars) — covered in each module's spec
- Bulk import or migration of existing reminders into templates
- Native mobile implementation (Phase 4+)

### Dependencies

- `_specs/life-admin-to-dos.md` — the Tasks module spec (renamed Tasks; pre-dates this engine spec)
- `_specs/platform--access-control.md` — `visible_to` recipient model; all instances inherit visibility from their template
- `_specs/terminology.md` — canonical role and recipient-tier definitions
- `architecture_decisions.md` ADR-011 — lead time defaults, hard limits, and frequency options
- ADR-012 (this spec) — see `architecture_decisions.md`

### Phasing

| Phase | What ships | When |
|-------|-----------|------|
| Phase 1 | Template schema, instance generation, Simple and Appointment state machines, history write-back, one-off tasks | Launch |
| Phase 2 | Push/email notifications at lead time and day-before-appointment | Post-launch |

---

## 3. Users & personas (required)

| Persona | Description | Primary need |
|---------|-------------|--------------|
| Household Owner / Admin | Sets up templates for the whole household — cars, home, pets | Templates created once, instances surface automatically; nothing falls through the cracks |
| Adult Member | Acts on instances assigned to them — books appointments, ticks tasks done | Clear view of what's due, what's booked, what's overdue |
| Teenager | May have instances assigned (e.g. health check-ups) | Simple actions only — tick done or view booking details |

---

## 4. Roles & access (required)

> Full role definitions in `_specs/platform--access-control.md`.

| Capability | Owner | Admin | Adult Member | Teenager | Child |
|------------|:-----:|:-----:|:------------:|:--------:|:-----:|
| Create / edit template | ✓ | ✓ | ✓ | ✗ | ✗ |
| Delete / deactivate template | ✓ | ✓ | Own only | ✗ | ✗ |
| View own instances | ✓ | ✓ | ✓ | ✓ | ✗ |
| View all household instances | ✓ | ✓ | ✗ | ✗ | ✗ |
| Progress instance (book, complete, cancel) | ✓ | ✓ | Assigned to them | Assigned to them | ✗ |
| Create one-off task | ✓ | ✓ | ✓ | ✗ | ✗ |

Instances inherit the `visible_to` value of their parent template. Visibility defaults follow the module's default (e.g. Health templates default to `self`; Cars/Home default to `family`).

---

## 5. Functional requirements (required)

Priority key: **P0** = must have at launch · **P1** = should have · **P2** = nice to have

| # | Requirement | Priority | Acceptance criteria |
|---|-------------|----------|---------------------|
| F-01 | Each module can define Schedule Templates on its entities (vehicle, property, pet, member, etc.) with: label, entity reference, instance type, frequency, cadence mode, anchor date, lead time, and `visible_to`. | P0 | Templates persisted, readable by Tasks API, editable without affecting existing instances |
| F-02 | The system generates a Task Instance lazily: when `today ≥ template.next_due − template.lead_time`, and no active instance already exists for that template cycle. | P0 | Instance appears in Tasks list on the correct day; duplicate instances not created |
| F-03 | **Simple instance state machine:** `created → completed` or `created → cancelled`. Either terminal state triggers next-instance calculation. | P0 | Completing or cancelling a simple task marks it terminal and spawns (or schedules) the next instance |
| F-04 | **Appointment instance state machine:** `created → booked → completed` or `→ rescheduled → completed` or `→ cancelled` at any non-terminal state. Either terminal state triggers next-instance calculation. | P0 | Full state transitions work; rescheduled preserves booking data with updated date/time; cancellation at any stage triggers next instance |
| F-05 | **Fixed cadence:** next `due_date = anchor_date + (n × frequency)`. The anchor is never mutated by completions. | P0 | Two consecutive completions produce due dates exactly one frequency apart from the anchor |
| F-06 | **Rolling cadence:** next `due_date = completion_date + frequency`. On cancellation, user is prompted to reschedule from: `due_date` (missed this cycle) or `today` (reset the clock). | P0 | Rolling next date uses actual completion date; cancellation prompt works for both choices |
| F-07 | Booking an Appointment instance captures: provider/who-with, date & time, location (optional), confirmation reference (optional), notes (optional). | P0 | All fields stored; booked instance shows date/time and provider in Tasks list |
| F-08 | Completing an Appointment instance prompts the user to log the outcome as a History entry in the source module. | P1 | Completion modal offers "Log to history" with pre-populated fields (date, type, entity); user can skip |
| F-09 | **One-off tasks** can be created from the Tasks module with no parent template: label, type (Simple / Appointment), due date, assigned-to member, notes. No recurrence. | P0 | One-off task behaves identically to a template-generated instance but has no next-instance logic |
| F-10 | A template can be **deactivated** (paused) or **deleted**. Deactivating stops new instances spawning; existing active instances are unaffected. Deleting also removes all future instances (completed instances are retained for history). | P1 | Deactivated template produces no new instances; completed history is preserved |

---

## 5.1 User Stories

| # | As a… | I want to… | So that… |
|---|-------|-----------|---------|
| US-01 | Household Owner | define an MOT renewal template on my car with "yearly, fixed cadence, 8 weeks lead time" | I see the task in my list at the right time without setting it up every year |
| US-02 | Adult Member | see my boiler service instance move to "Needs Booking" 1 month before it's due | I have enough time to arrange the appointment before it becomes overdue |
| US-03 | Adult Member | book an appointment and record who I booked with and the confirmation reference | I have all the details in one place and don't need to check my email |
| US-04 | Adult Member | complete an appointment and be prompted to log the outcome to history | the history record is created automatically rather than needing a separate manual step |
| US-05 | Adult Member | cancel a rolling-cadence task and choose whether to reschedule from the due date or today | the next instance is correct whether I missed a cycle or deliberately reset the schedule |
| US-06 | Adult Member | create a one-off task for something that isn't a recurring obligation | I can manage ad hoc work from the same Tasks module without cluttering my templates |
| US-07 | Household Owner | deactivate a template when I sell a car | the sold car's tasks stop appearing without losing the service history |

---

## 6. Non-functional requirements

| # | Requirement | Target |
|---|-------------|--------|
| NF-01 | Performance | Instance list loads in < 500 ms at P95 for a household with up to 50 active instances |
| NF-02 | Accessibility | WCAG 2.1 AA for all interactive elements (state transitions, booking form, completion modal) |
| NF-03 | Data retention | Completed and cancelled instances retained indefinitely (history trail); deleted templates do not purge completed instances |
| NF-04 | Privacy enforcement | `visible_to` enforced server-side via RLS; Tasks module never returns instances the requesting member cannot see |
| NF-05 | Consistency | Instance generation is idempotent — running the lazy check multiple times on the same day never creates duplicate instances |

---

## 7. User flows (required)

### Happy path — Template creation (in a module, e.g. Cars Key Dates)

1. User opens a Key Date row (e.g. MOT expiry) and selects Edit, or clicks "+ Add key date".
2. Form captures: label, frequency, cadence mode (Fixed / Rolling), anchor date, lead time, instance type (Simple / Appointment), `visible_to`.
3. On save, template is written to the module's `task_templates` table with `next_due` calculated from anchor + frequency.
4. No instance is created yet — lazy generation picks it up when lead time is crossed.

### Happy path — Simple instance (e.g. "Renew road tax")

1. System detects `today ≥ next_due − lead_time` → creates instance with status `created`.
2. Instance appears in Tasks module under the appropriate time-horizon group (Today / This Week / This Month).
3. User ticks it complete → status → `completed`. Completion timestamp recorded. (There is no snooze — overdue tasks remain visible until manually resolved or cancelled.)
4. System calculates next `due_date` (fixed: original anchor + n; rolling: today + frequency) and stores on template as `next_due`. New instance will be generated lazily at the next lead-time crossing.

### Happy path — Appointment instance (e.g. "MOT")

1. Instance spawns as `created` → appears in Tasks as "Needs Booking".
2. User taps "Book" → booking form: provider, date & time, location, confirmation ref, notes → status → `booked`.
3. Booked instance moves into the correct time-horizon group by booked date. A fixed 1-day pre-appointment signal surfaces it in Today the day before (not configurable).
4. After the appointment, user marks `completed` → completion modal prompts: "Log this to Car History?" with pre-filled fields. User confirms or skips.
5. Next instance scheduled per cadence rules.

### Rescheduled appointment flow

1. Booked instance: user selects "Reschedule" → updates date/time (and optionally provider/notes) → status → `rescheduled`, then back to `booked` with the new date.
2. History of the reschedule is retained on the instance record (original booked date preserved as `originally_booked_for`).

### Cancellation flow (rolling cadence)

1. User cancels an instance (from any non-terminal state).
2. If template cadence is **rolling**: prompt "Reset schedule from: [Due date — {date}] or [Today — {today}]". User selects one.
3. System sets `next_due = chosen_date + frequency`. Instance → `cancelled`.
4. If template cadence is **fixed**: no prompt needed — next instance due date is always anchor-based.

### Error / edge paths

- **Instance already overdue when first seen:** status shown as `overdue` in the Tasks list (due_date has passed, status still `created`). No automatic cancellation — user resolves manually.
- **Template deactivated while an instance is active:** existing instance remains and must be resolved (completed or cancelled) before the template's deactivation takes full effect.
- **Duplicate generation guard:** before spawning, check for any non-terminal instance with the same `template_id` and `cycle_due_date`. If one exists, skip.
- **Lead time auto-reset on frequency change:** when the user changes a template's frequency, lead time auto-resets to the default for the new frequency (per ADR-011). A warning is shown if the previous lead time exceeded the new maximum.

---

## 8. Data model

### `task_templates`

| Field | Description | Required? | Notes |
|-------|-------------|-----------|-------|
| `id` | UUID primary key | Yes | |
| `account_id` | Tenant scoping | Yes | FK → `accounts` |
| `source_module` | Module that owns this template | Yes | e.g. `cars`, `home`, `pets`, `health`, `finance` |
| `entity_id` | ID of the owning entity | Yes | e.g. vehicle ID, property ID, pet ID, member ID |
| `label` | Display name | Yes | e.g. "MOT renewal" |
| `instance_type` | Type of task to generate | Yes | Enum: `simple` \| `appointment` |
| `frequency` | Recurrence period | Yes | Enum: `weekly` \| `every_2_weeks` \| `monthly` \| `quarterly` \| `half_yearly` \| `9_months` \| `yearly` \| `18_months` \| `2_years` \| `3_years` |
| `cadence_mode` | How next due date is calculated | Yes | Enum: `fixed` \| `rolling` |
| `anchor_date` | First / reference due date | Yes | Date; for fixed cadence, all future dates derive from this |
| `lead_time_days` | Days before `next_due` to surface the instance | Yes | Integer; must be ≥ 1 and ≤ max per ADR-011 |
| `next_due` | Computed next due date | Yes | Recalculated on each terminal state; null if template is deactivated |
| `assigned_to` | Default assignee for generated instances | No | FK → `members`; null means unassigned. Inherited by each instance at spawn time. Changing this field only affects future instances — existing instances are not updated. |
| `visible_to` | Visibility tier | Yes | Enum: `self` \| `hmg` \| `family` \| `individual`; inherits module default |
| `visible_to_members` | Explicit member list | No | Used when `visible_to = individual` |
| `is_active` | Whether the template is generating instances | Yes | Default `true`; set `false` to deactivate |
| `created_by` | Member who created the template | Yes | FK → `members` |
| `created_at` | Creation timestamp | Yes | |
| `updated_at` | Last modified timestamp | Yes | |

### `task_instances`

| Field | Description | Required? | Notes |
|-------|-------------|-----------|-------|
| `id` | UUID primary key | Yes | |
| `account_id` | Tenant scoping | Yes | FK → `accounts` |
| `template_id` | Parent template | No | Null for one-off tasks |
| `cycle_due_date` | The due date this instance was generated for | Yes | Used as duplicate-guard key with `template_id` |
| `instance_type` | Copied from template at spawn time | Yes | `simple` \| `appointment` |
| `label` | Display label | Yes | Copied from template or user-entered for one-off |
| `status` | Current lifecycle state | Yes | See state machines below |
| `source_module` | Copied from template | No | Null for one-off |
| `entity_id` | Copied from template | No | Null for one-off |
| `assigned_to` | Member responsible for this instance | No | Inherited from `task_templates.assigned_to` at spawn time. User can reassign the instance to any member; this does not affect the template or future instances. |
| `visible_to` | Inherited from template | Yes | |
| `visible_to_members` | Inherited from template | No | |
| `due_date` | Actionable due date (same as `cycle_due_date` at spawn; may be updated on reschedule) | Yes | |
| `booked_with` | Provider / who-with (Appointment only) | No | |
| `booked_date` | Confirmed appointment date & time | No | |
| `booked_location` | Location (Appointment only) | No | |
| `confirmation_ref` | Booking reference (Appointment only) | No | |
| `originally_booked_for` | Original booked date before any reschedule | No | Preserved on reschedule |
| `notes` | Free-text notes | No | |
| `completed_at` | Timestamp of completion | No | |
| `cancelled_at` | Timestamp of cancellation | No | |
| `rolling_reschedule_from` | User's cancellation reschedule choice | No | `due_date` \| `today`; only relevant for rolling cadence templates |
| `history_logged` | Whether a history entry was created on completion | No | Boolean; for Appointment type |
| `is_one_off` | True for tasks with no parent template | Yes | Default `false` |
| `created_at` | Spawn timestamp | Yes | |
| `updated_at` | Last modified | Yes | |

### Status enums

**Simple instance:** `created` · `completed` · `cancelled`  
**Appointment instance:** `created` · `booked` · `rescheduled` · `completed` · `cancelled`

`overdue` is a **derived display state** (`status = created` AND `due_date < today`) — not stored as a DB status value.

---

## 9. UI / UX considerations

### Module view (Key Dates panels)

Each module's Key Dates panel is the **template management surface**. It shows the recurring schedule definition alongside the current status badge (derived from whether an active instance exists and its state). Edit modifies the template. "+ Reminder" / "+ Add" spawns the template and optionally forces an early instance. The Key Dates panel always shows `next_due` from the template — it is visible regardless of whether an instance is currently live.

### Tasks module view

The Tasks module is the **sole instance management surface**. It aggregates all active instances across all modules and all entities in the household. Per-module Key Dates panels are read-only status displays — all instance state transitions (Book, Complete, Reschedule, Cancel) happen exclusively in the Tasks module. Groups are by time horizon (Today / This Week / This Month / Next Month / Overdue) based on the instance's `due_date`. Module and entity labels provide context ("MOT · Honda Civic", "Boiler service · 12 Oak Lane").

**Simple instance actions:** Complete · Cancel.  
**Appointment instance actions:** Book (→ booking form) · Reschedule (if booked) · Complete · Cancel.

### Booking form (Appointment type)

Shown inline or as a modal when the user taps "Book". Fields: Who with (text), Date & time (datetime picker), Location (optional text), Confirmation ref (optional text), Notes (optional textarea). Compact design — max 5 fields visible without scrolling.

### Completion prompt (Appointment type)

After marking complete, a lightweight prompt: "Log this to [Module] history? [Yes, log it] [Skip]". Pre-fills: date (today), event type (derived from template label), entity (from template entity). User can edit before confirming.

### Empty state

When no instances are active across any module, Tasks shows: "All clear — nothing due. Your next tasks will appear here when they're due." (with the lead time in context: "Your next task is due in 6 weeks.")

---

## 10. Integration points & platform constraints

| Integration | Availability | Notes |
|-------------|-------------|-------|
| Push / email notifications at lead time | Phase 2 | Notification triggered when instance is spawned; governed by ADR-007 |
| Day-before appointment reminder | Phase 2 | Fixed 1-day pre-appointment signal; not configurable |
| History write-back | Phase 1 | Each module exposes a `POST /history` endpoint; Task Engine calls it on appointment completion when user confirms |
| Module template APIs | Phase 1 | Each module provides `GET /task-templates?entity_id=…` and `POST/PATCH /task-templates`; Tasks module queries a unified `GET /task-instances` endpoint |

---

## 11. Success metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Template adoption | ≥ 70% of households with a vehicle or property have ≥ 1 active template within 30 days of activation | Template count per account in analytics |
| Instance completion rate | ≥ 65% of spawned instances reach `completed` (vs languishing or being cancelled) | Instance status distribution |
| History write-back take-up | ≥ 50% of completed Appointment instances result in a history entry | `history_logged = true` ratio on completed appointments |
| Overdue rate | < 20% of instances reach overdue state | Instances where `due_date < today` and `status = created` |

---

## 12. Definition of done

- [ ] All P0 functional requirements implemented and tested
- [ ] Template CRUD API for all Phase 1 source modules (Cars, Home, Pets, Health)
- [ ] Lazy instance generation runs on login and on a daily scheduled job
- [ ] Duplicate generation guard verified with integration tests
- [ ] Both state machines (Simple and Appointment) covered by unit tests
- [ ] History write-back integration tested against at least one module (Cars)
- [ ] `visible_to` enforcement verified with RLS integration tests for all five roles
- [ ] One-off task creation and lifecycle tested end-to-end
- [ ] Empty state and overdue display reviewed at 375 px viewport
- [ ] WCAG 2.1 AA verified for booking form and completion modal

---

## 13. Open questions

All open questions resolved 2026-06-01.

| # | Question | Decision |
|---|----------|----------|
| Q-01 | Snooze behaviour | **No snooze.** Overdue instances stay visible in the list until the user manually completes or cancels them. No deferral mechanism. |
| Q-02 | Overdue auto-escalation | **Manual resolution only.** Instances that go overdue are never auto-cancelled. They remain in the Overdue group until the user acts. |
| Q-03 | Instance assignment | **Template sets the default; instance is reassignable.** `task_templates.assigned_to` is inherited by the instance at spawn time. The user can then reassign the instance to any household member. Reassigning an instance does not mutate the template — future instances continue to inherit the template's assigned-to value unless the template itself is edited. |

---

## 14. Revision history

| Version | Date | Author | Summary of changes |
|---------|------|--------|-------------------|
| 0.1 | 2026-06-01 18:02 | Dip | Initial draft — captures all decisions from design session: two-layer model, lazy generation, fixed/rolling cadence, simple/appointment state machines, one-off tasks, history write-back |
| 0.2 | 2026-06-01 18:18 | Dip | Resolved all three open questions: no snooze; overdue = manual resolution only; instance assignment inherited from template, reassignable per-instance without mutating template. Added `assigned_to` to `task_templates` schema. |
