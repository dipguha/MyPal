"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: "default" | "warm" | "rose";
  fullWidth?: boolean;
};

/**
 * Mirrors `.btn-sm` from the prototype: small bordered pill button.
 * - default: bg-card2 + border-border + text-text
 * - warm:    bg-warm/15 + border-warm + text-warm (the prototype's `.btn-warm`)
 * - rose:    transparent + border-rose + text-rose (destructive action)
 */
export const BtnSm = forwardRef<HTMLButtonElement, Props>(function BtnSm(
  { tone = "default", fullWidth, className, children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(
        "rounded-md border px-3.5 py-1.5 text-[12px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        tone === "warm"
          ? "border-warm bg-warm/15 text-warm hover:bg-warm hover:text-white"
          : tone === "rose"
            ? "border-rose/50 bg-transparent text-rose hover:bg-rose/10"
            : "border-border bg-card2 text-text hover:border-warm hover:text-warm",
        fullWidth && "w-full",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
});
