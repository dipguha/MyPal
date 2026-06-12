"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/cn";

import { SignOutButton } from "./SignOutButton";

interface NavItem {
  id: string;
  href: string;
  icon: string;
  label: string;
}

// Mirrors the NAV definition in _UI/mypal-app.jsx (the visual source of
// truth). Areas land on the first module within each area.
const NAV: NavItem[] = [
  { id: "today", href: "/today", icon: "🌅", label: "Today" },
  { id: "lifeadmin", href: "/life-admin", icon: "📋", label: "Life Admin" },
  { id: "finance", href: "/finance", icon: "💷", label: "Finance" },
  { id: "health", href: "/health", icon: "🩺", label: "Health" },
  { id: "recipes", href: "/recipes", icon: "🍳", label: "Recipes & Groceries" },
  { id: "travel", href: "/travel", icon: "✈️", label: "Travel" },
  { id: "account", href: "/account", icon: "👤", label: "My Account" },
];

const UTILITY_NAV: NavItem[] = [
  { id: "onboarding", href: "/onboarding", icon: "🚀", label: "Get Started" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-[220px] shrink-0 flex-col border-r border-border bg-surface p-4 md:flex">
      <div className="mb-6 flex items-center gap-2 px-2">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-warm to-rose text-lg shadow-md shadow-warm/30">
          🤝
        </div>
        <div>
          <div className="font-display text-[18px] font-bold leading-tight text-warm">
            MyPal
          </div>
          <div className="text-[11px] text-textS">Family OS</div>
        </div>
      </div>

      <div className="mb-2 px-2 text-[10px] font-bold uppercase tracking-wider text-textS">
        App
      </div>

      <nav className="flex flex-col gap-1">
        {NAV.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.id}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] transition-colors",
                active
                  ? "bg-warm/15 text-warm"
                  : "text-textS hover:bg-card hover:text-text",
              )}
            >
              <span className="text-[15px]">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-6 mb-2 px-2 text-[10px] font-bold uppercase tracking-wider text-textS">
        Setup
      </div>
      <nav className="flex flex-col gap-1">
        {UTILITY_NAV.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.id}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] transition-colors",
                active
                  ? "bg-warm/15 text-warm"
                  : "text-textS hover:bg-card hover:text-text",
              )}
            >
              <span className="text-[15px]">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-border pt-3">
        <SignOutButton />
      </div>
    </aside>
  );
}
