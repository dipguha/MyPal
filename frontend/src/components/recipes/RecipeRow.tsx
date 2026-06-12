"use client";

import toast from "react-hot-toast";

import { type Recipe, useToggleStar } from "@/hooks/useRecipes";
import { cn } from "@/lib/cn";

import { DietDot, InfoTag, MealBadge, SrcBadge, WarmTag } from "./badges";

export function RecipeRow({
  recipe,
  onOpen,
}: {
  recipe: Recipe;
  onOpen: (recipe: Recipe) => void;
}) {
  const toggleStar = useToggleStar();

  async function handleStar(e: React.MouseEvent) {
    e.stopPropagation();
    try {
      await toggleStar.mutateAsync({ id: recipe.id, on: !recipe.is_starred });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err));
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen(recipe)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(recipe);
        }
      }}
      className="flex cursor-pointer items-center gap-2 border-b border-border px-3.5 py-2.5 last:border-b-0 hover:bg-card2/40"
    >
      <DietDot diet={recipe.diet} />
      <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-text">
        {recipe.name}
      </span>
      <div className="flex max-w-[55%] flex-shrink-0 flex-wrap items-center justify-end gap-1">
        {recipe.meals.map((m) => (
          <MealBadge key={m} meal={m} />
        ))}
        <InfoTag>{recipe.cuisine}</InfoTag>
        {recipe.tags.slice(0, 1).map((t) => (
          <WarmTag key={t}>{t}</WarmTag>
        ))}
        <SrcBadge src={recipe.src} />
      </div>
      <button
        type="button"
        onClick={handleStar}
        aria-label={recipe.is_starred ? "Remove star" : "Star recipe"}
        aria-pressed={recipe.is_starred}
        className={cn(
          "flex-shrink-0 text-[15px] leading-none",
          recipe.is_starred ? "text-amber" : "text-textS hover:text-amber",
        )}
      >
        ★
      </button>
    </div>
  );
}
