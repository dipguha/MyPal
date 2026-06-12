"use client";

import { usePathname } from "next/navigation";

import { Tabs } from "@/components/ui/Tabs";

const TABS = [
  { key: "library", label: "Library" },
  { key: "meal-planner", label: "Meal Planner" },
  { key: "grocery-list", label: "Grocery List" },
  { key: "nutrition", label: "Nutrition" },
];

export function RecipesTabs() {
  const pathname = usePathname() || "";
  const segment = pathname.split("/").filter(Boolean)[1] ?? "library";
  return <Tabs tabs={TABS} current={segment} basePath="/recipes" />;
}
