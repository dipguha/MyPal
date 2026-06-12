"use client";

import type { KeyboardEvent, ReactNode } from "react";

import { cn } from "@/lib/cn";

interface Props {
  /** Slot before the title (e.g. checkbox, icon). */
  leading?: ReactNode;
  /** Main truncated title text. */
  title: ReactNode;
  /** Slot after the title (e.g. priority dot, chips, time). */
  trailing?: ReactNode;
  onClick?: () => void;
  /** Dim and italicise the row (e.g. completed). */
  muted?: boolean;
  className?: string;
}

/**
 * Canonical clickable list row for MyPal — see CLAUDE.md "Styling rules".
 * Composes leading slot · truncated title · trailing slot of chips/meta.
 * Use this for any "list of items where the row opens detail" pattern.
 */
export function ListRow({
  leading,
  title,
  trailing,
  onClick,
  muted = false,
  className,
}: Props) {
  const handleKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!onClick) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? handleKey : undefined}
      className={cn(
        "flex items-center gap-1.5 rounded-md px-1 py-1 transition-colors",
        onClick && "cursor-pointer hover:bg-card2/60",
        muted && "opacity-60",
        className,
      )}
    >
      {leading ? <div className="shrink-0">{leading}</div> : null}
      <div className="min-w-0 flex-1 truncate text-[12px] text-text">
        {title}
      </div>
      {trailing ? (
        <div className="ml-1 flex shrink-0 items-center gap-1.5 text-[10px] text-textS">
          {trailing}
        </div>
      ) : null}
    </div>
  );
}
