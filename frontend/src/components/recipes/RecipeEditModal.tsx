"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { type Recipe, type RecipeInput, useUpdateRecipe } from "@/hooks/useRecipes";

import { InfoTag, MealBadge, SrcBadge } from "./badges";
import {
  EMPTY_FORM,
  RecipeFormFields,
  type RecipeFormState,
} from "./RecipeFormFields";
import { DietDot } from "./badges";

function toFormState(recipe: Recipe): RecipeFormState {
  return {
    name: recipe.name,
    diet: recipe.diet,
    meals: recipe.meals,
    cuisine: recipe.cuisine,
    cook_time_minutes: recipe.cook_time_minutes ?? 30,
    serves: recipe.serves ?? 2,
    ingredients: recipe.ingredients ?? "",
    method: recipe.method ?? "",
    tags: recipe.tags,
    notes: recipe.notes ?? "",
  };
}

export function RecipeEditModal({
  recipe,
  onClose,
}: {
  recipe: Recipe | null;
  onClose: () => void;
}) {
  const update = useUpdateRecipe();
  const [form, setForm] = useState<RecipeFormState>(EMPTY_FORM);

  useEffect(() => {
    if (recipe) setForm(toFormState(recipe));
  }, [recipe]);

  const readOnly = !!recipe && !recipe.can_edit;
  const canSave = !readOnly && form.name.trim().length > 0 && form.meals.length > 0;

  async function handleSave() {
    if (!recipe || !canSave) return;
    const body: RecipeInput = {
      name: form.name.trim(),
      diet: form.diet,
      meals: form.meals,
      cuisine: form.cuisine,
      cook_time_minutes: form.cook_time_minutes || null,
      serves: form.serves || null,
      ingredients: form.ingredients || null,
      method: form.method || null,
      tags: form.tags,
      notes: form.notes || null,
    };
    try {
      await update.mutateAsync({ id: recipe.id, body });
      toast.success("Recipe updated");
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err));
    }
  }

  return (
    <Modal
      open={!!recipe}
      onClose={onClose}
      title={
        recipe ? (
          <span className="flex min-w-0 flex-1 items-center gap-2">
            <DietDot diet={recipe.diet} />
            <input
              value={form.name}
              disabled={readOnly}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              aria-label="Recipe name"
              className="min-w-0 flex-1 rounded-md border border-border bg-card2 px-2 py-1 font-display text-[18px] font-bold text-text outline-none focus:border-warm disabled:opacity-70"
            />
          </span>
        ) : (
          ""
        )
      }
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={update.isPending}>
            Close
          </Button>
          {readOnly ? null : (
            <Button onClick={handleSave} loading={update.isPending} disabled={!canSave}>
              Save changes
            </Button>
          )}
        </>
      }
    >
      {recipe ? (
        <div className="flex flex-col gap-3.5">
          <div className="flex flex-wrap items-center gap-1">
            {recipe.meals.map((m) => (
              <MealBadge key={m} meal={m} />
            ))}
            <InfoTag>{recipe.cuisine}</InfoTag>
            {recipe.cook_time_minutes != null ? (
              <InfoTag>{recipe.cook_time_minutes} min</InfoTag>
            ) : null}
            {recipe.serves != null ? <InfoTag>Serves {recipe.serves}</InfoTag> : null}
            <SrcBadge src={recipe.src} />
          </div>
          <RecipeFormFields
            form={form}
            setForm={setForm}
            showNotes
            readOnly={readOnly}
          />
        </div>
      ) : null}
    </Modal>
  );
}
