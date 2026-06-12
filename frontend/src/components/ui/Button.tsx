"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  loading?: boolean;
  fullWidth?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = "primary", loading, fullWidth, disabled, className, children, ...rest },
  ref,
) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-md px-5 py-2.5 font-body text-[14px] font-medium tracking-wide transition-all disabled:cursor-not-allowed disabled:opacity-50";
  // Primary uses the v2 prototype gradient (warm → rose) with a soft shadow.
  // Secondary and ghost map to palette tokens so they flip with theme.
  const styles =
    variant === "primary"
      ? "bg-gradient-to-br from-warm to-rose text-white shadow-md shadow-warm/30 hover:shadow-lg hover:shadow-warm/50 active:translate-y-[1px]"
      : variant === "secondary"
        ? "border border-border bg-card text-text hover:border-warm/60 hover:text-warm"
        : "text-textS hover:text-warm";

  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(base, styles, fullWidth && "w-full", className)}
      {...rest}
    >
      {loading ? (
        <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-r-transparent" />
      ) : null}
      <span>{children}</span>
    </button>
  );
});
