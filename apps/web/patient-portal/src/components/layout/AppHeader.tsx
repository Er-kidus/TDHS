"use client";

import Link from "next/link";
import { useState } from "react";
import type { ComponentType } from "react";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Bell,
  ChevronDown,
  Globe2,
  LogOut,
  Menu,
  MessageSquare,
  MoreVertical,
  Search,
  Settings,
  Stethoscope,
  Tv,
  Pill,
  UserCircle2,
} from "lucide-react";
import { useModeStore, type Mode } from "@/stores/modeStore";
import { useI18n } from "@/hooks/useI18n";

const modeItems: {
  value: Mode;
  icon: ComponentType<{ className?: string }>;
  key: "mode.care" | "mode.telemedicine" | "mode.pharmacy";
}[] = [
  { value: "care", icon: Stethoscope, key: "mode.care" },
  { value: "telemedicine", icon: Tv, key: "mode.telemedicine" },
  { value: "pharmacy", icon: Pill, key: "mode.pharmacy" },
];

export function AppHeader({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const router = useRouter();
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [modeOpen, setModeOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const mode = useModeStore((s) => s.mode);
  const setMode = useModeStore((s) => s.setMode);
  const { t, language, setLanguage } = useI18n();

  const activeMode =
    modeItems.find((item) => item.value === mode) ?? modeItems[0];

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <header className="h-16 border-b bg-card/95 backdrop-blur-sm flex items-center justify-between px-3 md:px-4 gap-2 shrink-0 sticky top-0 z-30">
      {/* LEFT */}
      <div className="flex items-center gap-2 min-w-0">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
          title="Toggle sidebar"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background hover:bg-accent"
        >
          <Menu className="h-4 w-4" />
        </button>

        <div className="h-9 w-9 rounded-xl medical-gradient flex items-center justify-center shrink-0 shadow-soft" />

        <div className="min-w-0">
          <p className="text-sm font-semibold truncate">{t("brand")}</p>
          <p className="text-[11px] text-muted-foreground truncate">
            {t("portal")}
          </p>
        </div>
      </div>

      {/* SEARCH */}
      <div className="hidden lg:flex items-center flex-1 max-w-xl mx-4">
        <label className="relative w-full">
          <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            placeholder={t("header.searchPlaceholder")}
            aria-label="Global search"
            className="w-full rounded-xl border border-border bg-background pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/40"
          />
        </label>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-2 relative">
        {/* MODE SWITCH (DESKTOP) */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setModeOpen((v) => !v)}
            aria-label="Switch mode"
            title="Switch mode"
            className="hidden md:inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 text-xs font-semibold hover:bg-accent"
          >
            <activeMode.icon className="h-3.5 w-3.5" />
            {t(activeMode.key)}
            <ChevronDown className="h-3 w-3" />
          </button>

          {modeOpen && (
            <div className="absolute right-0 mt-2 w-44 rounded-xl border bg-card shadow-elevated p-2 z-40">
              {modeItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.value}
                    onClick={() => {
                      setMode(item.value);
                      setModeOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-accent ${
                      item.value === mode ? "bg-accent" : ""
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {t(item.key)}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* LANGUAGE */}
        <button
          onClick={() =>
            setLanguage(language === "en" ? "am" : "en")
          }
          aria-label={t("header.language")}
          title={t("header.language")}
          className="hidden sm:inline-flex h-9 w-9 items-center justify-center rounded-lg border bg-background hover:bg-accent"
        >
          <Globe2 className="h-4 w-4" />
        </button>

        {/* THEME */}
        <div className="hidden sm:block">
          <ThemeToggle />
        </div>

        {/* MESSAGES */}
        <Link
          href="/messages"
          aria-label={t("header.messages")}
          title={t("header.messages")}
          className="hidden sm:inline-flex h-9 w-9 items-center justify-center rounded-lg border bg-background hover:bg-accent"
        >
          <MessageSquare className="h-4 w-4" />
        </Link>

        {/* NOTIFICATIONS */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen((v) => !v)}
            aria-label={t("header.notifications")}
            title={t("header.notifications")}
            className="h-9 w-9 inline-flex items-center justify-center rounded-lg border bg-background hover:bg-accent"
          >
            <Bell className="h-4 w-4" />
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border bg-card shadow-elevated p-3 z-40">
              Alerts
            </div>
          )}
        </div>

        {/* PROFILE */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen((v) => !v)}
            aria-label={t("header.profile")}
            title={t("header.profile")}
            className="h-9 w-9 inline-flex items-center justify-center rounded-lg border bg-background hover:bg-accent"
          >
            <UserCircle2 className="h-5 w-5 text-primary" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-52 rounded-xl border bg-card shadow-elevated p-2 z-40">
              <Link href="/profile" className="flex items-center gap-2 px-3 py-2 hover:bg-accent">
                <UserCircle2 className="h-4 w-4" />
                {t("header.profile")}
              </Link>
              <Link href="/settings" className="flex items-center gap-2 px-3 py-2 hover:bg-accent">
                <Settings className="h-4 w-4" />
                {t("nav.settings")}
              </Link>
            </div>
          )}
        </div>

        {/* LOGOUT */}
        <button
          onClick={logout}
          aria-label={t("header.logout")}
          title={t("header.logout")}
          className="hidden sm:inline-flex h-9 w-9 items-center justify-center rounded-lg border bg-background hover:bg-accent"
        >
          <LogOut className="h-4 w-4" />
        </button>

        {/* MOBILE MENU */}
        <div className="relative sm:hidden">
          <button
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label="Open menu"
            title="Open menu"
            className="h-9 w-9 inline-flex items-center justify-center rounded-lg border bg-background hover:bg-accent"
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {mobileMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border bg-card shadow-elevated p-2 z-50">
              {/* MODE SWITCH */}
              <div className="px-2 py-1">
                <p className="text-[10px] uppercase text-muted-foreground mb-1">
                  {t("header.mode")}
                </p>
                {modeItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.value}
                      onClick={() => {
                        setMode(item.value);
                        setMobileMenuOpen(false);
                      }}
                      className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-accent ${
                        item.value === mode ? "bg-accent" : ""
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {t(item.key)}
                    </button>
                  );
                })}
              </div>

              <div className="border-t my-2" />

              <button
                onClick={() => {
                  setLanguage(language === "en" ? "am" : "en");
                  setMobileMenuOpen(false);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 hover:bg-accent"
              >
                <Globe2 className="h-4 w-4" />
                {t("header.language")}
              </button>

              <Link
                href="/messages"
                className="flex w-full items-center gap-2 px-3 py-2 hover:bg-accent"
              >
                <MessageSquare className="h-4 w-4" />
                {t("header.messages")}
              </Link>

              <div className="flex items-center gap-2 px-3 py-2">
                <ThemeToggle />
                <span>{t("header.theme")}</span>
              </div>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-red-600 hover:bg-accent"
              >
                <LogOut className="h-4 w-4" />
                {t("header.logout")}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}