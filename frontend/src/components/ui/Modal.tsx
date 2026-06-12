"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { cn } from "@/lib/cn";

interface Props {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  /** Tailwind class for max width, e.g. "w-[min(460px,94vw)]". */
  widthClass?: string;
  children: ReactNode;
  footer?: ReactNode;
}

/**
 * Native <dialog>-based modal. Canonical modal pattern for MyPal —
 * see CLAUDE.md "Styling rules". Use this rather than introducing a
 * dialog library.
 */
export function Modal({
  open,
  onClose,
  title,
  widthClass = "w-[min(460px,94vw)]",
  children,
  footer,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className={cn(
        widthClass,
        "max-h-[90vh] overflow-y-auto rounded-2xl p-0",
        "border border-border bg-card text-text shadow-2xl shadow-black/40",
        "backdrop:bg-black/60 backdrop:backdrop-blur-[3px]",
      )}
    >
      <div className="flex flex-col gap-3.5 p-6">
        <div className="flex items-center justify-between">
          <div className="font-display text-[17px] font-bold text-text">{title}</div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md bg-card2 px-1.5 py-0.5 text-[18px] leading-none text-textS hover:text-text"
          >
            ✕
          </button>
        </div>
        {children}
        {footer ? (
          <div className="mt-1 flex flex-col gap-2 border-t border-border pt-3 sm:flex-row sm:justify-end">
            {footer}
          </div>
        ) : null}
      </div>
    </dialog>
  );
}
