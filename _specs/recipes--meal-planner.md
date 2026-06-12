# Meal Planner

> Generated from feature design session in Cowork — 2026-05-29  
> Template: `.claude/commands/references/feature_spec_template.md`

---

## 1. Overview (required)

**Feature name:** Meal Planner  
**Module / nav location:** Recipes & Groceries → Meal Planner  
**Author:** Dip  
**Status:** Draft  
**Last updated:** 2026-05-29 15:50 UTC

### Problem statement
Families spend significant time each week deciding what to eat, often repeating the same meals or failing to use the recipes they've saved. Without a visual weekly plan, meals are decided ad hoc, grocery shopping is inefficient, and dietary balance across the week is hard to track.

### User-facing goal
As a household Owner or Admin, I want to plan my family's meals for the week in one place — using saved recipes or AI suggestions — so that mealtimes are organised, shopping is straightforward, and we eat well without the daily decision overhead.

---

## 2. Scope (required)

### In scope
- 7×4 weekly grid: Monday–Sunday columns × Breakfast / Lunch / Snack / Dinner rows
- Two-week scope: This week and Next week, navigable with ← → arrows
- Both weeks pre-populated with example meal plans
- Cell colour coding: sky-blue = Library recipe · rose/pink = AI-suggested · amber/warm = quick option · empty = "+" prompt
- Meal picker — bottom sheet modal (mobile) / centred modal (desktop/tablet): search, Library section with diet dot + meal type badge, Quick options section, Clear this meal fixed footer
- Template system: save current week as a named template; load a template (overwrites whole week); copy from last week
- "Plan with AI" — 3-stage flow: input → loading → review → confirm
- "Generate grocery list" — navigates to Grocery List module
- Footer stats bar: avg kcal/day (shown only when ≥1 recipe in the plan has verified nutrition data; ÷ days with at least one meal planned) · meals planned / 28 · library recipe count
- Week navigation header shows date range of the active week
- ⋯ menu on planner header: Save this week as template / Load a template / Copy from last week

### Out of scope
- Plans beyond two weeks (Phase 2)
- Nutritional breakdown per individual meal (Nutrition module)
- Estimated grocery cost in the footer stats bar (Phase 2 — deferred pending supermarket API integration)
- Real-time grocery pricing (Phase 2 — supermarket API integration)
- Recipe detail view from within Meal Planner — tapping a cell always opens the meal picker; recipe detail is Library module only
- Push or email reminders based on the meal plan
- Sharing a plan with someone outside the account

### Dependencies
- `_specs/recipes--library.md` — recipes must exist in the Library before they appear in the meal picker
- `_specs/recipes--grocery-list.md` — "Generate grocery list" hands off the active plan to the Grocery List module
- `_specs/recipes--nutrition.md` — avg kcal/day stat pulls from nutrition data attached to Library recipes

### Phasing
| Phase | What ships | When |
|-------|-----------|------|
| Phase 1 | 7×4 grid, two-week navigation, meal picker, templates, AI meal planning flow, footer stats, grocery list handoff | Web launch |
| Phase 2 | Plans beyond two weeks, estimated grocery cost stat, real grocery pricing via supermarket API, plan sharing | Post-launch |

---

## 3. Users & personas (required)

| Persona | Description | Primary need from this feature |
|---------|-------------|-------------------------------|
| Owner / Admin | Plans meals for the household | Full plan creation and editing; AI planning; generate grocery list |
| Adult Member | Contributes to household meals | View plan; suggest or change own meals |
| Teenager | Interested in what's for dinner | View the week's plan; see upcoming meals |
| Children | Youngest members | View only — see what meals are planned |

---

## 4. Roles & access (required)

> Role definitions: `_specs/platform--access-control.md`

| Capability | Owner | Admin | Adult Member | Teenager | Children |
|------------|:-----:|:-----:|:------------:|:--------:|:--------:|
| View meal plan | ✓ | ✓ | ✓ | ✓ | ✓ |
| Add / change a meal in a cell | ✓ | ✓ | ✓ | ✗ | ✗ |
| Save / load / apply templates | ✓ | ✓ | ✗ | ✗ | ✗ |
| Copy from last week | ✓ | ✓ | ✗ | ✗ | ✗ |
| Run AI meal planning flow | ✓ | ✓ | ✗ | ✗ | ✗ |
| Generate grocery list | ✓ | ✓ | ✓ | ✗ | ✗ |

---

## 5. Functional requirements (required)

Priority key: **P0** = must have at launch · **P1** = should have · **P2** = nice to have

| # | Requirement | Priority | Acceptance criteria |
|---|-------------|----------|---------------------|
| F-01 | Display a 7×4 meal plan grid (Mon–Sun × Breakfast/Lunch/Snack/Dinner) for the active week | P0 | Grid renders all 28 cells; empty cells show a "+" prompt; filled cells show meal name colour-coded by type |
| F-02 | Support two weeks (This week / Next week) navigable via ← → arrows; week date range shown in header | P0 | Navigating updates the grid and date range label; each week's plan state is independent |
| F-03 | Meal picker opens on cell tap; shows Library recipes filtered to the cell's meal type, plus Quick options; supports free-text search across both sections | P0 | Selecting a recipe sets the cell to sky-blue (lib) or amber (qck); cell updates immediately |
| F-04 | Cell colour coding reflects meal source: sky-blue = Library · rose = AI-suggested · amber = quick option | P0 | Each cell background matches its type token; legend visible below the grid |
| F-05 | Save the current week as a named template; load a saved template (overwrites whole week); copy from last week | P1 | Templates persist in session; loading or copying replaces all 28 cells of the active week with a confirmation affordance |
| F-06 | "Plan with AI" — 3-stage flow: input preferences → loading thinking state → review AI-generated plan → confirm and apply | P0 | Each stage transitions correctly; dietary conflicts shown as amber strip; user can swap individual cells before confirming; confirmed plan overwrites the active week |
| F-07 | AI input stage includes pre-populated preference chips (selectable, append to text field) plus free-text textarea | P1 | Tapping a chip appends its text to the textarea; user can edit freely; at least one meal type must be selected to enable Generate |
| F-08 | "Generate grocery list" navigates to the Grocery List module passing the active week's plan; if an open list already exists, the Grocery List module prompts the user to Replace or Add to it | P0 | Navigation occurs; Grocery List module receives the plan data; replace/merge prompt shown when an open list exists |
| F-09 | Footer stats bar shows: avg kcal/day · meals planned / 28 · library recipe count. Avg kcal/day is hidden when no recipe in the active plan has verified nutrition data; when shown it divides total calories by days with ≥1 meal planned (not always 7) | P1 | Stats update when cells change; kcal/day is absent when no verified nutrition exists; when present uses the correct divisor |
| F-10 | "Clear this meal" always visible as a fixed footer in the meal picker when a meal is set | P1 | Button is not inside the scroll area; it is visible without scrolling; tapping it empties the cell |

---

## 5.1 User Stories

| # | As a… | I want to… | So that… |
|---|-------|-----------|---------|
| US-01 | Owner | See all meals for the week at a glance | I know what we're eating without asking everyone each evening |
| US-02 | Owner | Quickly assign a meal to a slot by picking from my recipe library | I reuse the recipes I've already saved rather than starting from scratch |
| US-03 | Owner | Let AI generate a full week's plan based on our budget and preferences | I save time on meal planning and get variety without effort |
| US-04 | Owner | Swap individual AI-suggested meals without regenerating the whole plan | I keep most of the AI's suggestions but adjust a few to our taste |
| US-05 | Owner | Save a week I'm happy with as a reusable template | I don't have to plan from scratch on weeks that follow a familiar pattern |
| US-06 | Owner | Copy last week's plan as a starting point | I make small adjustments rather than planning from zero |
| US-07 | Adult Member | Generate the grocery list from the week's plan | Shopping is based on what we've actually planned to eat |
| US-08 | Teenager | See what meals are planned for the week | I know what's for dinner and can look forward to favourites |

---

## 6. Non-functional requirements

| # | Requirement | Target |
|---|-------------|--------|
| NF-01 | Performance | Grid and meal picker load in < 500ms; AI flow thinking state shown immediately on tap |
| NF-02 | Accessibility | WCAG 2.1 AA; colour coding supplemented by text labels (not colour alone) |
| NF-03 | Data retention | Meal plans retained for current + next week; templates retained until deleted by user |
| NF-04 | Privacy enforcement | Plan data scoped to account; access rules enforced server-side |
| NF-05 | Mobile behaviour | Meal picker and all modals use bottom sheet on viewports < 640px; centred modal on ≥ 640px |

---

## 7. User flows (required)

### Happy path — Manual meal planning
1. User opens Recipes & Groceries → Meal Planner
2. Current week's grid is shown, pre-populated or partially filled
3. User taps an empty cell → meal picker opens
4. User searches or scrolls to a recipe in the Library section → taps it
5. Cell fills with the recipe name, sky-blue background
6. User repeats for other cells, then taps "Generate grocery list" to hand off to the Grocery List module

### Happy path — AI meal planning
1. User taps "Plan with AI"
2. Stage 1 (input): selects week, sets budget, picks meal types, taps preference chips and/or types free text, optionally toggles library usage
3. Taps "Generate meal plan" → Stage 1.5 (loading): thinking state shown for ~1.8s
4. Stage 2 (review): full 7×4 grid shown; dietary conflict strip shown if any conflicts; user swaps individual cells via the AI Plan Picker if needed; taps "Confirm plan"
5. Stage 3 (confirm): checkboxes for auto-generate grocery list and show in Today Briefing; taps "Apply plan"
6. Plan applied to the active week; AI-suggested new recipes saved to Library with "AI-made" badge

### Happy path — Templates
1. User has a plan they're happy with → taps ⋯ → "Save this week as template"
2. Enters a name → taps "Save template"
3. On a future week: taps ⋯ → "Load a template" → selects saved template → plan overwrites the active week

### Error / edge paths
- **No Library recipes match the cell's meal type:** Meal picker shows only Quick options; Library section is hidden
- **No meals selected in AI input stage:** Generate button is disabled
- **AI flow: dietary conflict detected:** Amber warning strip shown at top of review grid; conflict details listed per member; user can proceed or swap the conflicting meal — conflict does not block saving
- **Template applied to non-empty week:** Whole week is overwritten silently (no per-cell merge); user is informed via the load modal copy that this overwrites all meals

---

## 8. Data model

| Field | Description | Required? | Notes |
|-------|-------------|-----------|-------|
| `account_id` | Owning account | Yes | All plan data scoped per account |
| `week_start_date` | ISO date of the Monday for this week | Yes | Identifies which week the plan belongs to |
| `meal` | Meal slot: Breakfast / Lunch / Snack / Dinner | Yes | |
| `day_of_week` | Mon / Tue / Wed / Thu / Fri / Sat / Sun | Yes | |
| `recipe_id` | FK to Library recipe, if cell uses a Library recipe | No | Null if quick option or empty |
| `quick_option_label` | Text label for quick options (e.g. "Leftovers") | No | Null if Library recipe or empty |
| `source_type` | lib / ai / qck / empty | Yes | Determines cell colour coding |
| `template_id` | FK to plan template, if cell was applied from a template | No | |
| `template_name` | User-given name for a saved template | Yes (for templates) | |
| `template_created_at` | Timestamp when template was saved | Yes (for templates) | |
| `template_cells` | JSON snapshot of all 28 cells at time of save | Yes (for templates) | Stored as JSONB |

---

## 9. UI / UX considerations

The planner is a grid-first interface — the 7×4 table is the primary element and should fill available width. On mobile the grid scrolls horizontally; day column headers stay sticky. Cells are compact but tappable (minimum 44px touch target height).

**Cell states** are communicated through both background colour and a subtle border tint — never colour alone — so the layout remains readable for colour-blind users. A legend below the grid labels each colour type.

**Meal picker** is a bottom sheet on mobile (slides up, handle bar, full width) and a centred modal on tablet/desktop (max-width 480px, fully rounded). It is always grouped: Library recipes first (filtered to the cell's meal type), then Quick options. Search filters both sections simultaneously. "Clear this meal" sits in a fixed footer outside the scroll area so it is always reachable.

**AI planning flow** uses a step indicator (Preferences → AI plan → Confirm) so the user always knows where they are. The loading/thinking state is shown for a brief period to convey that AI is doing meaningful work. The review grid uses the same colour coding as the main planner so the two feel continuous.

**Templates** are accessed via a ⋯ overflow menu in the planner header rather than primary navigation — they are a power-user feature and should not clutter the main interface.

**Footer stats bar** sits below the grid and actions row. Stats are secondary information — useful but not the primary interaction target — so they use smaller typography and muted colour.

**Empty state:** A week with no meals planned shows all 28 cells as "+" prompts with a brief prompt below the grid: "Tap a cell to add a meal, or use Plan with AI to fill the week."

UI reference: `_UI/ui_working/mypal-app-working.jsx` → `RecipesScreen()` → `"Meal Planner"` view

---

## 10. Integration points & platform constraints

| Integration | Availability | Notes |
|-------------|-------------|-------|
| Library module | Phase 1 | Recipes must exist in Library to appear in the meal picker |
| Grocery List module | Phase 1 | "Generate grocery list" passes the active week plan to Grocery List |
| Today Briefing | Phase 1 | AI confirm stage offers to surface today's meals in the daily briefing |
| Nutrition module | Phase 1 | Avg kcal/day stat relies on verified nutrition data attached to Library recipes; stat hidden when none present in the active plan |
| Supermarket API (Tesco / Sainsbury's / ASDA) | Phase 2 | Real grocery pricing; est. grocery cost stat deferred to Phase 2 |
| Push notifications | Phase 2 | Meal reminders or "what's for dinner tonight" briefing |

---

## 11. Success metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Weekly active planners | ≥ 50% of active accounts have ≥ 1 meal planned per week | Backend event: `meal_plan_cell_set` |
| AI flow completion rate | ≥ 60% of users who start "Plan with AI" reach the confirm stage | Funnel: `ai_plan_started` → `ai_plan_confirmed` |
| Template usage | ≥ 20% of active planners save or load at least one template within 30 days | Event: `template_saved`, `template_loaded` |
| Grocery list handoff | ≥ 40% of weeks with a full plan result in "Generate grocery list" being tapped | Event: `grocery_list_generated` |

---

## 12. Definition of done

- [ ] All P0 functional requirements implemented and tested
- [ ] Access rules enforced server-side for all five roles
- [ ] Empty state handled (no meals planned, no library recipes)
- [ ] Mobile layout reviewed at 375px viewport; meal picker renders as bottom sheet
- [ ] Desktop layout reviewed at 1280px viewport; meal picker renders as centred modal
- [ ] Colour coding supplemented by text labels (accessible for colour-blind users)
- [ ] AI planning flow completes end-to-end with mock data
- [ ] WCAG 2.1 AA verified for all interactive elements
- [ ] Grocery List handoff tested: plan data passed correctly
- [ ] Open questions resolved or deferred with a decision recorded

---

## 13. Open questions

- [x] Kcal data source for footer stat — **Decision (2026-05-29):** Stat is hidden until at least one recipe in the active plan has verified nutrition data. When shown, divisor is days with ≥1 meal planned, not 7.
- [x] Est. grocery cost in footer — **Decision (2026-05-29):** Deferred to Phase 2. Not shown in Phase 1.
- [x] Pantry tracker interaction — **Decision (2026-05-29):** Pantry state is owned entirely by the Grocery List module. Meal Planner has no awareness of pantry — it passes the full ingredient list to Grocery List, which applies the pantry filter on its side.

---

## 14. Revision history

| Version | Date | Author | Summary of changes |
|---------|------|--------|-------------------|
| 0.1 | 2026-05-29 13:44 UTC | Dip | Initial draft — full design confirmed in Cowork session 2026-05-29 |
| 0.2 | 2026-05-29 14:26 UTC | Dip | Resolved open questions: kcal/day stat hidden until verified nutrition present; est. grocery cost deferred to Phase 2. Updated scope, F-09, phasing, and integrations accordingly. |
| 0.3 | 2026-05-29 15:50 UTC | Dip | Resolved pantry open question: pantry state owned by Grocery List, not Meal Planner. Updated F-08 to clarify replace/merge behaviour on grocery list generation. |
