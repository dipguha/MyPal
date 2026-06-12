"use client";

import { useState } from "react";
import toast from "react-hot-toast";

import {
  type AiRecipeDraft,
  type MealType,
  useGenerateAiRecipe,
  useSaveAiRecipe,
} from "@/hooks/useRecipes";
import { cn } from "@/lib/cn";

import { InfoTag, MealBadge } from "./badges";
import { CUISINES, MEAL_TYPES, PANTRY } from "./constants";

const labelCls =
  "mb-2 block text-[11px] font-semibold uppercase tracking-[0.04em] text-textS";
const fieldCls =
  "w-full rounded-lg border border-border bg-card2 px-3 py-2 text-[13px] text-text outline-none focus:border-warm";

function Chip({
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
        "rounded-full border px-3 py-1 text-[12px] transition-colors",
        active
          ? "border-warm bg-warm/10 font-semibold text-warm"
          : "border-border text-textS hover:border-warm/60",
      )}
    >
      {label}
    </button>
  );
}

function ServesPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="flex gap-1.5">
      {[1, 2, 3, 4, 5, 6].map((n) => (
        <button
          type="button"
          key={n}
          onClick={() => onChange(n)}
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-full border text-[12px] transition-colors",
            value === n
              ? "border-warm bg-warm/10 font-semibold text-warm"
              : "border-border text-textS hover:border-warm/60",
          )}
        >
          {n}
        </button>
      ))}
    </div>
  );
}

function Header({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="mb-4 flex items-center gap-2.5">
      <button
        type="button"
        onClick={onBack}
        aria-label="Back"
        className="text-[18px] leading-none text-textS hover:text-text"
      >
        ←
      </button>
      <div className="font-display text-[16px] font-bold text-text">{title}</div>
      <span className="ml-auto rounded-full bg-sage/10 px-2 py-0.5 text-[10px] font-semibold text-sage">
        AI
      </span>
    </div>
  );
}

export function AiCreateFlow({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: () => void;
}) {
  const generate = useGenerateAiRecipe();
  const save = useSaveAiRecipe();

  const [step, setStep] = useState<"input" | "review" | "confirm">("input");
  const [ingredientsText, setIngredientsText] = useState("");
  const [mealType, setMealType] = useState<MealType>("Dinner");
  const [serves, setServes] = useState(4);
  const [draft, setDraft] = useState<AiRecipeDraft | null>(null);

  const [confirmName, setConfirmName] = useState("");
  const [confirmMeals, setConfirmMeals] = useState<MealType[]>([]);
  const [confirmCuisine, setConfirmCuisine] = useState("");
  const [confirmServes, setConfirmServes] = useState(4);

  function addPantry(item: string) {
    if (ingredientsText.toLowerCase().includes(item.toLowerCase())) return;
    setIngredientsText((t) => {
      const s = t.trim();
      return s ? `${s}, ${item}` : item;
    });
  }

  async function handleGenerate() {
    if (!ingredientsText.trim()) return;
    try {
      const d = await generate.mutateAsync({
        ingredients_text: ingredientsText.trim(),
        meal_type: mealType,
        serves,
      });
      setDraft(d);
      setConfirmName(d.name);
      setConfirmMeals([mealType]);
      setConfirmCuisine(d.suggested_cuisine);
      setConfirmServes(serves);
      setStep("review");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "AI generation failed");
    }
  }

  async function handleSave() {
    if (!draft || !confirmName.trim() || confirmMeals.length === 0 || !confirmCuisine)
      return;
    try {
      await save.mutateAsync({
        name: confirmName.trim(),
        diet: draft.suggested_diet,
        meals: confirmMeals,
        cuisine: confirmCuisine,
        serves: confirmServes,
        cook_time_minutes: draft.cook_time_minutes,
        ingredients: draft.ingredients.join("\n"),
        method: draft.method.join("\n"),
        ai_calorie_min: draft.calorie_min,
        ai_calorie_max: draft.calorie_max,
      });
      toast.success("Recipe added");
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err));
    }
  }

  // ── Stage 1: Input ──
  if (step === "input") {
    return (
      <div>
        <Header title="Create with AI" onBack={onClose} />

        <span className={labelCls}>Ingredients</span>
        <div className="mb-2.5 flex flex-wrap gap-1.5">
          {PANTRY.map((item) => {
            const added = ingredientsText.toLowerCase().includes(item.toLowerCase());
            return (
              <Chip
                key={item}
                label={item}
                active={added}
                onClick={() => addPantry(item)}
              />
            );
          })}
        </div>
        <input
          value={ingredientsText}
          onChange={(e) => setIngredientsText(e.target.value)}
          placeholder="Select ingredients above or type here…"
          className={cn(fieldCls, "mb-4")}
        />

        <div className="mb-4 h-px bg-border" />

        <span className={labelCls}>Meal type</span>
        <div className="mb-4 flex flex-wrap gap-1.5">
          {MEAL_TYPES.map((m) => (
            <Chip
              key={m}
              label={m}
              active={mealType === m}
              onClick={() => setMealType(m)}
            />
          ))}
        </div>

        <div className="mb-4 h-px bg-border" />

        <div className="mb-4 flex items-center gap-2.5">
          <span className="whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.04em] text-textS">
            How many people?
          </span>
          <ServesPicker value={serves} onChange={setServes} />
        </div>

        <p className="mb-3.5 text-[11px] text-textS">
          🛡 Family dietary preferences loaded automatically
        </p>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={!ingredientsText.trim() || generate.isPending}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-gradient-to-br from-warm to-rose px-5 py-2.5 text-[14px] font-medium text-white shadow-md shadow-warm/30 transition-all hover:shadow-lg hover:shadow-warm/50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {generate.isPending ? (
            <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-r-transparent" />
          ) : null}
          {generate.isPending ? "Generating…" : "✨ Generate recipe"}
        </button>
      </div>
    );
  }

  // ── Stage 2: Review ──
  if (step === "review" && draft) {
    return (
      <div>
        <Header title="Create with AI" onBack={() => setStep("input")} />

        <div
          className={cn(
            "mb-3.5 flex items-center gap-2 rounded-lg border px-3 py-2.5 text-[12.5px] font-medium",
            draft.dietary.ok
              ? "border-sage/30 bg-sage/10 text-sage"
              : "border-warm/30 bg-warm/10 text-warm",
          )}
        >
          <span>{draft.dietary.ok ? "✓" : "⚠"}</span>
          <span>{draft.dietary.message}</span>
        </div>

        <div className="relative mb-3">
          <input
            value={confirmName}
            onChange={(e) => setConfirmName(e.target.value)}
            aria-label="Recipe name"
            className="w-full border-b-2 border-warm bg-transparent pb-1.5 pr-6 font-display text-[17px] font-semibold text-text outline-none"
          />
          <span className="pointer-events-none absolute right-0 top-1 text-[12px] text-warm">
            ✏
          </span>
        </div>

        <div className="mb-3.5 flex flex-wrap items-center gap-1.5">
          {confirmMeals.map((m) => (
            <MealBadge key={m} meal={m} />
          ))}
          <InfoTag>Serves {confirmServes}</InfoTag>
          <span className="whitespace-nowrap rounded-full bg-amber/10 px-2 py-[3px] text-[11px] text-amber">
            ~{draft.cook_time_minutes} min · AI est.
          </span>
          <span className="whitespace-nowrap rounded-full bg-amber/10 px-2 py-[3px] text-[11px] text-amber">
            {draft.calorie_min}–{draft.calorie_max} kcal · AI est.
          </span>
        </div>

        <div className="mb-3 h-px bg-border" />

        <span className={labelCls}>Ingredients</span>
        <div className="mb-3.5 flex flex-col gap-1.5">
          {draft.ingredients.map((ing, i) => (
            <div key={i} className="flex items-baseline gap-2 text-[13px] text-text">
              <span className="mt-1.5 inline-block h-[5px] w-[5px] shrink-0 rounded-full bg-warm" />
              <span>{ing}</span>
            </div>
          ))}
        </div>

        <div className="mb-3 h-px bg-border" />

        <span className={labelCls}>Method</span>
        <div className="mb-4 flex flex-col gap-2.5">
          {draft.method.map((stepText, i) => (
            <div key={i} className="flex items-start gap-2.5 text-[13px] leading-relaxed text-text">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-warm/10 text-[11px] font-semibold text-warm">
                {i + 1}
              </span>
              <span>{stepText}</span>
            </div>
          ))}
        </div>

        <div className="flex gap-2 border-t border-border pt-3.5">
          <button
            type="button"
            onClick={() => setStep("input")}
            className="flex-1 rounded-md border border-border bg-card2 px-3.5 py-2 text-[13px] font-semibold text-text transition-colors hover:border-warm hover:text-warm"
          >
            ↺ Regenerate
          </button>
          <button
            type="button"
            onClick={() => setStep("confirm")}
            className="flex-[2] rounded-md bg-gradient-to-br from-warm to-rose px-5 py-2 text-[13px] font-medium text-white shadow-md shadow-warm/30 transition-all hover:shadow-lg hover:shadow-warm/50"
          >
            Save to library →
          </button>
        </div>
      </div>
    );
  }

  // ── Stage 3: Confirm ──
  if (step === "confirm" && draft) {
    const canSave = !!confirmName.trim() && confirmMeals.length > 0 && !!confirmCuisine;
    return (
      <div>
        <Header title="Save to library" onBack={() => setStep("review")} />

        <div className="mb-4 rounded-lg border border-border bg-card2 px-3.5 py-2.5">
          <div className="mb-0.5 text-[11px] text-textS">Recipe</div>
          <div className="mb-1 text-[14px] font-semibold text-text">{confirmName}</div>
          <div className="text-[12px] text-amber">
            {draft.calorie_min}–{draft.calorie_max} kcal · AI est.{" "}
            <span className="text-textS">·</span> ~{draft.cook_time_minutes} min · AI est.
          </div>
        </div>

        <div className="mb-4">
          <span className={labelCls}>Name</span>
          <input
            value={confirmName}
            onChange={(e) => setConfirmName(e.target.value)}
            className={fieldCls}
          />
        </div>

        <div className="mb-4">
          <span className={labelCls}>Meal type</span>
          <div className="flex flex-wrap gap-1.5">
            {MEAL_TYPES.map((m) => (
              <Chip
                key={m}
                label={m}
                active={confirmMeals.includes(m)}
                onClick={() =>
                  setConfirmMeals((s) =>
                    s.includes(m) ? s.filter((x) => x !== m) : [...s, m],
                  )
                }
              />
            ))}
          </div>
        </div>

        <div className="mb-4">
          <span className={labelCls}>Cuisine</span>
          <select
            value={confirmCuisine}
            onChange={(e) => setConfirmCuisine(e.target.value)}
            className={cn(fieldCls, "appearance-auto")}
          >
            <option value="">Select cuisine…</option>
            {CUISINES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-5">
          <span className={labelCls}>Serves</span>
          <ServesPicker value={confirmServes} onChange={setConfirmServes} />
        </div>

        <div className="mb-4 h-px bg-border" />

        <button
          type="button"
          onClick={handleSave}
          disabled={!canSave || save.isPending}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-gradient-to-br from-warm to-rose px-5 py-2.5 text-[14px] font-medium text-white shadow-md shadow-warm/30 transition-all hover:shadow-lg hover:shadow-warm/50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {save.isPending ? (
            <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-r-transparent" />
          ) : null}
          🔖 Save recipe
        </button>
      </div>
    );
  }

  return null;
}
