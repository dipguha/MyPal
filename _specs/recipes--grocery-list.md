# Grocery List

> Generated from feature design session in Cowork — 2026-05-29  
> Template: `.claude/commands/references/feature_spec_template.md`

---

## 1. Overview (required)

**Feature name:** Grocery List  
**Module / nav location:** Recipes & Groceries → Grocery List  
**Author:** Dip  
**Status:** Draft  
**Last updated:** 2026-05-29 15:50 UTC

### Problem statement
Families who plan meals still face friction at the shops — manually transcribing ingredients from multiple recipes, duplicating items, and forgetting what they already have at home. Without a consolidated, categorised list tied to the meal plan, shopping is inefficient and incomplete.

### User-facing goal
As a household Owner or Admin, I want a grocery list generated automatically from my meal plan — consolidated, categorised, and easy to work through in the shop — so that I can get the weekly shop done quickly without missing anything or buying duplicates.

---

## 2. Scope (required)

### In scope
- Generate a grocery list from the active meal plan; ingredients consolidated across recipes with provenance (which recipe each item came from)
- Items grouped by category: Produce · Dairy & Eggs · Meat & Fish · Pantry & Dry · Bakery · Other
- Collapsible category groups
- Compact single-line item rows: checkbox · name · quantity · recipe source(s)
- Tick to mark an item as bought; Remove to mark as not buying this trip; both resolve the item
- Undo available on ticked and removed items
- 🧺 button on each needed item to move it straight to the pantry section (no modal)
- Pantry layer (Model B): items remembered as "already in pantry" from previous lists; excluded from active shopping; shown in a collapsed "Already in pantry" section; "Need it" button moves them back to the active list
- Summary bar: total items · needed · got it · estimated spend (£)
- Filter chips: All · Needed · Got it
- "Got it" view groups ticked items and removed items separately, each with Undo
- Share actions: Email · WhatsApp · Copy link · Print / PDF
- Add item manually via modal with name, quantity, unit, and category picker
- Edit any item via modal (tap row body): name, quantity, unit, category
- Completion state when all items are ticked or removed → celebratory moment → saved to Past Lists
- Past Lists history: expandable rows showing item-level detail; Completed vs Abandoned status
- Generate from Meal Planner: if an open list exists → Replace or Add to it modal; manually-added items always preserved
- Shop online Phase 2 placeholder (Tesco · Sainsbury's · Asda)

### Out of scope
- Persistent pantry inventory / dedicated pantry management screen (Phase 2)
- Real product matching and live pricing (Phase 2 — supermarket API)
- Basket handoff to supermarket checkout (Phase 2)
- Push or email notifications when a list is generated
- Sharing a list with someone outside the account
- Per-item cost tracking in Phase 1 (estimated total is static/manual)
- Barcode scanning

### Dependencies
- `_specs/recipes--meal-planner.md` — "Generate grocery list" hands off the active week's plan
- `_specs/recipes--library.md` — recipe ingredient data is the source for list generation
- `_specs/platform--access-control.md` — role-based access rules

### Phasing
| Phase | What ships | When |
|-------|-----------|------|
| Phase 1 | Full list management: generate, consolidate, categorise, tick/remove, pantry layer, manual add/edit, share, completion state, past lists history | Web launch |
| Phase 2 | Product matching to real supermarket SKUs, live pricing, basket handoff (deep link or API), full persistent pantry inventory | Post-launch |

---

## 3. Users & personas (required)

| Persona | Description | Primary need from this feature |
|---------|-------------|-------------------------------|
| Owner / Admin | Plans meals and does the weekly shop | Generate, manage, and complete the grocery list; share it before heading to the shops |
| Adult Member | May do the shop on behalf of the household | View and work through the list in the shop; tick items off; add ad-hoc items |
| Teenager | Occasionally shops or adds items | Add items they need; view the list |
| Children | Youngest members | View only |

---

## 4. Roles & access (required)

> Role definitions: `_specs/platform--access-control.md`

| Capability | Owner | Admin | Adult Member | Teenager | Children |
|------------|:-----:|:-----:|:------------:|:--------:|:--------:|
| View grocery list | ✓ | ✓ | ✓ | ✓ | ✓ |
| Tick / remove items | ✓ | ✓ | ✓ | ✓ | ✗ |
| Add items manually | ✓ | ✓ | ✓ | ✓ | ✗ |
| Edit items | ✓ | ✓ | ✓ | ✗ | ✗ |
| Generate / replace list from meal plan | ✓ | ✓ | ✓ | ✗ | ✗ |
| Move items to / from pantry | ✓ | ✓ | ✓ | ✗ | ✗ |
| Share list | ✓ | ✓ | ✓ | ✗ | ✗ |
| View past lists | ✓ | ✓ | ✓ | ✗ | ✗ |

---

## 5. Functional requirements (required)

Priority key: **P0** = must have at launch · **P1** = should have · **P2** = nice to have

| # | Requirement | Priority | Acceptance criteria |
|---|-------------|----------|---------------------|
| F-01 | Generate a grocery list from the active meal plan; ingredients consolidated across recipes (e.g. onions across 3 recipes = one line item with combined quantity); each item shows recipe source(s) | P0 | Generated list contains one row per unique ingredient; quantity is the sum across all recipes using that ingredient; sources list all contributing recipe names |
| F-02 | Items grouped by category (Produce · Dairy & Eggs · Meat & Fish · Pantry & Dry · Bakery · Other); groups are collapsible | P0 | Each item appears in exactly one group; tapping the group header collapses/expands it; collapsed state persists within the session |
| F-03 | Tick an item (checkbox) to mark it as bought; Remove button to mark as not buying this trip; both count as resolved; Undo reverses either action | P0 | Ticking moves item to Got it with green checkbox; Remove moves item to Got it with amber minus; Undo restores item to needed state; all transitions immediate |
| F-04 | Summary bar shows: total items · needed · got it · estimated spend (£); updates as items are resolved | P0 | Counts reflect current state; estimated spend is static in Phase 1 |
| F-05 | Filter chips (All · Needed · Got it) filter the displayed items; Got it view groups ticked and removed items in separate sub-groups each with Undo | P0 | Switching filter updates the list immediately; Got it shows two sub-groups when both ticked and removed items exist |
| F-06 | 🧺 button on each needed item row moves the item directly to the pantry section without opening a modal; pantry section is collapsed by default; "Need it" moves the item back to the active list | P1 | Tapping 🧺 removes item from active list and adds it to pantry section immediately; no modal shown; pantry section auto-expands when an item is added; tapping "Need it" reverses the move |
| F-07 | Pantry layer remembers items marked as pantry from the previous list and pre-populates them on the next generated list; user can move them back to active with "Need it" | P1 | Items previously pantry-marked appear in the pantry section on next generation; they do not appear in the active needed list |
| F-08 | Manual add via modal: name (required), quantity, unit, category (required — no default); item added to the correct category group | P0 | Add button disabled until name and category are filled; item appears in the correct category immediately on save |
| F-09 | Edit any item via modal (tap row body): name, quantity, unit, category; save updates item in place | P1 | Changes reflected immediately; category change moves item to the correct group |
| F-10 | When "Generate grocery list" is tapped in Meal Planner and an open list exists: prompt user to Replace or Add to it; Replace archives the current list as Abandoned; Add to it merges new items in, preserving existing checked-off items and manually-added items | P0 | Replace: current list saved to Past Lists as Abandoned; new list opens. Add to it: net-new items appended; no duplicates; checked and manually-added items untouched |
| F-11 | When all items are ticked or removed: completion moment shown; list saved to Past Lists as Completed with item count and estimated spend; "Start new list" CTA resets to a fresh list | P0 | Completion state triggers only when active (non-pantry) items are all resolved; past list entry created with correct status, count, and spend |
| F-12 | Past Lists history: each entry shows week, item count, spend, and status (Completed / Abandoned); tapping an entry expands it to show item-level detail (read-only) | P1 | Expanding shows at least the first 5 items with tick/removed status; remaining count shown; abandoned lists show explanatory note |
| F-13 | Share actions: Email · WhatsApp · Copy link · Print / PDF; accessible from the active list at any time | P1 | Share modal opens; each option triggers the correct OS share intent or generates a PDF; list content reflects current filter state (all items unless "Needed" filter is active) |

---

## 5.1 User Stories

| # | As a… | I want to… | So that… |
|---|-------|-----------|---------|
| US-01 | Owner | Generate a grocery list from this week's meal plan | I don't have to manually write out every ingredient |
| US-02 | Owner | See ingredients consolidated across recipes | I buy 3 onions once instead of separate entries for each recipe |
| US-03 | Adult Member | Tick items off as I put them in my trolley | I can see at a glance what I still need to find |
| US-04 | Adult Member | Remove an item I've decided not to buy | The list stays accurate without me having to undo a tick |
| US-05 | Owner | Mark items I already have at home as pantry items | They don't appear on my shopping list next time |
| US-06 | Owner | Add a item that isn't from the meal plan | I can pick up extra things without keeping a separate list |
| US-07 | Owner | Share the list before heading to the shops | A family member can do the shop from their phone |
| US-08 | Owner | See past lists | I can track roughly how much we spend each week and reuse a previous list if needed |
| US-09 | Owner | Update the meal plan mid-week and merge new ingredients into my open list | I don't lose what I've already ticked off |

---

## 6. Non-functional requirements

| # | Requirement | Target |
|---|-------------|--------|
| NF-01 | Performance | List generation and display < 500ms; item state updates (tick, remove, pantry) immediate (optimistic UI) |
| NF-02 | Accessibility | WCAG 2.1 AA; checkboxes and buttons have accessible labels; colour coding supplemented by text/icon (not colour alone) |
| NF-03 | Data retention | Active list retained until replaced or completed; past lists retained indefinitely (or until user deletes) |
| NF-04 | Privacy enforcement | List data scoped to account; access rules enforced server-side |
| NF-05 | Offline behaviour | Phase 1: requires connectivity; Phase 2: consider offline tick-off with sync on reconnect |

---

## 7. User flows (required)

### Happy path — Generate from meal plan (no existing list)
1. User is in Meal Planner with a planned week → taps "Generate grocery list"
2. System consolidates ingredients from all planned recipes, deduplicates, groups by category
3. Grocery List module opens showing the new active list
4. User works through the list in the shop, ticking items as they go
5. All items resolved → completion state shown → list saved to Past Lists as Completed

### Happy path — Generate with existing open list
1. User taps "Generate grocery list" from Meal Planner
2. System detects an open list with unresolved items → modal shown: "You have X items still needed"
3. User taps "Add to it" → new items merged in; existing ticked and manual items preserved
4. User continues shopping on the updated list

### Happy path — Manual add
1. User taps "+ Add item" → modal opens
2. User enters name, quantity, unit; selects category
3. Taps "Add" → item appears in the correct category group immediately

### Happy path — Pantry
1. User sees an item they already have at home → taps 🧺 on the row
2. Item moves instantly to the collapsed "Already in pantry" section
3. Next time a list is generated, that item is pre-populated in pantry and excluded from active needed items
4. If they run out, user taps "Need it" → item returns to active list

### Error / edge paths
- **Meal plan is empty when "Generate grocery list" is tapped:** System generates an empty list with a prompt to plan some meals first, and a shortcut back to the Meal Planner
- **All items already pantry — list appears empty:** Empty state explains that all items are in the pantry section; pantry section expanded by default in this case
- **User taps Replace in the generate modal:** Current list archived as Abandoned with note "Replaced before completion"; new list opens fresh
- **User closes app mid-shop:** List state persists server-side; resuming the session restores all tick/remove state

---

## 8. Data model

| Field | Description | Required? | Notes |
|-------|-------------|-----------|-------|
| `account_id` | Owning account | Yes | All list data scoped per account |
| `list_id` | Unique identifier for a list instance | Yes | |
| `week_start_date` | ISO date of the Monday the list was generated for | No | Null for manually created lists |
| `status` | active / completed / abandoned | Yes | |
| `created_at` | Timestamp list was generated or created | Yes | |
| `completed_at` | Timestamp list reached completed/abandoned status | No | |
| `item_id` | Unique identifier for a list item | Yes | |
| `name` | Item name | Yes | |
| `quantity` | Numeric quantity | No | |
| `unit` | Unit string (e.g. g, pints, cans) | No | |
| `category` | One of: Produce / Dairy & Eggs / Meat & Fish / Pantry & Dry / Bakery / Other | Yes | |
| `recipe_sources` | Array of recipe names/IDs this item was consolidated from | No | Empty for manually-added items |
| `state` | needed / done / removed / pantry | Yes | |
| `manual` | Boolean — true if user-added, not from meal plan | Yes | |
| `pantry_remembered` | Boolean — whether this item should be pre-pantried on next generation | Yes | Defaults false; set true when user taps 🧺 |
| `estimated_spend` | Static estimated total for the list in GBP | No | Phase 1: stored as entered; Phase 2: derived from real prices |

---

## 9. UI / UX considerations

The list is the primary interface — it should feel like a fast, frictionless shopping companion. Every interaction (tick, remove, pantry move) must be immediate with no loading state.

**Item rows** are compact single-line: `[checkbox] name · qty · source(s) [🧺] [Remove]`. The checkbox is the primary action — large enough to tap accurately with one hand. The 🧺 and Remove buttons are secondary, smaller, on the trailing edge. On resolved items (ticked or removed), both secondary buttons are replaced by a single blue Undo button.

**Row background** uses the card surface (white in light mode, lightest card in dark mode), contrasting against the module background. This makes the list feel like a document rather than a flat data dump.

**Category headers** are compact uppercase labels with a done/total counter and a collapse chevron. Collapsed by default only for the pantry section — all shopping categories are expanded on load.

**Got it view** (filter chip) shows two sub-groups: ticked items (green checkbox) and removed items (amber minus checkbox). Both have Undo. This lets the user see a clear picture of what was and wasn't purchased.

**Completion moment** is a light celebration — confetti or a simple 🎉 — not over-engineered. The primary CTA is "Start new list" not a detailed summary.

**Past Lists** are read-only and expandable. Each row shows week, item count, spend, and a Completed (green) or Abandoned (grey) badge. Expanding reveals per-item rows with tick/removed icons and a "+ N more items" footer.

**Modals** (Add item, Edit item, Replace/Merge, Share) follow the existing modal pattern in the app: dark overlay, rounded card, close button top-right. Add and Edit modals include a 3×2 category grid so the user picks a category visually rather than from a dropdown.

**Empty state:** No list generated yet → prompt to go to Meal Planner to generate one, with a shortcut button.

UI reference: `_UI/ui_working/mypal-app-working.jsx` → `RecipesScreen()` → `"Grocery List"` view

---

## 10. Integration points & platform constraints

| Integration | Availability | Notes |
|-------------|-------------|-------|
| Meal Planner module | Phase 1 | "Generate grocery list" passes the active week's plan; replace/merge logic handled in Grocery List |
| Library module | Phase 1 | Recipe ingredient data used for list generation and provenance labels |
| Today Briefing | Phase 2 | Optionally surface "your grocery list is ready" in the morning briefing |
| Supermarket APIs (Tesco / Sainsbury's / Asda) | Phase 2 | Product matching, live pricing, basket handoff; placeholder shown in Phase 1 |
| OS share sheet (Email / WhatsApp / PDF) | Phase 1 | Standard Web Share API for Email and WhatsApp; PDF via browser print dialog |

---

## 11. Success metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| List generation rate | ≥ 60% of accounts with a planned week generate a grocery list | Event: `grocery_list_generated` |
| List completion rate | ≥ 50% of generated lists reach Completed status | Status transition: active → completed |
| Pantry adoption | ≥ 30% of active list users mark at least one item as pantry within 4 weeks | Event: `item_moved_to_pantry` |
| Manual add usage | ≥ 40% of lists have at least one manually-added item | Field: `manual = true` on at least one item per list |

---

## 12. Definition of done

- [ ] All P0 functional requirements implemented and tested
- [ ] Access rules enforced server-side for all five roles
- [ ] Empty state handled: no list, empty list, all-pantry list
- [ ] Optimistic UI for tick/remove/pantry — no loading spinner on state changes
- [ ] Generate modal (replace/merge) shown correctly when open list exists
- [ ] Completion state triggers correctly; past list entry created with correct status
- [ ] Add and Edit modals validate required fields (name, category)
- [ ] Share modal triggers correct OS share intent for each option
- [ ] Mobile layout reviewed at 375px; rows remain single-line and tappable
- [ ] WCAG 2.1 AA verified for all interactive elements
- [ ] Open questions resolved or deferred with a decision recorded

---

## 13. Open questions

- [ ] Estimated spend calculation — Phase 1 is static (entered manually or left as a default). Is there a sensible default or formula to show before Phase 2 real pricing? — Dip · default £100.
- [ ] Past Lists retention policy — how many weeks of history to retain? 8–12 weeks suggested. — Dip - 8 weeks
- [ ] Pantry memory scope — is pantry state per-account (shared across all family members) or per-user? — Dip - per account

---

## 14. Revision history

| Version | Date | Author | Summary of changes |
|---------|------|--------|-------------------|
| 0.1 | 2026-05-29 15:50 UTC | Dip | Initial draft — full design confirmed in Cowork session 2026-05-29 |
