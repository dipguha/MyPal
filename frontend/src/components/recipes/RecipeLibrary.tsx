"use client";

import { useEffect, useMemo, useState } from "react";

import { type Recipe, useRecipes } from "@/hooks/useRecipes";

import { AddRecipeModal } from "./AddRecipeModal";
import { AiCreateFlow } from "./AiCreateFlow";
import { FilterPill } from "./badges";
import { MEAL_TYPES } from "./constants";
import { ForkConfirmModal } from "./ForkConfirmModal";
import { RecipeEditModal } from "./RecipeEditModal";
import { RecipeRow } from "./RecipeRow";

type SrcFilter = "all" | "mine" | "ai";
type MealFilter = "all" | (typeof MEAL_TYPES)[number];

export function RecipeLibrary() {
  const { data: recipes = [], isLoading, isError, error } = useRecipes();

  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [srcFilter, setSrcFilter] = useState<SrcFilter>("all");
  const [mealFilter, setMealFilter] = useState<MealFilter>("all");

  const [forkTarget, setForkTarget] = useState<Recipe | null>(null);
  const [editTarget, setEditTarget] = useState<Recipe | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [aiView, setAiView] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(search), 250);
    return () => clearTimeout(id);
  }, [search]);

  const filtered = useMemo(() => {
    const q = debounced.trim().toLowerCase();
    return recipes.filter((r) => {
      if (srcFilter === "mine" && r.src !== "mine") return false;
      if (srcFilter === "ai" && r.src !== "ai") return false;
      if (mealFilter !== "all" && !r.meals.includes(mealFilter)) return false;
      if (
        q &&
        !r.name.toLowerCase().includes(q) &&
        !r.cuisine.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [recipes, srcFilter, mealFilter, debounced]);

  const filtersActive =
    srcFilter !== "all" || mealFilter !== "all" || debounced.trim() !== "";

  const hasOwnRecipes = recipes.some((r) => r.src !== "predefined");

  function openRecipe(recipe: Recipe) {
    if (recipe.src === "predefined") setForkTarget(recipe);
    else setEditTarget(recipe);
  }

  function clearFilters() {
    setSrcFilter("all");
    setMealFilter("all");
    setSearch("");
  }

  if (aiView) {
    return (
      <AiCreateFlow
        onClose={() => setAiView(false)}
        onSaved={() => setAiView(false)}
      />
    );
  }

  return (
    <div>
      {/* Search */}
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name or cuisine…"
        className="mb-3 w-full rounded-lg border border-border bg-card2 px-3.5 py-2.5 text-[13px] text-text outline-none focus:border-warm"
      />

      {/* Filters */}
      <div className="mb-3 flex flex-col gap-2">
        <div className="flex gap-1.5 overflow-x-auto pb-0.5">
          {(
            [
              ["all", "All"],
              ["mine", "My recipes"],
              ["ai", "AI-made"],
            ] as Array<[SrcFilter, string]>
          ).map(([v, label]) => (
            <FilterPill
              key={v}
              label={label}
              active={srcFilter === v}
              onClick={() => setSrcFilter(v)}
            />
          ))}
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-0.5">
          <FilterPill
            label="All"
            active={mealFilter === "all"}
            onClick={() => setMealFilter("all")}
          />
          {MEAL_TYPES.map((m) => (
            <FilterPill
              key={m}
              label={m}
              active={mealFilter === m}
              onClick={() => setMealFilter(m)}
            />
          ))}
        </div>
      </div>

      {/* List card */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-3.5 py-2.5">
          <div className="text-[13px] font-semibold text-text">Recipes</div>
          <div className="text-[11px] text-textS">
            {filtered.length} {filtered.length !== 1 ? "recipes" : "recipe"}
          </div>
        </div>
        {isLoading ? (
          <div className="px-3.5 py-7 text-center text-[13px] text-textS">
            Loading recipes…
          </div>
        ) : isError ? (
          <div className="px-3.5 py-7 text-center text-[13px] text-rose">
            {error instanceof Error ? error.message : "Failed to load recipes"}
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-3.5 py-7 text-center text-[13px] text-textS">
            {filtersActive ? (
              <>
                No recipes match your filters.{" "}
                <button
                  type="button"
                  onClick={clearFilters}
                  className="font-semibold text-warm"
                >
                  Clear filters
                </button>
              </>
            ) : (
              "No recipes yet."
            )}
          </div>
        ) : (
          <div className="flex flex-col">
            {filtered.map((r) => (
              <RecipeRow key={r.id} recipe={r} onOpen={openRecipe} />
            ))}
          </div>
        )}
      </div>

      {/* No own-recipes nudge */}
      {!isLoading && !isError && !hasOwnRecipes && !filtersActive ? (
        <p className="mt-3 text-center text-[12px] text-textS">
          These are MyPal starter recipes. Add your own to build your family
          library.
        </p>
      ) : null}

      {/* Actions */}
      <div className="mt-3.5 flex gap-2">
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="flex-1 rounded-md border border-border bg-card2 px-3.5 py-2 text-[13px] font-semibold text-text transition-colors hover:border-warm hover:text-warm"
        >
          + Add recipe
        </button>
        <button
          type="button"
          onClick={() => setAiView(true)}
          className="flex-1 rounded-md border border-border bg-card2 px-3.5 py-2 text-[13px] font-semibold text-text transition-colors hover:border-warm hover:text-warm"
        >
          ✨ Create with AI
        </button>
      </div>

      <ForkConfirmModal
        recipe={forkTarget}
        onClose={() => setForkTarget(null)}
        onForked={(forked) => {
          setForkTarget(null);
          setEditTarget(forked);
        }}
      />
      <RecipeEditModal recipe={editTarget} onClose={() => setEditTarget(null)} />
      <AddRecipeModal open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}
