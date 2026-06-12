"use client";

import type { ReactNode } from "react";

export function FormError({ children }: { children: ReactNode }) {
  if (!children) return null;
  return (
    <div
      role="alert"
      className="rounded-md border border-rose/40 bg-rose/10 px-3.5 py-3 text-sm text-rose"
    >
      {children}
    </div>
  );
}
