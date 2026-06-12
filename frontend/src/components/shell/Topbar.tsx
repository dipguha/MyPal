"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";

import { cn } from "@/lib/cn";
import { MEMBERS, PRIMARY_MEMBER } from "@/lib/mock/members";

import { ThemeToggle } from "./ThemeToggle";

const AREA_TITLES: Array<[string, string]> = [
  ["/today", "Today"],
  ["/life-admin", "Life Admin"],
  ["/finance", "Finance"],
  ["/health", "Health"],
  ["/recipes", "Recipes & Groceries"],
  ["/travel", "Travel"],
  ["/account", "My Account"],
  ["/onboarding", "Onboarding"],
];

export function Topbar() {
  const pathname = usePathname();
  const title =
    AREA_TITLES.find(([prefix]) => pathname.startsWith(prefix))?.[1] ?? "MyPal";

  const [activeMember, setActiveMember] = useState(PRIMARY_MEMBER.id);

  return (
    <header className="flex items-center justify-between border-b border-border bg-surface/60 px-5 py-3">
      <div className="font-display text-[20px] font-semibold text-warm">
        {title}
      </div>
      <div className="flex items-center gap-3">
        <div className="flex flex-wrap gap-1.5">
          {MEMBERS.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setActiveMember(m.id)}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px] transition-colors",
                activeMember === m.id
                  ? "border-warm bg-warm/15 text-warm"
                  : "border-border bg-card text-textS hover:border-border/80 hover:text-text",
              )}
            >
              <span>{m.avatar}</span>
              <span>{m.name}</span>
            </button>
          ))}
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
