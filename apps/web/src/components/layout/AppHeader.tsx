import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Bell, Search, Globe, Wifi, WifiOff, ChevronDown, LogOut, User, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";

export const AppHeader: React.FC = () => {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [isOnline] = useState(true);

  return (
    <header className="h-14 border-b bg-card flex items-center justify-between px-3 gap-2 shrink-0">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="touch-target" />
        <div className="hidden md:flex items-center gap-2 ml-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={t("common.search")}
              className="h-9 w-64 rounded-lg border bg-secondary/50 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
            <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">⌘K</kbd>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        {/* Sync status */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground mr-2">
          {isOnline ? (
            <>
              <Wifi className="h-3.5 w-3.5 text-success" />
              <span className="status-pulse inline-block h-1.5 w-1.5 rounded-full bg-success" />
            </>
          ) : (
            <WifiOff className="h-3.5 w-3.5 text-warning" />
          )}
        </div>

        {/* Language toggle */}
        <button
          onClick={() => setLanguage(language === "en" ? "am" : "en")}
          className="h-8 px-2 rounded-lg text-xs font-medium bg-secondary hover:bg-muted transition-colors flex items-center gap-1 touch-target"
        >
          <Globe className="h-3.5 w-3.5" />
          {language === "en" ? "አማ" : "EN"}
        </button>

        {/* Notifications */}
        <button
          type="button"
          aria-label="Notifications"
          title="Notifications"
          className="relative h-9 w-9 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors touch-target"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive" />
        </button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 h-9 pl-2 pr-1 rounded-lg hover:bg-secondary transition-colors touch-target">
              <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary">
                {user?.name?.split(" ").map(n => n[0]).join("") || "U"}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-medium leading-tight">{user?.name}</p>
                <p className="text-[10px] text-muted-foreground capitalize">{user?.role}</p>
              </div>
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-xs gap-2">
              <User className="h-3.5 w-3.5" /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="text-xs gap-2">
              <Settings className="h-3.5 w-3.5" /> Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-xs gap-2 text-destructive focus:text-destructive">
              <LogOut className="h-3.5 w-3.5" /> Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
