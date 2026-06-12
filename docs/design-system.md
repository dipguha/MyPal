# MyDigitalPal — Design System

> **Version:** 1.2 · **Last updated:** 2026-05-24  
> Extracted from `_UI/mypal-app.jsx`, `CLAUDE.md`, `MyDigitalPal_architecture.md`, and feature specs.  
> This is the single source of truth for visual and UX decisions. Always consult alongside the live prototype at `_UI/mypal-app.jsx`.  
> For product terminology (roles, areas, modules, visible_to model, HMG, permission levels) see [`_specs/terminology.md`](_specs/terminology.md).

---

## Table of Contents

1. [Design Direction](#1-design-direction)
2. [Colour Tokens](#2-colour-tokens)
3. [Typography](#3-typography)
4. [Spacing & Layout](#4-spacing--layout)
5. [Elevation & Surfaces](#5-elevation--surfaces)
6. [Components](#6-components)
7. [Patterns](#7-patterns)
8. [Motion & Animation](#8-motion--animation)
9. [Icons & Imagery](#9-icons--imagery)
10. [UX Writing](#10-ux-writing)
11. [Access Control Model](#11-access-control-model)
12. [Implementation Rules](#12-implementation-rules)

---

## 1. Design Direction

**Name:** Warm Intelligence

**Concept:** A premium family product that feels warm and personal, not cold and corporate. Dark base with amber/terracotta accents creates editorial warmth while organised card layouts deliver clarity. Think a beautifully lit home rather than a productivity dashboard.

**Three words:** Warm · Organised · Intelligent

**Audience:** UK families (1–6 members). Primary user is a busy parent who manages household life across multiple domains — health, finance, tasks, travel, and more.

**Tone:** Calm confidence. The app does the heavy lifting; it never shouts or overwhelms.

---

## 2. Colour Tokens

### 2.1 Source of truth

Colours live in two places that must stay in sync:

| File | Role |
|------|------|
| `_UI/mypal-app.jsx` — the `T` object | Prototype source of truth |
| `frontend/src/lib/theme.ts` | TypeScript token map (mirrors `T`) |
| `frontend/src/app/globals.css` — `@theme {}` block | Tailwind CSS variables |
| `frontend/tailwind.config.ts` | Tailwind utility names |

**Rule:** Adding a colour means adding a token in all four files. Never write a literal hex anywhere else.

---

### 2.2 Dark mode palette (default)

| Token | Hex | Tailwind class | Usage |
|-------|-----|----------------|-------|
| `bg` | `#080910` | `bg-bg` | Page/shell background |
| `surface` | `#0f1018` | `bg-surface` | Sidebar, topbar |
| `card` | `#13151f` | `bg-card` | Primary cards |
| `card2` | `#181b27` | `bg-card2` | Nested cards, inputs, secondary surfaces |
| `border` | `#1e2236` | `border-border` | Default borders |
| `borderHi` | `#2c304a` | `border-border-hi` | Hover/active borders |

---

### 2.3 Semantic colours

Each semantic colour has a base and a `S` (surface/tint, ~13% opacity) variant. Always use the `S` variant for backgrounds behind coloured text.

| Token | Base hex | Tint token | Semantic meaning |
|-------|----------|-----------|-----------------|
| `warm` | `#e8a040` | `warmS` `rgba(232,160,64,0.13)` | **Primary.** Family warmth, brand, primary CTA, active states |
| `warmG` | `rgba(232,160,64,0.07)` | — | Very subtle warm tint (ghost backgrounds, hero gradient) |
| `teal` | `#38c4b4` | `tealS` `rgba(56,196,180,0.13)` | **Secondary / AI.** MyPal AI, tech features |
| `rose` | `#e06868` | `roseS` `rgba(224,104,104,0.13)` | **Destructive / error.** Delete, remove, error states |
| `sage` | `#5bb88a` | `sageS` `rgba(91,184,138,0.13)` | **Success / positive.** Completed, paid, verified, finance area |
| `sky` | `#4899e0` | `skyS` `rgba(72,153,224,0.13)` | **Informational.** Info banners, Finance area accent |
| `violet` | `#9870e8` | `violetS` `rgba(152,112,232,0.13)` | **Creative / lifestyle.** Lifestyle area, AI gradients |
| `amber` | `#d88830` | `amberS` `rgba(216,136,48,0.13)` | **Warning / due soon.** Overdue-adjacent states |
| `lime` | `#78b820` | `limeS` `rgba(120,184,32,0.13)` | Supplementary (e.g. healthy metrics) |
| `pink` | `#d06090` | `pinkS` `rgba(208,96,144,0.13)` | Supplementary (e.g. profile accents) |

---

### 2.4 Text colours

| Token | Hex | Usage |
|-------|-----|-------|
| `text` | `#e2e4f0` | Primary body text |
| `textS` | `#636880` | Secondary / muted text, placeholders, labels |
| `textM` | `#303448` | Tertiary / very muted text, dividers, disabled |

---

### 2.5 Light mode palette

The app ships with a dark/light toggle. Light mode tokens mirror the same semantic roles with adjusted values for legibility on a warm cream background.

| Token | Light hex |
|-------|-----------|
| `bg` | `#FBF7F0` |
| `surface` | `#FFFFFF` |
| `card` | `#FFFFFF` |
| `card2` | `#F0E8D8` |
| `border` | `#E0CEAD` |
| `borderHi` | `#CDB890` |
| `warm` | `#B06010` |
| `teal` | `#1A7A70` |
| `rose` | `#A83838` |
| `sage` | `#286840` |
| `sky` | `#1860A8` |
| `violet` | `#5838A8` |
| `text` | `#18120A` |
| `textS` | `#6A5840` |
| `textM` | `#C0A880` |

---

### 2.6 Area accent map

Each top-level area of the app has an assigned accent colour. Use it for the active sidebar indicator, section titles, and area-specific badges.

| Area | Accent token | Phase | Notes |
|------|-------------|-------|-------|
| Today | `warm` | 1 | |
| Life Admin | `teal` | 1 | |
| Finance | `sage` | 1 | |
| Health | `rose` | 1 | |
| Recipes & Groceries | `lime` | 1 | Promoted from Lifestyle — confirmed 24-May-2026 |
| Travel | `sky` | 2 | ⚠️ Conflicts with My Account — token to be confirmed before Phase 2 build |
| My Account | `sky` | 1 | |

**Removed:** Lifestyle area dissolved 24-May-2026. Pet Care moved to Life Admin. Hobbies & Interests dissolved into My Account → My Profile preferences.

---

### 2.7 Permission level colours

Used in access control UI only.

| Level | Colour token |
|-------|-------------|
| Manage | `warm` |
| Edit | `sage` |
| View | `sky` |
| None | `textS` |

---

### 2.8 Due-date colour coding (Bills & Subs)

| State | Colour token |
|-------|-------------|
| Overdue | `rose` |
| Due within 7 days | `amber` |
| Upcoming | `textS` (muted) |

---

## 3. Typography

### 3.1 Typefaces

| Role | Font family | Weights used |
|------|-------------|-------------|
| **Display / headings** | Playfair Display (Google Fonts) | 500, 700, 900; italic 400, 700 |
| **Body / UI** | DM Sans (Google Fonts) | 300, 400, 500, 600 |

Import via: `@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,500;0,700;0,900;1,400;1,700&display=swap')`

**Rule:** Never substitute another font. If the Google Fonts import fails, fall back to `serif` for Playfair Display and `sans-serif` for DM Sans.

---

### 3.2 Type scale

| Name | CSS class | Font | Size | Weight | Usage |
|------|-----------|------|------|--------|-------|
| Hero title | `.hero-title` | Playfair Display | 46px | 900 | Marketing page hero only |
| Section title | `.section-title` | Playfair Display | 22px | 700 | Screen/module headings |
| Card heading | `.card-title` | DM Sans | 11px | 700 | All-caps card label headers |
| Sidebar brand | `.sb-name` | Playfair Display | 18px | 700 | App logo wordmark |
| Topbar title | `.tb-title` | Playfair Display | 17px | 700 | Current section name |
| Body | — | DM Sans | 14px | 400/500 | General content |
| Small body | — | DM Sans | 13px | 400/500 | List rows, descriptions |
| Micro | — | DM Sans | 11–12px | 400–600 | Labels, secondary text |
| Tag / badge | — | DM Sans | 10–10.5px | 600–700 | Badges, tags, pill labels |

**Heading rule:** Section headings use Playfair Display. Everything else (buttons, labels, inputs, body copy) uses DM Sans. The only exceptions are stat numbers in cards, which also use Playfair Display for visual weight.

---

### 3.3 Label pattern

Form field labels and card section labels follow a fixed pattern:

```
font-size: 11px
font-weight: 700
text-transform: uppercase
letter-spacing: 0.06–0.12em
color: textS
```

This applies to: `.field-label`, `.card-title`, `.section-title` (sub-variant), `.sb-lbl`.

---

## 4. Spacing & Layout

### 4.1 Shell structure

```
┌─────────────────────────────────────────────┐
│  .shell  (display:flex; height:100vh)        │
│  ┌──────────┐  ┌──────────────────────────┐ │
│  │ .sb      │  │ .main                    │ │
│  │ 200px    │  │ ┌──────────────────────┐ │ │
│  │ sidebar  │  │ │ .topbar  54px        │ │ │
│  │          │  │ └──────────────────────┘ │ │
│  │          │  │ ┌──────────────────────┐ │ │
│  │          │  │ │ .content             │ │ │
│  │          │  │ │ padding: 22px        │ │ │
│  │          │  │ │ overflow-y: auto     │ │ │
│  └──────────┘  └──────────────────────────┘ │
└─────────────────────────────────────────────┘
```

- **Sidebar:** `width: 200px; min-width: 200px` — fixed, not collapsible in v1
- **Topbar:** `height: 54px` — fixed
- **Content area:** `padding: 22px` — consistent across all authenticated screens
- **Scrollbar:** Custom, `width: 3px`, matches `border` token colour

---

### 4.2 Grid system

| Class | Columns | Gap | Usage |
|-------|---------|-----|-------|
| `.g2` | 2 × `1fr` | 14px | Pricing cards, two-column form layouts |
| `.g3` | 3 × `1fr` | 12px | Stats row, triple-column layouts |
| `.g4` | 4 × `1fr` | 10px | Dense metric grids |
| `.g-auto` | `repeat(auto-fill, minmax(220px, 1fr))` | 12px | Responsive card grids (e.g. modules list) |

---

### 4.3 Spacing scale

Spacing is not formally tokenised — use multiples of 4px. Common values observed in the prototype:

| Value | Typical use |
|-------|-------------|
| 4px | Tight inline gaps (chip padding, badge gaps) |
| 6px | Row gaps within a card list |
| 8px | Button padding (small), small gaps |
| 10–11px | Row padding, default button gap |
| 12–14px | Card internal padding (card2) |
| 16px | Card internal padding (card), sidebar item padding |
| 18–20px | Section padding, onboarding step spacing |
| 22px | Main content area padding |
| 28px | Section-to-section separation |

---

### 4.4 Border radius scale

| Value | Applied to |
|-------|-----------|
| 6–7px | Small elements (checkboxes, small badges, quick-row selects) |
| 8px | Small buttons (`.btn-sm`), tags, nav tabs, group headers |
| 9–10px | Form inputs, note items, info banners |
| 11px | Secondary cards (`.card2`) |
| 12–13px | Primary cards (`.card`), dropdown menus, trip cards |
| 14–16px | Modals, confirmation dialogs |
| 18–20px | Pill chips (member chips, interest tags) |
| 50% | Circular avatars |

---

## 5. Elevation & Surfaces

The app uses five surface levels, from darkest to lightest (in dark mode):

| Level | Token | Hex | Typical element |
|-------|-------|-----|----------------|
| 0 — Page | `bg` | `#080910` | Shell background |
| 1 — Shell | `surface` | `#0f1018` | Sidebar, topbar |
| 2 — Card | `card` | `#13151f` | Primary cards, modal backgrounds |
| 3 — Nested | `card2` | `#181b27` | Input backgrounds, nested cards, card sub-rows |
| 4 — Overlay | Modal scrim | `rgba(0,0,0,0.55) + backdrop-filter:blur(3px)` | Modal dimmer |

**Rule:** Never skip levels. A card on `bg` uses `card`. A nested item inside a `card` uses `card2`. An input inside a card uses `card2`.

### Shadows

Shadows are reserved for modals and floating dropdowns:

| Element | Box shadow |
|---------|-----------|
| Dropdown menus | `0 18px 50px rgba(0,0,0,0.45)` |
| Modals / dialogs | `0 32px 80px rgba(0,0,0,0.55)` |
| Primary button | `0 4px 18px rgba(232,160,64,0.28)` |
| Primary button (hover) | `0 6px 22px rgba(232,160,64,0.40)` |
| CTA button (hero) | `0 6px 24px rgba(232,160,64,0.35)` |

Cards do **not** use box shadows — borders carry the separation job.

---

## 6. Components

### 6.1 Buttons

#### Primary button — `.btn-primary`
```css
padding: 12px 20px
border-radius: 11px
background: linear-gradient(135deg, warm, rose)   /* #e8a040 → #e06868 */
color: #fff
font-family: DM Sans
font-size: 14px
font-weight: 600
border: none
width: 100%
box-shadow: 0 4px 18px rgba(232,160,64,0.28)
transition: all 0.2s
```
Hover: `translateY(-1px)`, stronger shadow.  
Use for: the single primary action per screen (sign up, create account, confirm, etc.).

#### Secondary button — `.btn-secondary`
```css
padding: 11px 20px
border-radius: 11px
background: transparent
border: 1px solid border
color: text
font-size: 14px
width: 100%
margin-top: 8px
```
Hover: `border-color: borderHi; background: card2`.  
Use for: alternative or back actions, below a primary button.

#### Small button — `.btn-sm`
```css
padding: 6px 14px
border-radius: 8px
font-size: 12px
font-weight: 600
border: 1px solid border
background: card2
color: text
```
Hover: `border-color: warm; color: warm`.  
Use for: inline actions inside cards (e.g. "Cancel", "← Back", "+ Add").

#### Small warm button — `.btn-sm.btn-warm`
```css
border-color: warm
color: warm
background: warmS
```
Hover: `background: warm; color: #fff`.  
Use for: primary inline action in a card (e.g. "+ Add to HMG").

#### Hero CTA — `.hero-cta`
```css
padding: 14px 32px
border-radius: 12px
background: linear-gradient(135deg, warm, rose)
color: #fff
font-weight: 700
font-size: 15px
box-shadow: 0 6px 24px rgba(232,160,64,0.35)
```
Hover: `translateY(-2px)`, stronger shadow.  
Use for: marketing page CTAs only. Never inside the authenticated app shell.

#### Disabled state
Set `opacity: 0.5` and `cursor: not-allowed`. Apply to any button variant.

---

### 6.2 Cards

#### Primary card — `.card`
```css
background: card          /* #13151f */
border: 1px solid border  /* #1e2236 */
border-radius: 13px
padding: 16px
```

#### Secondary / nested card — `.card2`
```css
background: card2         /* #181b27 */
border: 1px solid border
border-radius: 11px
padding: 13px
```

**Hover state on interactive cards:**
```css
border-color: warm
background: warmG
cursor: pointer
```

**Selected / active card:**
```css
border-color: warm + "44"   /* 26% opacity warm border */
background: warmG           /* rgba(232,160,64,0.07) */
```

---

### 6.3 Form elements

#### Text input — `.field-input`
```css
width: 100%
background: card2
border: 1px solid border
border-radius: 10px
color: text
font-family: DM Sans
font-size: 14px
padding: 11px 14px
outline: none
transition: all 0.2s
```
Focus: `border-color: warm; box-shadow: 0 0 0 3px warmG`.

#### Field wrapper — `.field`
```css
margin-bottom: 14px
```

#### Field label — `.field-label`
```css
font-size: 11px
font-weight: 600
text-transform: uppercase
letter-spacing: 0.06em
color: textS
margin-bottom: 6px
```

#### Select element
Matches `.field-input` styles. Custom dropdown arrow injected via `background-image` SVG. Remove native appearance with `appearance: none`.

#### Checkbox (custom)
```css
width: 18px; height: 18px
border-radius: 5px
border: 1.5px solid border   /* unchecked */
background: card2            /* unchecked */

/* Checked state */
border-color: warm
background: warm
color: #fff    /* checkmark */
font-size: 10px
```

#### Password strength bar — `.pbar` / `.pfill`
```css
.pbar  { height: 4px; border-radius: 2px; background: border }
.pfill { height: 100%; border-radius: 2px; transition: width 0.5s ease }
```
Fill colour progression: rose (weak) → amber (fair) → teal (good) → sage (strong).

---

### 6.4 Navigation

#### Sidebar — `.sb`
```css
width: 200px
background: surface
border-right: 1px solid border
```

**Logo area — `.sb-logo`**
```css
padding: 18px 16px 14px
border-bottom: 1px solid border
```
The brand mark is `width: 32px; height: 32px; border-radius: 9px; background: linear-gradient(135deg, warm, rose); box-shadow: 0 4px 14px rgba(232,160,64,0.3)`.  
Wordmark font: Playfair Display, 18px, 700, colour: `warm`.

**Sidebar section label — `.sb-lbl`**
```css
font-size: 9px; font-weight: 700; letter-spacing: 0.12em
color: textM; text-transform: uppercase
padding: 10px 16px 4px
```

**Sidebar item — `.si`**
```css
display: flex; align-items: center; gap: 8px
padding: 7px 16px
font-size: 13px; color: textS
border-left: 3px solid transparent
transition: all 0.15s
```
Hover: `background: warmG; color: text`.  
Active — `.si.on`: `background: warmS; color: warm; border-left-color: warm`.

**Sidebar item icon — `.si-ic`**
```css
width: 16px; text-align: center; font-size: 13px
```

#### Topbar — `.topbar`
```css
height: 54px
background: surface
border-bottom: 1px solid border
padding: 0 22px
gap: 12px
```
Title: `.tb-title` — Playfair Display, 17px, 700, colour: `warm`.

**Topbar chip — `.tb-chip`**
```css
display: flex; align-items: center; gap: 5px
padding: 4px 10px; border-radius: 18px
font-size: 12px; border: 1px solid border; background: bg
white-space: nowrap
```
Hover / active: `border-color: warm; background: warmS; color: warm`.  
Use for: member filter (e.g. "👨‍👩‍👧‍👦 Family", "👨 James"), view toggles.

#### Sub-navigation tabs — `.nav-tabs` / `.nav-tab`
```css
.nav-tabs  { display: flex; gap: 6px; margin-bottom: 18px; flex-wrap: wrap }
.nav-tab   { padding: 6px 14px; border-radius: 8px; font-size: 12.5px
             border: 1px solid border; color: textS; background: card }
```
Hover: `border-color: borderHi; color: text`.  
Active — `.nav-tab.on`: `background: warmS; border-color: warm; color: warm`.

---

### 6.5 Badges & tags

#### Generic badge — `.badge`
```css
display: inline-flex; align-items: center; gap: 4px
font-size: 10.5px; font-weight: 600
padding: 2px 8px; border-radius: 8px
```
Pair with a semantic background: `background: warmS; color: warm`, etc.

#### Dot indicator — `.dot`
```css
width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0
```
Colour matches the semantic state.

#### Row tag — `.row-tag`
```css
font-size: 10.5px; padding: 2px 8px; border-radius: 8px; font-weight: 500
```

#### Status badge recipe
```
background: {colour}S   (13% opacity tint)
color: {colour}
border: 1px solid {colour}33   (optional — used in some banners)
```

#### Permission badge
```css
padding: 2px 8px; border-radius: 7px
font-size: 11px; font-weight: 700
min-width: 62px; text-align: center
/* e.g. Manage: background warmS, color warm */
```

---

### 6.6 List rows — `.row`

```css
display: flex; align-items: center; gap: 10px
padding: 9px 0; border-bottom: 1px solid border
```
Last child: `border: none`.  
Hover: `background: card2; margin: 0 -16px; padding-left: 16px; padding-right: 16px; border-radius: 6px`.

Row anatomy:
- `.row-icon` — `font-size: 16px; width: 26px; text-align: center` — emoji glyph
- `.row-text` — `flex: 1; font-size: 13px` — primary label
- `.row-sub` — `font-size: 11px; color: textS` — secondary info
- `.row-tag` — status or category badge (right-aligned)
- `.row-check` — circular completion toggle

**Completion checkbox — `.row-check`**
```css
width: 18px; height: 18px; border-radius: 50%
border: 2px solid border; cursor: pointer
transition: all 0.15s
```
Done — `.row-check.done`:
```css
background: sage; border-color: sage
```

---

### 6.7 Avatars

#### Single avatar — `<AvatarAC>`
```css
display: inline-flex; align-items: center; justify-content: center
border-radius: 50%
background: linear-gradient(135deg, {member.color}, {member.color}cc)
color: #fff
border: 1.5px solid surface    /* creates stacking gap */
```
Default size: 22px. Sizes used: 20, 22, 26, 32, 44px. Font size = `size × 0.55`.

Each member has an assigned colour from the palette (e.g. Owner → `warm`, Admin → `rose`, Teal member → `teal`, Teen → `violet`, Child → `sky`).

#### Avatar stack — `<AvatarStackAC>`
Overlapping avatars: `margin-left: -6px` from the second onward. Overflow shows a `+N` circle in `card2` / `textS`.

#### Member chips — `.mem-chip`
```css
display: flex; align-items: center; gap: 6px
padding: 4px 11px; border-radius: 18px
font-size: 12px; border: 1px solid border; background: bg
```
Active: `border-color: warm; background: warmS; color: warm`.

---

### 6.8 Modals & dialogs

**Canonical reference:** `TaskDetailsModal.tsx`.

**Scrim:**
```css
position: fixed; inset: 0
background: rgba(0,0,0,0.55)
backdrop-filter: blur(3px)
z-index: 300
```

**Dialog container:**
```css
position: fixed; top: 50%; left: 50%
transform: translate(-50%, -50%)
z-index: 301
width: min(460px, 94vw)
background: card
border: 1px solid borderHi
border-radius: 16px
padding: 22px
box-shadow: 0 32px 80px rgba(0,0,0,0.55)
```

Modal header pattern: avatar/icon + Playfair Display title (18px, 700) + close button (✕, `background: card2`).

Modal footer: `display: flex; justify-content: flex-end; gap: 8px`. Cancel uses `.btn-sm`; confirm uses `.btn-sm.btn-warm` (or rose gradient for destructive actions).

**Implementation rule:** Use native `<dialog>` element in the actual frontend. Do not import any modal library.

---

### 6.9 Dropdowns

**Container:**
```css
position: absolute; top: calc(100% + 4px); left: 0; right: 0
background: card; border: 1px solid borderHi; border-radius: 12px
padding: 6px; box-shadow: 0 18px 50px rgba(0,0,0,0.45)
z-index: 203
```

Backdrop close: fixed overlay at `z-index: 202` below the dropdown — clicking outside closes it.

Dropdown item:
```css
display: flex; align-items: center; gap: 11px
padding: 9px 11px; border-radius: 8px; cursor: pointer
```
Active item: `background: warmS; border: 1px solid warm+"55"`.

---

### 6.10 Progress bar

```css
.pbar  { height: 4px; border-radius: 2px; background: border; overflow: hidden; margin-top: 6px }
.pfill { height: 100%; border-radius: 2px; transition: width 0.5s ease }
```
Fill colour is context-dependent (see password strength, budget progress).

---

### 6.11 Info banners

Info/warning banners inside cards:
```css
padding: 11px 14px; border-radius: 10px; font-size: 12.5px; line-height: 1.6
background: {colour}S   (or warmG for very subtle)
border: 1px solid {colour}33
```

**AI banner — `.ai-banner`**
```css
padding: 14px 16px; border-radius: 12px; margin-bottom: 14px
background: linear-gradient(135deg, tealS, violetS)
border: 1px solid teal+"33"
display: flex; align-items: flex-start; gap: 13px
```
AI byline — `.ai-name`: Playfair Display, 11px, 700, colour: `teal`, uppercase, letter-spacing: 0.06em.

---

### 6.12 Social login buttons — `.social-btn`
```css
display: flex; align-items: center; gap: 12px
width: 100%; padding: 12px 16px; border-radius: 11px
border: 1px solid border; background: card2
font-size: 13.5px; font-weight: 500
margin-bottom: 9px; transition: all 0.2s
```
Hover: `border-color: borderHi; background: card; transform: translateX(2px)`.

---

### 6.13 Onboarding stepper

```css
.step-bar { display: flex; align-items: center; gap: 0; margin-bottom: 28px }

.step-dot {
  width: 28px; height: 28px; border-radius: 50%
  border: 2px solid border; background: card2
  font-size: 11px; font-weight: 700; color: textS
  transition: all 0.3s
}
.step-dot.active { border-color: warm; color: warm }
.step-dot.done   { background: warm; border-color: warm; color: #fff }

.step-line       { flex: 1; height: 2px; background: border; transition: background 0.3s }
.step-line.done  { background: warm }

.step-lbl { position: absolute; top: 33px; left: 50%; transform: translateX(-50%); font-size: 9px; color: textS; white-space: nowrap }
```

---

### 6.14 Interest / filter tags — `.int-tag`
```css
padding: 6px 14px; border-radius: 20px
border: 1.5px solid border; background: card2; color: textS
font-size: 13px; cursor: pointer; transition: all 0.18s
```
Hover: `border-color: warm+"44"; color: text`.  
Active: `border-color: warm; background: warmS; color: warm`.

---

### 6.15 Topbar / section chips — `.tb-chip`

See §6.4 Navigation. Also used for member filter chips in topbar.

---

### 6.16 Group headers (collapsible) — `.grp-hdr`

```css
display: flex; align-items: center; justify-content: space-between
padding: 8px 12px; cursor: pointer
background: card2; border: 1px solid border; transition: all 0.15s
```
Closed: `border-radius: 8px; margin-bottom: 8px`.  
Open: `border-radius: 8px 8px 0 0; margin-bottom: 0`.

**Group body — `.grp-body`**
```css
background: card; border: 1px solid border; border-top: none
border-radius: 0 0 8px 8px; padding: 8px 16px 12px; margin-bottom: 10px
```

**Chevron rotation:** `transform: rotate(90deg)` when open, `rotate(0deg)` when closed. `transition: transform 0.15s`.

---

### 6.17 Health stats — `.h-stat`
```css
padding: 12px; border-radius: 10px
border: 1px solid border; background: card2
```
Value — `.h-val`: Playfair Display, 22px, 700.  
Label — `.h-lbl`: 10.5px, `textM`.

---

### 6.18 Emergency button — `.emergency-btn`
```css
display: flex; align-items: center; gap: 10px
padding: 14px 16px; border-radius: 12px
background: linear-gradient(135deg, rgba(224,104,104,0.15), rgba(232,160,64,0.10))
border: 1px solid rose+"44"
cursor: pointer; transition: all 0.2s; margin-bottom: 16px
```
Hover: stronger rose tint.

---

## 7. Patterns

### 7.1 Section anatomy

Every authenticated module screen follows this structure:

```
[Sub-nav tabs]        ← .nav-tabs (if multiple sub-views)
[Section title]       ← .section-title (Playfair Display, 22px)
[Section subtitle]    ← .section-sub (13px, textS, margin-bottom: 20px)
[Member / filter chips in topbar]
[Content cards]       ← .card or .g2/.g3 grid
```

---

### 7.2 Card title pattern

```
.card-title = uppercase label + optional action link (right-aligned, textS)
```
Example: `UPCOMING BILLS` (left) · `See all →` (right).

---

### 7.3 Two-step picker pattern

Used for recipient/visibility pickers (e.g. note recipient, bill visibility). Step 1 shows tier options (Self / HMG / Family / Individual). Selecting "Individual" advances to step 2: a person-picker list. Back button returns to step 1.

---

### 7.4 Inline add row

Bills & Subs and similar list modules use an inline add row at the bottom of each section — a quick-form embedded directly in the list, not a modal. Fields are compact inputs matching `.qrow input` / `.qrow select`.

---

### 7.5 Mark as Paid / completion toggle

- Unpaid / incomplete: `.row-check` with `border: 2px solid border`
- Paid / complete: `.row-check.done` — `background: sage; border-color: sage` + a ✓ glyph
- Tapping again resets to unpaid/incomplete
- State persists on reload (server-backed)

---

### 7.6 Confirmation dialog pattern

Destructive or irreversible actions (e.g. remove from HMG, delete account) trigger a modal with:
1. Avatar/icon + Playfair Display title
2. A tinted box listing "What changes" in bullet points — positive actions use `warm` tint, destructive use `rose` tint
3. A brief plain-text disclaimer sentence
4. Footer: Cancel (`.btn-sm`) + Confirm (gradient warm→rose for add, rose gradient for remove)

---

### 7.7 Permission display pattern

Module permission rows (used in access control):
- Icon (emoji, 22px, opacity 0.55 if locked)
- Label (`font-size: 13px, font-weight: 500`)
- "Custom" badge (`warmS` background) when overridden
- "Reset" link when custom and unlocked
- Permission: either a static badge (locked) or a `<select>` dropdown (editable)

---

### 7.8 Public page layout (Home / Sign Up / Sign In)

These screens use the full `.main` area without the sidebar member filter chips. The marketing hero has a radial gradient overlay:
```css
background: radial-gradient(ellipse 80% 60% at 50% -20%, rgba(232,160,64,0.12), transparent 70%), bg
```

---

### 7.9 Error state

Inline error banner inside a form:
```css
padding: 10px 14px; border-radius: 10px
background: roseS; border: 1px solid rose
font-size: 13px; color: rose
margin-bottom: 14px
```

---

### 7.10 "Coming soon" badge

```css
font-size: 11px; padding: 2px 7px; border-radius: 5px
background: card2; border: 1px solid border; color: textS
```
Applied inline next to disabled features (e.g. "Sign in with phone").

---

### 7.11 OR divider — `.or-div`
```css
display: flex; align-items: center; gap: 12px
color: textM; font-size: 12px; margin: 16px 0
```
Uses `::before` / `::after` pseudo-elements as `height: 1px; background: border` lines.

---

## 8. Motion & Animation

### 8.1 Defined animations

```css
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(10px) }
  to   { opacity: 1; transform: translateY(0) }
}

@keyframes pop {
  from { transform: scale(0); opacity: 0 }
  to   { transform: scale(1); opacity: 1 }
}
```

| Class | Animation | Duration | Used for |
|-------|-----------|----------|---------|
| `.fade-up` | `fadeUp` | 0.3s ease | Screen transitions, new step reveals |
| `.pop-in` | `pop` | 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) | Completion states, celebration moments |

### 8.2 Transition defaults

| Element type | Transition |
|-------------|-----------|
| Buttons, chips, rows | `all 0.15s` |
| Primary button hover | `all 0.2s` |
| Stepper dots/lines | `all 0.3s` |
| Progress bar fill | `width 0.5s ease` |
| Chevron rotation | `transform 0.15s` |

---

## 9. Icons & Imagery

### 9.1 Icon system — emoji glyphs

**Rule:** All icons are emoji glyphs. No icon library (no lucide-react, react-icons, Heroicons, Feather, Font Awesome, or similar) is permitted. Introducing an icon library requires a deliberate ADR decision.

### 9.2 Navigation area icons

| Area | Emoji | Phase |
|------|-------|-------|
| Today | 🌅 | 1 |
| Life Admin | 📋 | 1 |
| Finance | 💷 | 1 |
| Health | 🩺 | 1 |
| Recipes & Groceries | 🍳 | 1 |
| Travel | ✈️ | 2 |
| My Account | 👤 | 1 |

**Removed:** Lifestyle (🎯) dissolved 24-May-2026.

### 9.3 Module icons (Life Admin)

| Module | Emoji | Notes |
|--------|-------|-------|
| Tasks | ✅ | Renamed from "To Dos" — merges To Dos + Reminders |
| Household Info | 📝 | |
| Documents | 📁 | |
| Cars & Home | 🚗 | Renamed from "Car & Home" |
| Pet Care | 🐾 | Moved from Lifestyle — confirmed 24-May-2026 |

### 9.4 Module icons (Finance)

| Module | Emoji |
|--------|-------|
| Overview | 💷 |
| Budget Envelopes | 💰 |
| Transactions | 💳 |
| Bills & Subs | 📄 |
| Finance Admin | ⚙️ |

### 9.5 Module icons (Health)

| Module | Emoji |
|--------|-------|
| Overview | 💊 or 💚 |
| Medications | 💊 |
| Appointments | 📅 |
| Journal | 📔 |
| Emergency Info | 🚨 |

### 9.6 Functional / UI icons

| Purpose | Emoji |
|---------|-------|
| Chevron / expand | ▶ (rotated 90° when open) |
| Collapse | ▼ (rotated 180° when open) |
| Close | ✕ |
| Back | ← |
| Forward/next | → or › |
| Checkmark | ✓ |
| Lock / private | 🔒 |
| Security | 🛡️ |
| AI / MyPal brain | 🤖 or custom glyph |
| Warning | ⚠️ |
| Info | ℹ️ |

### 9.7 Brand mark

The brand mark is a `32×32` element with `border-radius: 9px` and `background: linear-gradient(135deg, warm, rose)`. It displays an emoji (🏠 or similar) at 15px. No external image asset — purely CSS + emoji.

---

## 10. UX Writing

### 10.1 Voice & tone

**Voice:** Knowledgeable friend — warm, direct, and never condescending.  
**Tone shifts:** Calm for everyday states → slightly encouraging for empty states → clear and plain for errors.

**Writing rules:**
- UK English throughout. "authorise" not "authorize". "organisation" not "organization". "colour" not "color". "practise" (verb) vs "practice" (noun).
- Active voice. "You haven't added any bills yet" not "No bills have been added."
- Short sentences. Aim for ≤15 words per sentence in UI copy.
- No jargon. "Due this week" not "items with due_date ≤ +7d".

---

### 10.2 Date & currency format

| Type | Format | Example |
|------|--------|---------|
| Date | dd-Mon-yyyy | `20-May-2026` |
| Currency | £{amount} | `£4.99`, `£2.99/mo` |
| Currency range | £{x}–£{y} | `£2.99–£4.99` |
| Month/year (abbreviated) | Mon-yyyy | `May-2026` |

**Rule:** Never expose raw enum values to users. The plan type `"solo"` is always labelled **Individual** in the UI. The plan type `"family"` is always labelled **Family**.

---

### 10.3 Pricing copy

| Plan DB value | UI label | Price | CTA |
|---------------|----------|-------|-----|
| `solo` | Individual | £2.99/mo | "Start 14-day free" |
| `family` | Family | £4.99/mo | "Start 14-day free" |

Both plans show: "14 days free, no card needed."

---

### 10.4 Empty states

Pattern: emoji → serif heading → short sub-copy → optional CTA.  
Example: `📄` → "No bills yet" → "Add your first household bill to start tracking." → `[+ Add bill]`

---

### 10.5 Error messages

| Error type | Copy pattern |
|-----------|-------------|
| Invalid email/password | "Incorrect email or password." + forgot password link |
| Required field | "{Field} is required." |
| Password too weak | Strength label: "Weak" / "Fair" / "Good" / "Strong" |
| Verification email | "We've sent you a verification link. Click it to activate your account — it expires in 24 hours." |
| Resend | "Resend email" (link) |

---

### 10.6 Action labels

| Action | Label | Notes |
|--------|-------|-------|
| Mark bill/task paid | "Mark as Paid" | Turns green; tapping again reverts |
| Remove item | "Remove" | No confirmation for most items; see §7.6 for destructive actions |
| Add member to HMG | "Add {name} to HMG" | Confirmation dialog required |
| Remove member from HMG | "Remove from HMG" | Confirmation dialog required |
| Permission change | "None" / "View" / "Edit" | Never show "Manage" as a selectable option — it is set by role |

---

### 10.7 Notification / banner patterns

| Scenario | Tone | Colour |
|----------|------|--------|
| Unused subscription | Warning nudge: "Unused 6 wks" | `amber` / `amberS` |
| Overdue bill | Urgent: date in `rose` | `rose` |
| Due this week | Caution: date in `amber` | `amber` |
| Completed / paid | Positive: sage tick | `sage` |
| AI insight | Informative, conversational | `teal` gradient |
| Privacy confirmation | Reassuring | `warm` tint |

---

## 11. Access Control Model

### 11.1 Five member roles

| Role | DB value | Description |
|------|----------|-------------|
| Owner | `Owner` | Account creator. Full access to everything. Always in HMG. |
| Admin | `Admin` | Co-manager (e.g. partner/spouse). Same operational access as Owner. Default HMG member. Personal data private from Owner. |
| Adult Member | `Adult` | 18+. Module access granted per-module by Owner/Admin. Can be added to HMG by Owner/Admin. |
| Teenager | `Teen` | 13–17. Restricted access. Can reopen assigned tasks. Inbox highlights not visible to Owner/Admin. |
| Child | `Child` | Under 13. No independent privacy from Owner/Admin. No Finance access. |

---

### 11.2 Module permission levels

| Level | Colour | Who can grant | Meaning |
|-------|--------|--------------|---------|
| Manage | `warm` | By role only (Owner/Admin) | Full control — add, edit, delete, configure |
| Edit | `sage` | Owner/Admin per-module | Add, edit, mark done, change visibility (visible_to). Cannot delete module or change settings. |
| View | `sky` | Owner/Admin per-module | Read-only. Cannot add, edit, or delete. |
| None | `textS` | Owner/Admin per-module | Module is hidden entirely. |

**Rule:** The Manage level cannot be assigned via the per-module permission UI. Promote to Admin role to grant full management. The permission dropdowns only expose None / View / Edit.

---

### 11.3 Visibility tiers (`visible_to` field)

Every item carries a `visible_to` field (stored as a column on the item's own table) with four possible values. The visibility picker UI presents these as the "who is this for?" control.

| Tier | DB value | Icon | Who sees it |
|------|----------|------|-------------|
| Self | `self` | 🔒 | Only the creator |
| HMG | `hmg` | 🛡️ | Household Managers Group (Owner + Admin + any elevated Adults) |
| Family | `family` | 🏠 | All household members |
| Individual | `individual` | 👥 | Specific people the creator picks (stored in `visible_to_members[]`) |

Children can only set visible_to to HMG (they cannot set Self, Family, or Individual).  
Sensitive content types (journal, health) default to Self and show extra copy: "even Owner/Admin can't see this."

---

### 11.4 Household Managers Group (HMG)

- Owner is always in HMG; cannot be removed.
- Admin is in HMG by default; can be removed but this is unusual.
- Adult Members can be added to HMG by Owner or Admin (one-at-a-time confirmation flow).
- Teenagers and Children can never join HMG.
- HMG members can see items assigned to HMG across every module, see Children's items, and direct items to Children.

---

## 12. Implementation Rules

These are hard rules. Exceptions require a written ADR entry.

### 12.1 Styling

| Rule | Details |
|------|---------|
| Tailwind CSS v4 only | No CSS-in-JS, no CSS modules, no `.css` files outside `globals.css` |
| No third-party component libraries | No shadcn/ui, Radix, Headless UI, Mantine, MUI, Chakra, Ant, NextUI, DaisyUI, Flowbite |
| No inline `style={{}}` for static values | Inline style permitted only for genuinely dynamic values (e.g. computed percentage widths). Dynamic values must reference CSS variables via `var(--…)`, never literal hex/rgb/hsl. |
| No hard-coded colours | Never `text-[#abc]`, `bg-[#fff]`, `style={{ color: "#…" }}`. All colours from theme tokens. |
| No icon libraries | Emoji glyphs only. See §9. |
| Modals use native `<dialog>` | Mirror `TaskDetailsModal.tsx`. No modal library. |
| Toasts use `react-hot-toast` | Via `<Toaster>` in `AppToaster.tsx`. No `sonner` or alternatives. |
| Class composition via `cn` | `src/lib/cn.ts` (wraps `clsx` + `tailwind-merge`). Don't import `clsx` directly. |
| Arbitrary brackets for sizes OK | `text-[12px]`, `w-[460px]` are allowed. Never for colours. |

---

### 12.2 Component rules

- Shared primitives live in `src/components/ui/` — Button, Input, Card, RadioCard, FormError, AuthShell.
- Never create a duplicate Button or Input component. Extend the existing ones.
- Canonical reference components: `TaskDetailsModal.tsx` (modals), `TaskRow.tsx` (list rows), `Button.tsx` (primitives).

---

### 12.3 Locale conventions

| Convention | Value |
|-----------|-------|
| Currency | GBP, symbol £ |
| Date format | dd-Mon-yyyy (e.g. `20-May-2026`) |
| Language | UK English |
| Region | EU (`eu-west-1`) |
| Time zone | UK (GMT/BST) |

---

### 12.4 Token sync checklist

When adding a new colour token:
1. Add to `T` object in `_UI/mypal-app.jsx`
2. Add to `frontend/src/lib/theme.ts`
3. Add CSS variable in `frontend/src/app/globals.css` `@theme {}`
4. Add Tailwind class mapping in `frontend/tailwind.config.ts`
5. Add light-mode variant to `T_LIGHT` in the prototype

---

### 12.5 Commit convention (reminder)

```
feat(<feature-slug>): short description
fix(<feature-slug>): short description
chore(<feature-slug>): short description
```

Commit after each verified phase — not at the end of the whole feature.

---

*End of design system. For the interactive prototype, open `_UI/mypal-app.jsx`. For architecture decisions and ADR log, see `architecture_decisions.md`.*
