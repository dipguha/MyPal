"use client";

import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";

import { cn } from "@/lib/cn";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  title: string;
  description: string;
  icon?: ReactNode;
};

export const RadioCard = forwardRef<HTMLInputElement, Props>(function RadioCard(
  { title, description, icon, className, id, ...rest },
  ref,
) {
  const inputId = id ?? `${rest.name}-${rest.value}`;
  return (
    <label
      htmlFor={inputId}
      className={cn(
        "relative flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-card2 p-4 transition-colors",
        "hover:border-warm/40",
        "has-[input:checked]:border-warm has-[input:checked]:bg-warm/10 has-[input:checked]:shadow-[inset_0_0_0_1px_rgba(232,160,64,0.4)]",
        className,
      )}
    >
      <input
        ref={ref}
        id={inputId}
        type="radio"
        className="peer sr-only"
        {...rest}
      />
      {icon ? (
        <span className="mt-0.5 inline-flex h-7 w-7 flex-none items-center justify-center rounded-full bg-card text-warm">
          {icon}
        </span>
      ) : null}
      <span className="block">
        <span className="block font-display text-[17px] leading-tight text-text">
          {title}
        </span>
        <span className="mt-1 block text-xs text-textS">{description}</span>
      </span>
      <span
        aria-hidden
        className="ml-auto mt-1 inline-flex h-4 w-4 flex-none rounded-full border border-border peer-checked:border-warm peer-checked:bg-warm"
      />
    </label>
  );
});
