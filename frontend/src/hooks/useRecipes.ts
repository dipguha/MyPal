"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";

export type RecipeSrc = "predefined" | "mine" | "ai";
export type RecipeDiet = "nonveg" | "veg" | "vegan";
export type MealType = "Breakfast" | "Lunch" | "Dinner" | "Snack";

export interface Recipe {
  id: string;
  src: RecipeSrc;
  name: string;
  diet: RecipeDiet;
  meals: MealType[];
  cuisine: string;
  cook_time_minutes: number | null;
  serves: number | null;
  ingredients: string | null;
  method: string | null;
  tags: string[];
  notes: string | null;
  is_ai_generated: boolean;
  ai_calorie_min: number | null;
  ai_calorie_max: number | null;
  forked_from_id: string | null;
  created_by_member_id: string | null;
  created_by_name: string | null;
  is_starred: boolean;
  can_edit: boolean;
  created_at: string;
  updated_at: string;
}

export interface RecipeInput {
  name: string;
  diet: RecipeDiet;
  meals: MealType[];
  cuisine: string;
  cook_time_minutes?: number | null;
  serves?: number | null;
  ingredients?: string | null;
  method?: string | null;
  tags?: string[];
  notes?: string | null;
}

export interface AiGenerateInput {
  ingredients_text: string;
  meal_type: MealType;
  serves: number;
}

export interface AiRecipeDraft {
  name: string;
  ingredients: string[];
  method: string[];
  cook_time_minutes: number;
  calorie_min: number;
  calorie_max: number;
  suggested_cuisine: string;
  suggested_meals: MealType[];
  suggested_diet: RecipeDiet;
  dietary: { ok: boolean; message: string };
}

export interface AiSaveInput {
  name: string;
  diet: RecipeDiet;
  meals: MealType[];
  cuisine: string;
  serves?: number | null;
  cook_time_minutes?: number | null;
  ingredients?: string | null;
  method?: string | null;
  ai_calorie_min?: number | null;
  ai_calorie_max?: number | null;
}

const KEY = ["recipes"];

export function useRecipes() {
  return useQuery({
    queryKey: KEY,
    queryFn: () => api<Recipe[]>("/recipes"),
    staleTime: 60_000,
  });
}

export function useCreateRecipe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: RecipeInput) =>
      api<Recipe>("/recipes", { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
    },
  });
}

export function useForkRecipe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api<Recipe>(`/recipes/${id}/fork`, { method: "POST" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
    },
  });
}

export function useUpdateRecipe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: RecipeInput }) =>
      api<Recipe>(`/recipes/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
    },
  });
}

export function useDeleteRecipe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api<void>(`/recipes/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
    },
  });
}

export function useToggleStar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, on }: { id: string; on: boolean }) =>
      api<void>(`/recipes/${id}/star`, { method: on ? "POST" : "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
    },
  });
}

export function useGenerateAiRecipe() {
  return useMutation({
    mutationFn: (body: AiGenerateInput) =>
      api<AiRecipeDraft>("/recipes/ai/generate", {
        method: "POST",
        body: JSON.stringify(body),
      }),
  });
}

export function useSaveAiRecipe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: AiSaveInput) =>
      api<Recipe>("/recipes/ai", { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
    },
  });
}
