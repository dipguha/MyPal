"use client";

import { useState } from "react";

import type { MealType, RecipeDiet } from "@/hooks/useRecipes";
import { cn } from "@/lib/cn";

import { DietSelect } from "./badges";
import { CUISINES, MEAL_TYPES, SUGGESTED_TAGS } from "./constants";

export interface RecipeFormState {
  name: string;
  diet: RecipeDiet;
  meals: MealType[];
  cuisine: string;
  cook_time_minutes: number;
  serves: number;
  ingredients: string;
  method: string;
  tags: string[];
  notes: string;
}

export const EMPTY_FORM: RecipeFormState = {
  name: "",
  diet: "nonveg",
  meals: [],
  cuisine: "British",
  cook_time_minutes: 30,
  serves: 2,
  ingredients: "",
  method: "",
  tags: [],
  notes: "",
};

const labelCls =
  "mb-1 block text-[11px] font-semibold uppercase tracking-[0.04em] text-textS";
const fieldCls =
  "w-full rounded-lg border border-border bg-card2 px-3 py-2 text-[13px] text-text outline-none focus:border-warm";

function TagEditor({
  tags,
  onChange,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
}) {
  const [input, setInput] = useState("");

  const add = (t: string) => {
    const v = t.trim();
    if (v && !tags.includes(v)) onChange([...tags, v]);
    setInput("");
  };

  return (
    <div>
      <span className={labelCls}>Tags</span>
      <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
        {tags.map((t) => (
          <span
            key={t}
            className="flex items-center gap-1 rounded-full bg-warm/10 px-2 py-0.5 text-[11px] text-warm"
          >
            {t}
            <button
              type="button"
              onClick={() => onChange(tags.filter((x) => x !== t))}
              aria-label={`Remove ${t}`}
              className="font-bold leading-none"
            >
              ×
            </button>
          </span>
        ))}
        <span className="flex items-center gap-1.5">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                add(input);
              }
            }}
            placeholder="Add tag…"
            className="w-20 rounded-full border border-border bg-card2 px-2.5 py-1 text-[11px] text-text outline-none focus:border-warm"
          />
          {input ? (
            <button
              type="button"
              onClick={() => add(input)}
              className="text-[11px] font-semibold text-warm"
            >
              + Add
            </button>
          ) : null}
        </span>
      </div>
      <div className="flex flex-wrap gap-1">
        {SUGGESTED_TAGS.filter((t) => !tags.includes(t)).map((t) => (
          <button
            type="button"
            key={t}
            onClick={() => onChange([...tags, t])}
            className="rounded-full border border-border px-2 py-[1px] text-[10px] text-textS hover:border-warm/60"
          >
            + {t}
          </button>
        ))}
      </div>
    </div>
  );
}

/** The shared body fields for Add and Edit modals. The `name` field is
 *  rendered by the parent (in the header for Edit, as a field for Add).
 *  Personal notes are shown only when `showNotes` is true. */
export function RecipeFormFields({
  form,
  setForm,
  showNotes,
  notesDisabled,
  readOnly,
}: {
  form: RecipeFormState;
  setForm: (next: RecipeFormState) => void;
  showNotes: boolean;
  notesDisabled?: boolean;
  readOnly?: boolean;
}) {
  const set = <K extends keyof RecipeFormState>(
    key: K,
    value: RecipeFormState[K],
  ) => setForm({ ...form, [key]: value });

  const toggleMeal = (m: MealType) =>
    set(
      "meals",
      form.meals.includes(m)
        ? form.meals.filter((x) => x !== m)
        : [...form.meals, m],
    );

  return (
    // A disabled <fieldset> natively disables every nested control, giving a
    // read-only view for recipes the member can't edit.
    <fieldset
      disabled={readOnly}
      className="m-0 flex flex-col gap-3 border-0 p-0"
    >
      <div>
        <span className={labelCls}>Diet type</span>
        <DietSelect value={form.diet} onChange={(v) => set("diet", v)} />
      </div>

      <div>
        <span className={labelCls}>Meal type</span>
        <div className="flex flex-wrap gap-1.5">
          {MEAL_TYPES.map((m) => {
            const active = form.meals.includes(m);
            return (
              <button
                type="button"
                key={m}
                onClick={() => toggleMeal(m)}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-[12px] transition-colors",
                  active
                    ? "border-warm bg-warm/10 font-semibold text-warm"
                    : "border-border text-textS hover:border-warm/60",
                )}
              >
                {m}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex gap-2">
        <div className="w-[70px] shrink-0">
          <span className={labelCls}>Serves</span>
          <input
            type="number"
            min={1}
            value={form.serves}
            onChange={(e) => set("serves", Number(e.target.value))}
            className={fieldCls}
          />
        </div>
        <div className="w-[90px] shrink-0">
          <span className={labelCls}>Cook time</span>
          <input
            type="number"
            min={1}
            value={form.cook_time_minutes}
            onChange={(e) => set("cook_time_minutes", Number(e.target.value))}
            className={fieldCls}
          />
        </div>
        <div className="flex-1">
          <span className={labelCls}>Cuisine</span>
          <select
            value={form.cuisine}
            onChange={(e) => set("cuisine", e.target.value)}
            className={cn(fieldCls, "appearance-auto")}
          >
            {CUISINES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <span className={labelCls}>Ingredients</span>
        <textarea
          rows={4}
          value={form.ingredients}
          onChange={(e) => set("ingredients", e.target.value)}
          placeholder="One ingredient per line…"
          className={cn(fieldCls, "resize-y")}
        />
      </div>

      <div>
        <span className={labelCls}>Method</span>
        <textarea
          rows={4}
          value={form.method}
          onChange={(e) => set("method", e.target.value)}
          placeholder="Describe the cooking steps…"
          className={cn(fieldCls, "resize-y")}
        />
      </div>

      <TagEditor tags={form.tags} onChange={(t) => set("tags", t)} />

      {showNotes ? (
        <div>
          <span className={labelCls}>Personal notes</span>
          <textarea
            rows={2}
            value={form.notes}
            disabled={notesDisabled}
            onChange={(e) => set("notes", e.target.value)}
            placeholder="e.g. Tom loves this, double the garlic next time…"
            className={cn(fieldCls, "resize-y disabled:opacity-60")}
          />
        </div>
      ) : null}
    </fieldset>
  );
}
