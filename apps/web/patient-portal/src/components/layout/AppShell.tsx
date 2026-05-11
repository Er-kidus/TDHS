"use client";

import { type ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AppHeader } from "@/components/layout/AppHeader";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { quickActionsByMode } from "@/components/layout/navConfig";
import { Plus } from "lucide-react";
import { useModeStore } from "@/stores/modeStore";
import { AIAssistantPanel } from "@/components/ai/AIAssistantPanel";
import { useAiContextStore } from "@/stores/aiContextStore";

export function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);
  const [lowBandwidth] = useState(() => {
    if (typeof navigator === "undefined") return false;
    const conn = (navigator as Navigator & { connection?: { effectiveType?: string; saveData?: boolean } }).connection;
    if (!conn) return false;
    const effective = conn.effectiveType ?? "";
    return Boolean(conn.saveData) || effective.includes("2g");
  });
  const pathname = usePathname();
  const mode = useModeStore((s) => s.mode);
  const quickActions = quickActionsByMode[mode];
  const setAiContext = useAiContextStore((s) => s.setContext);

  useEffect(() => {
    setAiContext({ mode, page: pathname });
  }, [mode, pathname, setAiContext]);

  useEffect(() => {
    let isRedirecting = false;
    let timer: ReturnType<typeof setInterval> | null = null;

    const handleSessionExpired = async () => {
      if (isRedirecting) return;
      isRedirecting = true;
      await fetch("/api/auth/logout", { method: "POST" }).catch(() => undefined);
      router.push("/login");
      router.refresh();
    };

    const checkSession = async () => {
      try {
        const res = await fetch("/api/auth/session/status", { cache: "no-store" });
        if (res.status === 401) {
          await handleSessionExpired();
        }
      } catch {
        // Ignore temporary network failures; next poll will re-check.
      }
    };

    void checkSession();
    timer = setInterval(() => {
      void checkSession();
    }, 30000);

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [router]);

  function toggleSidebar() {
    if (typeof window === "undefined") {
      setCollapsed((value) => !value);
      return;
    }

    if (window.innerWidth < 768) {
      setMobileOpen((value) => !value);
      return;
    }

    setCollapsed((value) => !value);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="min-h-screen flex w-full">
        <AppSidebar collapsed={collapsed} mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
        <div className="flex min-w-0 flex-1 flex-col">
          <AppHeader onToggleSidebar={toggleSidebar} />
          {lowBandwidth ? (
            <div className="mx-4 mt-3 rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-warning">
              Low-bandwidth mode detected. Video and heavy media are automatically optimized.
            </div>
          ) : null}
          <main className="flex-1 min-w-0 p-4 md:p-6">{children}</main>
        </div>
        <AIAssistantPanel />
      </div>

      <div className="fixed bottom-4 right-4 z-40">
        {quickOpen ? (
          <div className="mb-2 w-56 rounded-xl border border-border bg-card p-2 shadow-elevated">
            {quickActions.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href + item.label}
                  href={item.href}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-accent"
                  onClick={() => setQuickOpen(false)}
                >
                  <Icon className="h-4 w-4 text-primary" /> {item.label}
                </Link>
              );
            })}
          </div>
        ) : null}
        <button
          type="button"
          onClick={() => setQuickOpen((v) => !v)}
          className="h-12 w-12 rounded-full medical-gradient text-primary-foreground inline-flex items-center justify-center shadow-elevated touch-target"
          aria-label="Quick actions"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
