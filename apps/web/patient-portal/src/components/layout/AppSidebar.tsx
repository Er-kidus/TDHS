"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItemsByMode } from "@/components/layout/navConfig";
import { ShieldCheck, X } from "lucide-react";
import { useModeStore } from "@/stores/modeStore";
import { useI18n } from "@/hooks/useI18n";

export function AppSidebar({
  collapsed,
  mobileOpen,
  onCloseMobile,
}: {
  collapsed: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}) {
  const pathname = usePathname();
  const mode = useModeStore((s) => s.mode);
  const { t } = useI18n();
  const navItems = navItemsByMode(mode);

  const desktopSidebar = (
    <aside
      className={
        "hidden shrink-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex md:flex-col transition-all duration-300 " +
        (collapsed ? "w-22" : "w-72")
      }
      aria-label="Main navigation"
    >
      <div className="px-4 py-4">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {collapsed ? "Nav" : "Navigation"}
        </div>
      </div>

      <nav className="flex flex-col gap-1 px-3">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              className={
                "rounded-lg px-3 py-2 text-sm font-medium transition-colors touch-target flex items-center gap-2.5 " +
                (active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50")
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              {collapsed ? null : <span className="truncate">{t(item.labelKey)}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto p-4 space-y-3">
        <div className="rounded-lg border border-sidebar-border bg-card/60 px-3 py-3 text-xs text-muted-foreground space-y-1.5">
          <div className="flex items-center gap-1.5 text-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-success" />
            {collapsed ? "Secure" : "Secure Session"}
          </div>
          {collapsed ? null : <p>HIPAA-style safeguards active. Last login: Today 08:42 AM.</p>}
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
                <div className="mt-1 text-sm font-medium text-foreground">{t("portal")}</div>
              </div>
              <button type="button" onClick={onCloseMobile} aria-label="Close navigation" title="Close navigation" className="rounded-lg border border-sidebar-border p-2">
                <X className="h-4 w-4" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-3 py-3">
              <div className="space-y-1.5">
                {navItems.map((item) => {
                  const active = pathname === item.href || pathname.startsWith(item.href + "/");
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onCloseMobile}
                      className={
                        "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition " +
                        (active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent/50")
                      }
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{t(item.labelKey)}</span>
                    </Link>
                  );
                })}
              </div>
            </nav>
            <div className="border-t border-sidebar-border p-4 space-y-3">
              <div className="rounded-lg border border-sidebar-border bg-card/60 px-3 py-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5 text-foreground">
                  <ShieldCheck className="h-3.5 w-3.5 text-success" />
                  Secure Session
                </div>
              </div>
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
