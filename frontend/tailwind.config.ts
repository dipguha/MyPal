import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // ── THEME v2 (light) — edit these ─────────────────────────────────
        bg:      "#f3f3f3",   // page background
        surface: "#ffffff",   // sidebar / topbar
        card:    "#fff2cc",   // content cards (Today's Priorities, Top News, etc.)
        card2:   "#eef0f8",   // row hover / inset areas
        tab:     "#e4e7f2",   // inactive tab buttons (Daily Briefing, MyPal AI, etc.)
        banner:  "#d3eae2",   // banner cards (Good Morning, Ask MyPal)
        border:  "#dde0ec",
        text:    "#0d0e14",
        textS:   "#5a6074",
        warm:    "#b56a05",
        teal:    "#0d8c7e",
        rose:    "#c03535",
        sage:    "#2d7d50",
        sky:     "#1666c0",
        violet:  "#5a2fd4",
        amber:   "#8a5c05",
        pink:    "#a83090",
        // ── THEME v1 (original dark) — kept for reference ─────────────────
        // bg:      "#080910",
        // surface: "#0f1018",
        // card:    "#13151f",
        // card2:   "#181b27",
        // tab:     "#13151f",  // same as card in dark theme
        // border:  "#1e2236",
        // text:    "#e2e4f0",
        // textS:   "#636880",
        // warm:    "#e8a040",
        // teal:    "#38c4b4",
        // rose:    "#e06868",
        // sage:    "#5bb88a",
        // sky:     "#4899e0",
        // violet:  "#9870e8",
        // amber:   "#d49a3a",
        // pink:    "#d878b8",
      },
      fontFamily: {
        display: ["'Playfair Display'", "serif"],
        body: ["'Montserrat'", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
