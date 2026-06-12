"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

interface Props {
  label: ReactNode;
  selected?: boolean;
  onClick?: () => void;
  leading?: ReactNode;
  disabled?: boolean;
  className?: string;
}

export function Chip({
  label,
  selected,
  onClick,
  leading,
  disabled,
  className,
}: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={!!selected}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        selected
          ? "border-warm bg-warm/15 text-warm"
          : "border-border bg-card text-textS hover:border-warm/60 hover:text-warm",
        className,
      )}
    >
      {leading ? <span aria-hidden>{leading}</span> : null}
      <span>{label}</span>
    </button>
  );
}
