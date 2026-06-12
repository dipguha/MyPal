# Design Brief: Key Dates Module
**Area:** Life Admin
**Module:** Key Events
**Status:** Ready for prototype
**Date:** 2026-06-02
**Author:** Cowork (from design conversation with Dip)
**ADRs:** ADR-013, ADR-014

---

## 1. Purpose

Key Dates is the fifth tab in Life Admin. It serves two roles:

1. **Aggregator** — a single screen showing all recurring events across every module (Home, Cars, Pet Care, Health, Recipes & Groceries). Users see everything in one place without navigating module by module.
2. **Owner** — exclusively owns "Others" routines: recurring events with no module home (e.g. monthly budget review, annual tax return, weekly family briefing).

---

## 2. What changes elsewhere

### 2.1 Life Admin SUBNAV

Old: `["Tasks", "Household Info", "Documents", "Cars & Home", "Pet Care"]`
New: `["Tasks", "Key Dates", "Household Info", "Documents", "Cars & Home", "Pet Care"]`

### 2.2 "Manage Routines" removed from Tasks

The Recurring section inside the Tasks module is removed. Tasks is strictly a one-off surface. Users who want to manage recurring patterns go to Key Events.

### 2.3 "Key Dates" → "Key Dates" rename inside modules

The GroupHeader label currently used inside Home, Cars, and Pet Care is **"📅 Key Events"**. This must be renamed to **"📅 Key Dates"** in all three modules to avoid naming collision with the standalone module.

**Rationale:** Key Dates = specific scheduled points in time for an asset (MOT due 15 Jun, insurance renewal 10 Apr). Key Events = the recurring patterns that generate those dates.

### 2.4 MOD_AC entry

Add `["Life Admin", "keyevents", "Key Dates", "📅", false, {Owner:"Manage", Admin:"Manage", Adult:"Edit", Teen:"View", Child:"None"}]` to MOD_AC.

---

## 3. Key Dates module — screen design

### 3.1 Header controls

**ForPicker** — inline, top of screen. Options: Own | HMG | Family | All.
Standard ForPicker inline layout from CLAUDE.md design system.

**Module filter chips** — horizontal scrollable row below ForPicker:
`All | 🏠 Home | 🚗 Cars | 🐾 Pet Care | 🩺 Health | 🍽️ Recipes | 📦 Others`

Active chip: `background: T.teal, color: "#fff"`. Inactive: `background: "transparent", color: T.textS`. Same chip style as category filter chips used in History sections.

### 3.2 Grouping

Primary grouping: **by owning module**. Each module is a GroupHeader with the module name, count of routines, and the module's accent colour.

| Module | Accent | Behaviour |
|---|---|---|
| 🏠 Home | T.teal | Read-only |
| 🚗 Cars | T.amber | Read-only |
| 🐾 Pet Care | T.lime | Read-only |
| 🩺 Health | T.rose | Read-only |
| 🍽️ Recipes & Groceries | T.sage | Read-only |
| 📦 Others | T.violet | Full CRUD |

GroupHeaders collapsed by default (same pattern as Cars & Home, Pet Care).

### 3.3 Routine row — read-only (module-owned)

Uses **WrapRow + DataRow** pattern.

**Left side:**
- Line 1: title — `fontSize:13, fontWeight:500, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"`
- Line 2: `For [assignee]` + `By [creator]` — DataRow For/By pattern

**Right side** (DataRow right, items separated by `sep`):
- Frequency label (e.g. "Yearly") — `fontSize:11, color:T.textS`
- Next due date — `fontSize:11, color:T.textS` (amber/rose tint if due soon/overdue)
- Status badge — Up to date / Due soon / Overdue / In progress
- "View in Tasks →" button — only when active instance exists (`fontSize:9.5, color:T.teal`)
- "Manage in [Module] →" text link — `fontSize:11, color:T.textS, fontStyle:"italic"` — navigates to owning module

**No edit or delete actions on read-only rows.** A subtle 🔒 icon or "Read only" label on the row group header communicates this.

### 3.4 Routine row — editable (Others)

Same WrapRow + DataRow structure as read-only rows.

**Right side additions:**
- Edit button (pencil icon or `btn-sm`) — opens Edit Routine modal
- Delete button (🗑 or `btn-sm` danger) — with confirmation

No "Manage in →" link (Others has no owning module).

### 3.5 Status badge colours

Reuse HP_STATUS pattern already in Cars & Home and Pet Care:

| Status | Background | Text |
|---|---|---|
| Up to date | T.sageS | T.sage |
| Due soon | T.amberS | T.amber |
| Overdue | T.roseS | T.rose |
| In progress | T.tealS | T.teal |

### 3.6 Others section — add routine

Full-width `+ Add routine` button at the bottom of the Others GroupHeader body.

Opens **Add Routine modal** (see section 4).

The Others section also shows a count badge in its GroupHeader. When empty, shows a gentle empty state: *"No household routines yet. Add one to track recurring events that don't belong to a specific module."*

---

## 4. Add Routine modal (Others only)

Standard `modalShell` + `fldLbl` + `fldInp` pattern.

**Fields:**

| Field | Type | Notes |
|---|---|---|
| Routine name | text input | Required |
| Frequency | select (FreqLeadPair left) | Standard 10-option frequency list |
| Lead time | select (FreqLeadPair right) | Auto-defaults from frequency; KE_LEAD_MAX enforced |
| Next due date | date input (DateField) | Anchor date |
| ForVisPair | two-column grid | For + Visible to |
| Notes (optional) | textarea | Any context |

Uses **FreqLeadPair** and **ForVisPair** exactly as defined in CLAUDE.md.

No "module" field — the module is always "Others" for items created here.

---

## 5. Routine row mock data (for prototype)

### Home (read-only)
| Routine | Frequency | Status | Next due |
|---|---|---|---|
| Boiler annual service | Yearly | Overdue | 01-Nov-2025 |
| Home insurance renewal | Yearly | Due soon | 10-Apr-2026 |
| Gas safety certificate | Yearly | Overdue | 15-Nov-2025 |
| Mortgage deal expiry | One-off | Overdue | 01-Apr-2026 |
| EPC certificate expiry | — | Up to date | 2032 |

### Cars (read-only)
| Routine | Frequency | Status | Next due |
|---|---|---|---|
| MOT — Honda Civic | Yearly | Up to date | 15-Jun-2026 |
| Car insurance — Honda Civic | Yearly | Due soon | 01-Aug-2026 |
| Annual service — VW Touran | Yearly | Up to date | 01-Sep-2026 |

### Pet Care (read-only)
| Routine | Frequency | Status | Next due |
|---|---|---|---|
| Annual booster — Buddy | Yearly | Up to date | 01-Apr-2027 |
| Flea treatment — Buddy | Monthly | Due soon | 01-May-2025 |
| Pet insurance renewal — Buddy | Yearly | Up to date | 01-Mar-2026 |
| Annual booster — Whiskers | Yearly | Up to date | 15-Aug-2026 |

### Health (read-only)
| Routine | Frequency | Status | Next due |
|---|---|---|---|
| Annual health check — James | Yearly | Up to date | 01-Mar-2027 |
| Dental check — Family | Every 6 months | Due soon | 01-Jun-2026 |

### Others (editable, full CRUD)
| Routine | Frequency | Status | Next due |
|---|---|---|---|
| Monthly budget review | Monthly | Up to date | 01-Jun-2026 |
| Annual tax return | Yearly | Up to date | 31-Jan-2027 |
| Weekly family briefing | Weekly | Up to date | 26-May-2026 |
| Fortnightly bin collection | Every 2 Weeks | Up to date | 28-May-2026 |
| Monthly family meeting | Monthly | Up to date | 01-Jun-2026 |

---

## 6. Interaction notes

- **"Manage in [Module] →"** — tapping navigates to the owning module tab (e.g. Cars & Home, Pet Care) and scrolls/opens the Key Dates section for that asset. In the prototype this can be a visual-only label; in production it's a router push.
- **"View in Tasks →"** — only shown when `hasInstance: true` on a routine. Navigates to the Tasks module filtered to show that active instance.
- **Module filter** — selecting a module chip hides all other GroupHeaders. "All" shows everything.
- **ForPicker** — filters routines by visibility/assignee scope, same as all other Life Admin tabs.
- **GroupHeaders collapsed by default** — user expands modules they care about.

---

## 7. What this replaces / supersedes

- `todoData[sec].recurring` data in the prototype — the Recurring section in Tasks is removed; this data moves to Key Events
- "Manage Routines" section heading in Tasks prototype JSX
- "Key Dates" GroupHeader labels in Home, Cars & Home, Pet Care — rename to "Key Dates"

---

## 8. Open questions (Phase 2)

- **Sorting within module groups** — by status (Overdue first) or by next due date? Recommend status-first, then date.
- **Cross-module routine** — a routine that spans multiple modules (e.g. annual review of all insurance policies across Home + Cars + Pet Care). Phase 2 consideration; not in scope for Phase 1.
- **System-generated "In progress" state** — automatic instance creation (lazy generation per ADR-012) is Phase 2. Phase 1: "In progress" state is set manually via "Create task →" button in the owning module's Key Dates section.
