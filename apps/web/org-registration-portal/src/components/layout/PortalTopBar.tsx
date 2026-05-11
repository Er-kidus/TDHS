"use client";

import { usePortalPreferences } from "./PortalPreferences";
import { Heart, Languages, LogOut, Menu, Moon, Sun } from "lucide-react";
import { clearOrgAuthToken } from "../../lib/orgApplicationApi";

export function PortalTopBar({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const { darkMode, language, toggleDarkMode, toggleLanguage } = usePortalPreferences();

  function handleLogout() {
    clearOrgAuthToken();
    if (typeof window !== "undefined") {
      window.location.assign("/login");
    }
  }

  return (
    <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card shadow-sm hover:bg-muted"
            aria-label="Toggle navigation"
            title="Toggle navigation"
          >
            <Menu className="h-4 w-4" />
          </button>

          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl medical-gradient text-white shadow-soft">
            <Heart className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold leading-none truncate">Tenadam</p>
            <p className="text-xs text-muted-foreground truncate">Organization portal</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleDarkMode}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-card px-3 text-sm shadow-sm hover:bg-muted"
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            <span className="hidden sm:inline">{darkMode ? "Light" : "Dark"}</span>
          </button>

          <button
            type="button"
            onClick={toggleLanguage}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-card px-3 text-sm shadow-sm hover:bg-muted"
            aria-label={language === "en" ? "Switch to Amharic" : "Switch to English"}
          >
            <Languages className="h-4 w-4" />
            <span>{language === "en" ? "አማርኛ" : "English"}</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-card px-3 text-sm shadow-sm hover:bg-muted"
            aria-label="Log out"
            title="Log out"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
