"use client";

import { usePathname } from "next/navigation";

import { Tabs } from "@/components/ui/Tabs";

const TABS = [
  { key: "my-profile", label: "My Profile" },
  { key: "family-members", label: "Family Members" },
  { key: "access", label: "Access" },
  { key: "preferences", label: "Preferences" },
  { key: "security-privacy", label: "Security & Privacy" },
];

export function AccountTabs() {
  const pathname = usePathname() || "";
  const segment = pathname.split("/").filter(Boolean)[1] ?? "my-profile";
  return <Tabs tabs={TABS} current={segment} basePath="/account" />;
}
