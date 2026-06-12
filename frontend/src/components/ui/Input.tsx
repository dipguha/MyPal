"use client";

import { forwardRef, useState, type InputHTMLAttributes, type ReactNode } from "react";

import { cn } from "@/lib/cn";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  hint?: ReactNode;
  endAdornment?: ReactNode;
};

export const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { label, error, hint, endAdornment, className, type = "text", id, ...rest },
  ref,
) {
  const [reveal, setReveal] = useState(false);
  const isPassword = type === "password";
  const effectiveType = isPassword && reveal ? "text" : type;
  const inputId = id ?? rest.name ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <label htmlFor={inputId} className="block">
      <span className="mb-1.5 block text-xs uppercase tracking-[0.18em] text-textS">
        {label}
      </span>
      <span className="relative block">
        <input
          ref={ref}
          id={inputId}
          type={effectiveType}
          className={cn(
            "w-full rounded-md border bg-card2 px-3.5 py-2.5 font-body text-[15px] text-text placeholder:text-textS/70",
            "outline-none transition-colors",
            "focus:border-warm focus:ring-1 focus:ring-warm/40",
            error ? "border-rose/60" : "border-border",
            (isPassword || endAdornment) && "pr-11",
            className,
          )}
          aria-invalid={!!error || undefined}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...rest}
        />
        {isPassword ? (
          <button
            type="button"
            onClick={() => setReveal((v) => !v)}
            className="absolute inset-y-0 right-3 my-auto h-6 text-[11px] uppercase tracking-[0.16em] text-textS hover:text-warm"
            aria-label={reveal ? "Hide password" : "Show password"}
          >
            {reveal ? "Hide" : "Show"}
          </button>
        ) : endAdornment ? (
          <span className="absolute inset-y-0 right-3 flex items-center text-textS">
            {endAdornment}
          </span>
        ) : null}
      </span>
      {error ? (
        <span
          id={`${inputId}-error`}
          className="mt-1.5 block text-xs text-rose"
          role="alert"
        >
          {error}
        </span>
      ) : hint ? (
        <span className="mt-1.5 block text-xs text-textS">{hint}</span>
      ) : null}
    </label>
  );
});
