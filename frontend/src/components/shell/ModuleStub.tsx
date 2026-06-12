import { cn } from "@/lib/cn";

interface Props {
  area: string;
  module: string;
  icon: string;
  /** Optional one-line note about why this stub is here. */
  note?: string;
}

/**
 * Placeholder card rendered while a module is awaiting implementation.
 * Each module will be replaced by its real screen via its own /tech_spec
 * cycle, ported from `_UI/mypal-app.jsx`.
 */
export function ModuleStub({ area, module, icon, note }: Props) {
  return (
    <div className="mx-auto mt-8 max-w-2xl">
      <div
        className={cn(
          "rounded-2xl border border-border bg-card p-8 text-center",
          "shadow-sm shadow-black/10",
        )}
      >
        <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-card2 text-[32px]">
          {icon}
        </div>
        <div className="text-[11px] font-bold uppercase tracking-wider text-textS">
          {area}
        </div>
        <h1 className="mt-1 font-display text-[24px] font-bold text-text">
          {module}
        </h1>
        <p className="mt-3 text-[13px] text-textS">
          This module isn&apos;t built yet. The visual design lives in{" "}
          <code className="rounded bg-card2 px-1.5 py-0.5 text-[12px] text-text">
            _UI/mypal-app.jsx
          </code>
          .
        </p>
        {note ? (
          <p className="mt-2 text-[12px] text-textS/80">{note}</p>
        ) : null}
      </div>
    </div>
  );
}
