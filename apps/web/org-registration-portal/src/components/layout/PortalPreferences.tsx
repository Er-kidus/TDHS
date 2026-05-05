"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type PortalLanguage = "en" | "am";

type PortalPreferencesValue = {
  darkMode: boolean;
  language: PortalLanguage;
  setDarkMode: (value: boolean | ((current: boolean) => boolean)) => void;
  setLanguage: (value: PortalLanguage | ((current: PortalLanguage) => PortalLanguage)) => void;
  toggleDarkMode: () => void;
  toggleLanguage: () => void;
};

const PortalPreferencesContext = createContext<PortalPreferencesValue | null>(null);

function getInitialDarkMode() {
  if (typeof window === "undefined") return false;
  const storedTheme = window.localStorage.getItem("theme");
  if (storedTheme === "dark") return true;
  if (storedTheme === "light") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function getInitialLanguage() {
  if (typeof window === "undefined") return "en";
  const storedLanguage = window.localStorage.getItem("language");
  return storedLanguage === "am" ? "am" : "en";
}

export function PortalPreferencesProvider({ children }: { children: ReactNode }) {
  const [darkMode, setDarkMode] = useState<boolean>(getInitialDarkMode);
  const [language, setLanguage] = useState<PortalLanguage>(getInitialLanguage);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    window.localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    window.localStorage.setItem("language", language);
  }, [language]);

  const value = useMemo<PortalPreferencesValue>(
    () => ({
      darkMode,
      language,
      setDarkMode,
      setLanguage,
      toggleDarkMode: () => setDarkMode((current) => !current),
      toggleLanguage: () => setLanguage((current) => (current === "en" ? "am" : "en")),
    }),
    [darkMode, language],
  );

  return <PortalPreferencesContext.Provider value={value}>{children}</PortalPreferencesContext.Provider>;
}

export function usePortalPreferences() {
  const context = useContext(PortalPreferencesContext);
  if (!context) {
    throw new Error("usePortalPreferences must be used within PortalPreferencesProvider");
  }

  return context;
}
