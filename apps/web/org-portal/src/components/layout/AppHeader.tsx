"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ChevronDown, Menu, Pill, Stethoscope, Tv } from "lucide-react";
import { orgNavModeFromPath, type OrgRole } from "@/lib/rbac";

export function AppHeader({ onToggleSidebar, role, showSidebarToggle = true }: { onToggleSidebar: () => void; role: OrgRole; showSidebarToggle?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const [modeOpen, setModeOpen] = useState(false);

  const modeItems = useMemo(() => {
    const careHref = role === "doctor" ? "/dashboard/doctor" : "/dashboard/nurse";
    if (role === "doctor" || role === "nurse") {
      return [
        { key: "organization", label: "Organization Mode", href: careHref, icon: Stethoscope },
        { key: "telemedicine", label: "Telemedicine", href: "/dashboard/telemedicine", icon: Tv },
      ] as const;
    }
    if (role === "pharmacist") {
      return [{ key: "pharmacy", label: "Pharmacy", href: "/dashboard/pharmacy", icon: Pill }] as const;
    }
    return [] as const;
  }, [role]);

  const activeMode = useMemo(() => {
    const mode = orgNavModeFromPath(pathname, role);
    return modeItems.find((item) => item.key === mode) ?? modeItems[0];
  }, [modeItems, pathname, role]);

  const showModeSwitch = modeItems.length > 1;

  async function logout() {
    await fetch("/api/org/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border/70 bg-background/95 px-3 backdrop-blur md:px-4">
      <div className="flex items-center gap-2">
        {showSidebarToggle ? (
          <button
            type="button"
            onClick={onToggleSidebar}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background hover:bg-accent touch-target"
            aria-label="Toggle sidebar"
            title="Toggle sidebar"
          >
            <Menu className="h-4 w-4" />
          </button>
        ) : null}
        <div className="h-8 w-8 rounded-lg medical-gradient flex items-center justify-center shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">Tenadam</p>
          <p className="truncate text-[10px] capitalize text-muted-foreground">Organization Portal • {role}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {showModeSwitch && activeMode ? (
          <div className="relative">
            <button
              type="button"
              onClick={() => setModeOpen((value) => !value)}
              className="hidden md:inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 text-xs font-semibold hover:bg-accent"
              aria-label="Switch mode"
              title="Switch mode"
            >
              <activeMode.icon className="h-3.5 w-3.5" /> {activeMode.label} <ChevronDown className="h-3 w-3" />
            </button>
            {modeOpen ? (
              <div className="absolute right-0 mt-2 w-44 rounded-xl border border-border bg-card shadow-elevated p-2 z-40">
                {modeItems.map((item) => {
                  const Icon = item.icon;
                  const selected = activeMode.key === item.key;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => {
                        setModeOpen(false);
                        router.push(item.href);
                      }}
                      className={"w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-accent " + (selected ? "bg-accent" : "")}
                    >
                      <Icon className="h-4 w-4" /> {item.label}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>
        ) : null}
        <ThemeToggle />
        <button
          type="button"
          onClick={logout}
          className="h-9 px-3 rounded-lg text-sm font-medium bg-secondary hover:bg-muted transition-colors touch-target"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
