# _UI/CLAUDE.md

| | |
|---|---|
| **File** | `_UI/CLAUDE.md` |
| **Purpose** | Rules for every session that reads or edits the UI prototype. Mandatory read before touching any file in `_UI/`. |
| **Version** | 1.0 |
| **Updated by** | Cowork |
| **Last updated** | 12/06/2026 UTC |

**Maintaining this file.** Every edit must: (1) bump the version, (2) update **Last updated** to the current UTC time, (3) set **Updated by**, (4) append a row to the revision history.

---

## File ownership

| File | Who edits | Rules |
|---|---|---|
| `_UI/ui_working/mypal-app-working.jsx` | Cowork only | Working copy — all design changes go here |
| `_UI/mypal-app.jsx` | Dip only (manually) | Canonical approved prototype — Claude never edits this directly |
| `_UI/ui-prototype.md` | Cowork (on close-out only) | Update SUBNAV/NAV and section 9 when structure changes; never update line-number ranges |
| `_UI/specs/` | Cowork | UI design spec per module |

---

## Before every edit — mandatory pre-flight

Do these in order before proposing or touching any file:

1. **Read `_UI/ui-prototype.md`** — it has the design contract (Section 12), SUBNAV map (Section 5), CSS class reference (Section 7), and shared constant definitions.
2. **Locate the exact section** of `mypal-app-working.jsx` you need to change. The file is large (~400KB) — use `grep` or `Read` with an offset to find the component. Do not read the whole file.
3. **Read 30–50 lines of context** around the insertion/change point to understand the local pattern before writing anything.
4. **List the shared helpers you'll reuse** — include this in your proposal (Step 3 of the Cowork workflow). Never write a modal, form field, or list row from memory; find the existing constants first.

---

## Shared constants — always reuse, never reinvent

These four constants are defined near the top of every complex screen function. If the screen you're editing already defines them, reuse them. If you're adding a modal or form to a screen that doesn't yet have them, define them at the top of that function.

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

**Global file-top constants** (available in all screen functions — do not redeclare):

| Constant | What it is |
|---|---|
| `T` | Colour token object — `T.warm`, `T.rose`, `T.card`, `T.textS`, etc. |
| `MEMBERS_AC` | Demo household (James · Sarah · Alex · Mia · Lily · Tom) with roles, avatars, colours |
| `KE_LEAD_OPTS` | Lead-time select options for FreqLeadPair |
| `KE_LEAD_DEFAULT` | Default lead time per frequency string |
| `KE_LEAD_MAX` | Max allowed lead time per frequency string |
| `keLeadAllowed(freq, val)` | Returns true if `val` is within the max for `freq` |
| `FREQ_LEAD_DAYS` | Frequency label → lead days (number) |
| `MOD_AC` | Module permission defaults — drives the Access tab in My Account |
| `TIERS_AC` | Visibility tiers: `self` · `hmg` · `family` · `individual` |
| `badge(bg, fg)` | Returns badge inline style object |

---

## CSS classes — use existing, never add new utilities

All classes are generated inside `makeCSS()`. Use them via `className`. To add a new class, add it inside `makeCSS()` — never add a separate `<style>` tag.

| Class | Use |
|---|---|
| `.btn-sm` | Small action button (neutral) |
| `.btn-sm.btn-warm` | Small primary button (amber fill) |
| `.btn-primary` | Full-width primary CTA |
| `.card` | Primary content card — `T.card` bg, `T.border` border, `13px` radius, `16px` padding |
| `.card2` | Secondary / nested card — `T.card2` bg |
| `.card-title` | Uppercase section label inside a card |
| `.nav-tabs` | Tab bar container |
| `.nav-tab` | Individual tab button |
| `.nav-tab.on` | Active tab (warm colour + warm tint background) |
| `.row` | List row with hover state |
| `.g2` | 2-column responsive grid |
| `.g3` | 3-column responsive grid |
| `.grp-body` | Collapsible section body (`T.card` bg, joined border-top to header) |

For full CSS class reference see `_UI/ui-prototype.md` Section 7.

---

## Hard rules — no exceptions

| Rule | Detail |
|---|---|
| **Never use hex literals** | All colours via `T.xxx`. Exception: `rgba(0,0,0,0.55)` for backdrop/shadow — these are not semantic. |
| **Never `import`** | File runs without a bundler; CDN only. No `import` statements. |
| **No `localStorage`** | Prototype state is ephemeral. Never persist anything. |
| **No new top-level constants** | Don't add file-level constants unless shared across 3+ screens. Keep mock data inside the screen function. |
| **Never define a modal as a component function inside another function** | React remounts on every parent state change → inputs lose focus. Use a JSX value: `const modalJSX = (...)`, render as `{condition && modalJSX}`. |
| **No new `T` tokens without updating `T_LIGHT`** | If you add to `T`, also add the light-theme equivalent in `T_LIGHT`, then add the CSS rule in `makeCSS()`. |
| **Date inputs** | Always `type="date"` with `style={{...fldInp, colorScheme:"dark"}}`. Never `type="text"` with a date placeholder. |
| **Variable renames** | Always `replace_all: true` on the Edit tool. Immediately grep for the old name to verify zero remaining references. |
| **`<select>` must have a `▾` indicator** | Wrap in `position:relative` div; add `<span style={{position:"absolute",right:10,...}}>▾</span>`. Never leave a bare `<select>`. |
| **`fldInp` for selects too** | Spread `fldInp` onto every `<select>` and `<textarea>`, not just `<input>`. They share the same style contract. |

---

## Propose before edit

**Do not touch `mypal-app-working.jsx` until Dip gives explicit approval.**

The proposal (Step 3 of the Cowork workflow) must include:
1. Which section/component will change
2. Which shared helpers and CSS classes will be reused (name them explicitly)
3. Any new `useState` or data constants being added
4. Any state that will be lifted or modal pattern that will be used

Approval phrases: **"looks good"** · **"approved"** · **"do it"**

---

## Post-edit checklist

Before reporting the edit as done, verify:

- [ ] No hex literals introduced: run `grep -n "#[0-9a-fA-F]\{3,6\}" mypal-app-working.jsx` — only the `T` object and `makeCSS` body should match
- [ ] No inline `<style>` tag added
- [ ] New modals use `modalShell`, `fldLbl`, `fldInp`, and `rowBase`
- [ ] New buttons use `.btn-sm` or `.btn-sm.btn-warm` (not hand-rolled inline styles)
- [ ] New `<select>` elements have a `▾` indicator and use `fldInp`
- [ ] Date inputs use `type="date"` + `colorScheme:"dark"`
- [ ] No new file-top constants added unless genuinely shared across screens

---

## Revision history

| Version | Updated by | Last updated (UTC) | Summary |
|---|---|---|---|
| 1.0 | Cowork | 12/06/2026 UTC | Initial version. Extracted and consolidated rules from workflow.md, CLAUDE.md, and ui-prototype.md Section 11/12. Grounded in actual prototype constants. |
