"use client";

import toast from "react-hot-toast";

import { BtnSm } from "@/components/ui/BtnSm";
import { Modal } from "@/components/ui/Modal";
import { type Recipe, useForkRecipe } from "@/hooks/useRecipes";

import { DietDot } from "./badges";

export function ForkConfirmModal({
  recipe,
  onClose,
  onForked,
}: {
  recipe: Recipe | null;
  onClose: () => void;
  onForked: (forked: Recipe) => void;
}) {
  const fork = useForkRecipe();

  async function handleConfirm() {
    if (!recipe) return;
    try {
      const forked = await fork.mutateAsync(recipe.id);
      onForked(forked);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err));
    }
  }

  return (
    <Modal
      open={!!recipe}
      onClose={onClose}
      widthClass="w-[min(340px,94vw)]"
      title={
        recipe ? (
          <span className="flex items-center gap-2">
            <DietDot diet={recipe.diet} />
            {recipe.name}
          </span>
        ) : (
          ""
        )
      }
      footer={
        <>
          <BtnSm onClick={onClose} disabled={fork.isPending}>
            Cancel
          </BtnSm>
          <BtnSm tone="warm" onClick={handleConfirm} disabled={fork.isPending}>
            Save a copy
          </BtnSm>
        </>
      }
    >
      <p className="text-[13px] leading-relaxed text-textS">
        This is a MyPal recipe. To make changes, we&apos;ll save a copy to{" "}
        <strong className="text-text">My recipes</strong> that you can edit
        freely.
      </p>
    </Modal>
  );
}
