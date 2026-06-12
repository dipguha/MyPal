"use client";

import type { RecipeDiet, RecipeSrc } from "@/hooks/useRecipes";
import { cn } from "@/lib/cn";

/** Indian-restaurant-style diet dot: a small square with an inner circle.
 *  veg → sage (green), vegan → violet (purple), nonveg → rose (red). */
const DIET_META: Record<RecipeDiet, { token: string; title: string }> = {
  veg: { token: "sage", title: "Vegetarian" },
  vegan: { token: "violet", title: "Vegan" },
  nonveg: { token: "rose", title: "Non-vegetarian" },
};

export function DietDot({ diet }: { diet: RecipeDiet }) {
  const meta = DIET_META[diet];
  const border =
    diet === "veg"
      ? "border-sage"
      : diet === "vegan"
        ? "border-violet"
        : "border-rose";
  const fill =
    diet === "veg" ? "bg-sage" : diet === "vegan" ? "bg-violet" : "bg-rose";
  return (
    <span
      title={meta.title}
      role="img"
      aria-label={meta.title}
      className={cn(
        "inline-flex h-[11px] w-[11px] shrink-0 items-center justify-center rounded-[2px] border-[1.5px]",
        border,
      )}
    >
      <span className={cn("h-[5px] w-[5px] rounded-full", fill)} />
    </span>
  );
}

const MEAL_TOKEN: Record<string, string> = {
  Breakfast: "bg-amber/10 text-amber",
  Lunch: "bg-sage/10 text-sage",
  Dinner: "bg-teal/10 text-teal",
  Snack: "bg-card2 text-textS",
};

export function MealBadge({ meal }: { meal: string }) {
  return (
    <span
      className={cn(
        "whitespace-nowrap rounded-md px-1.5 py-[1px] text-[10px] font-semibold",
        MEAL_TOKEN[meal] ?? MEAL_TOKEN.Snack,
      )}
    >
      {meal}
    </span>
  );
}

export function InfoTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="whitespace-nowrap rounded-md bg-card2 px-1.5 py-[1px] text-[10px] text-textS">
      {children}
    </span>
  );
}

export function WarmTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="whitespace-nowrap rounded-md bg-warm/10 px-1.5 py-[1px] text-[10px] font-semibold text-warm">
      {children}
    </span>
  );
}

export function SrcBadge({ src }: { src: RecipeSrc }) {
  if (src === "predefined") return null;
  const label = src === "mine" ? "My recipe" : "AI-made";
  const cls =
    src === "mine" ? "bg-warm/10 text-warm" : "bg-sage/10 text-sage";
  return (
    <span
      className={cn(
        "whitespace-nowrap rounded-md px-1.5 py-[1px] text-[10px] font-semibold",
        cls,
      )}
    >
      {label}
    </span>
  );
}

export function FilterPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] transition-colors",
        active
          ? "border-warm bg-warm/10 font-semibold text-warm"
          : "border-border text-textS hover:border-warm/60",
      )}
    >
      {label}
    </button>
  );
}

export function DietSelect({
  value,
  onChange,
}: {
  value: RecipeDiet;
  onChange: (v: RecipeDiet) => void;
}) {
  const opts: Array<[RecipeDiet, string]> = [
    ["nonveg", "Non-veg"],
    ["veg", "Veg"],
    ["vegan", "Vegan"],
  ];
  return (
    <div className="flex gap-1.5">
      {opts.map(([v, l]) => (
        <button
          type="button"
          key={v}
          onClick={() => onChange(v)}
          className={cn(
            "rounded-full border px-2.5 py-1 text-[11px] transition-colors",
            value === v
              ? "border-warm bg-warm/10 font-semibold text-warm"
              : "border-border text-textS hover:border-warm/60",
          )}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
