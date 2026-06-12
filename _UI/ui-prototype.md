# MyPal UI Prototype Guide

| | |
|---|---|
| **File** | `_UI/ui-prototype.md` |
| **Purpose** | Reference guide for reading, editing, or extending the prototype. Read before any prototype session. |
| **Version** | 1.2 |
| **Updated by** | Cowork |
| **Last updated** | 12/06/2026 UTC |

**Maintaining this file.** Every edit must: (1) bump the version, (2) update **Last updated** to the current UTC time, (3) set **Updated by**, (4) append a row to the revision history at the bottom. Only update Section 5 (SUBNAV) and Section 9 when structure actually changes — never update line-number ranges in Section 2.

---

## 1. What This File Is

`mypal-app.jsx` is a single-file React prototype. It is the **visual design source of truth** for MyPal — used to review and agree UI before feature specs are written. It is not production code. It runs as a self-contained HTML/JSX artifact (React and fonts loaded via CDN; no bundler).

**Workflow position:**
```
Design decisions (Cowork)
  → ui-design-spec.md (Cowork writes)
  → _UI/ui_working/mypal-app-working.jsx (Cowork edits)
  → Dip reviews locally, gives feedback in Cowork
  → Cowork iterates working copy until approved
  → ui-design-spec.md Section 13 updated (Visual Review Log)
  → _UI/mypal-app.jsx updated (canonical — approved copy)
  → feature_spec.md (Cowork writes from approved spec)
  → tech_spec.md (Claude Code)
  → implementation
```

**`_UI/` folder structure:**

| Path | Purpose | Who edits |
|---|---|---|
| `_UI/ui_working/mypal-app-working.jsx` | Active working copy — all changes go here | Cowork |
| `_UI/mypal-app.jsx` | Canonical approved prototype | Cowork, only after Dip approves |
| `_UI/specs/[area]--[module].md` | UI design specs (input to prototype changes) | Cowork |
| `_UI/design_brief/[area]--[module]-brief.md` | Design briefs from Cowork conversations | Cowork |
| `_UI/ui-prototype.md` | This file — prototype guide | Cowork |
| `_UI/ui-design-spec-template.md` | Spec template | Cowork |
| `_UI/CLAUDE.md` | Directory context for all Claude sessions | Cowork |

**How to view:** Dip runs `mypal-app-working.jsx` locally in a browser (React + CDN — no build step needed). The root component is `MyPal()`.

---

## 2. File Structure (top to bottom)

| Lines (approx) | Contents |
|---|---|
| 1–44 | Design direction comment + `T` colour token object |
| 45–58 | `NAV` — sidebar navigation array |
| 60–77 | `T_DARK` and `T_LIGHT` — theme token sets |
| 79–135 | Access control constants (`MEMBERS_AC`, `TIERS_AC`, `MOD_AC`, `ROLE_*`) |
| 137–690 | Shared components: `AvatarAC`, `AvatarStackAC`, `NoteRecipientPicker`, `AccessTabContent`, `HMGConfirmDialog` |
| 688–880 | `makeCSS()` function — generates all CSS from token object |
| 861–877 | `MEMBERS` (member picker data) + `SUBNAV` (module tabs per area) |
| 879–1286 | Public screen components: `HomePage`, `SignUp`, `SignIn`, `Onboarding` |
| 1287–1552 | `TodayScreen` + `ScopeToggle` helper |
| 1553–3300 | `LifeAdminScreen` (largest screen — contains Tasks, Household Info, Documents, Cars & Home, Pet Care) |
| 3301–4250 | Health sub-components: `HAvatar`, `HMemberCard`, `HOverview`, `HProfiles`, `HMedications`, `HPrevCare`, `HEmergency`, `HAppointments`, `HJournal` |
| 4251–4312 | `HealthScreen` |
| 4313–4495 | `LifestyleScreen` (contains Hobbies, Travel, Pet Care, Recipes & Groceries) |
| 4496–4645 | `AccountScreen` |
| 4646–6407 | `FinanceScreen` (largest after Life Admin) |
| 6408–end | `MyPal()` root component |

---

## 3. Design System

### 3.1 Colour Tokens

All colours live in the `T` object (lines 10–43). **Never hardcode hex values** in screen components — always use `T.xxx`.

| Token | Purpose |
|---|---|
| `T.bg` | Page background |
| `T.surface` | Sidebar and topbar background |
| `T.card` | Primary card background |
| `T.card2` | Secondary card / input background |
| `T.border` | Default border colour |
| `T.borderHi` | Highlighted / focused border |
| `T.warm` | Primary accent — amber (family warmth) |
| `T.warmS` | Warm tint background (13% opacity) |
| `T.warmG` | Warm ghost background (7% opacity) |
| `T.teal` | Secondary accent — AI / tech |
| `T.rose` | Danger / health / alerts |
| `T.sage` | Success / finance positive |
| `T.sky` | Info / view-only |
| `T.violet` | Lifestyle / personal |
| `T.amber` | Warning / in-progress |
| `T.lime` | Nature / pet / growth |
| `T.pink` | Social / family events |
| `T.text` | Primary text |
| `T.textS` | Secondary / muted text |
| `T.textM` | Disabled / placeholder text |

Suffix convention: base colour = `T.rose`; tint swatch = `T.roseS` (rgba 13%).

### 3.2 Typography

- **Display / headings:** `'Playfair Display', serif` — used for names, titles, hero text
- **Body / UI:** `'DM Sans', sans-serif` — used for everything else; set as default in `.shell`

### 3.3 Theme System

`T` is a **mutable object**. At render time, `MyPal()` calls `Object.assign(T, TH)` to overwrite it with either `T_DARK` or `T_LIGHT` based on user preference. This means all child components that read `T.xxx` at render time pick up the active theme automatically.

**When adding new tokens:** Add to both `T` (dark defaults, lines 10–43) and `T_LIGHT` (lines 64–77), then add the CSS rule in `makeCSS()`.

---

## 4. NAV — Sidebar Navigation

```js
const NAV = [
  { id:"home",       icon:"🌐", label:"Home",                 type:"public" },
  { id:"signup",     icon:"✍️", label:"Sign Up",              type:"public" },
  { id:"signin",     icon:"🔑", label:"Sign In",              type:"public" },
  null,  // ← renders a divider
  { id:"today",      icon:"🌅", label:"Today",                color:T.warm   },
  { id:"lifeadmin",  icon:"📋", label:"Life Admin",           color:T.teal   },
  { id:"finance",    icon:"💷", label:"Finance",              color:T.sage   },
  { id:"health",     icon:"🩺", label:"Health",               color:T.rose   },
  { id:"recipes",    icon:"🍳", label:"Recipes & Groceries",  color:T.lime   },
  { id:"travel",     icon:"✈️", label:"Travel",               color:T.sky    },
  { id:"account",    icon:"👤", label:"My Account",           color:T.sky    },
  { id:"onboarding", icon:"🚀", label:"Onboarding",           color:T.violet },
];
```

**Rules:**
- `type:"public"` → renders under "Public" sidebar label; no `type` → renders under "App" label
- `null` entries render as a visual divider (`<div className="sdiv"/>`)
- `id` must match the `case` key in `renderScreen()` (in `MyPal()`) and the key in `SCREEN_TITLES`
- `color` is currently stored but not yet actively used for per-area accent colouring in the sidebar

**To add a new top-level area:**
1. Add entry to `NAV` (with unique `id`, icon, label, colour token)
2. Add matching `case` in `renderScreen()` switch: `case "travel": return <TravelScreen/>;`
3. Add entry in `SCREEN_TITLES`: `travel:"Travel"`
4. Add entry in `SUBNAV`: `travel: ["My Trips","Packing Templates","Travel Ready"]`
5. Create the screen component function (see Section 6)

---

## 5. SUBNAV — Module Tabs Per Area

```js
const SUBNAV = {
  today:     ["Daily Briefing"],
  lifeadmin: ["Tasks","Key Dates","Household Info","Documents","Cars & Home","Pet Care"],
  finance:   ["Overview","Budget Envelopes","Transactions","Bills & Subs","Admin","My Finance"],
  health:    ["Overview","Profiles","Medications","Appointments","Emergency Info","Journal"],
  recipes:   ["Library","Meal Planner","Grocery List","Nutrition"],
  travel:    ["My Trips","Packing Templates","Travel Ready"],
  account:   ["My Profile","Family Members","Preferences","Access","Security & Privacy"],
};
```

**Note:** `SUBNAV` is currently defined but **not directly consumed** by the tab rendering — each screen component renders its own `nav-tabs` from its local `views` object. `SUBNAV` serves as a human-readable reference and can be used by any component that needs to enumerate modules programmatically.

**To add a module to an area:** Add the tab label string to the relevant `SUBNAV` array, then add the matching key to the `views` object inside the screen component.

---

## 6. Screen Component Pattern

Every area uses the same pattern:

```jsx
function AreaNameScreen() {
  const [tab, setTab] = useState("First Module Name");

  // Optional: section-level state for modules that need it
  const [someSec, setSomeSec] = useState("family");

  const views = {
    "Module Name 1": (
      <div>
        {/* module content */}
      </div>
    ),
    "Module Name 2": (
      <div>
        {/* module content */}
      </div>
    ),
  };

  return (
    <div>
      <div className="nav-tabs">
        {Object.keys(views).map(t => (
          <div key={t} className={`nav-tab${tab===t?" on":""}`} onClick={()=>setTab(t)}>{t}</div>
        ))}
      </div>
      {views[tab]}
    </div>
  );
}
```

**Rules:**
- Tab label string in `views` object = exactly what appears in the UI tab bar
- Always use `className="nav-tabs"` for the tab bar container and `className="nav-tab"` for each tab
- Active tab = append `" on"` to className
- Keep module content JSX inside the `views` object — don't pull it into separate sub-functions unless it's genuinely complex (like the Health sub-components)
- Section-level toggles (e.g. Me / HMG / Family scope) live inside the module's JSX, not as separate screen state — exception: Health, which has a cross-module scope bar

---

## 7. CSS Classes Reference

All CSS is generated by `makeCSS(TH)` and injected via `<style>` in `MyPal()`. CSS classes use `T.xxx` tokens baked in at render time.

### Layout
| Class | Use |
|---|---|
| `.shell` | Root flex container (full viewport height, no scroll) |
| `.sb` | Sidebar (fixed width, scrollable) |
| `.main` | Main content area (flex-1, scrollable) |
| `.topbar` | Top bar inside main (title + member picker) |

### Sidebar
| Class | Use |
|---|---|
| `.sb-logo` | Logo / app name area at top of sidebar |
| `.sb-mark` | Logo icon badge |
| `.sb-name` | "MyPal" wordmark |
| `.sb-tag` | "Family OS" tagline |
| `.sb-lbl` | Section label ("Public", "App") |
| `.si` | Sidebar nav item |
| `.si.on` | Active sidebar nav item (amber colour, warm background) |
| `.sdiv` | Sidebar divider line |

### Navigation Tabs (module-level)
| Class | Use |
|---|---|
| `.nav-tabs` | Tab bar container |
| `.nav-tab` | Individual tab |
| `.nav-tab.on` | Active tab |

### Cards
| Class | Use |
|---|---|
| `.card` | Primary content card (13px border-radius, border, padding 16px) |
| `.card2` | Secondary / nested card (slightly smaller, card2 background) |
| `.card-title` | Uppercase label at top of a card section |

### Content
| Class | Use |
|---|---|
| `.row` | List row (flex, gap, border-bottom, hover state) |
| `.row-icon` | Fixed-width icon cell in a row |
| `.row-text` | Flex-1 text cell in a row |
| `.g2` | 2-column responsive grid |

### Buttons
| Class | Use |
|---|---|
| `.btn-sm` | Small secondary button |
| `.btn-sm.btn-warm` | Small primary/warm button (amber fill) |
| `.btn-secondary` | Medium secondary button |

### Inputs
| Class | Use |
|---|---|
| `.field-input` | Text input / textarea (full-width, card2 bg) |

### Interest Tags
| Class | Use |
|---|---|
| `.int-tag` | Pill tag (e.g. hobby interests) |
| `.int-tag.on` | Active/selected tag |

---

## 8. Access Control Constants

### MOD_AC — Module permission defaults (line ~118)

```js
const MOD_AC = [
  ["AreaName", "moduleKey", "Module Label", "🔣", locked, {Owner:"Manage", Admin:"Manage", Adult:"Edit", Teen:"View", Child:"None"}],
  ...
].map(([area,key,label,icon,locked,perms]) => ({area,key,label,icon,locked,perms}));
```

This array powers the Access tab in My Account. When adding a new module, add a corresponding row here so it appears in the permissions management UI.

**Permission levels:** `Manage` (HMG only, locked) · `Edit` · `View` · `None`

### MEMBERS_AC — Demo household members (line ~85)

Six fixed demo members: James (Owner), Sarah (Admin), Alex (Adult), Mia (Teen), Lily (Child), Tom (Adult). Used by the access control components and avatar rendering throughout. The `inHMG` flag drives HMG-aware UI.

### TIERS_AC — Visibility tiers (line ~100)

Four tiers: `self`, `hmg`, `family`, `individual`. Used by `NoteRecipientPicker`. The HMG tier description is "Household Managers Group".

---

## 9. Current Prototype State

**All structural and design changes are applied and approved as of 24-May-2026.** The canonical prototype (`_UI/mypal-app.jsx`) reflects the confirmed target structure. See `_UI/specs/structural--backlog.md` Section 9 (Visual Review Log) for the full change log.

### 9.1 Confirmed area/module structure (NAV order)

| Area | Modules | Phase |
|---|---|---|
| Today | Daily Briefing | 1 |
| Life Admin | Tasks · Key Dates · Household Info · Documents · Cars & Home · Pet Care | 1 |
| Finance | Overview · Budget Envelopes · Transactions · Bills & Subs · Admin · My Finance | 1 |
| Health | Overview · Profiles · Medications · Appointments · Emergency Info · Journal | 1 |
| Recipes & Groceries | Library · Meal Planner · Grocery List · Nutrition | 1/2 |
| Travel | My Trips · Packing Templates · Travel Ready | 2 (placeholder) |
| My Account | My Profile · Family Members · Preferences · Access · Security & Privacy | 1 |

### 9.2 Notable design details confirmed in prototype

- **Tasks** (Life Admin): merges To Dos + Reminders; six groups including Recurring section; recurrence is a task property
- **My Account → My Profile**: Plan & Billing as two collapsed cards; Hobbies & Interests tag picker; identity documents section
- **My Account → Family Members**: Invite modal with interactive role picker (Adult / Teen / Child); Manage member modal
- **My Account → Preferences**: Language, Appearance (interactive theme toggle), Notifications (Phase 2 greyed)
- **My Account → Security & Privacy**: Two-Factor Auth and Your Data greyed as Phase 2
- **Modal standard**: all modals use `rgba(0,0,0,0.55)` backdrop + `blur(3px)` + `0 32px 80px rgba(0,0,0,0.55)` panel shadow; inputs use `T.surface` background
- **Visibility label**: "Visible to" (not "For (who can see this)") everywhere
- **Pet Care**: add/edit pet modals; Log Vet Visit, Log Vaccination modals; microchip/insurer on single line per pet
- **Recipes → Library**: `recipes` is `useState` (mutable array — was `REC_LIB` const); three `src` values: `predefined` / `mine` / `ai`. Compact one-line cards: `DietDot` (Indian restaurant square+circle convention; green=veg, purple=vegan, red=nonveg) + name (truncated, flex:1) + meal type badges (multi, colour-coded amber/sage/teal/muted) + cuisine `InfoTag` + one `WarmTag` + `SrcBadge` (predefined=nothing; mine=warm; ai=sage) + star. Source filter (All/My recipes/AI-made) + meal type filter combinable. Predefined recipes trigger `forkConfirm` modal before opening edit; `confirmFork` creates `src:"mine"` copy. Edit modal: `editName` (controlled input, Playfair Display, always editable), `editTags`, `editNotes` synced via `openForEdit`; `saveRecipe()` upserts by id (updates existing or appends fork). Add Recipe modal: `saveNewRecipe()` validates name + ≥1 meal type before appending. `RECIPE_OPTIONS` in Meal Planner also reads from `recipes` state — keep in sync on any rename. **Phase 1:** "Create with AI" button is `disabled` with `opacity:0.45`, `cursor:not-allowed`, and `title="Coming in a future update"` — `aiView` state and AI flow code remain in file for Phase 2.
- **Recipes → Meal Planner**: cell picker modal rendered at screen-level return (not inside views object) to avoid `position:fixed` trapping
- **Recipes → Grocery List**: inline add entry with keyboard shortcuts (Enter to add, Escape to cancel)

---

## 10. Adding a New Module — Step-by-Step

When a `ui-design-spec.md` arrives for a new module, follow this sequence:

1. **SUBNAV** — add the module name string to the relevant area key
2. **Screen component `views` object** — add the new tab key with JSX content
3. **MOD_AC** — add a permissions row for the module
4. **Data** — add any mock data constants near the top of the screen function (not at file level, unless shared across screens)
5. **State** — add section-level `useState` hooks at the top of the screen function if the module needs sub-tabs or scope toggles
6. **Preview** — verify the tab renders and the nav-tab bar looks correct before considering done

---

## 11. Rules and Guardrails

- **Working copy first** — all changes go to `_UI/ui_working/mypal-app-working.jsx`. The canonical `_UI/mypal-app.jsx` is updated only after Dip explicitly approves. Never edit the canonical file directly during a design iteration.
- **Never hardcode colours** — always `T.warm`, `T.rose`, etc.
- **Never import libraries** — the file runs without a bundler; only what's available globally (React via CDN)
- **No `localStorage`** — state only; nothing persists between sessions in the prototype
- **Keep mock data inline** — data constants belong near the component that uses them, not at file top (except `MEMBERS_AC` and `MOD_AC` which are shared)
- **Preserve the `makeCSS()` function** — do not add inline `<style>` tags; add new CSS rules inside `makeCSS()`
- **Phase 2 features** — add as visible but non-functional placeholders with a `Phase 2` chip/badge, not hidden or removed
- **Date format** — always `dd-Mon-yyyy` (e.g. `24-May-2026`) in displayed data
- **Currency** — always GBP `£` in Phase 1 data
- **File size** — the file is already large (~370KB). Avoid duplicating JSX patterns; use small helper components for repeated UI (e.g. `ScopeChip`, `PriDot`, `GroupHdr`) rather than copy-pasting markup
- **Theme safety** — all inline styles must reference `T.xxx` so they respond to theme switching; never mix hardcoded hex with `T.xxx` in the same component

---

## 12. Design Contract — Modals and Rows

> **Mandatory read.** Before writing any new modal or list row in the prototype, read this section and use the shared style constants below. Do not invent values from scratch — inconsistency across modals and rows is the direct result of bypassing this contract.

### 12.1 Shared style constants

Every component in `HAppointments` (and any other complex screen function) must define these four constants near the top of the function, before any sub-components or JSX:

```js
const fldLbl = {
  display:"block", fontSize:11, fontWeight:600, color:T.textS,
  marginBottom:4, marginTop:14, letterSpacing:".04em", textTransform:"uppercase"
};
const fldInp = {
  width:"100%", padding:"8px 11px", borderRadius:8,
  border:`1px solid ${T.border}`, background:T.surface, color:T.text,
  fontSize:13, outline:"none", fontFamily:"inherit", boxSizing:"border-box"
};
const modalShell = {
  position:"fixed", top:"50%", left:"50%", transform:"translate(-50%,-50%)",
  zIndex:201, width:"min(460px,94vw)", maxHeight:"88vh", overflowY:"auto",
  background:T.card, border:`1px solid ${T.borderHi}`, borderRadius:18,
  padding:24, boxShadow:"0 32px 80px rgba(0,0,0,0.55)"
};
const rowBase = {
  display:"flex", alignItems:"center", gap:10, padding:"8px 14px",
  borderBottom:`1px solid ${T.border}`, cursor:"pointer", transition:"background .12s"
};
```

Use `modalShell` for every modal panel. Use `rowBase` for every list row (spread it: `style={{...rowBase, ...overrides}}`). Use `fldLbl` for every modal field label. Use `fldInp` for every modal input, select, and textarea.

### 12.2 Modal anatomy

Every modal must follow this structure exactly:

| Element | Spec |
|---|---|
| Backdrop | `position:fixed, inset:0, background:rgba(0,0,0,0.6), zIndex:200, backdropFilter:blur(3px)` — click to close |
| Panel | Use `modalShell` constant — `min(460px,94vw)` wide, `borderRadius:18`, `padding:24` |
| Header — title | `fontSize:15, fontWeight:700` |
| Header — subtitle | `fontSize:11, color:T.textS, marginTop:2` — type/context info |
| Close button | Top-right; `fontSize:20, padding:"2px 7px", borderRadius:6, background:T.card2`; click to close |
| Field label | Use `fldLbl` constant — uppercase, 11px, `T.textS` |
| Field input / select | Use `fldInp` constant — 13px, `T.surface` bg, 8px border-radius |
| Section divider label | `fontSize:11, fontWeight:600, color:T.textS, margin:"16px 0 6px", letterSpacing:".04em", textTransform:"uppercase"` |
| Footer buttons | `display:"flex", gap:8, marginTop:20` — primary: `btn-sm btn-warm, flex:1, padding:"9px"`; secondary: `btn-sm, flex:1, padding:"9px"` |
| Wider modals | Use `min(480px,94vw)` when the form has side-by-side grid fields (e.g. date + time) |
| zIndex | Backdrop: 200 · Panel: 201 · Any nested: 202+ |

**Focus safety:** Never define a modal as a `const ComponentName = () => (...)` inside a parent component function — React will unmount/remount it on every parent state change, causing inputs to lose focus. Instead define it as a JSX value: `const modalJSX = (...)` and render as `{condition && modalJSX}`.

### 12.3 List row anatomy

Every list row (active appointment, schedule entry, past entry, etc.) must follow this layout:

| Column | Spec |
|---|---|
| Type icon | `fontSize:13–14, flexShrink:0, width:18–20px, textAlign:"center"` |
| Title block (2-line) | `flex:"1 1 130px", minWidth:0` — line 1: `fontSize:12.5, fontWeight:600`, overflow ellipsis; line 2: `fontSize:10, color:T.textS, marginTop:1` — contextual info (e.g. "For Dip · By Apala") |
| Date/time | `flexShrink:0, fontSize:11, color:T.text, whiteSpace:"nowrap"` — **never truncated** (auto width, no fixed flex-basis) |
| Provider/detail | `flex:"1 1 100px", minWidth:0, fontSize:10.5, color:T.textS` — overflow ellipsis, shares remaining space |
| Status badge | `flexShrink:0, fontSize:9.5, padding:"2px 7px", borderRadius:6, fontWeight:600, whiteSpace:"nowrap"` |
| Action button | `btn-sm, fontSize:10, padding:"2px 7px", flexShrink:0` |

**Row hover:** use `onMouseEnter`/`onMouseLeave` to set `background:T.card2` / `"transparent"` — never CSS `:hover` (inline styles only in prototype).

**Row separation:** `borderBottom` on each row (not `marginBottom`) — use `1px solid ${T.border}`.

**No VisPill in active rows** — visibility pills add clutter. Show visibility only inside the detail/edit modal where the user is already in an editing context.

### 12.4 Status badge colours

Use these exact values consistently across all status badges:

| Status | Background | Text colour |
|---|---|---|
| Booked | `rgba(91,184,138,0.16)` | `T.sage` |
| Not booked | `rgba(232,160,64,0.16)` | `T.amber \|\| T.warm` |
| Rescheduled | `rgba(140,120,220,0.16)` | `T.violet` |
| Cancelled | `rgba(229,115,115,0.16)` | `T.rose` |
| Done / Past | `T.card2` | `T.textS` |
| Overdue | `rgba(229,115,115,0.15)` | `T.rose` |
| Due soon | `rgba(232,160,64,0.15)` | `T.amber \|\| T.warm` |

### 12.5 Collapsible section headers (GroupHdr pattern)

Used wherever a list section can be expanded/collapsed (Tasks, Appointments, etc.):

```js
const GHdr = ({gk, label, count, accent}) => (
  <div onClick={()=>tog(gk)}
    style={{display:"flex", alignItems:"center", justifyContent:"space-between",
      padding:"8px 12px", cursor:"pointer",
      borderRadius: open[gk] ? "8px 8px 0 0" : "8px",
      background: accent ? accent+"18" : T.card2,
      border: `1px solid ${accent ? accent+"44" : T.border}`,
      marginBottom: open[gk] ? 0 : 4}}>
    <div style={{fontSize:11, fontWeight:700, textTransform:"uppercase",
      letterSpacing:".07em", color:accent||T.textS,
      display:"flex", alignItems:"center", gap:8}}>
      {label}
      <span style={{background:T.card, borderRadius:10, padding:"1px 7px",
        fontSize:10, fontWeight:600, color:accent||T.textS}}>{count}</span>
    </div>
    <span style={{fontSize:10, color:accent||T.textM}}>{open[gk]?"▼":"▶"}</span>
  </div>
);
```

Section body immediately follows with `borderRadius:"0 0 8px 8px", borderTop:"none"` to complete the rounded-rectangle look.

### 12.6 Revision note

This section was added 30-May-2026 after identifying that modals and rows were drifting apart across the Health → Appointments module iterations because each new modal/row was written from memory rather than from a shared contract.


---

## Revision history

| Version | Updated by | Last updated (UTC) | Summary |
|---|---|---|---|
| 1.0 | Dip | 24/05/2026 UTC | Initial version — file structure, design system tokens, CSS class reference, screen component pattern. |
| 1.1 | Dip | 30/05/2026 UTC | Added Section 12 (Design Contract for modals and rows): shared style constants, modal anatomy, list row anatomy, status badge colours, GroupHdr pattern. Added revision note. |
| 1.2 | Cowork | 12/06/2026 UTC | Added proper document header and revision history. Updated NAV and SUBNAV to match actual prototype (added recipes/travel, removed lifestyle; updated module lists). Updated Section 9.1 confirmed module structure. Added _UI/CLAUDE.md to file ownership table. |
