# Today — Daily Brief

## Overview

The **Today** screen is the app's home landing screen for authenticated users. It gives a family an at-a-glance view of everything that matters today — weather, commute, emails, priorities, reminders, and news — and surfaces AI-suggested actions the user can act on directly. This iteration uses mock data throughout; no live API calls are made.

---

## Goals

- Give the user a single-screen daily briefing covering key family priorities for the day.
- Allow the user to tick off priority items inline.
- Surface email highlights and allow the user to trigger an AI-drafted reply.
- Show upcoming reminders and allow the user to mark them done.
- Surface AI-suggested actions the user can approve or dismiss with one tap.
- Use mock data so the screen is fully interactive without backend integration.

## Non-Goals

- Live data from external sources (weather API, calendar feeds, email providers) — out of scope for this iteration.
- Creating, editing, or deleting tasks / reminders from this screen — managed in Life Admin.
- Push notifications — separate feature.
- Multi-member view (all data is shown for the primary / logged-in member).

---

## User Stories

| # | As a… | I want to… | So that… |
|---|-------|-----------|---------|
| 1 | Family member | See a quick briefing strip at the top of Today | I get weather, commute, email count and news at a glance |
| 2 | Family member | View and tick off today's priority items | I know what's done and what still needs attention |
| 3 | Family member | See inbox highlights with sender and subject | I can decide which emails need action without leaving the app |
| 4 | Family member | Send an AI-drafted reply to an email | I can respond quickly without composing from scratch |
| 5 | Family member | See this week's reminders | I can prepare for upcoming events |
| 6 | Family member | See AI-suggested actions and approve or dismiss them | I can let MyPal handle routine tasks with one tap |
| 7 | Family member | Switch between "Daily Briefing" and "MyPal AI" tabs | I can focus on the overview or go deeper into AI assistance |

---

## Functional Requirements

### Briefing Strip

- Displayed at the top of the Daily Briefing tab as a horizontal strip.
- Contains five fixed mock tiles:
  - **Weather** — temperature + conditions + location.
  - **Commute** — journey time + traffic alert.
  - **School run** — travel time + alert status.
  - **Inbox** — unread count + sender preview.
  - **News** — story count + category preview.
- Tapping a tile has no action in this iteration (tiles are display-only).

### Today's Priorities Card

- Lists up to 5 priority items for the day, each with:
  - An icon, description text, and a category tag (colour-coded).
  - A checkbox on the right.
- Tapping a row toggles the checkbox and applies a strikethrough style to the text.
- Items pre-marked as done in mock data render with strikethrough by default.
- No add / edit / delete in this iteration.

### Top News Card

- Lists up to 5 mock news headlines.
- Each row shows: category badge (colour-coded), headline text, and time ago.
- Rows are display-only (no tap action).

### Inbox Highlights Card

- Lists up to 5 mock email entries.
- Each row shows: unread dot (if unread), avatar emoji, sender name, subject preview, and time.
- Unread rows use bold sender name.
- Tapping an unread email row opens an **AI Reply Sheet** (bottom sheet / modal):
  - Shows sender, subject, and a mock AI-drafted reply.
  - Two buttons: **Send Reply** (dismisses with a success toast) and **Dismiss**.

### Reminders This Week Card

- Lists up to 5 mock reminders with day abbreviation, icon, label, and a colour dot.
- Display-only in this iteration.

### On This Day Card

- A small card beneath reminders showing a single mock historical fact.
- Display-only.

### Ask MyPal Banner (Daily Briefing tab)

- A persistent banner at the bottom of the Daily Briefing tab.
- Shows a mock AI insight with a **"Compare →"** primary action button and a **Dismiss** button.
- Tapping **Dismiss** hides the banner for the session.
- Tapping the primary action button shows a toast "Feature coming soon" in this iteration.

### MyPal AI Tab

- A second tab alongside "Daily Briefing".
- Contains:
  - **Good morning banner** — personalised greeting + summary of today's AI insight + **"Do it →"** button.
  - **Recipe Plan This Week card** — mock 5-day meal plan, display-only.
  - **Grocery Items for Approval card** — mock shopping list with per-item checkboxes, **Approve & order** and **Edit list** buttons (both show "Feature coming soon" toast).
  - **Suggested Actions card** — list of 4 mock AI-suggested actions, each with a **"Do it"** button that shows a success toast on tap.

---

## UX / UI Requirements

- Screen lives at `/today` within the `(app)` route group (authenticated).
- Follows the existing palette tokens in `src/lib/theme.ts` and the visual reference in `_UI/mypal-app.jsx` (`TodayScreen` component).
- Two-column grid layout (`g2`) on wider viewports; single column on mobile.
- Tab switcher at the top toggles between "Daily Briefing" and "MyPal AI".
- Use frontend-design skill for the visual implementation.
- Toasts for action feedback should auto-dismiss after 3 seconds.
- All mock data is defined in a single co-located constants file — not scattered inline.

---

## Mock Data

All data for this iteration is static and defined in the frontend. The following datasets are needed:

| Dataset | Contents |
|---------|----------|
| `briefingStrip` | 5 tiles: weather, commute, school run, inbox count, news count |
| `priorities` | 5 items with icon, text, tag, colour, and optional `done: true` |
| `newsItems` | 5 headlines with category, text, and time-ago |
| `emailHighlights` | 5 emails with avatar, sender, subject, time, and `unread` flag |
| `remindersThisWeek` | 5 reminders with day, icon, label, colour |
| `onThisDay` | 1 historical fact string |
| `aiSuggestedActions` | 5 actions with icon, text, tag, colour |
| `recipePlan` | 5 days × meal name |
| `groceryItems` | 5 items with icon, name, and `checked` flag |

---

## Error States

| Scenario | Behaviour |
|---|---|
| AI Reply Sheet — send action | Success toast: "Reply sent" (mock only, no real send) |
| Any "Do it" / action button | Success toast: "Done!" or relevant confirmation |
| "Compare →" / "Approve & order" / "Edit list" | Toast: "Feature coming soon" |

---

## Out of Scope

- Real email integration.
- Real weather, commute, or news API calls.
- Creating or editing priorities / reminders from this screen.
- Multi-member switching on this screen.
- Persistent state across page reloads (checked items reset on refresh).

---

## Open Questions

1. Should ticking a priority item on Today also update the corresponding to-do in Life Admin, or are they independent in this iteration? Update corresponding to-do in Life Admin
2. Should the "Do it →" button on the MyPal AI morning banner trigger the first suggested action automatically, or open a confirmation? Defer for now
3. Is there a preferred toast library already in the project, or should we introduce one (e.g. `react-hot-toast`)? Introduce
