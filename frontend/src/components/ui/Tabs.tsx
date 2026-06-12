"use client";

import Link from "next/link";

import { cn } from "@/lib/cn";

export interface TabItem {
  key: string;
  label: string;
  /** Path appended to basePath. Defaults to `/${key}`. */
  href?: string;
}

interface Props {
  tabs: TabItem[];
  current: string;
  basePath: string;
}

/**
 * Pill-style sub-navigation tabs. Mirrors `.nav-tabs` / `.nav-tab` in the
 * prototype: each tab is a bordered pill with `bg-card`, becoming
 * `bg-warm/15` + `border-warm` + `text-warm` when active.
 */
export function Tabs({ tabs, current, basePath }: Props) {
  return (
    <nav
      className="flex flex-wrap gap-1.5"
      aria-label="Sub-navigation"
    >
      {tabs.map((t) => {
        const isActive = t.key === current;
        const href = `${basePath}${t.href ?? `/${t.key}`}`;
        return (
          <Link
            key={t.key}
            href={href}
            className={cn(
              "rounded-lg border px-3.5 py-1.5 text-[12.5px] transition-colors",
              isActive
                ? "border-warm bg-warm/15 text-warm"
                : "border-border bg-card text-textS hover:text-text",
            )}
            aria-current={isActive ? "page" : undefined}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
