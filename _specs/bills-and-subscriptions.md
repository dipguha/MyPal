# Bills & Subscriptions

> Generated from feature design session in Cowork — 2026-05-20  
> Template: `.claude/commands/references/feature_spec_template.md`

---

## 1. Overview (required)

**Feature name:** Bills & Subscriptions  
**Module / nav location:** Life Admin → Bills & Subs  
**Author:** Dip  
**Status:** Draft  
**Last updated:** 2026-05-20

### Problem statement
Families have a mix of shared household bills and individual personal financial commitments that need tracking in one place. Without visibility of what is due, when it was last paid, and whether it has been settled this cycle, payments get missed and there is no easy way to see the total monthly outgoing picture.

### User-facing goal
As a household Owner or Admin, I want to track all bills and subscriptions — both household-shared and personal — so that I never miss a payment and always know our total monthly outgoings at a glance.

---

## 2. Scope (required)

### In scope
- Two item types: Bills (recurring fixed/variable charges) and Subscriptions (recurring digital/service memberships)
- Two visibility tiers per item: Household (visible to all members with finance access) and Personal (visible only to the creator)
- Summary card showing: Bills total/mo, Subscriptions/mo, Total outgoings/mo, Due this week count
- Bill fields: Name, Next Due Date, Amount, Last Paid, Last Used, Mark as Paid, Remove
- Subscription fields: Name, Next Due Date, Amount, Last Paid, Mark as Paid, Remove
- Due date colour coding: overdue (red), due within 7 days (amber), upcoming (muted)
- Unused subscription warning badge (e.g. "Unused 6 wks") surfaced automatically
- Mark as Paid toggle — turns green with a tick when confirmed; reverts if tapped again
- Inline quick-add row at the bottom of each section
- Date format: dd-Mon-yyyy throughout (e.g. 20-May-2026)
- Section totals (£/mo) shown in each section header

### Out of scope
- Bank account or open-banking integration (Phase 2)
- Auto-detection of subscriptions from bank statements (Phase 2)
- Recurring payment scheduling or direct debit management
- Spending analytics or budget tracking (separate Finance module)
- Splitting a bill between members
- Currency other than GBP (Phase 2)
- Attachments (e.g. PDF invoices) on bill records

### Phasing
| Phase | What ships | When |
|-------|-----------|------|
| Phase 1 | Household + Personal tiers, bill/sub tracking, Mark as Paid, summary card, inline add | Web launch |
| Phase 2 | Open banking feed, auto-subscription detection, multi-currency, invoice attachments | Post-launch |

---

## 3. Users & personas (required)

| Persona | Description | Primary need from this feature |
|---------|-------------|-------------------------------|
| Owner | Account creator; manages household finances | Full view of household and personal bills; see total outgoings |
| Admin | Co-manager (e.g. partner/spouse) | Same operational access as Owner; personal bills private from Owner |
| Adult Member (finance granted) | Adult with finance view/edit access | View household bills only; manage their own personal bills |
| Young Person / Child | Under-18 family member | No access — Finance module hidden |

---

## 4. Functional requirements (required)

Priority key: **P0** = must have at launch · **P1** = should have · **P2** = nice to have

| # | Requirement | Priority | Acceptance criteria |
|---|-------------|----------|---------------------|
| F-01 | Display Bills and Subscriptions as two separate sections within the module, each with its own column headers and inline add row | P0 | Both sections render with correct columns; Bills has Last Used column, Subscriptions does not |
| F-02 | Household / Personal tab switcher at the top of the module — Personal items are visible only to their creator | P0 | Switching tabs shows only items matching that visibility tier; other members cannot see Personal items via API or UI |
| F-03 | Summary card at top showing Bills/mo, Subscriptions/mo, Total outgoings/mo, Due this week — updates live as items change | P0 | Totals recalculate immediately when Mark as Paid or Remove is triggered; counts reflect only items visible to the current user |
| F-04 | Bills row displays: Name, Next Due Date, Amount, Last Paid, Last Used, Mark as Paid button, Remove button | P0 | All six data columns and two action columns render on a single row without wrapping |
| F-05 | Subscriptions row displays: Name, Next Due Date, Amount, Last Paid, Mark as Paid button, Remove button | P0 | All five data columns and two action columns render on a single row without wrapping |
| F-06 | Dates formatted as dd-Mon-yyyy throughout (e.g. 20-May-2026) | P0 | All date fields in both Bills and Subscriptions use this format consistently |
| F-07 | Due date colour coding: overdue = red, due within 7 days = amber, upcoming = muted grey | P0 | Colour applied to Next Due Date value only; threshold is calendar days from today |
| F-08 | Mark as Paid toggles state — turns green with tick when paid; tapping again resets to unpaid | P0 | State persists on reload; Mark as Paid and Remove buttons remain on a single line |
| F-09 | Remove deletes the item immediately with no confirmation prompt | P1 | Item removed from list immediately; soft-delete retained server-side for 30 days |
| F-10 | Unused subscription warning badge ("Unused N wks") surfaced automatically when a subscription has not been used within the last 4 weeks | P1 | Badge appears on subscription row when `last_used` is > 28 days ago; dismissed when usage is logged |

---

## 4.1 User Stories

| # | As a… | I want to… | So that… |
|---|-------|-----------|---------|
| US-01 | Owner | See all household bills and their next due dates in one place | I never miss a payment |
| US-02 | Owner | Mark a bill as paid this month | I can track what has been settled without deleting the recurring entry |
| US-03 | Admin | Keep my personal Amex bill private from the Owner | My individual financial commitments remain my own business |
| US-04 | Owner | See a summary of total monthly outgoings at a glance | I can quickly assess the household's financial commitments |
| US-05 | Admin | Add a new household subscription inline without leaving the page | I can quickly capture a new commitment as it arises |
| US-06 | Owner | See which subscriptions haven't been used recently | I can cancel ones the family no longer needs |
| US-07 | Adult Member (finance granted) | View household bills and manage my own personal ones | I can stay on top of my share without seeing others' private bills |
| US-08 | Owner | See items due this week highlighted in amber | I can prioritise payments without scanning every date |

---

## 5. Non-functional requirements

| # | Requirement | Target |
|---|-------------|--------|
| NF-01 | Performance | Bills & Subs list loads in < 500ms; Mark as Paid optimistic update appears immediately |
| NF-02 | Privacy enforcement | Personal items must be enforced server-side — API returns only items the requesting user is permitted to see; frontend hiding alone is not sufficient |
| NF-03 | Accessibility | WCAG 2.1 AA; Mark as Paid and Remove buttons have descriptive aria-labels including the item name |
| NF-04 | Data retention | Removed items soft-deleted; retained for 30 days then purged |
| NF-05 | Responsiveness | Single-row column layout on desktop (≥ 768px); stacked card layout on mobile |

---

## 6. User flows (required)

### Happy path — Mark a household bill as paid
1. Owner opens Life Admin → Bills & Subs; Household tab is active by default
2. Summary card shows 3 unpaid bills due this week highlighted in amber
3. Owner clicks "Mark paid" on Electricity row — button turns green with a tick instantly
4. Summary card updates: unpaid count decreases by 1; total outgoings unchanged

### Happy path — Add a personal subscription
1. Admin taps Personal tab
2. Scrolls to Subscriptions section, types "Audible" in the inline add field, presses Enter
3. New row appears with today's date as Last Paid, next month as Next Due, £0.00 as Amount
4. Admin edits Amount inline to £7.99
5. Item visible only to Admin; Owner's view of Personal tab does not show it

### Happy path — Spot and remove an unused subscription
1. Owner sees "Unused 6 wks" badge on Duolingo row
2. Clicks Remove — row disappears immediately
3. Subscriptions total in summary card updates

### Error / edge paths
- **Adult Member tries to access Bills & Subs via direct URL without finance grant:** API returns 403; frontend redirects to dashboard with "Ask your household admin for access"
- **Owner tries to view Admin's Personal tab items:** API returns only Owner's own Personal items — Admin's are never included in the response
- **Mark as Paid on an item that was just removed by another session:** UI shows item as gone on next refresh; no error shown to user
- **Add row submitted empty:** No item created; field shakes briefly to indicate nothing was entered

---

## 7. Data model

### `bills` table

| Field | Description | Required? | Notes |
|-------|-------------|-----------|-------|
| `id` | Unique identifier | Yes | UUID |
| `account_id` | Household account | Yes | Foreign key → accounts |
| `created_by` | Member who created the item | Yes | Foreign key → members; determines Personal visibility |
| `name` | Display name of the bill | Yes | Max 100 chars |
| `next_due_date` | Next payment due date | Yes | Date; formatted dd-Mon-yyyy in UI |
| `amount` | Payment amount in GBP | Yes | Decimal(10,2) |
| `last_paid_date` | Date last marked as paid | No | Null until first Mark as Paid |
| `last_used_date` | Date the service was last used | No | Bills only; used for unused-subscription warning |
| `is_paid` | Whether paid this cycle | Yes | Boolean; default false; resets on billing cycle rollover |
| `visibility` | Who can see this item | Yes | Enum: `household`, `personal`; default `household` |
| `item_type` | Bill or subscription | Yes | Enum: `bill`, `subscription` |
| `deleted_at` | Soft-delete timestamp | No | Null = active; set on Remove |

---

## 8. UI / UX considerations

The module opens on the Household tab by default. A four-cell summary card spans the full width at the top, showing Bills/mo, Subscriptions/mo, Total outgoings/mo, and Due this week — all updating reactively as the user interacts.

Below the tab switcher, Bills and Subscriptions appear as separate cards with column headers (Name, Next Due, Amount, Last Paid, Last Used for bills; Name, Next Due, Amount, Last Paid for subscriptions) followed by item rows. The actions column (Mark as Paid + Remove) is the last column and always renders on a single line with no wrapping.

The visibility badge (Household in green, Personal in purple) sits next to the item name inline. Due date values are the only element with colour — overdue in red, within 7 days in amber, otherwise muted. The unused-subscription warning badge appears as a small red pill to the right of the subscription name.

Each section ends with an inline add row — a text input and an Add button. Submitting creates a row with sensible defaults: next month's date as Next Due, today as Last Paid, £0.00 as Amount, the current tab's visibility. The user can then edit the amount directly in the row.

On the Personal tab, a banner at the top reminds the user that these items are not visible to other household members, including the household admin.

---

## 9. Integration points & platform constraints

| Integration | Availability | Notes |
|-------------|-------------|-------|
| Row-Level Security (Postgres RLS) | Web ✓ | Personal items enforced via `created_by` = current `member_id`; `SET LOCAL app.member_id` pattern from CLAUDE.md |
| Finance access grant | Web ✓ | Module hidden for Adult Members unless `finance_access` = `view` or `edit` on their `members` row |
| Open banking / bank feed | Phase 2 | No web standard; requires third-party provider (e.g. TrueLayer) |
| Push notifications for upcoming bills | Phase 2 | Requires browser permission; planned for native app |

---

## 10. Success metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Bills entered per active household | ≥ 5 bills/subs added within 7 days of first use | Count of `bills` rows per `account_id` at day 7 |
| Mark as Paid usage | ≥ 60% of active households use Mark as Paid at least once per month | `is_paid` toggle events per account per 30-day window |
| Unused subscription warning acted on | ≥ 30% of "Unused N wks" badges result in removal within 14 days | Remove events within 14 days of badge first appearing |
| Zero privilege escalation | 0 cases of a member seeing another's Personal items | Server-side 403 rate on personal-item endpoints; security audit |

---

## 11. Open questions

- [ ] Should Mark as Paid reset automatically on the next billing cycle, or require manual reset? If auto, what triggers it — the Next Due Date rolling over?
- [ ] Should Amount be editable inline on the row, or only via a detail modal?
- [ ] Is Last Used date entered manually by the user, or derived from some usage signal?
- [ ] Should removed items be recoverable (undo toast) or silently soft-deleted?
- [ ] Do we show a combined total across Household + Personal on the summary card, or separate totals per tab?

---

## 12. Revision history

| Version | Date | Author | Summary of changes |
|---------|------|--------|-------------------|
| 0.1 | 2026-05-20 | Dip | Initial draft from Cowork design session — UI prototype, privacy model, field definitions |
