"use client";

import { useState, type ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { PortalSidebar } from "./PortalSidebar";
import { PortalTopBar } from "./PortalTopBar";

export function PortalShell({ children }: { children?: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  function toggleSidebar() {
    if (typeof window === "undefined") {
      setCollapsed((current) => !current);
      return;
    }

    if (window.innerWidth < 768) {
      setMobileOpen((current) => !current);
      return;
    }

    setCollapsed((current) => !current);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen w-full">
        <PortalSidebar collapsed={collapsed} mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
        <div className="flex min-w-0 flex-1 flex-col">
          <PortalTopBar onToggleSidebar={toggleSidebar} />
          <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
            {children ?? <Outlet />}
          </main>
        </div>
      </div>
    </div>
  );
}
