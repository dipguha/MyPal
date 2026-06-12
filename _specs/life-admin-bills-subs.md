# Life Admin — Bills & Subscriptions

## 1. Overview

**Feature name:** Life Admin — Bills & Subscriptions
**Module / nav location:** Life Admin → Bills & Subs
**Author:** Chandradip Guha
**Status:** Draft
**Last updated:** 2026-05-19

### Problem statement
Families juggle a mix of recurring bills (mortgage, utilities, council tax) and
subscriptions (streaming, gym, apps) across multiple providers. Without a single
view, payments get missed, unused subscriptions go unnoticed, and there is no
sense of total monthly outgoings. A dedicated Bills & Subs tab in Life Admin
solves this by capturing every recurring cost in one place.

### User-facing goal
As a family admin, I want to see all my household bills and subscriptions in one
place so that I never miss a payment and always know my total monthly spend.

---

## 2. Scope

### In scope
- A **Bills & Subs** tab in Life Admin with two sections: **Bills** and **Subscriptions**.
- Add, view, edit, and delete bills and subscriptions.
- Mark a bill as paid — records a payment and advances the next due date.
- Due-soon / overdue badges on bill rows.
- "Unused X weeks" badge on subscriptions where `last_used_at` is stale.
- Monthly total summary in the Subscriptions section header.
- Inactive toggle — archive without deleting.
- Payment history per bill (last paid date visible on the row; full history in modal).
- Fixed category lists for bills and subscriptions with a free-text fallback.
- Account-scoped — visible to all family members.

### Out of scope
- Automatic payment detection (bank feed integration) — Phase 2.
- Push / email due-date alerts — handled by the Reminders feature.
- Budget planning or expense tracking (separate Finance module).
- Direct debit / bank account linking.
- Multi-currency conversion (store in GBP; currency field kept for future use).
- Mobile native (web only for Phase 1).

### Phasing
| Phase | What ships | When |
|-------|-----------|------|
| Phase 1 | Web MVP — CRUD, mark-as-paid, due badges, unused badge, monthly total | Launch |
| Phase 2 | Reminders integration (auto-create reminder from bill due date), Today screen surface, AI unused-subscription nudges | Post-launch |

---

## 3. Users & personas

| Persona | Description | Primary need from this feature |
|---------|-------------|-------------------------------|
| Family admin | Household organiser managing all finances | See every bill/subscription, track what's paid, spot unused waste |
| Family member | Adult with shared household visibility | Know what bills are due this month without asking |
| Budget-conscious user | Wants to reduce monthly outgoings | See total spend and identify subscriptions to cancel |

---

## 4. Functional requirements

Priority key: **P0** = must have at launch · **P1** = should have · **P2** = nice to have

| # | Requirement | Priority | Acceptance criteria |
|---|-------------|----------|---------------------|
| F-01 | View all active bills in "Bills This Month" and all active subscriptions in a "Subscriptions" card — compact rows with icon, name, amount, paid status, and due-date badge | P0 | Both sections render; paid bills show a green dot; unpaid show an amber dot |
| F-02 | Add a bill via quick-add (name + amount, Enter to create) or detailed modal (name, category, amount, frequency, next due date, provider, auto-pay toggle) | P0 | Bill appears in list immediately; toast "Bill added" |
| F-03 | Add a subscription via quick-add or modal (name, category, amount, billing cycle, next renewal date, provider URL) | P0 | Subscription appears in list; monthly total updates |
| F-04 | Mark a bill as paid — records the payment with date and optional amount, advances `next_due_date` by the bill's frequency | P0 | Row shows green dot and "Paid" state; next due date advances correctly |
| F-05 | Edit or delete a bill / subscription via a details modal | P0 | Saves changes; delete soft-deletes (row removed from active list); confirm prompt before delete |
| F-06 | Monthly total shown in Subscriptions section header (sum of active subscriptions normalised to per-month cost) | P1 | Total updates when a subscription is added / edited / deleted; weekly billed items show ×4.33, annually ÷12 |
| F-07 | Due-soon badge on bill rows: amber "Due {date}" when due within 7 days; rose "Overdue" when past due | P1 | Badges appear on correct rows; absent when paid or due > 7 days away |
| F-08 | "Unused X wks" badge on subscriptions where `last_used_at` is ≥ 4 weeks ago or null with subscription age ≥ 4 weeks | P1 | Badge appears on stale subscriptions; absent when recently used |
| F-09 | Inactive toggle in the details modal — archives a bill/subscription (hides from active list; accessible via a collapsed "Inactive" section). Inactive status is always set manually by the user; the system never changes it automatically, except that a `one_off` bill becomes inactive after the user marks it as paid | P1 | Toggling inactive hides the row; toggling back restores it; one_off bills auto-archive only after user-triggered "Mark as paid" |
| F-10 | Payment history for a bill — last paid date visible on the row; full history (date, amount, method) shown in the modal | P2 | Modal shows a payment log; most recent payment date shown in the row's meta strip |

---

## 4.1 User Stories

| # | As a… | I want to… | So that… |
|---|-------|-----------|---------|
| 1 | Family admin | See all my bills and subscriptions in one place | I know which are paid and which are coming up |
| 2 | Family admin | Add a new bill quickly by typing its name and amount | I can capture it without interrupting my flow |
| 3 | Family admin | Mark a bill as paid with one tap | I can track payments and advance the next due date automatically |
| 4 | Family admin | See which subscriptions I haven't used recently | I can decide whether to cancel them and save money |
| 5 | Family admin | See my total subscription spend per month | I understand my committed monthly outgoings at a glance |
| 6 | Family member | See upcoming due-date highlights on bill rows | I don't miss a payment even if I'm not the one who set it up |
| 7 | Family admin | Edit or delete a bill or subscription | I can keep the list accurate as providers or amounts change |
| 8 | Family admin | Archive a cancelled bill without deleting the history | My records stay complete but the active list stays clean |
| 9 | Family admin | View the payment history for a bill | I can confirm when I last paid and how much |
| 10 | Family member | Add any custom name for a bill or subscription | I'm not limited to a fixed list of services |

---

## 5. Non-functional requirements

| # | Requirement | Target |
|---|-------------|--------|
| NF-01 | Performance | Both sections render in < 500ms for up to 100 bills and 50 subscriptions |
| NF-02 | Accessibility | WCAG 2.1 AA — keyboard navigation across rows; modal traps focus |
| NF-03 | Data retention | Soft-delete (`deleted_at`); inactive records retained indefinitely |
| NF-04 | RLS | Bills and subscriptions are account-scoped; no cross-account reads |
| NF-05 | Currency | All amounts stored and displayed in GBP (£) for Phase 1 |

---

## 6. User flows

### Happy path — Add a bill
1. User opens **Life Admin → Bills & Subs**.
2. Two cards: "Bills This Month" and "Subscriptions".
3. User types "Electricity" and an amount into the Bills quick-add input and presses Enter.
4. Row appears with category auto-detected as "Electricity", frequency defaulting to "monthly",
   next due date defaulting to the first of next month.
5. Toast: "Bill added". User clicks the row to set the exact due date and provider.

### Happy path — Mark a bill as paid
1. "Council Tax — Due 25 May" row shows an amber due badge and amber dot.
2. User clicks the row → modal opens showing payment details.
3. User clicks "Mark as paid" → confirms amount (pre-filled from bill amount).
4. Row updates: green dot, "Paid" label, next due date advances by +1 month.
5. Payment recorded in history.

### Happy path — Spot an unused subscription
1. "Duolingo — Unused 6 wks" shows a rose badge in the Subscriptions card.
2. User opens the modal → sees last used date and cost.
3. User toggles "Inactive" to archive it.
4. Row disappears from active list; monthly total decreases.

### Error / edge paths
- **Duplicate bill name:** allowed — no uniqueness constraint on name. User is responsible for deduplication.
- **Mark paid on auto-pay bill:** allowed — same flow; records the payment even if `auto_pay = true`.
- **Frequency = one_off after marking paid:** next due date is not advanced; row is set to Inactive as a direct result of the user's "Mark as paid" action (not a background process).
- **Subscription with no `last_used_at`:** treated as "unused since creation" — badge appears after 4 weeks from `created_at`.

---

## 7. Data model

The tables already exist in the baseline schema. No new tables required for Phase 1.

### bills
| Field | Description | Required? | Notes |
|-------|-------------|-----------|-------|
| `id` | UUID PK | Yes | |
| `account_id` | Owning account | Yes | RLS scope |
| `name` | Bill name | Yes | Max 200 chars |
| `category` | Fixed category or free text | No | Mortgage, Rent, Water, Gas, Electricity, Phone, Internet, Council Tax, Insurance, Other |
| `amount` | Regular payment amount | Yes | NUMERIC(10,2) |
| `currency` | ISO currency code | Yes | Default GBP |
| `frequency` | Payment cadence | Yes | one_off / weekly / monthly / quarterly / annually |
| `due_day` | Day of month/week the bill is typically due | No | 1–31 for monthly; 0–6 for weekly |
| `next_due_date` | Next payment due date | No | Advances after each "mark as paid" |
| `auto_pay` | Whether this is paid automatically | Yes | Default false |
| `provider` | Provider name | No | Max 150 chars |
| `account_number` | Account / reference number | No | Max 100 chars |
| `notes` | Free text | No | |
| `active` | Whether the bill is currently active | Yes | Default true; false = archived |
| `created_at`, `updated_at`, `deleted_at` | Timestamps | Yes | Soft-delete |

### bill_payments
| Field | Description | Required? | Notes |
|-------|-------------|-----------|-------|
| `id` | UUID PK | Yes | |
| `bill_id` | FK → bills | Yes | |
| `member_id` | Who recorded the payment | No | SET NULL on member delete |
| `amount_paid` | Actual amount paid | Yes | May differ from bill.amount |
| `paid_at` | Timestamp | Yes | Default NOW() |
| `payment_method` | e.g. direct debit, bank transfer | No | |
| `reference` | Payment reference | No | |
| `notes` | Free text | No | |

### subscriptions
| Field | Description | Required? | Notes |
|-------|-------------|-----------|-------|
| `id` | UUID PK | Yes | |
| `account_id` | Owning account | Yes | RLS scope |
| `name` | Subscription name | Yes | Max 200 chars |
| `category` | Category | No | Streaming, Music, Shopping, Fitness, Education, Productivity, Gaming, Other |
| `amount` | Regular cost | Yes | NUMERIC(10,2) |
| `currency` | ISO currency code | Yes | Default GBP |
| `billing_cycle` | Cadence | Yes | weekly / monthly / annually |
| `next_renewal` | Next renewal date | No | |
| `last_used_at` | Last time this service was actively used | No | Drives unused badge |
| `provider_url` | Service URL | No | |
| `notes` | Free text | No | |
| `active` | Whether the subscription is active | Yes | Default true |
| `created_at`, `updated_at`, `deleted_at` | Timestamps | Yes | Soft-delete |

---

## 8. UI / UX considerations

The Bills & Subs tab mirrors the visual style of the To-Dos and Reminders tabs:
two **Card** components stacked vertically, each with a compact single-line row
per entry.

**Bills card** — header "💳 Bills This Month":
- Each row: emoji icon (by category) · name (flex-1, truncate) · optional due-date badge
  (amber "Due {DD Mon}" within 7 days; rose "Overdue" if past) · amount (right-aligned,
  bold if unpaid, muted if paid) · status dot (sage = paid; amber = due soon; rose = overdue).
- Hover: reveal edit (pencil) and "Mark paid" (✓) affordances.
- Footer: `+ Add bill` quick-add input.

**Subscriptions card** — header "🔄 Subscriptions" with right-aligned monthly total:
- Each row: emoji icon · name · optional "Unused X wks" badge (rose tint) · monthly
  amount (right-aligned, muted text).
- Hover: reveal edit affordance.
- Footer: `+ Add subscription` quick-add input.

**Details Modal** (shared between Bills and Subscriptions, field set differs by type):
- White/light surface — same FIELD and LABEL styling as `TaskDetailsModal`.
- Bill fields: Name, Category, Provider, Amount, Frequency, Next due date, Due day,
  Auto-pay toggle, Account number, Notes, Active toggle, Payment history log.
- Subscription fields: Name, Category, Provider URL, Amount, Billing cycle,
  Next renewal, Last used date, Notes, Active toggle.
- Footer: Save / Cancel / Delete (with confirmation).

Inactive records shown in a collapsible "Inactive" section below the active card,
dim and without due-date badges.

Mobile: single-column stack; modal becomes bottom sheet on narrow viewports.

---

## 9. Integration points & platform constraints

| Integration | Availability | Notes |
|-------------|-------------|-------|
| Reminders (`reminders` table) | Web ✓ (Phase 2) | Bills with `next_due_date` can auto-create a linked reminder with configurable lead time |
| Today screen — priorities | Web ✓ (Phase 2) | Overdue bills could surface as high-priority today items |
| Finance module (budgets, expenses) | Future | Bills feed into budget calculations once that module ships |
| Bank feed / Open Banking | — | Out of scope for Phase 1 |

---

## 10. Success metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Bills created per active account | ≥ 4 bills added within 7 days of feature launch | `COUNT(*) FROM bills WHERE account_id = ...` |
| Mark-paid rate | ≥ 60% of bills with a `next_due_date` in the past have a matching `bill_payment` | Cross-join query |
| Subscription capture rate | ≥ 3 subscriptions added per account within first week | `COUNT(*) FROM subscriptions` |
| Monthly total visibility | Users who view the Subscriptions total at least once per week | Frontend analytics |

---

## 11. Open questions

- [x] Should "Mark as paid" on an `auto_pay = true` bill still be user-triggered, or should it be auto-completed when the due date passes? — **User-triggered only.**
- [x] Should inactive bills/subscriptions show a total of what was being spent? — **Yes** — show a muted "was £X/mo" summary in the Inactive section header.
- [x] Category icons — use a fixed emoji map or allow the user to pick? — **Fixed emoji map.**
- [x] Should bills with `frequency = one_off` automatically become inactive after payment? — **Yes** — as a direct result of the user's "Mark as paid" action (not a background scheduler).
- [x] Phase 2 trigger: when a bill's `next_due_date` is set, should it auto-create a Reminder or only offer to? — **Auto-create a linked Reminder** (Phase 2).

---

## 12. Revision history

| Version | Date | Author | Summary of changes |
|---------|------|--------|-------------------|
| 0.1 | 2026-05-19 | Chandradip Guha | Initial draft |
| 0.2 | 2026-05-19 | Chandradip Guha | Clarified inactive is manual-only; closed open questions |
