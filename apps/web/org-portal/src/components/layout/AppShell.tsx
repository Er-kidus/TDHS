"use client";

import { type ReactNode, useState } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { type OrgRole } from "@/lib/rbac";

export function AppShell({ children, role }: { children: ReactNode; role: OrgRole }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const hideShellSidebar = false;

  function toggleSidebar() {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setMobileOpen((value) => !value);
      return;
    }

    setCollapsed((value) => !value);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="min-h-screen flex w-full">
        {hideShellSidebar ? null : <AppSidebar role={role} collapsed={collapsed} mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />}
        <div className="flex min-w-0 flex-1 flex-col">
          <AppHeader onToggleSidebar={toggleSidebar} role={role} showSidebarToggle={!hideShellSidebar} />
          <main className={"flex-1 min-w-0 " + (hideShellSidebar ? "p-0" : "p-4 md:p-6")}>{children}</main>
        </div>
      </div>
    </div>
  );
}
