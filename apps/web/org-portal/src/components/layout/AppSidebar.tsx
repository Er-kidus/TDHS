"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, X } from "lucide-react";
import { navigationForRole, type OrgRole } from "@/lib/rbac";

export function AppSidebar({ role, collapsed, mobileOpen, onCloseMobile }: { role: OrgRole; collapsed: boolean; mobileOpen: boolean; onCloseMobile: () => void }) {
  const pathname = usePathname();
  const nav = navigationForRole(role);
  const activeHref = [...nav]
    .sort((left, right) => right.href.length - left.href.length)
    .find((item) => pathname === item.href || pathname.startsWith(item.href + "/"))?.href;

  const desktopSidebar = (
    <aside className={"hidden shrink-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-300 md:flex md:flex-col " + (collapsed ? "w-20" : "w-64")}>
      <div className="px-4 py-4">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Navigation</div>
      </div>

      <nav className="flex flex-col gap-1 px-2.5">
        {nav.map((item) => {
          const active = activeHref === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                "touch-target rounded-lg px-3 py-2 text-sm font-medium transition-colors " +
                (active ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm" : "text-sidebar-foreground hover:bg-sidebar-accent/50")
              }
            >
              {collapsed ? item.label.slice(0, 1) : item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto p-4">
        <div className="rounded-lg border border-sidebar-border bg-card/50 px-3 py-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5 text-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-success" />
            {collapsed ? "Secure" : "Org access is protected with JWT."}
          </div>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {desktopSidebar}
      {mobileOpen ? (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <button type="button" aria-label="Close navigation" className="absolute inset-0 bg-slate-950/60" onClick={onCloseMobile} />
          <aside className="relative flex h-full w-[86vw] max-w-sm flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-2xl">
            <div className="flex items-center justify-between border-b border-sidebar-border px-4 py-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Navigation</div>
                <div className="mt-1 text-sm font-medium text-foreground">Organization Portal</div>
              </div>
              <button type="button" onClick={onCloseMobile} aria-label="Close navigation" title="Close navigation" className="rounded-lg border border-sidebar-border p-2">
                <X className="h-4 w-4" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-3">
              <div className="space-y-1.5">
                {nav.map((item) => {
                  const active = activeHref === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onCloseMobile}
                      className={
                        "flex items-center rounded-2xl px-4 py-3 text-sm font-medium transition " +
                        (active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent/50")
                      }
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>

            </nav>

            <div className="border-t border-sidebar-border p-4">
              <div className="rounded-lg border border-sidebar-border bg-card/50 px-3 py-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5 text-foreground">
                  <ShieldCheck className="h-3.5 w-3.5 text-success" />
                  Org access is protected with JWT.
                </div>
              </div>
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
