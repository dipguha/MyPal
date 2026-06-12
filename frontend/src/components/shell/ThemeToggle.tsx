"use client";

import { cn } from "@/lib/cn";

import { type Theme, useTheme } from "./ThemeProvider";

const OPTIONS: { value: Theme; icon: string; label: string }[] = [
  { value: "light", icon: "☀️", label: "Light" },
  { value: "system", icon: "💻", label: "System" },
  { value: "dark", icon: "🌙", label: "Dark" },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className="flex items-center gap-0.5 rounded-lg border border-border bg-card2 p-0.5"
    >
      {OPTIONS.map((opt) => {
        const isActive = theme === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            aria-label={opt.label}
            title={opt.label}
            onClick={() => setTheme(opt.value)}
            className={cn(
              "grid h-6 w-7 place-items-center rounded text-[12px] transition-colors",
              isActive
                ? "bg-surface text-warm shadow-sm"
                : "text-textS hover:text-text",
            )}
          >
            {opt.icon}
          </button>
        );
      })}
    </div>
  );
}
