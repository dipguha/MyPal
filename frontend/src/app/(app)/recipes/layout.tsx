import type { ReactNode } from "react";

import { RecipesTabs } from "@/components/recipes/RecipesTabs";

export default function RecipesLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      <RecipesTabs />
      {children}
    </div>
  );
}
