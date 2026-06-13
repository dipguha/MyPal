# frontend/CLAUDE.md

> **Version:** 1.3
> **Updated by:** Claude Code
> **Last updated:** 12/06/2026 19:30 UTC

Frontend-only conventions. For global rules (branch naming, locale, auth model overview) see the root `CLAUDE.md`. For the UI component catalogue and design tokens see `docs/design-system.md`.

---

## Before building any screen or component — mandatory pre-flight

1. **Read `docs/design-system.md`** — props, usage examples, and anti-patterns for every shared primitive; also covers colour tokens, UX patterns (WrapRow, ForVisPair, RowModalSync, etc.), and badge semantics.
2. **Read every file in `src/components/ui/`** — the actual implementations are the ground truth; the reference doc summarises them but the source is authoritative.
3. Use what exists. Never hand-roll a button, input, modal, select, or tab component. If the design calls for a pattern not covered by existing primitives, propose adding a new `src/components/ui/` component rather than writing one-off styles in the feature file.

Missing this step is the single most common cause of inconsistent UI. Skip it and Claude Code will create duplicate, unstyled components that require manual correction.

---

## Source layout

All paths below are relative to `frontend/`.

```
src/
├── app/
│   ├── (app)/               # authenticated shell — all protected screens
│   │   ├── layout.tsx       # server component: calls auth(), redirects to /sign-in if no session
│   │   └── <area>/
│   │       ├── layout.tsx   # area sub-nav (required for multi-module areas — see below)
│   │       └── <module>/
│   │           └── page.tsx
│   ├── (public)/            # sign-in, sign-up, forgot-password
│   ├── api/
│   │   ├── [...path]/route.ts      # BFF proxy → Rails (authenticated)
│   │   ├── auth/[...nextauth]/     # NextAuth HTTP handlers
│   │   └── public/[...path]/      # BFF proxy → Rails (unauthenticated)
│   ├── globals.css          # @theme block (design tokens) + font imports
│   └── layout.tsx           # root layout (ThemeProvider, fonts)
├── components/
│   ├── ui/                  # shared primitives (see below)
│   ├── shell/               # Sidebar, Topbar, AppToaster, providers
│   └── <area>/              # area-specific components and tab strip
├── hooks/                   # TanStack Query hooks (one file per domain)
├── lib/
│   ├── api.ts               # typed BFF fetcher
│   ├── cn.ts                # clsx + tailwind-merge helper
│   ├── theme.ts             # T object (mirrors prototype palette — use for reference only)
│   └── auth.ts              # NextAuth session helpers
└── types/                   # shared TypeScript types
```

---

## Styling rules (hard rules — no exceptions without a written decision)

- **Tailwind CSS v4 is the only styling layer.** No CSS-in-JS, no CSS modules, no `.css` files outside `globals.css`. No `styled-components`, Emotion, Radix, shadcn/ui, Mantine, MUI, Chakra, DaisyUI, or any other UI library.
- **No `style={{…}}` inline attributes** except for genuinely dynamic values Tailwind cannot express (e.g. a percentage computed from props). When you must use inline style for a dynamic value, reference a token via `var(--color-…)` — never a literal hex or rgb.
- **No hard-coded colours.** Never write `text-[#abcdef]`, `bg-[#fff]`, or `style={{ color: "#…" }}`. All colours come from the `@theme` tokens in `globals.css` (e.g. `text-text`, `bg-card`, `border-border`, `text-teal`).
- **No third-party component libraries.** Components are hand-rolled with Tailwind and live in `src/components/ui/`.
- **Icons are emoji glyphs.** No `lucide-react`, Heroicons, or other icon packages. Any icon library addition is a deliberate one-off decision — surface the request, don't pull one in unilaterally.
- **Class composition** uses the `cn` helper at `src/lib/cn.ts` (clsx + tailwind-merge). Don't import `clsx` directly elsewhere.
- **Arbitrary value brackets (`text-[12px]`, `w-[460px]`)** are allowed for sizes not in the theme scale. They are **not** allowed for colours.
- **Modals use native `<dialog>`** composed via `src/components/ui/Modal.tsx`. Do not introduce a modal library.
- **Toasts use `react-hot-toast`** via the existing `<Toaster>` in `components/shell/AppToaster.tsx`.

---

## Theme tokens

Tokens are defined as CSS custom properties in `src/app/globals.css` inside `@theme {}`. Light mode is the default; dark mode applies via `[data-theme="dark"]` on `<html>`.

| Token | Tailwind class | Use |
|---|---|---|
| `--color-bg` | `bg-bg` | Page background |
| `--color-surface` | `bg-surface` | Sidebar / topbar |
| `--color-card` | `bg-card` | Content cards |
| `--color-card2` | `bg-card2` | Row hover / inset / muted surfaces |
| `--color-border` | `border-border` | Default borders |
| `--color-text` | `text-text` | Body text |
| `--color-textS` | `text-textS` | Secondary / muted text |
| `--color-warm` | `text-warm` / `bg-warm` | Primary accent (CTAs, active states) |
| `--color-teal` | `text-teal` / `bg-teal` | Secondary accent |
| `--color-rose` | `text-rose` / `bg-rose` | Error / overdue |
| `--color-sage` | `text-sage` / `bg-sage` | Success / done |
| `--color-amber` | `text-amber` / `bg-amber` | Warning |
| `--color-violet` | `text-violet` / `bg-violet` | Scheduled / future |

Full badge colour semantics and component-level token usage: `docs/design-system.md`.

---

## BFF proxy contract

Browser code **never calls Rails directly**. All requests go through the Next.js BFF:

```
Browser → /api/<path> (Next.js)
         → reads Cognito access token from NextAuth session (server-side)
         → forwards to Rails at RAILS_INTERNAL_URL/api/v1/<path>
         → with Authorization: Bearer <token>
```

Key files:
- `src/app/api/[...path]/route.ts` — authenticated proxy (requires valid session)
- `src/app/api/public/[...path]/route.ts` — unauthenticated proxy (sign-up, onboarding pre-auth)
- `src/lib/api.ts` — the `api<T>(path, init?)` typed fetcher used by all hooks

**⚠️ Rails migration note:** The env var is currently named `FASTAPI_INTERNAL_URL`. Rename to `RAILS_INTERNAL_URL` in `.env.example`, `.env.local`, `docker-compose.yml`, and the proxy file when setting up the Rails backend. Update all CI/CD environment configs at the same time.

The `api()` fetcher calls `/api/<path>` on Next.js — it never touches a Bearer token or Cognito directly. No JWT handling belongs in browser-side code.

---

## Auth pattern (NextAuth v5)

- **`auth.ts`** (root of `frontend/`) — NextAuth config. Cognito provider + custom credentials provider for direct username/password sign-in.
- **Server components** call `auth()` from `../../../../auth` to get the session.
- **Client components** use `useSession()` via `SessionProvider` (already mounted in `(app)/layout.tsx`).
- **`(app)/layout.tsx`** is a server component that calls `auth()` and redirects to `/sign-in` if there is no session. This is the auth gate — do not add client-side auth guards on top of it.
- **`middleware.ts`** enforces the same rule for direct `/api/*` calls (except `/api/auth/*` and `/api/public/*`).
- The `accessToken` on the session is the Cognito access token. It is set by `auth.ts` and forwarded by the BFF proxy. Never read it in browser code.

---

## Route groups and layout hierarchy

```
app/
├── layout.tsx              # root: ThemeProvider, fonts, html/body
├── (public)/layout.tsx     # public shell (centred auth card)
│   └── sign-in, sign-up, forgot-password
└── (app)/layout.tsx        # authenticated shell: auth guard, Sidebar, Topbar
    └── <area>/layout.tsx   # area sub-nav (required — see below)
        └── <module>/page.tsx
```

**Area sub-nav rule.** Every area with more than one module (Recipes, Health, Finance, Life Admin, Travel, My Account) **must** have:
1. `src/app/(app)/<area>/layout.tsx` — renders a `<AreaTabs>` component above `{children}`
2. `src/components/<area>/<Area>Tabs.tsx` — client component using `usePathname()` to mark the active tab
3. `src/app/(app)/<area>/page.tsx` — `redirect()`s to the first module

Canonical example: `src/app/(app)/account/layout.tsx` + `src/components/account/AccountTabs.tsx`.

Use the shared `src/components/ui/Tabs.tsx` primitive — do not hand-roll tab components.

---

## Shared UI primitives (`src/components/ui/`)

Always reuse these. Never create a duplicate button, input, or modal.

| Component | Use for |
|---|---|
| `Button.tsx` | All buttons |
| `BtnSm.tsx` | Compact inline action buttons |
| `Input.tsx` | All text inputs |
| `Modal.tsx` | All modals (wraps native `<dialog>`) |
| `Tabs.tsx` | Tab strips (area sub-nav, in-page tabs) |
| `ListRow.tsx` | Standard list rows (see DataRow/WrapRow in design-system.md) |
| `Card.tsx` | Content cards |
| `Chip.tsx` | Status chips / small badges |
| `Collapsible.tsx` | Collapsible sections (GroupHeader pattern) |
| `FormError.tsx` | Inline form validation errors |
| `RadioCard.tsx` | Radio button styled as a selectable card |
| `AuthShell.tsx` | Centred card shell for public auth screens |
| `PublicShell.tsx` | Outer shell for public pages |

For component visual specs (GroupHeader, WrapRow, ForVisPair, RowModalSync, etc.) see `docs/design-system.md`.

---

## State management

- **Server state** (API data): TanStack Query. One hook file per domain in `src/hooks/` (e.g. `useRecipes.ts`, `useMembers.ts`). Use `api<T>()` from `src/lib/api.ts` inside query functions.
- **Ephemeral UI state** (modals open, form state, local toggles): Zustand or React `useState`. Zustand for state shared across components; `useState` for local component state.
- **Forms**: `react-hook-form` + `zod` for validation. Zod schemas live alongside the component or in `src/types/`.

---

## Responsive design (hard rules — no exceptions without a written decision)

MyPal targets mobile, tablet, and desktop. Every screen must work at all three sizes. Build mobile-first — the unsuffixed Tailwind class is the mobile style; add `md:` and `lg:` overrides for larger screens.

### Breakpoints

| Prefix | Min width | Target device |
|---|---|---|
| *(none)* | 0px | Mobile — design here first |
| `sm:` | 640px | Large mobile / small tablet |
| `md:` | 768px | Tablet |
| `lg:` | 1024px | Laptop / desktop |
| `xl:` | 1280px | Wide desktop |

### Shell — navigation pattern

- **Mobile (`< md`):** Sidebar is hidden. A fixed bottom tab bar (`components/shell/BottomNav.tsx`) shows the top-level nav icons. The topbar shows the area title and a hamburger for secondary actions.
- **Desktop (`md+`):** Sidebar is visible. Bottom tab bar is hidden.
- Never show both simultaneously. Use `hidden md:flex` / `flex md:hidden` to toggle.

### Layout rules

| Pattern | Mobile | Desktop |
|---|---|---|
| Page padding | `px-4 py-4` | `px-6 py-6` |
| Content max-width | full width | `max-w-3xl` or `max-w-5xl` depending on density |
| Card grids | `grid-cols-1` | `md:grid-cols-2 lg:grid-cols-3` |
| Stat/summary rows | `grid-cols-2` | `md:grid-cols-4` |
| Form column pairs (ForVisPair etc.) | `grid-cols-1` | `sm:grid-cols-2` |
| Modal width | `w-[94vw]` (already in `Modal` default) | `w-[min(460px,94vw)]` |
| Tables | `overflow-x-auto` wrapper; consider card reflow below `sm` | standard table |

### Typography scaling

Scale heading sizes across breakpoints. Never use a fixed size for a page title or area heading.

```tsx
<h1 className="text-xl font-display md:text-2xl lg:text-3xl">Area title</h1>
<h2 className="text-base font-semibold md:text-lg">Section heading</h2>
```

Body text (`text-[13px]`, `text-[15px]`) does **not** need to scale — it is already legible at all sizes.

### Touch targets

Interactive elements (buttons, list rows, chips) must be at least `44px` tall on mobile. Use `min-h-[44px]` when the natural height falls short. `ListRow` already meets this — do not shrink it.

### Overflow and truncation

- Titles in list rows always `truncate` — never let them wrap and break the row height.
- Right-side metadata clusters use `whitespace-nowrap` and the WrapRow pattern (see `docs/design-system.md`) so they wrap below the title rather than crushing it.

### What NOT to do

- Do not design desktop-only and add `md:hidden` as an afterthought — the mobile layout must be the primary design pass.
- Do not use fixed pixel widths (`w-[320px]`) for containers — use `w-full` with a `max-w-*` cap instead.
- Do not rely on hover states for primary actions — hover does not exist on touch.

---

## Commands

```bash
# from frontend/
npm install
npm run dev          # Next.js dev server on :3000
npm run build        # production build
npm run typecheck    # tsc --noEmit
npm run lint         # eslint
```

---

## Revision history

| Version | Updated by | Last updated (UTC) | Summary |
|---|---|---|---|
| 1.0 | Cowork | 12/06/2026 14:53 UTC | Initial version. Grounded in actual codebase. Flags FASTAPI_INTERNAL_URL rename. |
| 1.1 | Cowork | 12/06/2026 UTC | Added mandatory pre-flight: read docs/ui-components.md + src/components/ui/ before building any screen. |
| 1.2 | Cowork | 12/06/2026 18:25 UTC | Updated pre-flight to point to docs/design-system.md (ui-components.md merged in). |
| 1.3 | Claude Code | 12/06/2026 19:30 UTC | Added Responsive design section: mobile-first rule, breakpoint table, shell nav pattern (Sidebar/BottomNav), layout rules, typography scaling, touch targets, overflow/truncation, anti-patterns. |
