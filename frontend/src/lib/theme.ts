// Mirrors the T token map in mypal-complete.jsx so feature components can use
// consistent palette values when not driven via Tailwind classes.
// Must stay in sync with tailwind.config.ts and globals.css.

// ── THEME v2 (light) — edit these ────────────────────────────────────────
export const T = {
  bg:      "#f3f3f3",
  surface: "#ffffff",
  card:    "#fff2cc",
  card2:   "#eef0f8",
  tab:     "#e4e7f2",
  banner:  "#d3eae2",
  border:  "#dde0ec",
  warm:    "#b56a05",
  teal:    "#0d8c7e",
  rose:    "#c03535",
  sage:    "#2d7d50",
  sky:     "#1666c0",
  violet:  "#5a2fd4",
  amber:   "#8a5c05",
  pink:    "#a83090",
  text:    "#0d0e14",
  textS:   "#5a6074",
  textM:   "#9ca3af",
} as const;

// ── THEME v1 (original dark) — kept for reference ────────────────────────
// export const T = {
//   bg:      "#080910",
//   surface: "#0f1018",
//   card:    "#13151f",
//   card2:   "#181b27",
//   border:  "#1e2236",
//   warm:    "#e8a040",
//   teal:    "#38c4b4",
//   rose:    "#e06868",
//   sage:    "#5bb88a",
//   sky:     "#4899e0",
//   violet:  "#9870e8",
//   amber:   "#d49a3a",
//   pink:    "#d878b8",
//   text:    "#e2e4f0",
//   textS:   "#636880",
//   textM:   "#303448",
// } as const;
