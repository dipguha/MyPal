"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { type RecipeInput, useCreateRecipe } from "@/hooks/useRecipes";

import {
  EMPTY_FORM,
  RecipeFormFields,
  type RecipeFormState,
} from "./RecipeFormFields";

export function AddRecipeModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const create = useCreateRecipe();
  const [form, setForm] = useState<RecipeFormState>(EMPTY_FORM);

  useEffect(() => {
    if (open) setForm(EMPTY_FORM);
  }, [open]);

  const canSave = form.name.trim().length > 0 && form.meals.length > 0;

  async function handleSave() {
    if (!canSave) return;
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
      await create.mutateAsync(body);
      toast.success("Recipe added");
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err));
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add recipe"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={create.isPending}>
            Cancel
          </Button>
          <Button onClick={handleSave} loading={create.isPending} disabled={!canSave}>
            Save recipe
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <div>
          <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.04em] text-textS">
            Recipe name
          </span>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Mum's shepherd's pie"
            className="w-full rounded-lg border border-border bg-card2 px-3 py-2 text-[13px] text-text outline-none focus:border-warm"
          />
        </div>
        <RecipeFormFields form={form} setForm={setForm} showNotes />
      </div>
    </Modal>
  );
}
