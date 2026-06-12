# Spec — Home Page (Public Marketing Page)

> UI reference: `_UI/mypal-app.jsx` → `HomePage` component

---

## 1. Overview (required)

**Feature name:** Home Page — Public Marketing Page
**Module / nav location:** Public → Home
**Author:** Dip
**Status:** Draft
**Last updated:** 2026-05-20

### Problem statement
Prospective users landing on MyPal have no account yet and need to quickly understand what the product does, what it costs, and why they can trust it with sensitive family data. Without a clear, compelling public page, conversion from visitor to sign-up will be low.

### User-facing goal
As a prospective user, I want to land on a clear, honest page that explains what MyPal does, what it costs, and that my data is safe — so that I feel confident enough to start a free trial without needing to speak to anyone.

---

## 2. Scope (required)

### In scope
- Hero section: headline, AI agents subheadline, primary CTA, sign-in link
- Stats bar: 3 product-truth stats (11 life categories, up to 6 members, free to get started)
- "What problems we solve" section with 8 feature category pills
- Security & Privacy trust card
- Pricing section: Individual (£2.99/mo) and Family (£4.99/mo), both with 14-day free trial
- FAQ accordion: 5 questions, collapsed by default, one open at a time
- Closing CTA section after FAQ

### Out of scope
- Authentication (handled by Sign Up / Sign In pages)
- Testimonials and social proof stats — deferred until real post-launch data is available
- App Store / Play Store download links — Phase 2
- Push notification opt-in — Phase 2
- Live chat or support widget — Phase 2

### Dependencies
- `_specs/user-sign-up.md` — all primary CTAs route to Sign Up
- `_specs/platform--access-control.md` — role definitions referenced for post-signup context

### Phasing

| Phase | What ships | When |
|-------|-----------|------|
| Phase 1 | Full public marketing page — web only | Launch |
| Phase 2 | Native app landing experience, App Store / Play Store links, testimonials with real data | Post-launch |

---

## 3. Users & personas (required)

| Persona | Description | Primary need from this feature |
|---------|-------------|-------------------------------|
| Prospective user | No MyPal account; discovered via search, referral, or social | Understand the product quickly and feel safe enough to sign up |
| Returning visitor | Has an account but lands on the home URL | Fast path to Sign In without friction |

---

## 4. Roles & access (required)

This is a fully public page — no authentication required. All content is visible to any visitor. The only role-aware interaction is the "Sign in →" link for users who already have an account.

| Capability | Public visitor | Authenticated user |
|------------|:--------------:|:-----------------:|
| View full page | ✓ | ✓ |
| Click CTA → Sign Up | ✓ | ✓ |
| Click Sign in → | ✓ | ✓ (routes to app) |

---

## 5. Functional requirements (required)

Priority key: **P0** = must have at launch · **P1** = should have · **P2** = nice to have

| # | Requirement | Priority | Acceptance criteria |
|---|-------------|----------|---------------------|
| F-01 | Hero section displays headline, AI agents subheadline, and primary CTA button | P0 | Hero renders correctly in both light and dark mode; CTA routes to Sign Up |
| F-02 | Stats bar shows 3 product-truth stats: 11 life categories, 6 members per family, Free to get started | P0 | No placeholder or fictional stats; values match product capabilities at launch |
| F-03 | "What problems we solve" section displays all 8 feature category pills | P0 | All 8 pills render; section heading and body copy reference AI agents |
| F-04 | Security & Privacy card lists 4 trust points | P0 | All 4 points visible; card renders in both themes |
| F-05 | Pricing section shows Individual (£2.99/mo) and Family (£4.99/mo) cards, each with a 14-day free trial badge and "Start 14-day free" button | P0 | Prices and badge copy are accurate; both CTAs route to Sign Up |
| F-06 | Both pricing card CTA buttons sit at the same vertical level regardless of feature list length | P0 | Verified at standard viewport widths; flex-column layout with flex:1 on feature list |
| F-07 | FAQ section shows 5 questions collapsed by default; clicking a question expands its answer; clicking again collapses it; only one item open at a time | P0 | Accordion works via keyboard and mouse; chevron rotates on open |
| F-08 | Closing CTA section appears after FAQ with headline, subheading, and "Start 14-day free" button | P1 | Section renders correctly; CTA routes to Sign Up |
| F-09 | All primary CTA buttons route to the Sign Up page | P0 | Verified for hero CTA, both pricing buttons, and closing CTA |
| F-10 | "Sign in →" links route to the Sign In page | P0 | Both hero and closing CTA sign-in links verified |

---

## 5.1 User Stories

| # | As a… | I want to… | So that… |
|---|-------|-----------|---------|
| US-01 | Prospective user | Understand what MyPal does within the first screen | I can decide quickly if it's relevant to my family |
| US-02 | Prospective user | See clear, honest pricing before I commit | I know exactly what I'm signing up for with no surprises |
| US-03 | Prospective user | Read answers to common questions without the page feeling cluttered | I can find the answer I need without losing my place |
| US-04 | Prospective user | See specific, credible security and privacy assurances | I feel safe entering sensitive health and financial data |
| US-05 | Prospective user | Start a trial without entering a credit card | I can try the product risk-free before committing |
| US-06 | Returning user | Quickly find the Sign In link | I don't have to hunt around to get back to my account |

---

## 6. Non-functional requirements

| # | Requirement | Target |
|---|-------------|--------|
| NF-01 | Performance | Page visible in < 1s — fully static, no API calls on load |
| NF-02 | Accessibility | WCAG 2.1 AA; FAQ accordion keyboard-navigable with correct aria roles |
| NF-03 | Theme support | Both light mode (T_LIGHT) and dark mode (T_DARK) render correctly |
| NF-04 | No pre-auth data collection | No cookies, tracking pixels, or user data collected before sign-up |
| NF-05 | Honest stats | All stats shown are factually accurate at launch; no aspirational or fictional numbers |

---

## 7. User flows (required)

### Happy path — new visitor converts (Individual)
1. Visitor lands on Home page
2. Reads hero headline and AI agents subheadline
3. Scrolls past stats, feature pills, privacy card
4. Reviews Individual pricing card (£2.99/mo, 14-day free badge)
5. Clicks "Start 14-day free" → routed to Sign Up page
6. Completes sign up → redirected to Onboarding

### Happy path — new visitor converts (Family)
1–3. Same as above
4. Reviews Family pricing card (£4.99/mo, 14-day free badge)
5. Clicks "Start 14-day free" → routed to Sign Up page
6. Completes sign up → redirected to Onboarding

### Happy path — returning user signs in
1. User lands on Home page
2. Clicks "Sign in →" (hero or closing CTA)
3. Routed to Sign In page → authenticated → redirected to Today

### Error / edge paths
- **FAQ — multiple clicks:** Only one FAQ item open at a time; opening a second item closes the first
- **FAQ — keyboard:** Tab navigates between questions; Enter/Space toggles the open state
- **Pricing — equal buttons:** If Individual has fewer features than Family, flex layout ensures buttons remain level; verified across viewport widths

---

## 8. Data model

No data stored. The Home page is fully static — no API calls, no user input captured, no server-side rendering required beyond page delivery.

---

## 9. UI / UX considerations

**Reference:** `_UI/mypal-app.jsx` → `HomePage` function (opens at `/* ── HOME PAGE ──`)

**Design language:** "Warm Intelligence" — dark base (#080910) with warm amber/terracotta accents in dark mode; cream base (#FBF7F0) with muted amber (#B06010) in light mode. Playfair Display for headings, DM Sans for body text.

**Hero:** Radial gradient background, large Playfair Display headline with text-gradient effect, subheadline references the "6 apps → AI agents" hook as the primary differentiator. CTA is the `hero-cta` class (inline-block, auto width, 14px 32px padding, 12px radius).

**Stats:** Three cards in a 3-column grid using `.g3` and `.card` classes. Values use `.stat-num` (Playfair Display, 32px). Stats are product-truth only — no fictional numbers at launch.

**Pricing:** Two cards in a `.g2` grid. Each card is `display:flex; flex-direction:column` so the feature list takes `flex:1` and the button is always pushed to the bottom, keeping both buttons level. Each card has a green "14 days free, no card needed" badge above the feature list. Button uses `.btn-primary` class.

**FAQ accordion:** Managed with `useState(null)` — stores the index of the open item. Clicking the same item again sets state to `null` (closes). Chevron uses inline CSS `transform: rotate(180deg)` when open with `transition: transform .2s`.

**Closing CTA:** Warm-tinted card (`background: T.warmG`, `border: T.warm + "38"`) centred after the FAQ. Uses `hero-cta` class button to visually match the hero, maintaining consistency.

**Empty state:** Not applicable — no dynamic content on this page.

---

## 10. Integration points & platform constraints

| Integration | Availability | Notes |
|-------------|-------------|-------|
| Sign Up page | Phase 1 | All primary CTAs link here |
| Sign In page | Phase 1 | "Sign in →" links link here |
| Push notifications | Phase 2 | Not applicable to this page |
| App Store / Play Store | Phase 2 | No download links at launch |
| Open banking | Phase 2 | Not applicable to this page |
| Testimonials / social proof | Post-launch | Requires real user data; placeholder stats must not be used |

---

## 11. Success metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Home → Sign Up conversion rate | > 15% of unique visitors | Analytics: CTA click events |
| FAQ interaction rate | > 30% of visitors expand ≥ 1 question | Analytics: accordion open events |
| Bounce rate | < 60% | Analytics: session depth |
| Pricing section scroll-through rate | > 50% of visitors reach pricing | Analytics: scroll depth |

---

## 12. Definition of done

- [ ] All P0 functional requirements implemented and tested
- [ ] Both light and dark themes verified visually
- [ ] Pricing card buttons confirmed level at standard viewports (1280px, 1024px, 768px)
- [ ] FAQ accordion keyboard-navigable; aria-expanded attribute toggled correctly
- [ ] All CTA buttons verified to route to Sign Up
- [ ] Both "Sign in →" links verified to route to Sign In
- [ ] No fictional or aspirational stats — all values confirmed accurate at launch
- [ ] WCAG 2.1 AA verified for interactive elements (buttons, accordion)
- [ ] Open questions resolved or formally deferred

---

## 13. Open questions

- [ ] Is 5GB document storage confirmed as the Individual plan limit, or is this TBC? — TBC, put a generic message
- [ ] After a user signs in, should the Home page redirect automatically to Today, or remain accessible? — redirect automatically to Today

---

## 14. Revision history

| Version | Date | Author | Summary of changes |
|---------|------|--------|-------------------|
| 0.1 | 2026-05-20 | Dip | Initial draft — generated from mypal-complete-v2.jsx HomePage component |
