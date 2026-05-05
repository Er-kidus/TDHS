"use client";

import { NavLink, useLocation } from "react-router-dom";
import { ClipboardList, Globe, Heart, LayoutDashboard, RefreshCcw, FileClock, UserPlus, X } from "lucide-react";

const sidebarItems = [
  { to: "/request-access", label: "Request Access", icon: UserPlus },
  { to: "/dashboard/pending-access", label: "Pending Access", icon: ClipboardList },
  { to: "/dashboard/organizational-domain", label: "Organizational Domain", icon: Globe },
  { to: "/dashboard/update-request", label: "Update Request", icon: RefreshCcw },
  { to: "/dashboard/request-status", label: "Request Status", icon: FileClock },
] as const;

export function PortalSidebar({ collapsed, mobileOpen, onCloseMobile }: { collapsed: boolean; mobileOpen: boolean; onCloseMobile: () => void; }) {
  const location = useLocation();

  const sidebarBody = (showLabels: boolean) => (
    <>
      <div className="border-b border-sidebar-border px-4 py-4">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {showLabels ? "Navigation" : "Nav"}
        </div>
        {showLabels ? <p className="mt-1 text-sm font-medium text-foreground">Organization portal</p> : null}
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3 py-3">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.to || location.pathname.startsWith(item.to + "/");
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition-colors ${
                  isActive || active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                }`
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              {showLabels ? <span className="flex-1 truncate">{item.label}</span> : null}
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-sidebar-border p-4">
        <div className="rounded-2xl border border-sidebar-border bg-card/60 px-3 py-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5 text-foreground">
            <Heart className="h-3.5 w-3.5 text-primary" />
            {showLabels ? "Secure onboarding" : "Secure"}
          </div>
          {showLabels ? <p className="mt-1.5">Organization onboarding and access control</p> : null}
        </div>
      </div>
    </>
  );

  return (
    <>
      <aside className={`hidden shrink-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground backdrop-blur md:flex md:flex-col transition-all duration-300 ${collapsed ? "w-20" : "w-72"}`} aria-label="Main navigation">
        {sidebarBody(!collapsed)}
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <button type="button" aria-label="Close navigation" className="absolute inset-0 bg-slate-950/60" onClick={onCloseMobile} />
          <aside className="relative flex h-full w-[86vw] max-w-sm flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-2xl">
            <div className="flex items-center justify-between border-b px-4 py-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Navigation</div>
                <div className="mt-1 text-sm font-medium text-foreground">Organization portal</div>
              </div>
              <button type="button" onClick={onCloseMobile} aria-label="Close navigation" className="rounded-lg border border-sidebar-border p-2">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex flex-1 flex-col overflow-y-auto">
              {sidebarBody(true)}
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
