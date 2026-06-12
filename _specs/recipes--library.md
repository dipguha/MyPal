# Spec: Recipes & Groceries — Library

## 1. Overview

**Feature name:** Recipe Library  
**Module / nav location:** Recipes & Groceries → Library  
**Author:** Dip  
**Status:** Draft  
**Last updated:** 2026-05-28 08:05 UTC

### Problem statement
Families cook the same meals repeatedly but have no central, organised place to store them. Recipes live in browser bookmarks, handwritten notes, and memory — making it hard to plan meals, track what works, and involve everyone in the household. The Library gives families a single, searchable recipe store that combines a curated starter set with their own recipes and AI-generated ones.

### User-facing goal
As a family member, I want a searchable, organised recipe library so that I can quickly find meals I know work for my family, save new ones, and have a reliable source to pull from when planning the week.

---

## 2. Scope

### In scope
- Browsing and searching a recipe library (predefined MyPal recipes + user's own + AI-generated)
- Compact recipe card list with diet indicator, meal type badges, cuisine, tags, and source badge
- Filtering by source (All / My recipes / AI-made) and meal type (All / Breakfast / Lunch / Dinner / Snack)
- Recipe detail / edit modal: view full recipe, edit tags and personal notes (My recipes and AI-made only)
- Forking a predefined recipe into "My recipe" with a confirmation step
- Adding a new recipe manually via Add Recipe modal (name, diet, meal types, cuisine, cook time, serves, ingredients, method, tags, personal notes)
- Starring / favouriting recipes
- AI recipe creation flow ("Create with AI") — ingredients-based generation, with serving size selector and family dietary flag auto-loading (see Flow section)
- AI-generated recipes saved with permanent "AI-made" badge
- Suggested tags for quick-add when editing or adding recipes
- Taxonomy: four independent dimensions — Meal type (Breakfast/Lunch/Dinner/Snack), Cuisine, Diet (Non-veg/Veg/Vegan), Tags (free labels)

### Out of scope
- URL import / recipe scraping (Phase 2)
- Nutrition calculation from recipe ingredients (Library → Nutrition flow — separate spec)
- Supermarket / shopping list integration (Grocery List module — separate spec)
- Barcode scanning for ingredients
- AI recipe creation flow — ingredients input, generation, confirm & save (Phase 2)
- Recipe admin screen for managing the predefined recipe library (Phase 2)
- Recipe sharing with other families or public sharing
- Recipe ratings or commenting by family members
- Meal Planner integration (Meal Planner module — separate spec)

### Dependencies
- `_specs/recipes--meal-planner.md` — Library is the recipe source for meal planning (not yet written)
- `_specs/recipes--nutrition.md` — Nutrition calculation flow reads recipes from Library (not yet written)
- MyPal AI / Claude integration — required for AI recipe creation flow
- Family profile / member dietary flags — AI flow auto-loads dietary restrictions from profile

### Phasing

| Phase | What ships | When |
|-------|-----------|------|
| Phase 1 | Recipe list, search, filter, fork, Add Recipe modal, edit modal (name / tags / notes), starring, predefined seed data (10 recipes). "Create with AI" button visible but disabled with tooltip "Coming in a future update". | Launch |
| Phase 2 | Full AI recipe creation flow — 3-stage: Input (ingredient chips + free-text + meal type + serving count) → Review (dietary strip, editable name, AI est. pills, ingredients, method) → Confirm (name, meal types, cuisine, serves). Enables the "Create with AI" button. | Post-launch |
| Phase 3 | URL import / recipe scraping from web links | Post-launch |

---

## 3. Users & personas

| Persona | Description | Primary need from this feature |
|---------|-------------|-------------------------------|
| Primary cook (Owner/Admin) | Sets up the household, does most cooking and meal planning | Save, organise, and quickly retrieve family-tested recipes; build library over time |
| Secondary cook (Adult Member) | Cooks occasionally, less likely to manage the library | Find a recipe quickly, use AI to generate something from available ingredients |
| Teenager | May cook for themselves | Browse and find quick/easy recipes; use AI suggestions |
| Child | Unlikely to use directly | View recipes assigned to them in Meal Planner context (out of scope for Library itself) |

---

## 4. Roles & access

All recipes are family-shared by default. Any member who can access the Library can see every recipe in the account's library, regardless of who created it. There is no per-recipe visibility control. "Created by" and "updated by" are tracked for attribution and edit/delete scoping.

| Capability | Owner | Admin | Adult Member | Teenager | Child |
|------------|:-----:|:-----:|:------------:|:--------:|:-----:|
| View all recipes in Library | ✓ | ✓ | ✓ | ✓ | ✗ |
| Search and filter | ✓ | ✓ | ✓ | ✓ | ✗ |
| Add recipe manually | ✓ | ✓ | ✓ | ✓ | ✗ |
| Create recipe via AI | ✓ | ✓ | ✓ | ✓ | ✗ |
| Fork predefined recipe | ✓ | ✓ | ✓ | ✓ | ✗ |
| Edit any field (incl. notes) on own recipes | ✓ | ✓ | Own only | Own only | ✗ |
| Edit any field (incl. notes) on others' recipes | ✓ | ✓ | ✗ | ✗ | ✗ |
| Delete own recipes | ✓ | ✓ | Own only | Own only | ✗ |
| Delete others' recipes | ✓ | ✓ | ✗ | ✗ | ✗ |
| Star / favourite | ✓ | ✓ | ✓ | ✓ | ✗ |

Predefined recipes (src = `predefined`) are read-only for all roles. They can be forked into a family copy (`src = mine`) and then edited by anyone with edit rights.

Personal notes are visible to all family members who can view the recipe. Only the recipe creator (or Owner/Admin) can edit the notes field.

---

## 5. Functional requirements

| # | Requirement | Priority | Acceptance criteria |
|---|-------------|----------|---------------------|
| F-01 | The Library displays all recipes (predefined + mine + AI-made) as a compact, scrollable list | P0 | List renders with diet dot, recipe name, meal type badge(s), cuisine tag, up to one custom tag, source badge, and star. No item wraps to a second line at 375px+ viewport |
| F-02 | Recipes can be filtered by source (All / My recipes / AI-made) and by meal type (All / Breakfast / Lunch / Dinner / Snack); filters are combinable | P0 | Selecting a source filter and a meal type filter simultaneously returns the correct intersection |
| F-03 | A search box filters the list by recipe name and cuisine in real time | P0 | Typing returns matching results within 300 ms; empty state shown when no matches |
| F-04 | Tapping a predefined recipe shows a fork confirmation modal before opening the edit view | P0 | User sees "Save a copy to My recipes?" dialog; confirming opens the edit modal with the name pre-populated and editable; cancelling closes with no change |
| F-05 | Tapping a My recipe or AI-made recipe opens the recipe detail/edit modal | P0 | Modal shows all recipe fields; recipe name, tags, and personal notes are editable; changes are saved on "Save" |
| F-06 | The Add Recipe modal captures all required fields (name, diet, meal type(s), cuisine, cook time, serves) and optional fields (ingredients, method, tags, personal notes) | P0 | Form validates name + at least one meal type are present before save; saved recipe appears immediately in the list with `src = mine` |
| F-07 | Each recipe stores four independent taxonomy dimensions: Meal type (multi-select), Cuisine (single, dropdown), Diet (Non-veg / Veg / Vegan), Tags (free labels) | P0 | All four dimensions are editable in both Add Recipe and Edit modals; filtering works against the correct dimension |
| F-08 | **[Phase 1]** "Create with AI" button is visible in the Library header but disabled. It carries a tooltip "Coming in a future update" and does not trigger any action. | P0 | Button renders in the correct position; has disabled styling (reduced opacity, `cursor:not-allowed`); tooltip visible on hover; clicking does nothing |
| F-08b | **[Phase 2]** "Create with AI" flow — 3-stage: Input → Review → Confirm & Save | P2 | **Input:** ingredient chips (common staples) append to a free-text field on tap; chips highlight when their name is present in the text; free-text is the single editable source; meal type single-select chip (Breakfast/Lunch/Dinner/Snack, default Dinner); serving count 1–6 circles (default 4); Generate disabled until text field has content. **Review:** dietary safety strip always visible below header — green (✓ no conflicts) or amber (⚠ conflict with member name); strip is informational only, does not block saving; recipe name editable inline (amber underline + edit icon), changes carry to confirm; meta pills: meal type · Serves N · ~X min · AI est. (amber) · Y–Z kcal · AI est. (amber); cook time displayed as AI estimate, same amber treatment as calories; ingredients as bulleted list; method as numbered steps; Regenerate returns to Input with all selections pre-filled; Save to Library advances to Confirm. **Confirm:** read-only recipe preview card (name + calorie range + cook time, AI est.); editable name field; meal type multi-select chips; cuisine dropdown; serving count circles; Save disabled if name empty / no meal type / no cuisine; saved with permanent "AI-made" badge |
| F-09 | AI-generated recipes carry a permanent "AI-made" badge throughout the Library | P1 | Badge is visible on list card and inside detail modal; badge cannot be removed. In Phase 1 no AI recipes will exist; badge logic must be present for Phase 2 readiness |
| F-10 | Recipes can be starred; starred recipes are visually distinct; starring is per-account (not per-member in Phase 1) | P1 | Star toggles on tap; starred state persists across sessions; starred recipes are visually distinct on the list |

---

## 5.1 User stories

| # | As a… | I want to… | So that… |
|---|-------|-----------|---------|
| US-01 | Primary cook | See all family recipes in one place with clear diet and meal type labels | I can quickly scan and pick something suitable without reading every recipe |
| US-02 | Primary cook | Add my own recipes with ingredients and method | I stop losing family favourites across scraps of paper and browser tabs |
| US-03 | Primary cook | Fork a predefined recipe and personalise it | I can start from a working recipe and adapt it to our taste without losing the original |
| US-04 | Adult member | Type what's in the fridge and get a recipe suggestion | I can cook something good without a trip to the shops |
| US-05 | Adult member | Filter by Dinner / Veg quickly | I can find a weeknight dinner option in seconds |
| US-06 | Primary cook | Add a personal note to a recipe (e.g. "Tom likes double the sauce") | I capture family preferences without cluttering the main recipe |
| US-07 | Teenager | Use AI to generate a quick recipe for myself | I can cook independently without asking a parent what to make |
| US-08 | Primary cook | See at a glance which recipes are AI-generated vs my own | I know which ones I've personally tested and trust for guests |

---

## 6. Non-functional requirements

| # | Requirement | Target |
|---|-------------|--------|
| NF-01 | Performance | Recipe list loads in < 500 ms; AI generation response begins streaming within 5 s |
| NF-02 | Accessibility | WCAG 2.1 AA; diet dot includes accessible `title` tooltip; all interactive elements keyboard-navigable |
| NF-03 | Data retention | Soft-delete only; deleted recipes retained for 30 days before permanent removal |
| NF-04 | Privacy enforcement | Access rules enforced server-side; `account_id` scoped via RLS; predefined recipes are global (no account_id) |
| NF-05 | AI safety | Family dietary restriction flags auto-checked before AI recipe is shown; dietary safety result displayed before user reads the recipe |
| NF-06 | AI calorie estimates | Shown as a range (e.g. 420–480 kcal), never a single number; always labelled "AI estimate — not database-verified" |

---

## 7. User flows

### Happy path — Browse and open a My recipe
1. User navigates to Recipes & Groceries → Library tab.
2. Recipe list loads showing all recipes (predefined + mine + AI-made).
3. User optionally filters by source ("My recipes") or meal type ("Dinner"), or types in the search box.
4. User taps a My recipe card.
5. Recipe detail/edit modal opens showing name, diet dot, meal badges, cuisine, cook time, serves, tags, ingredients, method, and personal notes.
6. User edits tags or notes and taps Save. Modal closes; list updates.

### Happy path — Fork a predefined recipe
1. User taps a predefined recipe card.
2. Fork confirmation modal appears: "Save a copy to My recipes?"
3. User taps "Save a copy".
4. Recipe detail/edit modal opens with `src = mine`, identical fields, empty personal notes, and the name field pre-populated and focused for editing.
5. User optionally renames the recipe and makes any other edits, then saves.
6. New "My recipe" appears in the list with "My recipe" badge, using the (possibly renamed) name.

### Happy path — Add a recipe manually
1. User taps "+ Add recipe" button.
2. Add Recipe modal opens.
3. User fills in: name, diet type, one or more meal types, cuisine (dropdown), cook time (minutes), serves, ingredients, method. Optionally adds tags and personal notes.
4. User taps "Save recipe". Modal closes; recipe appears in list with "My recipe" badge.

### Happy path — Create with AI (ingredients-based)

**Stage 1 — Input**
1. User taps "Create with AI" button. AI creation view slides in, replacing the Library list.
2. User taps ingredient chips to quick-add common staples (each chip appends its name to the text field; highlighted once added). User can also type freely in the text field to add, edit, or remove ingredients.
3. User selects a meal type (single-select chip — Breakfast / Lunch / Dinner / Snack; Dinner pre-selected).
4. User sets serving count (circular buttons 1–6; default 4).
5. User taps "Generate recipe". Button is disabled until the text field has content.

**Stage 2 — Review**
6. Simple spinner shown while AI generates.
7. Dietary safety strip appears below the header: green ("✓ No conflicts with your family's restrictions") on the happy path. Strip is always visible — not just on conflict.
8. Generated recipe card shown: name (editable inline — amber underline + ✏ icon), meta pills (meal type · Serves N · ~X min · AI est. · Y–Z kcal · AI est.), ingredients as bulleted list with quantities, method as numbered steps.
9. User can: tap "Regenerate" to return to Stage 1 with all inputs pre-filled, or tap "Save to library" to advance to Stage 3.

**Stage 3 — Confirm**
10. Read-only recipe preview card shown (name, calorie range, cook time — both labelled AI est.).
11. User confirms or adjusts: name (editable text input), meal type(s) (multi-select chips — user may tag multiple), cuisine (dropdown), serving count (circles 1–6).
12. User taps "Save recipe". Disabled if name is empty, no meal type selected, or no cuisine selected.
13. Recipe saved with permanent "AI-made" badge. User returned to Library list with new recipe visible.

### Error / edge paths
- **No name entered in Add Recipe:** Save button inactive or inline validation shown; modal stays open.
- **No meal type selected in Add Recipe:** Inline validation; cannot save without at least one meal type.
- **AI generation fails / times out:** Error message shown with "Try again" button; no partial recipe saved.
- **AI generation returns a recipe that conflicts with a family dietary restriction:** Amber dietary strip shown ("⚠ Contains X — conflicts with [member]'s [restriction]"). Strip is informational — user can still save. No acknowledgement tap required.
- **Empty library (no recipes match filters):** Empty state shown with prompt to clear filters or add a recipe.
- **User cancels fork:** Modal dismissed; predefined recipe unchanged; no copy created.

---

## 8. Data model

| Field | Description | Required? | Notes |
|-------|-------------|-----------|-------|
| `id` | Recipe unique identifier | Yes | UUID |
| `account_id` | Owning account (family) | Yes | Null for predefined (global) recipes |
| `created_by_member_id` | Member who created the recipe | No | Null for predefined recipes; shown as "Added by [name]" in UI |
| `updated_by_member_id` | Member who last updated the recipe | No | Null for predefined recipes; updated on every save |
| `name` | Recipe name | Yes | Max 120 chars |
| `src` | Recipe source | Yes | Enum: `predefined`, `mine`, `ai` |
| `diet` | Diet classification | Yes | Enum: `nonveg`, `veg`, `vegan` |
| `meals` | Meal type(s) | Yes | Array; values: `Breakfast`, `Lunch`, `Dinner`, `Snack`; min 1 |
| `cuisine` | Cuisine category | Yes | Single value; e.g. British, Italian, Indian — open string Phase 1 |
| `cook_time_minutes` | Cook time in minutes | No | Integer; null if unset |
| `serves` | Number of people | No | Integer; default 4 |
| `ingredients` | Ingredient list | No | Free text; one ingredient per line |
| `method` | Cooking steps | No | Free text |
| `tags` | Custom labels | No | Array of strings; e.g. ["Family fav", "Quick"] |
| `notes` | Personal notes on the recipe | No | Free text; visible to all family members; editable by creator, Owner, and Admin only |
| `is_ai_generated` | Permanent AI provenance flag | Yes | Boolean; true for `src = ai`; cannot be unset |
| `ai_calorie_min` | Lower bound of AI calorie estimate | No | Integer kcal; only set when `is_ai_generated = true` |
| `ai_calorie_max` | Upper bound of AI calorie estimate | No | Integer kcal; only set when `is_ai_generated = true` |
| `ai_cook_time_estimated` | Flag that cook time is AI-estimated | No | Boolean; true when cook time was generated by AI rather than entered by user; displayed as "~X min · AI est." in UI |
| `starred_by` | Member IDs who have starred this recipe | No | Array of member UUIDs; Phase 1 per-account |
| `forked_from_id` | ID of the predefined recipe this was forked from | No | UUID; null if not a fork |
| `created_at` | Creation timestamp | Yes | |
| `updated_at` | Last updated timestamp | Yes | |
| `deleted_at` | Soft-delete timestamp | No | Null = active |

---

## 9. UI / UX considerations

**UI reference:** `_UI/mypal-app.jsx` → `RecipesScreen()` → Library tab (line 4646)

**List layout.** Recipes are displayed as compact single-line rows inside a white card container. Each row contains (left to right): diet dot (coloured square with inner circle — green=Veg, purple=Vegan, red=Non-veg), recipe name (truncated with ellipsis, flex:1), then a right-aligned tag group (meal type badges, cuisine info tag, one custom tag, source badge), and a star. This fits maximum content in minimum vertical space.

**Diet dot.** Follows the Indian restaurant convention: a small square (borderRadius:2) with a filled circle inside. Green = Vegetarian, Purple = Vegan, Red = Non-vegetarian. Includes a `title` tooltip for accessibility.

**Meal type badges.** Colour-coded pills — Amber for Breakfast, Sage for Lunch, Teal for Dinner, muted for Snack. A recipe can carry multiple meal type badges on the same row.

**Source badges.** "My recipe" (warm/amber) and "AI-made" (sage/green) badges appear only for non-predefined recipes. Predefined recipes have no source badge — they are the anonymous MyPal starter library.

**Filter row.** Two groups of filter pills above the list: source filter (All / My recipes / AI-made) and meal type filter (All / Breakfast / Lunch / Dinner / Snack). Both are single-select within their group; they combine. The active pill is highlighted warm.

**Fork confirmation.** Tapping a predefined recipe shows a small centred modal asking "Save a copy to My recipes?" with a brief explanation that changes won't affect the original. Two actions: "Save a copy" (warm) and "Cancel".

**Recipe detail/edit modal.** Full-screen-height centred modal (max 460px wide, max 88vh). Header shows diet dot + recipe name as an editable text input + close button — the name is always editable for `mine` and `ai` recipes. Below: meal type badges, cuisine info tag, cook time, serves. Then: Tags section (editable — add/remove chips + suggested quick-add chips below). Serves / Cook time / Cuisine on one row (Serves 70px, Cook time 90px, Cuisine flex). Ingredients and Method as labelled textareas. Personal notes (plain label + textarea, no background tint) shown for `mine` and `ai` recipes.

**Add Recipe modal.** Same structure as the edit modal. Serves / Cook time / Cuisine on one row. Cook time is a number input (minutes). Cuisine is a dropdown (British, Italian, Indian, Chinese, Mexican, American, Mediterranean, Other). Suggested tags shown as quick-add chips below the tag input.

**Cook time display.** Always shown as minutes only — "40 min", "90 min". No hours/minutes formatting ("1 hr 30 min") anywhere in the UI.

**AI creation view — 3 stages, all replace the Library list (no modal).**

*Input stage:* Common ingredient chips (e.g. Chicken, Pasta, Eggs) that append to a free-text field on tap; chip highlights when its name is present in the text; free-text field is always editable and is the single source of truth for ingredients. Meal type single-select chips (Breakfast/Lunch/Dinner/Snack; Dinner default). Serving count circular buttons 1–6 (default 4). Family dietary note below Generate button. Generate disabled until text field has content.

*Review stage:* Dietary safety strip pinned below the header — sage/green background + ✓ icon on clear ("No conflicts with your family's restrictions"); amber background + ⚠ icon on conflict ("Contains X — conflicts with [member]'s [restriction]"). Strip always shown; never blocks saving. Recipe name as an editable inline input (amber bottom border + ✏ icon); edits carry through to Confirm. Meta row of pills: meal type badge · "Serves N" (muted) · "~X min · AI est." (amber) · "Y–Z kcal · AI est." (amber). Ingredients as a bulleted list with amber dot markers. Method as numbered steps with amber circle step numbers. Actions row: "Regenerate" (secondary, left) returns to Input with all selections pre-filled; "Save to library" (primary, right) advances to Confirm.

*Confirm stage:* Read-only recipe preview card at top (name + calorie range + cook time, both labelled AI est.). Below: editable name field, meal type multi-select chips, cuisine dropdown (British / Italian / Indian / Chinese / Mexican / American / Mediterranean / Other), serving count circles 1–6. Save button disabled if name empty / no meal type / no cuisine. On save: recipe added to Library with "AI-made" badge; user returned to Library list.

**Empty states.** When filters return no results: message + "Clear filters" link. When library has no user-added recipes yet (only predefined): a prompt to add a recipe or try AI creation.

**Mobile.** At 375px the filter row scrolls horizontally. Recipe card name truncates to prevent overflow. Modal width fills the viewport with 16px margin each side.

---

## 10. Integration points & platform constraints

| Integration | Availability | Notes |
|-------------|-------------|-------|
| MyPal AI (Claude) — recipe generation | Phase 1 | Structured prompt returning name, ingredients, method, calorie range, dietary check; streamed response |
| Family profile — dietary restriction flags | Phase 1 | Auto-loaded into AI creation flow; used for pre-display safety check |
| Meal Planner module | Phase 1 | Recipes from Library are the source for meal plan cells; integration spec TBD in `recipes--meal-planner.md` |
| Nutrition module | Phase 2 | "Calculate nutrition" flow will read recipe ingredients and match against CoFID / Open Food Facts |
| URL import / web scraping | Phase 2 | Parse a recipe URL into structured fields; out of scope Phase 1 |

---

## 11. Success metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Library adoption | ≥ 60% of active accounts have ≥ 1 user-added recipe within 30 days of onboarding | Backend: count of accounts with `src IN (mine, ai)` recipe |
| AI creation conversion | ≥ 40% of AI creation flow starts result in a saved recipe | Backend: events for flow-start vs confirm-save |
| Fork rate | ≥ 25% of accounts use fork at least once in first 60 days | Backend: count of recipes with non-null `forked_from_id` per account |
| Search / filter usage | ≥ 50% of Library sessions include a filter or search interaction | Frontend event tracking |
| Recipe library size | Average ≥ 5 user-added recipes per active account at 90 days | Backend aggregate |

---

## 12. Definition of done

### Phase 1
- [ ] All P0 functional requirements implemented and tested
- [ ] Predefined recipe seed data loaded (10 recipes across British, Italian, Indian, Chinese, American cuisines)
- [ ] Fork flow confirmed: predefined recipe unchanged; forked copy created with `forked_from_id` set
- [ ] "Create with AI" button visible, disabled, with tooltip "Coming in a future update" — clicking does nothing
- [ ] `is_ai_generated` field present in schema; AI-made badge renders correctly for any `src = ai` records
- [ ] Access rules enforced server-side for all roles (predefined = read-only for all; edit/delete scoped to creator + Owner/Admin)
- [ ] Empty states handled: no recipes, no search matches, no filter matches
- [ ] Mobile layout reviewed at 375px viewport
- [ ] WCAG 2.1 AA verified for interactive elements (diet dot tooltip, modal focus trap, filter pills keyboard-navigable)

### Phase 2
- [ ] Full 3-stage AI creation flow implemented (Input → Review → Confirm & Save)
- [ ] Ingredient chips append to free-text field; chip highlights when name is present in field; free-text is the editable source of truth
- [ ] Meal type single-select on Input stage; multi-select on Confirm stage
- [ ] Serving count carried from Input to Confirm; adjustable at both stages
- [ ] Family dietary restriction flags auto-loaded; dietary strip always visible on Review stage (green clear / amber conflict); conflict does not block save
- [ ] Cook time displayed as "~X min · AI est." (amber pill); `ai_cook_time_estimated = true` set on save
- [ ] AI calorie estimates displayed as range only (e.g. 420–480 kcal); "AI est." amber pill; never a single number
- [ ] Recipe name editable inline on Review stage; changes carry through to Confirm
- [ ] Regenerate returns to Input with all prior selections pre-filled
- [ ] Save button on Confirm disabled if name empty / no meal type / no cuisine
- [ ] "Create with AI" button enabled; disabled state and tooltip removed

---

## 13. Open questions

- [x] **Personal notes visibility** — visible to all family members; editable by creator, Owner, and Admin only. Confirmed 2026-05-28.
- [x] **Predefined recipe starter set content** — 10 predefined recipes ship at launch. A Recipe admin screen (for Anthropic/MyPal team to manage the predefined library) is deferred to a later phase. Confirmed 2026-05-28.
- [x] **Starring scope** — account-wide (visible to all family members). Confirmed 2026-05-28.
- [x] **Cook time display format** — minutes only throughout (e.g. "40 min", "90 min"). No hours/minutes formatting. Confirmed 2026-05-28.

---

## 14. Revision history

| Version | Date | Author | Summary of changes |
|---------|------|--------|-------------------|
| 0.1 | 2026-05-28 06:38 UTC | Dip | Initial draft |
| 0.2 | 2026-05-28 06:39 UTC | Dip | Access model: family-shared by default (Option A); personal notes public; added `updated_by_member_id` to data model; resolved open question on notes visibility |
| 0.3 | 2026-05-28 06:51 UTC | Dip | Recipe name editable in detail/edit modal; fork modal pre-populates name as editable field |
| 0.4 | 2026-05-28 07:57 UTC | Dip | Resolved all open questions: predefined set = 10 recipes (Recipe admin screen Phase 2); starring = account-wide; cook time display = minutes only; updated DoD, Out of scope, UI/UX section accordingly |
| 0.5 | 2026-05-28 08:05 UTC | Dip | Split implementation into Phase 1 (CRUD) and Phase 2 (AI flow); "Create with AI" button visible but disabled in Phase 1; F-08 split into F-08 (Phase 1 stub) and F-08b (Phase 2 AI); DoD split by phase |
| 0.6 | 2026-05-28 13:25 UTC | Dip | Full Phase 2 AI flow designed and specced: 3-stage Input/Review/Confirm; ingredient chips append to free-text (single source of truth); meal type at input (single-select), at confirm (multi-select); dietary strip always visible, conflict warns but doesn't block; name editable inline at review; cook time as AI est.; ai_cook_time_estimated field added to data model; F-08b, happy path flow, edge paths, UI/UX section, and Phase 2 DoD updated |
