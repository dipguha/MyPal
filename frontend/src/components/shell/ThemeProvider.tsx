"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type Theme = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

const STORAGE_KEY = "mypal-theme";

interface ThemeContextValue {
  theme: Theme;
  resolved: ResolvedTheme;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyTheme(resolved: ResolvedTheme) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.theme = resolved;
}

function resolveSystem(): ResolvedTheme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function resolveTheme(theme: Theme): ResolvedTheme {
  return theme === "system" ? resolveSystem() : theme;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Start with "light" on the server; the pre-paint inline script in
  // <head> (see layout.tsx) sets the correct data-theme before hydration
  // so users don't see a flash. We sync the in-memory state from storage
  // in useEffect.
  const [theme, setThemeState] = useState<Theme>("light");
  const [resolved, setResolved] = useState<ResolvedTheme>("light");

  useEffect(() => {
    const stored = (localStorage.getItem(STORAGE_KEY) as Theme | null) ?? "system";
    setThemeState(stored);
    const r = resolveTheme(stored);
    setResolved(r);
    applyTheme(r);
  }, []);

  // Listen for OS preference changes when theme is "system".
  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      const r = resolveSystem();
      setResolved(r);
      applyTheme(r);
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    localStorage.setItem(STORAGE_KEY, t);
    const r = resolveTheme(t);
    setResolved(r);
    applyTheme(r);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, resolved, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used inside <ThemeProvider>");
  }
  return ctx;
}

/**
 * Inline script that runs before the body paints — reads the stored
 * preference (defaulting to "system") and sets `data-theme` on `<html>`
 * so the first paint is in the correct theme. Embedded as a string so
 * Next.js can inject it as a `<script>` in `<head>`.
 */
export const THEME_INIT_SCRIPT = `
(function(){
  try {
    var t = localStorage.getItem('${STORAGE_KEY}') || 'system';
    var r = t === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : t;
    document.documentElement.dataset.theme = r;
  } catch (e) {
    document.documentElement.dataset.theme = 'light';
  }
})();
`;
