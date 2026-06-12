# Structural Backlog — Full Area/Module Reorganisation — UI Design Spec

**Spec version:** v0.1
**Date:** 24-May-2026
**Author:** Cowork
**Status:** Draft
**Phase:** Phase 1 (with Phase 2 placeholders as noted)

> This is not a single-module spec. It covers the complete structural reorganisation of the MyPal prototype as defined in `_UI/ui-prototype.md` Section 9. It enumerates every change to NAV, SUBNAV, screen components, MOD_AC, and the AccessTabContent groups array. Individual module design specs (e.g. `life-admin--pet-care.md`) will cover per-module layout detail; this spec covers structure only.

---

## 1. Overview

The prototype reflects an earlier structural design. The confirmed target structure promotes several modules out of the `Lifestyle` area into dedicated top-level areas, dissolves `Lifestyle` entirely, restructures `My Account`, and renames one `Life Admin` module. The changes are grouped below by type.

---

## 2. Area-Level Changes (NAV + renderScreen + SCREEN_TITLES)

### 2.1 Remove `Lifestyle` area

| Artefact | Change |
|---|---|
| `NAV` array | Remove `{ id:"lifestyle", icon:"🎯", label:"Lifestyle", color:T.violet }` |
| `SUBNAV` | Remove `lifestyle` key and its array |
| `SCREEN_TITLES` | Remove `lifestyle:"Lifestyle"` |
| `renderScreen()` switch | Remove `case "lifestyle": return <LifestyleScreen/>;` |
| `LifestyleScreen` function | Remove entire function (content distributed — see §3) |

### 2.2 Add `Recipes & Groceries` as top-level area (Phase 1)

| Artefact | Change |
|---|---|
| `NAV` array | Add `{ id:"recipes", icon:"🍳", label:"Recipes & Groceries", color:T.lime }` after `Health` |
| `SUBNAV` | Add `recipes: ["Library","Meal Planner","Grocery List","Nutrition"]` |
| `SCREEN_TITLES` | Add `recipes:"Recipes & Groceries"` |
| `renderScreen()` switch | Add `case "recipes": return <RecipesScreen/>;` |
| New screen component | `function RecipesScreen()` — see §6.1 for mock data |

### 2.3 Add `Travel` as top-level area (Phase 2 placeholder)

| Artefact | Change |
|---|---|
| `NAV` array | Add `{ id:"travel", icon:"✈️", label:"Travel", color:T.sky }` after `Recipes & Groceries` |
| `SUBNAV` | Add `travel: ["My Trips","Packing Templates","Travel Ready"]` |
| `SCREEN_TITLES` | Add `travel:"Travel"` |
| `renderScreen()` switch | Add `case "travel": return <TravelScreen/>;` |
| New screen component | `function TravelScreen()` — Phase 2 placeholder screen; see §6.2 |

### 2.4 Final NAV order (app area entries only)

```
Today · Life Admin · Finance · Health · Recipes & Groceries · Travel · My Account
```

---

## 3. Module-Level Changes (SUBNAV + screen component views)

### 3.1 Life Admin

**Current SUBNAV:** `["To Dos","Household Info","Documents","Cars & Home"]`
**Target SUBNAV:** `["Tasks","Household Info","Documents","Cars & Home","Pet Care"]`

| Change | Detail |
|---|---|
| Rename `"To Dos"` → `"Tasks"` | Update the `views` key in `LifeAdminScreen` and the initial `useState` value. Tasks module merges To Dos + Reminders with six groups including Recurring. The existing JSX content is kept as-is — this is a label-only rename at structural level. |
| Add `"Pet Care"` tab | Move Pet Care JSX from `LifestyleScreen` `views["Pet Care"]` → new `"Pet Care"` entry in `LifeAdminScreen` `views`. The content (Buddy profile, vaccinations, vet history cards) transfers unchanged. |

### 3.2 Hobbies & Interests (dissolution)

The `"Hobbies"` tab from `LifestyleScreen` is dissolved as a standalone nav entry. The interest tag picker and personalised feed JSX moves into `My Account → My Profile` as a **"Hobbies & Interests"** card section. It does not appear as a module tab anywhere in the final structure.

### 3.3 Travel content (absorbed into TravelScreen)

The `"Travel"` tab from `LifestyleScreen` (Brighton/Lanzarote trip cards, Weekend Ideas card) moves into `TravelScreen`. However, since Travel is a Phase 2 area, these cards are rendered as a **Phase 2 placeholder** — not as live content. The existing trip card JSX can be preserved in a comment for future use.

### 3.4 Recipes & Groceries

**Source:** `LifestyleScreen` `views["Recipes & Groceries"]`
**Target:** `RecipesScreen` — new top-level screen with 4 tabs

| Tab | Phase | Content |
|---|---|---|
| Library | 1 | Phase 2 placeholder card (recipe library — search, saved recipes, add your own) |
| Meal Planner | 1 | Existing meal plan grid from LifestyleScreen, extracted here |
| Grocery List | 1 | Existing grocery list card from LifestyleScreen, extracted here |
| Nutrition | 2 | Phase 2 placeholder card |

> **Note:** The Meal Planner and Grocery List content already exists in `LifestyleScreen`; extract it verbatim into `RecipesScreen`. Library and Nutrition are Phase 2 placeholders.

### 3.5 My Account

**Current SUBNAV:** `["Profile","Members","Access","Security","Plan","Billing","Privacy & Data"]`
**Target SUBNAV:** `["My Profile","Family Members","Preferences","Access","Security & Privacy"]`

| Change | Detail |
|---|---|
| Rename `"Profile"` → `"My Profile"` | Update `views` key and initial `useState`. Add "Hobbies & Interests" card section to this tab (from dissolved Hobbies module — see §3.2 and §6.3 for mock data). |
| Rename `"Members"` → `"Family Members"` | Update `views` key only — JSX content unchanged. |
| Add `"Preferences"` tab | New tab between `"Family Members"` and `"Access"`. See §6.4 for content. |
| Merge `"Security"` + `"Privacy & Data"` → `"Security & Privacy"` | Combine both JSX blocks under a single `"Security & Privacy"` tab key. |
| Remove `"Plan"` and `"Billing"` | Remove both `views` entries (Phase 2). Add a Phase 2 placeholder card inside `"My Profile"` or as a separate collapsed section referencing plan details. |

### 3.6 Health — no changes

Current 7 tabs confirmed correct: `["Overview","Profiles","Medications","Preventive Care","Emergency Info","Appointments","Journal"]`

### 3.7 Finance — no changes

Current 6 tabs confirmed correct: `["Overview","Budget Envelopes","Transactions","Bills & Subs","Admin","My Finance"]`

### 3.8 Today — no changes

Current 2 tabs confirmed correct: `["Daily Briefing","MyPal AI"]`

---

## 4. Access Control (MOD_AC) Updates

### 4.1 Rows to remove

| Area | Key | Label | Reason |
|---|---|---|---|
| `Lifestyle` | `hobbies` | Hobbies | Lifestyle area dissolved; Hobbies moves into My Profile |
| `Lifestyle` | `travel` | Travel | Now a top-level area with its own MOD_AC rows |
| `Lifestyle` | `petcare` | Pet Care | Moved to Life Admin |
| `Wellbeing` | `recipes` | Recipes & Grocery | Now a top-level area with its own MOD_AC rows |
| `Wellbeing` | `journal` | Journal | No longer under Wellbeing group (Health area owns journal) |
| `Wellbeing` | `appts` | Appointments | No longer under Wellbeing group (Health area owns appointments) |
| `Wellbeing` | `health` | Health | No longer under Wellbeing group (Health area owns it directly) |

> The entire `Wellbeing` area group is removed from MOD_AC. Health-area modules were already rendered correctly in `HealthScreen`; this cleans up the MOD_AC group labelling.

### 4.2 Rows to add

**Life Admin — Pet Care**
```js
["Life Admin","petcare","Pet Care","🐾",false,{Owner:"Manage",Admin:"Manage",Adult:"Edit",Teen:"View",Child:"View"}]
```

**Life Admin — Tasks** (rename label only — key `"tasks"` already exists)
```js
// Change label from "To Dos" to "Tasks" in the existing row:
["Life Admin","tasks","Tasks","✅",false,{Owner:"Manage",Admin:"Manage",Adult:"Edit",Teen:"Edit",Child:"View"}]
```

**Health area** — add explicit rows replacing the Wellbeing group:
```js
["Health","health",   "Health Overview","🩺",false,{Owner:"Manage",Admin:"Manage",Adult:"Edit",Teen:"Edit",Child:"View"}],
["Health","meds",     "Medications",    "💊",false,{Owner:"Manage",Admin:"Manage",Adult:"Edit",Teen:"Edit",Child:"View"}],
["Health","prevcare", "Preventive Care","🛡️",false,{Owner:"Manage",Admin:"Manage",Adult:"Edit",Teen:"View",Child:"None"}],
["Health","emergency","Emergency Info", "🚨",true, {Owner:"Manage",Admin:"Manage",Adult:"Edit",Teen:"View",Child:"None"}],
["Health","appts",    "Appointments",   "📅",false,{Owner:"Manage",Admin:"Manage",Adult:"Edit",Teen:"Edit",Child:"View"}],
["Health","journal",  "Journal",        "📔",false,{Owner:"Manage",Admin:"Manage",Adult:"Edit",Teen:"Edit",Child:"None"}],
```

**Recipes & Groceries area** — four new rows:
```js
["Recipes & Groceries","recLib",  "Library",      "📖",false,{Owner:"Manage",Admin:"Manage",Adult:"Edit",Teen:"Edit",Child:"View"}],
["Recipes & Groceries","recMeal", "Meal Planner", "🗓️",false,{Owner:"Manage",Admin:"Manage",Adult:"Edit",Teen:"Edit",Child:"View"}],
["Recipes & Groceries","recGroc", "Grocery List", "🛒",false,{Owner:"Manage",Admin:"Manage",Adult:"Edit",Teen:"Edit",Child:"View"}],
["Recipes & Groceries","recNut",  "Nutrition",    "🥗",false,{Owner:"Manage",Admin:"Manage",Adult:"Edit",Teen:"View",Child:"None"}],
```

**Travel area** — three new rows (Phase 2):
```js
["Travel","trvTrips",  "My Trips",          "✈️",false,{Owner:"Manage",Admin:"Manage",Adult:"Edit",Teen:"Edit",Child:"View"}],
["Travel","trvPack",   "Packing Templates", "🧳",false,{Owner:"Manage",Admin:"Manage",Adult:"Edit",Teen:"Edit",Child:"View"}],
["Travel","trvReady",  "Travel Ready",      "🛂",false,{Owner:"Manage",Admin:"Manage",Adult:"Edit",Teen:"View",Child:"None"}],
```

### 4.3 AccessTabContent — groups array update

**Current:**
```js
const groups = ["Life Admin","Finance","Wellbeing","Lifestyle"];
```

**Target:**
```js
const groups = ["Life Admin","Finance","Health","Recipes & Groceries","Travel"];
```

The `filterGroup()` function already filters MOD_AC by area string — no other changes needed there beyond this array update.

---

## 5. Mock Data for New / Moved Content

### 5.1 RecipesScreen mock data

The existing `LifestyleScreen` "Recipes & Groceries" content provides mock data for Meal Planner and Grocery List. No new mock data needed for those tabs. Library and Nutrition use Phase 2 placeholder cards with no data.

### 5.2 TravelScreen mock data

Travel is a Phase 2 placeholder — no mock data needed. The trip card data from `LifestyleScreen` (Brighton, Lanzarote) can be commented out in `TravelScreen` as a Phase 2 reference. The placeholder screen shows the three tab stubs (`My Trips`, `Packing Templates`, `Travel Ready`) with a Phase 2 card in each.

### 5.3 My Account — Hobbies & Interests mock data (moved from Lifestyle)

The interest tag state and `allInts` array move from `LifestyleScreen` into `AccountScreen` as local state. The personalised feed and local events cards from the Hobbies tab **do not** transfer — only the interest tag picker and its "Your Interests" card move into My Profile.

```js
// Inside AccountScreen — add to top-level state:
const [interests, setInterests] = useState([
  "📸 Photography","🚴 Cycling","⚽ Football","💻 Technology"
]);
const toggleInt = t => setInterests(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t]);
const allInts = [
  "📸 Photography","🚴 Cycling","🍳 Cooking","📚 Reading",
  "⚽ Football","✈️ Travel","💻 Technology","🌱 Gardening",
  "🎵 Music","🏃 Running","🎮 Gaming","🍷 Wine",
];
```

### 5.4 My Account — Preferences tab mock data

New Preferences tab UI fields:

| Field | Type | Mock value |
|---|---|---|
| Language | Select (enum) | English (UK) |
| Date format | Select (enum) | DD-Mon-YYYY |
| Currency | Select (enum) | GBP (£) |
| Theme | Toggle | Dark (current) / Light |
| Notifications | Toggle | On |
| Start page | Select (enum) | Today |

All rendered as static rows with `.btn-sm` "Change" buttons — no live state needed except the Theme toggle (which can call the existing dark/light toggle in `MyPal()`).

---

## 6. New Screen Components

### 6.1 RecipesScreen

```
function RecipesScreen()
  state: tab = "Meal Planner"   (default to first live tab)

  views:
    "Library"      → Phase 2 placeholder card
                     icon 📖  title "Recipe Library"
                     sub "Search, save, and add your own recipes — coming soon"
    "Meal Planner" → Extract existing meal plan grid JSX from LifestyleScreen
                     (7-day grid, 4 meal rows, hardcoded mock data)
    "Grocery List" → Extract existing grocery list + AI Grocery Order cards from LifestyleScreen
    "Nutrition"    → Phase 2 placeholder card
                     icon 🥗  title "Nutrition Insights"
                     sub "Per-meal and weekly nutrition tracking — coming soon"
```

Default tab: `"Meal Planner"` (first tab with live content).

### 6.2 TravelScreen (Phase 2 placeholder)

```
function TravelScreen()
  state: tab = "My Trips"

  views:
    "My Trips"          → Phase 2 placeholder card
                          icon ✈️  title "My Trips"
                          sub "Plan and track your trips, from weekend breaks to holidays — coming soon"
    "Packing Templates" → Phase 2 placeholder card
                          icon 🧳  title "Packing Templates"
                          sub "Smart packing lists tailored to your destination and trip type — coming soon"
    "Travel Ready"      → Phase 2 placeholder card
                          icon 🛂  title "Travel Ready"
                          sub "Track passport expiry, visa requirements, and travel insurance — coming soon"
```

All three tabs show Phase 2 cards using the standard pattern from `ui-prototype.md` §9.

---

## 7. Changes to Existing Prototype — Complete Edit List

This is the authoritative edit sequence. Apply in order.

| # | Location | Change |
|---|---|---|
| 1 | `NAV` array (line ~47) | Remove `{ id:"lifestyle", ... }` entry |
| 2 | `NAV` array | Add `{ id:"recipes", icon:"🍳", label:"Recipes & Groceries", color:T.lime }` after `{ id:"health", ... }` |
| 3 | `NAV` array | Add `{ id:"travel", icon:"✈️", label:"Travel", color:T.sky }` after new `recipes` entry |
| 4 | `MOD_AC` | Remove rows: `["Lifestyle","hobbies",...]`, `["Lifestyle","travel",...]`, `["Lifestyle","petcare",...]` |
| 5 | `MOD_AC` | Remove rows: `["Wellbeing","health",...]`, `["Wellbeing","recipes",...]`, `["Wellbeing","journal",...]`, `["Wellbeing","appts",...]` |
| 6 | `MOD_AC` | In existing `["Life Admin","tasks","To Dos",...]` row, change label `"To Dos"` → `"Tasks"` |
| 7 | `MOD_AC` | Add `["Life Admin","petcare","Pet Care","🐾",false,{...}]` (see §4.2) after the `carhome` row |
| 8 | `MOD_AC` | Add 6 Health area rows (see §4.2) |
| 9 | `MOD_AC` | Add 4 Recipes & Groceries area rows (see §4.2) |
| 10 | `MOD_AC` | Add 3 Travel area rows (see §4.2) |
| 11 | `SUBNAV` | Remove `lifestyle` key |
| 12 | `SUBNAV` | In `lifeadmin` array: rename `"To Dos"` → `"Tasks"`, add `"Pet Care"` |
| 13 | `SUBNAV` | Add `recipes: ["Library","Meal Planner","Grocery List","Nutrition"]` |
| 14 | `SUBNAV` | Add `travel: ["My Trips","Packing Templates","Travel Ready"]` |
| 15 | `SUBNAV` | In `account` array: update to `["My Profile","Family Members","Preferences","Access","Security & Privacy"]` |
| 16 | `SCREEN_TITLES` (line ~6437) | Remove `lifestyle:"Lifestyle"`, add `recipes:"Recipes & Groceries"`, add `travel:"Travel"` |
| 17 | `renderScreen()` switch | Remove `case "lifestyle"`, add `case "recipes": return <RecipesScreen/>;`, add `case "travel": return <TravelScreen/>;` |
| 18 | `LifeAdminScreen` | In `views` object: rename key `"To Dos"` → `"Tasks"` (update `useState` default too) |
| 19 | `LifeAdminScreen` | Add `"Pet Care"` tab — extract JSX from `LifestyleScreen` `views["Pet Care"]` |
| 20 | `LifestyleScreen` | Remove entire function (all content distributed) |
| 21 | New: `RecipesScreen` | Create function — see §6.1 |
| 22 | New: `TravelScreen` | Create function — see §6.2 |
| 23 | `AccountScreen` | Rename `views["Profile"]` → `"My Profile"`, update `useState("My Profile")` |
| 24 | `AccountScreen` | Add Hobbies & Interests card section inside `"My Profile"` tab (see §5.3) |
| 25 | `AccountScreen` | Add Plan details as a Phase 2 reference card inside `"My Profile"` (condensed — current plan name + renewal date, static) |
| 26 | `AccountScreen` | Rename `views["Members"]` → `"Family Members"` |
| 27 | `AccountScreen` | Add `"Preferences"` tab between `"Family Members"` and `"Access"` (see §5.4) |
| 28 | `AccountScreen` | Merge `"Security"` + `"Privacy & Data"` → `"Security & Privacy"` (combine JSX, Security content first, Privacy & Data second) |
| 29 | `AccountScreen` | Remove `"Plan"` and `"Billing"` tabs |
| 30 | `AccessTabContent` | Change `groups` array from `["Life Admin","Finance","Wellbeing","Lifestyle"]` → `["Life Admin","Finance","Health","Recipes & Groceries","Travel"]` |

---

## 8. Guardrails

- Working copy only: all edits to `_UI/ui_working/mypal-app-working.jsx`
- Colours: only `T.xxx` tokens
- Dates: `dd-Mon-yyyy` in all mock data
- Currency: GBP `£`
- Language: UK English
- Phase 2 features: render as visible placeholders using the Phase 2 card pattern (`ui-prototype.md` §9)
- Do not redesign content — extract/rename only unless new content is explicitly described above

---

## 9. Visual Review Log

**Status:** Approved
**Approved date:** 24-May-2026

**Working copy → canonical:** Done — 24-May-2026

**Changes from visual review (all 30 structural edits applied + additional UI iteration):**

During the design iteration session, the following changes were applied beyond the original structural edit list:

- My Account → My Profile: Plan & Billing split into two separate collapsed cards (Plan, Billing History); billing history collapsed by default
- My Account → My Profile: Hobbies & Interests modal (add/remove tags) wired up interactively
- My Account → Family Members: Invite modal with interactive role picker (Adult / Teen / Child); Manage member modal with actions list and remove option
- My Account → Preferences: All three sections (Language, Appearance, Notifications) collapsible; theme selector interactive; Notifications greyed as Phase 2; Start Page removed
- My Account → Security & Privacy: Two-Factor Auth and Your Data greyed as Phase 2
- Onboarding → Add Member: uses same Invite modal as My Account → Family Members
- Life Admin → Household Info: search input background corrected to white (T.surface)
- Life Admin → Documents: Upload document opens a modal with fields; Visible To is a `<select>` dropdown; each document row on one line
- Life Admin → Cars & Home: Log Service and Log Maintenance open modals; each row has an Edit button opening an edit modal
- Life Admin → Pet Care: Add pet modal and Edit pet modal (pre-filled); Log Vet Visit modal; microchip/insurer details on single horizontal line; vaccination entries each editable; Log Vaccination modal
- Recipes → Library: Promoted to Phase 1 with real recipe data (grid + View/Edit modal per recipe)
- Recipes → Meal Planner: Each cell selectable from recipe picker modal (moved to screen-level return to fix position:fixed trapping)
- Recipes → Grocery List: Add item inline entry (input + keyboard shortcuts)
- Modal consistency: all modals standardised to `rgba(0,0,0,0.55)` backdrop + `blur(3px)` + `0 32px 80px rgba(0,0,0,0.55)` panel shadow
- "For (who can see this)" → "Visible to" globally
- Task/Routine/Note modal inputs: background corrected from T.card2 → T.surface

---

*Spec version: v0.1 · 24-May-2026*
