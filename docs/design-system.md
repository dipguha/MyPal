# MyPal — Design System

| | |
|---|---|
| **File** | `docs/design-system.md` |
| **Purpose** | Single source of visual and UX truth for the production codebase. Read this before building any screen or component. Covers colour tokens, typography, every shared UI primitive, and the recurring UX patterns that span multiple modules. |
| **Version** | 2.1 |
| **Updated by** | Claude Code |
| **Last updated** | 12/06/2026 19:30 UTC |

**Maintaining this file.** Every edit must: (1) bump the version, (2) update **Last updated** to current UTC time, (3) set **Updated by**, (4) append a revision history row.

---

## Before building any screen — mandatory pre-flight

1. Read this file. If a primitive or pattern exists here, use it — never hand-roll.
2. Read each file in `frontend/src/components/ui/` — the source is authoritative; the props tables below summarise them.
3. If a design pattern calls for something not covered here, propose a new `src/components/ui/` component rather than writing one-off inline styles.

The prototype uses `T.xxx` inline styles. This file shows the Tailwind equivalent. Token mapping: `T.warm` → `text-warm` / `bg-warm`, `T.card` → `bg-card`, etc.

---

## 1. Colour tokens

### 1.1 Source of truth

Colours are defined in four places that must stay in sync:

| File | Role |
|---|---|
| `_UI/mypal-app.jsx` — `T` object | Prototype source of truth |
| `frontend/src/app/globals.css` — `@theme {}` | CSS custom properties (authoritative for production) |
| `frontend/tailwind.config.ts` | Tailwind utility names |
| `frontend/src/lib/theme.ts` | TypeScript `T` mirror (use for reference only) |

**Rule:** Adding a colour token means updating all four files. See the Token sync checklist at the end.

---

### 1.2 Surface tokens

| Token | Tailwind | Hex (dark) | Usage |
|---|---|---|---|
| `bg` | `bg-bg` | `#080910` | Page / shell background |
| `surface` | `bg-surface` | `#0f1018` | Sidebar, topbar |
| `card` | `bg-card` | `#13151f` | Primary content cards |
| `card2` | `bg-card2` | `#181b27` | Nested cards, inputs, secondary surfaces |
| `border` | `border-border` | `#1e2236` | Default borders |
| `borderHi` | `border-border-hi` | `#2c304a` | Hover / focus borders |

---

### 1.3 Semantic colours

Each semantic colour has a base token and an `S` (surface tint, ~13% opacity) variant. Always use the `S` variant for coloured backgrounds behind text.

| Token | Tailwind | Hex | `S` token | Semantic meaning |
|---|---|---|---|---|
| `warm` | `text-warm` / `bg-warm` | `#e8a040` | `bg-warm/15` | **Primary.** Brand, CTAs, active states, family warmth |
| `teal` | `text-teal` / `bg-teal` | `#38c4b4` | `bg-teal/15` | **Secondary / AI.** MyPal AI, tech features |
| `rose` | `text-rose` / `bg-rose` | `#e06868` | `bg-rose/15` | **Error / destructive.** Delete, error states |
| `sage` | `text-sage` / `bg-sage` | `#5bb88a` | `bg-sage/15` | **Success / positive.** Completed, paid, verified |
| `amber` | `text-amber` / `bg-amber` | `#d88830` | `bg-amber/15` | **Warning / due soon.** Near-overdue states |
| `sky` | `text-sky` / `bg-sky` | `#4899e0` | `bg-sky/15` | **Informational.** Info banners, read-only states |
| `violet` | `text-violet` / `bg-violet` | `#9870e8` | `bg-violet/15` | **Scheduled / future.** Recurring, upcoming events |
| `lime` | `text-lime` / `bg-lime` | `#78b820` | `bg-lime/15` | Recipes & Groceries, growth |
| `pink` | `text-pink` / `bg-pink` | `#d06090` | `bg-pink/15` | Supplementary — profile accents |

---

### 1.4 Text tokens

| Token | Tailwind | Hex (dark) | Usage |
|---|---|---|---|
| `text` | `text-text` | `#e2e4f0` | Primary body text |
| `textS` | `text-textS` | `#636880` | Secondary / muted text, labels, placeholders |
| `textM` | `text-textM` | `#303448` | Disabled / very muted, dividers |

---

### 1.5 Area accent map

Each top-level area has an assigned accent. Use it for active sidebar indicator, section headings, and area-specific badges.

| Area | Token | Tailwind |
|---|---|---|
| Today | `warm` | `text-warm` |
| Life Admin | `teal` | `text-teal` |
| Finance | `sage` | `text-sage` |
| Health | `rose` | `text-rose` |
| Recipes & Groceries | `lime` | `text-lime` |
| Travel | `sky` | `text-sky` ⚠️ conflicts with My Account — confirm before Phase 2 |
| My Account | `sky` | `text-sky` |

---

### 1.6 Badge colour semantics

| Status | Background | Text | Tailwind example |
|---|---|---|---|
| Overdue / error | `roseS` | `rose` | `bg-rose/15 text-rose border-rose/40` |
| Warning / due soon | `amberS` | `amber` | `bg-amber/15 text-amber border-amber/40` |
| Done / success | `sageS` | `sage` | `bg-sage/15 text-sage border-sage/40` |
| Active / in progress | `warmS` | `warm` | `bg-warm/15 text-warm border-warm/40` |
| Info / scheduled | `tealS` | `teal` | `bg-teal/15 text-teal border-teal/40` |
| Neutral / past | `card2` | `textS` | `bg-card2 text-textS border-border` |

---

### 1.7 Permission level colours (access control UI only)

| Level | Token | Tailwind |
|---|---|---|
| Manage | `warm` | `text-warm` |
| Edit | `sage` | `text-sage` |
| View | `sky` | `text-sky` |
| None | `textS` | `text-textS` |

---

## 2. Typography

| Role | Font | Tailwind | Usage |
|---|---|---|---|
| Display / headings | Playfair Display | `font-display` | Area titles, hero text, stat numbers |
| Body / UI | DM Sans | `font-body` | Everything else |

**Rule:** Never substitute another font. Playfair Display for titles, DM Sans for all UI copy.

### Field label pattern

All form field labels use this exact style (maps to `fldLbl` in the prototype):

```tsx
<span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.04em] text-textS">
  Label text
</span>
```

---

## 3. UI primitives (`src/components/ui/`)

Always reuse these. Never create a duplicate button, input, or modal.

### Button

`variant`: `"primary"` | `"secondary"` | `"ghost"` · `loading` · `fullWidth`

- `primary` — warm→rose gradient, white text. Main CTA.
- `secondary` — bordered card. Cancel / secondary actions.
- `ghost` — text only, `textS` colour. Tertiary / destructive links.

```tsx
<Button onClick={handleSave}>Save changes</Button>
<Button variant="secondary" onClick={onClose}>Cancel</Button>
<Button loading={isPending} fullWidth>Create account</Button>
```

### BtnSm

`tone`: `"default"` | `"warm"` | `"rose"` · `fullWidth`

Compact inline action buttons inside rows, cards, or modals.

```tsx
<BtnSm tone="warm" onClick={handleConfirm}>Confirm</BtnSm>
<BtnSm tone="rose" onClick={handleDelete}>Remove</BtnSm>
```

### Input

`label` (required) · `error` · `hint` · `endAdornment` · `type`

All text inputs. `type="password"` auto-adds show/hide toggle. Pass `error` for field-level validation messages.

```tsx
<Input label="Email address" name="email" type="email" />
<Input label="Amount" name="amount" type="number" endAdornment="£" error={errors.amount?.message} />
```

### Select (no component yet — use this pattern)

Wrap every `<select>` in a relative div with a `▾` indicator. Never leave a bare `<select>`.

```tsx
<div>
  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.04em] text-textS">
    {label}
  </span>
  <div className="relative">
    <select className="w-full appearance-none rounded-md border border-border bg-card2 px-3.5 py-2.5 pr-8 text-[15px] text-text outline-none focus:border-warm focus:ring-1 focus:ring-warm/40">
      {options}
    </select>
    <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[10px] text-textS">▾</span>
  </div>
</div>
```

### Date inputs

Always `type="date"` — never `type="text"` with a date placeholder.

```tsx
<Input label="Due date" name="dueDate" type="date" />
```

### Modal

`open` · `onClose` · `title` · `widthClass` (default `"w-[min(460px,94vw)]"`) · `footer` · `children`

Uses native `<dialog>`. Never introduce a modal library. Control `open` with `useState` — modals never control their own visibility.

```tsx
<Modal
  open={isOpen}
  onClose={() => setIsOpen(false)}
  title="Add expense"
  footer={
    <>
      <BtnSm onClick={() => setIsOpen(false)}>Cancel</BtnSm>
      <BtnSm tone="warm" onClick={handleSave}>Save</BtnSm>
    </>
  }
>
  <Input label="Description" name="description" />
  <Input label="Amount" name="amount" type="number" endAdornment="£" />
</Modal>
```

### Tabs

`tabs` (TabItem[]) · `current` · `basePath`

Area sub-navigation (required for every multi-module area). See `frontend/CLAUDE.md` for the `<AreaTabs>` scaffolding rule.

```tsx
<Tabs tabs={TABS} current={current} basePath="/health" />
```

### ListRow

`leading` · `title` (required) · `trailing` · `onClick` · `muted`

Standard clickable list item. Title truncates with ellipsis. For complex right-side metadata clusters, use the WrapRow pattern (see Section 4).

```tsx
<ListRow
  leading={<span>🐾</span>}
  title="Vaccination booster — Luna"
  trailing={<span className="text-rose text-xs">Overdue</span>}
  onClick={() => setSelected(pet)}
/>
```

### Card / Card.Row

Content card with optional title. `Row` export creates bordered-bottom key-value rows inside a card.

```tsx
<Card title="Pet details">
  <Row><span className="text-textS text-xs">Breed</span><span className="ml-auto text-sm">Golden Retriever</span></Row>
</Card>
```

### Chip

`label` · `selected` · `onClick` · `leading` · `disabled`

Toggleable filter tag. Selected: `bg-warm/15 border-warm text-warm`.

```tsx
<Chip label="Vegetarian" selected={filters.includes("veg")} onClick={() => toggle("veg")} />
```

### Collapsible

`title` · `badge` · `defaultOpen` (false) · `children`

Collapsible section. Starts collapsed. Equivalent of the prototype's `GroupHeader` pattern.

```tsx
<Collapsible title="Upcoming appointments" badge={<span className="text-xs text-textS">3</span>}>
  {items.map(i => <ListRow key={i.id} ... />)}
</Collapsible>
```

### FormError

Form-level error block. For field errors pass `error` to `Input` instead.

```tsx
<FormError>{form.formState.errors.root?.message}</FormError>
```

### RadioCard

`title` · `description` · `icon` + standard radio props. Plan tier picker, multi-option selection.

```tsx
<RadioCard name="plan" value="solo" title="Individual" description="£2.99/mo." checked={plan==="solo"} onChange={()=>setPlan("solo")} />
```

### Non-interactive badge (no component)

```tsx
<span className="rounded-full border border-rose/40 bg-rose/15 px-2 py-0.5 text-[10px] font-semibold text-rose">
  Overdue
</span>
```

---

## 4. UX patterns

These patterns appear across multiple modules. Use them consistently — never invent a local variant.

### WrapRow — responsive two-column list row

Use when a row has a right-side metadata cluster (date + badge + button) that must not crush the title on narrow screens.

```tsx
<div className="flex flex-wrap items-start gap-2 px-3 py-2">
  {/* Left unit — icon + text */}
  <div className="flex min-w-0 flex-[1_1_160px] items-start gap-2">
    <span className="mt-0.5 h-5 w-5 shrink-0 rounded-[5px]">{icon}</span>
    <div className="min-w-0 flex-1">
      <p className="truncate text-[13px] font-medium">{title}</p>
      <div className="mt-0.5 flex flex-wrap gap-1.5">
        {/* For · By labels */}
        <span className="text-[11px] text-textS">
          <span className="mr-0.5 text-[10px] uppercase tracking-[.04em] text-textM">For</span>
          {forName}
        </span>
      </div>
    </div>
  </div>
  {/* Right unit — metadata */}
  <div className="flex shrink-0 items-center gap-1.5">
    {date}
    <div className="h-3 w-px shrink-0 bg-border" /> {/* sep */}
    {badge}
  </div>
</div>
```

On wide screens left and right sit side by side. On narrow screens the right unit wraps below, giving the title full width. Use for any row where the right side has more than one `whitespace-nowrap` item.

### DataRow — row content convention

The standard content for a WrapRow. Follow this for every list row unless there's an explicit reason not to.

- **Left line 1:** title — `text-[13px] font-medium truncate`
- **Left line 2:** `For [assignee]` and `By [creator]` — each as `text-[11px] text-textS`, with the label (`For`, `By`) in `text-[10px] uppercase tracking-[.04em] text-textM`
- **Right:** metadata items separated by a `h-3 w-px bg-border` vertical divider. All right-side text uses `whitespace-nowrap`.
- **"By" omitted** when creator is always the viewer or irrelevant in context.

### ForVisPair — For + Visible to field group

Two-column grid used in every add/edit form where an item has an assignee and visibility. Always use this exact structure.

```tsx
<div className="grid grid-cols-2 gap-2.5">
  <div>
    <span className="...label classes...">For</span>
    <div className="relative">
      <select className="...select classes... pr-8">
        {MEMBERS.map(m => <option key={m.id} value={m.id}>{m.av} {m.name}{m.you?" (you)":""}</option>)}
        <option value="family">👥 Family</option>
        <option value="hmg">🛡 Household Managers</option>
      </select>
      <span className="...chevron...">▾</span>
    </div>
  </div>
  <div>
    <span className="...label classes...">Visible to</span>
    <div className="relative">
      <select defaultValue="family" className="...select classes... pr-8">
        {MEMBERS.map(m => <option key={m.id} value={m.id}>{m.av} {m.name}{m.you?" (you)":""}</option>)}
        <option value="family">👥 Family</option>
        <option value="hmg">🛡 Household Managers</option>
      </select>
      <span className="...chevron...">▾</span>
    </div>
  </div>
</div>
```

**Rules:** For options = all members + Family + HMG. Visible to options = same. Visible to defaults to `"family"`. Both single-select. The `▾` chevron span is mandatory on every select.

### FreqLeadPair — frequency + auto-defaulting lead time

Two-column grid for schedule forms. Frequency select on left; lead time select on right (only renders when a frequency is chosen).

Lead time defaults and maxima (ADR-011 — user can always override up to the max):

| Frequency | Default | Max |
|---|---|---|
| Weekly | 1 day | 3 days |
| Every 2 Weeks | 2 days | 1 week |
| Monthly | 3 days | 2 weeks |
| Quarterly | 1 week | 1 month |
| Half Yearly | 2 weeks | 3 months |
| 9 Months + | 2 weeks | 3 months |
| Yearly | 1 month | 3 months |
| 18 Months+ | 1 month | 3 months |

**Behaviour:** frequency change → auto-set lead to default. Disallowed options show `(max: X)` and are `disabled`. onChange guard prevents setting a disallowed value.

### RowModalSync — bidirectional row ↔ edit modal data exchange

Every clickable list row that has an edit modal must follow this pattern.

**Requirements:**
1. Item collection in React `useState` (not a `const`)
2. Row click: `onClick={() => setEditState({...item, _contextId: container.id})}`
3. Modal uses IIFE pattern: `{editState && (()=>{ const handleSave = ...; return (<>...</>); })()}`
4. `useRef` on the modal container: `ref={editFormRef}`
5. All form fields use `defaultValue` (not `value`) so they show current data
6. Save handler reads via `formRef.current.querySelector('[name="x"]')?.value` and writes back to state collection
7. Cancel resets `editState` to null without writing

### ScopePicker — visibility selector

Pill segmented control. Values: `"own"` | `"hmg"` | `"family"` | `"individual"`. Implement as `src/components/ui/ScopePicker.tsx` (not yet created). Active pill: `bg-teal text-white`. Inactive: `text-textS`. Vertical `1px border-border` dividers between unselected pills; hide dividers adjacent to the active pill. "Own" is the single canonical label for self-only visibility — never "Me", "Self", or "Just me".

### ForPicker — assignee selector

Same visual as ScopePicker but with different icons and captions (assigning vs visibility). Values: `"own"` | `"hmg"` | `"family"` | `"individual"`. Implement as `src/components/ui/ForPicker.tsx` (not yet created). Inline layout: bold `"Show for"` label on left, pill control on right with `flex: 1 1 auto`.

### GroupHeader with accent — coloured collapsible group header

For lists that group items by status/time (overdue, today, this week, etc.) and need colour-coded headers. Extends the `Collapsible` primitive with an accent colour prop.

Canonical accent colours: `rose` (overdue) · `amber` (today/warning) · `teal` (this week) · `sage` (this month) · `violet` (next month / scheduled) · no accent = neutral `bg-card2` header.

Header background: `bg-[accent]/[.19]` · border: `border-[accent]/[.53]` · `borderRadius: "8px 8px 0 0"` when open, `"8px"` when closed.

---

## 5. Responsive layout patterns

These patterns complement the rules in `frontend/CLAUDE.md`. Use them when building any screen or component.

### 5.1 Breakpoint reference

| Prefix | Min width | Primary target |
|---|---|---|
| *(none)* | 0px | Mobile (375px baseline) |
| `sm:` | 640px | Large mobile / small tablet |
| `md:` | 768px | Tablet |
| `lg:` | 1024px | Laptop / desktop |
| `xl:` | 1280px | Wide desktop |

Always write the mobile class first, then layer breakpoint overrides.

### 5.2 Common responsive class pairs

| Element | Mobile | Desktop |
|---|---|---|
| Page container | `px-4 py-4 w-full` | `lg:max-w-3xl lg:px-6` |
| Stat grid | `grid grid-cols-2 gap-3` | `md:grid-cols-4` |
| Card grid | `grid grid-cols-1 gap-3` | `md:grid-cols-2 lg:grid-cols-3` |
| Form field pair (ForVisPair) | `grid grid-cols-1 gap-2.5` | `sm:grid-cols-2` |
| Sidebar visibility | `hidden` | `md:flex` |
| Bottom nav visibility | `flex` | `md:hidden` |
| Area heading | `text-xl font-display` | `md:text-2xl lg:text-3xl` |

### 5.3 Table handling

Wrap all `<table>` elements in `<div className="overflow-x-auto">`. On screens below `sm`, consider reflowing the table as a stack of cards using `block` display overrides rather than a horizontal scroll.

### 5.4 Modal on mobile

`Modal` defaults to `w-[min(460px,94vw)]` which is already mobile-safe. Do not override the width class to a fixed value wider than `94vw`. On mobile the modal should appear centred over the viewport, not anchored to the bottom — do not convert to a bottom sheet without a written decision.

### 5.5 Touch targets

All tappable elements must be at least `44×44px`. Check using the `min-h-[44px]` utility when a button or row would otherwise be shorter. `ListRow`, `Button`, and `BtnSm` already satisfy this at their default sizes.

---

## 6. Token sync checklist

When adding a new colour token, update all four files in the same commit:

1. Add to `T` object in `_UI/mypal-app.jsx` (dark value)
2. Add to `T_LIGHT` in the same file (light-mode equivalent)
3. Add CSS variable in `frontend/src/app/globals.css` `@theme {}` block
4. Add Tailwind class mapping in `frontend/tailwind.config.ts`

Never add a token to only one place — the prototype and production will diverge.

---

## Revision history

| Version | Updated by | Last updated (UTC) | Summary |
|---|---|---|---|
| 1.0–1.2 | Dip / Cowork | 2026-05-24 – 2026-05-30 | Original design-system.md from old MyDigitalPals project. Covered tokens, typography, components (old codebase), patterns, access control model, implementation rules. |
| 2.0 | Cowork | 12/06/2026 UTC | Full rewrite for new MyPal repo. Merged with docs/ui-components.md (deleted). Kept: colour tokens, typography, area accent map, badge semantics, token sync checklist. Added: all production primitives grounded in actual src/components/ui/ files (Button, BtnSm, Input, Modal, Tabs, ListRow, Card, Chip, Collapsible, FormError, RadioCard), UX patterns (WrapRow, DataRow, ForVisPair, FreqLeadPair, RowModalSync, ScopePicker, ForPicker, GroupHeader). Removed: stale implementation rules (now in frontend/CLAUDE.md), access control model (→ _specs/terminology.md), Motion/Animation, UX Writing. |
| 2.1 | Claude Code | 12/06/2026 19:30 UTC | Added Section 5 — Responsive layout patterns: breakpoint reference table, common responsive class pairs, table handling, modal mobile behaviour, touch target rule. Token sync checklist renumbered to Section 6. |
