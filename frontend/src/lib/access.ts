/**
 * Access-control constants — mirror of `backend/app/access/constants.py`.
 * Keep both files in sync if either changes.
 */

export type Permission = "none" | "view" | "edit" | "manage";
export type RoleCode = "owner" | "admin" | "adult" | "teenager" | "child";

export interface ModuleMeta {
  key: string;
  label: string;
  area: ModuleArea;
  icon: string;
}

export type ModuleArea =
  | "life-admin"
  | "finance"
  | "health"
  | "recipes"
  | "travel";

export const MODULE_AREAS: { key: ModuleArea; label: string; icon: string }[] = [
  { key: "life-admin", label: "Life Admin", icon: "📋" },
  { key: "finance", label: "Finance", icon: "💷" },
  { key: "health", label: "Health", icon: "❤️" },
  { key: "recipes", label: "Recipes & Groceries", icon: "🍳" },
  { key: "travel", label: "Travel", icon: "✈️" },
];

export const MODULES: ModuleMeta[] = [
  // Life Admin
  { key: "life-admin.tasks",          area: "life-admin", label: "Tasks",          icon: "✅" },
  { key: "life-admin.household-info", area: "life-admin", label: "Household Info", icon: "🏠" },
  { key: "life-admin.documents",      area: "life-admin", label: "Documents",      icon: "📄" },
  { key: "life-admin.cars-home",      area: "life-admin", label: "Cars & Home",    icon: "🚗" },
  { key: "life-admin.pet-care",       area: "life-admin", label: "Pet Care",       icon: "🐾" },
  // Finance
  { key: "finance.overview",         area: "finance", label: "Overview",         icon: "📊" },
  { key: "finance.budget-envelopes", area: "finance", label: "Budget Envelopes", icon: "✉️" },
  { key: "finance.transactions",     area: "finance", label: "Transactions",     icon: "💳" },
  { key: "finance.bills-subs",       area: "finance", label: "Bills & Subs",     icon: "🧾" },
  { key: "finance.admin",            area: "finance", label: "Admin",            icon: "⚙️" },
  { key: "finance.my-finance",       area: "finance", label: "My Finance",       icon: "👛" },
  // Health
  { key: "health.overview",        area: "health", label: "Overview",        icon: "🩺" },
  { key: "health.medications",     area: "health", label: "Medications",     icon: "💊" },
  { key: "health.preventive-care", area: "health", label: "Preventive Care", icon: "🛡️" },
  { key: "health.emergency-info",  area: "health", label: "Emergency Info",  icon: "🚨" },
  { key: "health.appointments",    area: "health", label: "Appointments",    icon: "📅" },
  { key: "health.journal",         area: "health", label: "Journal",         icon: "📔" },
  // Recipes & Groceries
  { key: "recipes.library",      area: "recipes", label: "Library",      icon: "📚" },
  { key: "recipes.meal-planner", area: "recipes", label: "Meal Planner", icon: "🗓️" },
  { key: "recipes.grocery-list", area: "recipes", label: "Grocery List", icon: "🛒" },
  // Travel
  { key: "travel.my-trips",          area: "travel", label: "My Trips",          icon: "🧳" },
  { key: "travel.packing-templates", area: "travel", label: "Packing Templates", icon: "🧺" },
  { key: "travel.travel-ready",      area: "travel", label: "Travel Ready",      icon: "✈️" },
];

export const LOCKED_MODULES: ReadonlySet<string> = new Set([
  "finance.admin",
  "health.emergency-info",
]);

export const FINANCE_MODULES: ReadonlySet<string> = new Set(
  MODULES.filter((m) => m.area === "finance").map((m) => m.key),
);

export const ROLE_LABELS: Record<RoleCode, string> = {
  owner: "Owner",
  admin: "Admin",
  adult: "Adult Member",
  teenager: "Teenager",
  child: "Children",
};

export const PERMISSION_LABELS: Record<Permission, string> = {
  none: "None",
  view: "View",
  edit: "Edit",
  manage: "Manage",
};

export const PERMISSION_DESCRIPTIONS: Record<Permission, string> = {
  none: "Cannot see this module.",
  view: "Can see items but cannot make changes.",
  edit: "Can see items and create, change, or remove their own.",
  manage: "Full access — can see and change everyone's items.",
};

export function modulesByArea(): Record<ModuleArea, ModuleMeta[]> {
  const groups = {
    "life-admin": [] as ModuleMeta[],
    finance: [] as ModuleMeta[],
    health: [] as ModuleMeta[],
    recipes: [] as ModuleMeta[],
    travel: [] as ModuleMeta[],
  };
  for (const m of MODULES) groups[m.area].push(m);
  return groups;
}
