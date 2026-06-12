# Life Admin — To-Dos

## Overview

The **Life Admin → To-Dos** screen lets a family member capture, organise, and complete the running list of tasks that keep the household moving — bills, appointments, errands, school admin, life chores. Tasks are grouped into three time-bucket lists (**Today**, **This Week**, **Later**) so the user can focus on what matters now without losing sight of what's coming. Adding a task is friction-free (title only); editing is rich (full description, date/time, assignee). Completed tasks linger in their list until their due date passes so the user can review what they got done, then drop off the visible list and into an archive.

---

## Goals

- Give every family member a single place to capture and act on to-dos.
- Make task creation a one-line affair so nothing is lost to friction.
- Group tasks by relevance window — **Today**, **This Week**, **Later** — so the user always sees the right horizon.
- Allow rich editing (description, date/time, assignee, priority, category) in a dedicated modal when a user wants to add detail.
- Preserve completion history in an audit/archive trail so the user can look back at what they got done.
- Keep the visible list tidy by auto-archiving completed tasks once their due date is past.

## Non-Goals

- Subtasks, dependencies, or task hierarchies.
- Recurring tasks — covered by the separate **Reminders** feature.
- File attachments on tasks.
- Real-time multi-user collaboration (live cursors, presence). Standard read-after-write consistency is sufficient.
- Mobile native to-dos — this spec covers the web (Next.js BFF) experience.
- Notifications / reminders — out of scope; covered by a future notifications feature.

---

## User Stories

| # | As a… | I want to… | So that… |
|---|-------|-----------|---------|
| 1 | Family member | See my to-dos grouped into Today, This Week, and Later | I can focus on the right horizon |
| 2 | Family member | Add a task by typing a short title only | I can capture things instantly without breaking flow |
| 3 | Family member | Tick off a task | I can mark it done and feel progress |
| 4 | Family member | See completed tasks stay visible until their due date passes | I can review what I got done today/this week |
| 5 | Family member | Remove a task I no longer need | The list stays accurate |
| 6 | Family member | Click a task to open it and edit description, date/time, assignee, priority, and category | I can add context when the task needs it |
| 7 | Family admin | Assign a task to another family member | We can share household work |
| 8 | Family member | See a compact card showing description prominently, with due date, assignee, priority, and category in small text | The list is scannable |
| 9 | Family member | Have completed/overdue tasks auto-archive | The list stays focused on what's still relevant |
| 10 | Family member | See in **Today** any to-do whose due date is today, including ones I originally placed in **This Week** or **Later** | Tasks "graduate" into Today automatically as their due date arrives |

---

## Functional Requirements

### Lists

- The screen shows three lists in vertical order, in this sequence:
  1. **Today**
  2. **This Week**
  3. **Later**
- Each list has a header showing its name and the count of currently visible items (e.g. `Today (4)`).
- Each list has its own **+ Add task** input row at the bottom.
- A list with no items shows a brief empty-state message (e.g. `No tasks for today — nice.`).
- The membership of each list is **computed from the task's due date**, not stored as a separate list assignment:
  - **Today** — due date is today (or, if the task is completed, due date is today and not yet past midnight).
  - **This Week** — due date is between tomorrow and the upcoming Sunday inclusive.
  - **Later** — due date is from next Monday onward (or has no specific date but is flagged "Later").
- The user-perceived "current day" follows the user's local timezone.

### Task Card (Compact View)

Each task in a list renders as a single-line compact row to maximise the
number of tasks visible at once:
- A **checkbox** on the left.
- The **description / title** as the primary, prominent text. Truncates on
  overflow with a hover tooltip showing the full title.
- A right-aligned meta-strip on the **same line** as the title, in smaller,
  muted text, containing in order:
  - **Due date** (e.g. `Today`, `Tue 19 May`, `Mon 26 May`).
  - **Assignee** (e.g. `James`).
  - **Priority** (`Low` · `Normal` · `High`) — only shown when not `Normal`.
  - **Category** pill (e.g. `Personal`, `Work`, `Birthday`, `Party`, `Bills`,
    `School`, `Health`, `Home`) with a category-coloured background.
- A small **delete** affordance (`×` icon) visible on hover.
- A completed task shows the title struck through and the checkbox filled.

### Creating a Task (Quick Add)

- The **+ Add task** row at the bottom of each list is a single-line input plus a confirm action (Enter key or button).
- Typing a title and pressing Enter creates a task with these defaults:
  - **Title** = the typed string (max 200 chars).
  - **Due date** depends on which list the input was used in:
    - **Today** → today's date.
    - **This Week** → tomorrow's date (if tomorrow is past Sunday, defaults to today's date instead, since the list would be empty otherwise).
    - **Later** → next Monday's date (the Monday at least 7 days out from today).
  - **Time** = unspecified (no time component) — task is treated as "any time on the due date".
  - **Assignee** = the current user (logged-in member).
  - **Priority** = `Normal`.
  - **Category** = `Personal`.
  - **Description** = empty.
- After creation, the input clears and the new task appears in the relevant list (which may not be the one the user typed it in — e.g. a "Today" task created from the "This Week" input still appears under **Today** because the due date governs membership).
- A short toast confirms creation (e.g. `Task added`).

### Editing a Task (Full Modal)

- Clicking anywhere on a task card (other than the checkbox or delete affordance) opens the **Task Details Modal**.
- The modal contains, in order:
  - **Title** — single-line text input (required, max 200 chars).
  - **Description** — multi-line textarea (optional, max 2000 chars).
  - **Due date** — date picker (required).
  - **Due time** — optional time picker, with a "no specific time" toggle.
  - **Assignee** — dropdown of family members (max 6 from the current account).
  - **Priority** — segmented control: `Low` · `Normal` · `High`.
  - **Category** — dropdown / chip selector of pre-defined categories: `Personal`, `Work`, `Bills`, `Health`, `School`, `Home`, `Birthday`, `Party`, `Travel`, `Other`. The list of categories is fixed for v1.
- A primary **Save** button persists changes and closes the modal.
- A **Cancel** button discards changes (with a confirm prompt if the user has made changes).
- A **Delete task** button at the bottom of the modal removes the task (with a confirm prompt).
- Changes show in the list immediately on Save (optimistic update is acceptable).

### Completing a Task

- Tapping the checkbox toggles the task's completed state.
- A completed task:
  - Shows the title with strikethrough.
  - Stays visible in its current list **until its due date is past** (specifically, until the local-time end of its due date).
  - Once past due, it disappears from the visible list on the next render or refresh and is moved to the **audit table** (archive).
- Re-ticking a completed task (un-completing) is allowed while it's still visible.

### Deleting a Task

- The delete affordance on the task card removes the task immediately, with a `Task deleted — Undo` toast for ~5 seconds.
- Clicking **Undo** restores the task.
- After 5 seconds, deletion is permanent (no recovery).
- Deletion from the modal works the same way.

### Audit / Archive Behaviour

- Completed tasks that have aged past their due date are moved into an **audit table** in the database.
- This audit data is **not visible on the Life Admin To-Dos screen** in v1 — it exists for analytics, history, and potential future surfacing.
- A user-facing "Archive" or "History" view is out of scope for v1.

### List Refresh / Day Rollover

- The page should reflect "today" based on the user's current local date.
- If the user keeps the screen open across midnight, the lists should re-bucket on the next interaction (or after a periodic refresh) so that a task that *was* in This Week becomes Today.
- A simple approach is acceptable: re-compute buckets on tab focus, on visibility change, or via a soft polling tick — exact mechanism is an implementation detail.

### Permissions / Scope

- A task is **account-scoped**. Any family member of the account can see, create, edit, complete, and delete tasks in their account's list (subject to the Postgres RLS rules already defined for `todo_lists` / `todo_items`).
- An assignee can be any current member of the account.
- There are no per-task ACLs in v1.

---

## UX / UI Requirements

- Screen lives at `/life-admin` within the `(app)` route group (authenticated).
- The page shows the full Life Admin tab strip from `_UI/mypal-app.jsx`:
  `To Dos`, `Reminders`, `Finance`, `Bills & Subs`, `Documents`, `Notes`,
  `Car & Home`. In this iteration **only `To Dos` is wired**; the other six
  render a simple "Coming soon" placeholder card. Keeping the full tab strip
  visible reserves the layout and the URL shape.
- Visual reference: the `LifeAdminScreen` component in `_UI/mypal-app.jsx`.
- Design uses the existing palette tokens in `src/lib/theme.ts` — categories
  are colour-coded.
- Layout is mobile-first; lists stack vertically. On wider screens, the column
  is centred with comfortable max-width.
- The **Task Details Modal uses a light (white) surface** intentionally — the
  rest of the app is dark, so the modal stands out as a "focused workspace"
  with strong contrast on inputs, selects, and the active priority pill.
- Empty states are friendly and brief.
- Use frontend-design skill for the visual implementation.
- Provide a clear loading state on first render and on any persistence call.

---

## Error States

| Scenario | Behaviour |
|---|---|
| Quick-add input is empty on Enter | No-op; the row stays focused |
| Quick-add input exceeds 200 chars | Block the keystroke past 200 and show a small inline hint |
| Save fails (network/server) | Toast: `Couldn't save — try again`. Local changes revert. |
| Delete fails (network/server) | Toast: `Couldn't delete — try again`. Task remains in the list. |
| Loading the list fails | Show a retry button with the message `Couldn't load your tasks` |
| Assignee no longer in the account (edge case) | Show the task as `Unassigned` and let the user pick a new assignee in the modal |
| Tick-off persistence fails | Revert the checkbox state and show a toast |

---

## Out of Scope

- Recurring / repeating tasks.
- Subtasks / dependencies between tasks.
- File or photo attachments.
- Comments / chat threads on a task.
- Cross-account or shared-with-friends tasks.
- Notifications / push reminders.
- A user-facing archive / history view.
- Bulk operations (multi-select, bulk delete, bulk reassign).
- Drag-and-drop reordering within a list (sort is by due date then created time).
- Manual list assignment that disagrees with the due date (the due date is the source of truth).

---

## Open Questions

1. Should completed tasks within a list be visually grouped at the bottom of that list, or interleaved by due date with the rest? — *Resolved during implementation: interleaved by due date.*
2. What's the desired sort order within a list — due date ascending, priority then due date, or created-time? — *Resolved: due date ascending, then created-time ascending.*
3. Should the user be able to add a **custom** category, or is the fixed v1 list of categories sufficient for now? — *Deferred: fixed list of 10 in v1.*
4. What's the desired retention policy for the audit table (e.g. keep forever, prune after 12 months)? — *Deferred: kept indefinitely in `todo_items` (filtered from the visible list once completed and past-due).*
5. Should "Later" with no specific due date be a real state (a nullable due date) or should we always require a due date and default to next Monday? — *Resolved: always require a due date; Later quick-add defaults to next Monday ≥7d out.*
6. Should we surface a **Today** count badge on the sidebar navigation entry for Life Admin? — *Deferred: easy follow-up once layout polish is done.*
7. Should ticking a task here also tick off the corresponding Priority row on the **Today** screen (and vice versa)? — *Resolved: yes, both screens share `useTodosStore` so toggles mirror across.*
8. When the user opens the Task Details Modal from the **Today** screen's priorities (future integration), should it be the same modal component, or a simplified variant? — *Deferred: plan to reuse the same component.*
