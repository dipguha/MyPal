import { redirect } from "next/navigation";

import { auth } from "../../../auth";
import { AppToaster } from "@/components/shell/AppToaster";
import { QueryProvider } from "@/components/shell/QueryProvider";
import { SessionProvider } from "@/components/shell/SessionProvider";
import { Sidebar } from "@/components/shell/Sidebar";
import { Topbar } from "@/components/shell/Topbar";

export default async function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/sign-in");

  return (
    <SessionProvider>
      <QueryProvider>
        <div className="flex h-screen bg-bg text-text">
          <Sidebar />
          <main className="flex flex-1 flex-col overflow-hidden">
            <Topbar />
            <div className="flex-1 overflow-y-auto p-5">{children}</div>
          </main>
          <AppToaster />
        </div>
      </QueryProvider>
    </SessionProvider>
  );
}
