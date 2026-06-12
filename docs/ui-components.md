# MyPal — UI Component Reference

| | |
|---|---|
| **File** | `docs/ui-components.md` |
| **Purpose** | Usage reference for every primitive in `frontend/src/components/ui/`. Read this before writing any JSX for a new screen. It is the Tailwind translation of the prototype's inline `T.xxx` styles. |
| **Version** | 1.0 |
| **Last updated** | 2026-06-12 UTC |

---

## Before you build anything

1. **Read this file first.** If a primitive exists here, use it — never hand-roll a button, modal, or input.
2. **If the design needs a pattern not covered**, add a new component to `src/components/ui/` rather than writing one-off inline styles in the feature component.
3. **The prototype uses `T.xxx` inline styles.** This file shows the Tailwind equivalent for each. Translate using the token table in `frontend/CLAUDE.md`.

---

## Button

**File:** `src/components/ui/Button.tsx`

**When to use:** Primary CTAs (save, submit, continue) and secondary actions at screen level. Not for compact inline row actions — use `BtnSm` for those.

**Props:**

| Prop | Type | Default | Notes |
|---|---|---|---|
| `variant` | `"primary" \| "secondary" \| "ghost"` | `"primary"` | See visual guide below |
| `loading` | `boolean` | `false` | Shows a spinner; disables the button |
| `fullWidth` | `boolean` | `false` | `w-full` |
| `disabled` | `boolean` | `false` | Standard HTML disabled |

**Variants:**
- `primary` — warm→rose gradient, white text, shadow. Use for the main action on a screen.
- `secondary` — bordered card, theme text. Use for cancel/back or secondary actions.
- `ghost` — text only, secondary colour. Use for tertiary/destructive text links.

```tsx
<Button onClick={handleSave}>Save changes</Button>
<Button variant="secondary" onClick={onClose}>Cancel</Button>
<Button loading={isPending} fullWidth>Create account</Button>
```

---

## BtnSm

**File:** `src/components/ui/BtnSm.tsx`

**When to use:** Compact inline actions inside list rows, cards, or modals. Matches the prototype's `.btn-sm` and `.btn-warm` classes.

**Props:**

| Prop | Type | Default | Notes |
|---|---|---|---|
| `tone` | `"default" \| "warm" \| "rose"` | `"default"` | |
| `fullWidth` | `boolean` | `false` | |

- `default` — neutral bordered pill (`bg-card2`, `border-border`)
- `warm` — tinted active/confirm action (`bg-warm/15`, `border-warm`, `text-warm`)
- `rose` — destructive action (`border-rose`, `text-rose`)

```tsx
<BtnSm onClick={handleEdit}>Edit</BtnSm>
<BtnSm tone="warm" onClick={handleConfirm}>Confirm</BtnSm>
<BtnSm tone="rose" onClick={handleDelete}>Remove</BtnSm>
```

---

## Input

**File:** `src/components/ui/Input.tsx`

**When to use:** All text inputs — plain text, email, password, number, search. Built-in password reveal toggle. Use `<select>` with the standard style (see below) for dropdowns — there is no Select component yet.

**Props:**

| Prop | Type | Default | Notes |
|---|---|---|---|
| `label` | `string` | required | Rendered as an uppercase small label above the field |
| `error` | `string` | — | Renders error text below in `text-rose`; adds `border-rose/60` |
| `hint` | `ReactNode` | — | Help text below field (mutually exclusive with `error`) |
| `endAdornment` | `ReactNode` | — | Icon or text slotted into the right edge |
| `type` | HTML input type | `"text"` | `"password"` automatically adds show/hide toggle |

```tsx
<Input label="Email address" name="email" type="email" />
<Input label="Password" name="password" type="password" error={errors.password?.message} />
<Input label="Amount" name="amount" type="number" endAdornment="£" />
```

---

## Select (no component yet — use this pattern)

There is no `Select` component. Use a plain `<select>` with these classes until one is added. The custom `▾` indicator is required to override browser default styling.

```tsx
<div className="block">
  <span className="mb-1.5 block text-xs uppercase tracking-[0.18em] text-textS">
    {label}
  </span>
  <div className="relative">
    <select
      className="w-full appearance-none rounded-md border border-border bg-card2 px-3.5 py-2.5 pr-8 font-body text-[15px] text-text outline-none focus:border-warm focus:ring-1 focus:ring-warm/40"
    >
      {options}
    </select>
    <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[10px] text-textS">
      ▾
    </span>
  </div>
</div>
```

---

## Modal

**File:** `src/components/ui/Modal.tsx`

**When to use:** Every modal/dialog in the app. Uses native `<dialog>` — do not introduce a modal library.

**Props:**

| Prop | Type | Default | Notes |
|---|---|---|---|
| `open` | `boolean` | required | Controls visibility |
| `onClose` | `() => void` | required | Called when backdrop clicked or ✕ pressed |
| `title` | `ReactNode` | required | Displayed in the modal header |
| `widthClass` | `string` | `"w-[min(460px,94vw)]"` | Override for wide modals (`w-[min(640px,96vw)]`) |
| `footer` | `ReactNode` | — | Renders below a divider, right-aligned; put action buttons here |
| `children` | `ReactNode` | required | Modal body content |

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

**Pattern note:** Control `open` with `useState`. Pass `onClose` as the state setter. A modal never controls its own visibility.

---

## Tabs

**File:** `src/components/ui/Tabs.tsx`

**When to use:** Area sub-navigation (required for every multi-module area — see `frontend/CLAUDE.md`). Also for in-page tab switching where the tab content lives at a different route.

**Props:**

| Prop | Type | Notes |
|---|---|---|
| `tabs` | `TabItem[]` | `{ key: string; label: string; href?: string }` |
| `current` | `string` | The active tab's `key` |
| `basePath` | `string` | Prepended to each tab's href (e.g. `"/health"`) |

```tsx
// In <HealthTabs> — reads current path to set active tab
"use client";
import { usePathname } from "next/navigation";
import { Tabs } from "@/components/ui/Tabs";

const TABS = [
  { key: "overview",        label: "Overview" },
  { key: "appointments",    label: "Appointments" },
  { key: "medications",     label: "Medications" },
  { key: "journal",         label: "Journal" },
  { key: "preventive-care", label: "Preventive Care" },
];

export function HealthTabs() {
  const pathname = usePathname();
  const current = TABS.find(t => pathname.includes(t.key))?.key ?? "overview";
  return <Tabs tabs={TABS} current={current} basePath="/health" />;
}
```

---

## ListRow

**File:** `src/components/ui/ListRow.tsx`

**When to use:** Any clickable list item that opens detail, a modal, or navigates. Has leading slot (icon/checkbox), truncated title, and trailing slot (chips, meta text).

**Props:**

| Prop | Type | Notes |
|---|---|---|
| `leading` | `ReactNode` | Left-side slot (icon, avatar, checkbox) |
| `title` | `ReactNode` | Main text — truncates with ellipsis |
| `trailing` | `ReactNode` | Right-side meta — chips, dates, badges |
| `onClick` | `() => void` | Makes the row clickable + keyboard accessible |
| `muted` | `boolean` | 60% opacity for completed/archived items |

```tsx
<ListRow
  leading={<span>🐾</span>}
  title="Vaccination booster — Luna"
  trailing={<span className="text-rose">Overdue</span>}
  onClick={() => setSelectedPet(pet)}
/>
```

For complex row layouts with a metadata cluster on the right (date + badge + button), use the WrapRow pattern from `docs/design-system.md`.

---

## Card and Card.Row

**File:** `src/components/ui/Card.tsx`

**When to use:** `Card` wraps any section of content with a rounded border. `Row` creates a bordered-bottom row inside a card — use it for key-value or list layouts within a card.

```tsx
<Card title="Pet details">
  <Row>
    <span className="text-textS text-xs">Breed</span>
    <span className="ml-auto text-text text-sm">Golden Retriever</span>
  </Row>
  <Row>
    <span className="text-textS text-xs">DOB</span>
    <span className="ml-auto text-text text-sm">14/03/2021</span>
  </Row>
</Card>
```

---

## Chip

**File:** `src/components/ui/Chip.tsx`

**When to use:** Toggleable filter tags, multi-select options, status badges that are also interactive. For non-interactive badges use a `<span>` with `bg-<colour>/15 text-<colour> border border-<colour>/40 rounded-full px-2 py-0.5 text-[10px] font-semibold`.

**Props:**

| Prop | Type | Notes |
|---|---|---|
| `label` | `ReactNode` | |
| `selected` | `boolean` | Active state: `bg-warm/15 border-warm text-warm` |
| `onClick` | `() => void` | |
| `leading` | `ReactNode` | Optional icon/emoji before label |

```tsx
<Chip label="Vegetarian" selected={filters.includes("veg")} onClick={() => toggle("veg")} />
<Chip label="🐱 Cats" leading="🐱" selected={petFilter === "cat"} onClick={() => setPetFilter("cat")} />
```

---

## Collapsible

**File:** `src/components/ui/Collapsible.tsx`

**When to use:** Any section that should start collapsed and expand on click. The production equivalent of the prototype's `GroupHeader` pattern.

**Props:**

| Prop | Type | Default | Notes |
|---|---|---|---|
| `title` | `ReactNode` | required | |
| `badge` | `ReactNode` | — | Shown next to title when collapsed only |
| `defaultOpen` | `boolean` | `false` | Start expanded |

```tsx
<Collapsible title="Upcoming appointments" badge={<span className="text-xs text-textS">3</span>}>
  {appointments.map(a => <ListRow key={a.id} ... />)}
</Collapsible>
```

---

## FormError

**File:** `src/components/ui/FormError.tsx`

**When to use:** Form-level errors (e.g. "Invalid credentials"). Not for field-level errors — pass `error` to `Input` for those.

```tsx
<FormError>{form.formState.errors.root?.message}</FormError>
```

---

## RadioCard

**File:** `src/components/ui/RadioCard.tsx`

**When to use:** Plan tier picker, multi-option selection where each option needs a title and description. Visually distinct from a standard radio button.

**Props:**

| Prop | Type | Notes |
|---|---|---|
| `title` | `string` | Large display text |
| `description` | `string` | Small secondary text |
| `icon` | `ReactNode` | Optional emoji/icon in a circular badge |
| + all `<input type="radio">` props | | `name`, `value`, `checked`, `onChange` etc. |

```tsx
<RadioCard
  name="plan"
  value="solo"
  title="Individual"
  description="Perfect for a single person. £2.99/mo."
  icon="👤"
  checked={plan === "solo"}
  onChange={() => setPlan("solo")}
/>
```

---

## Layout shells (not general-use)

- **`AuthShell`** — centred card layout for public auth screens (`/sign-in`, `/sign-up`). Already used in `(public)/` layouts; don't use elsewhere.
- **`PublicShell`** — outer shell for public-facing pages. Used in the root layout for public routes.

---

## Non-interactive badge pattern

There is no `Badge` component. Use this inline pattern:

```tsx
// Colour semantics: rose=overdue/error, amber=warning, sage=done, warm=active, teal=info
<span className="rounded-full border border-rose/40 bg-rose/15 px-2 py-0.5 text-[10px] font-semibold text-rose">
  Overdue
</span>
```

---

## Revision history

| Version | Updated by | Last updated (UTC) | Summary |
|---|---|---|---|
| 1.0 | Cowork | 2026-06-12 UTC | Initial version grounded in actual component implementations. |
