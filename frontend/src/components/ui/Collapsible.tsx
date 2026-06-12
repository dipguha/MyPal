"use client";

import { useState, type ReactNode } from "react";

import { cn } from "@/lib/cn";

interface Props {
  title: ReactNode;
  badge?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
  className?: string;
}

export function Collapsible({
  title,
  badge,
  defaultOpen = false,
  children,
  className,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section
      className={cn(
        "rounded-2xl border border-border bg-card",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-[15px] font-bold text-text">{title}</span>
          {!open && badge ? badge : null}
        </div>
        <span
          aria-hidden
          className={cn(
            "text-textS transition-transform",
            open && "rotate-90",
          )}
        >
          ▸
        </span>
      </button>
      {open ? (
        <div className="border-t border-border px-5 py-4">{children}</div>
      ) : null}
    </section>
  );
}
