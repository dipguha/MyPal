import type { ReactNode } from "react";

import { AccountTabs } from "@/components/account/AccountTabs";

export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      <AccountTabs />
      {children}
    </div>
  );
}
