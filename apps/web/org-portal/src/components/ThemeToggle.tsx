"use client";

import { useEffect, useState } from "react";

const THEME_STORAGE_KEY = "org-portal-theme";

function getSystemTheme() {
  if (typeof window === "undefined") {
    return "light";
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getActiveTheme() {
  if (typeof window === "undefined") {
    return "light";
  }
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  return stored === "dark" || stored === "light" ? stored : getSystemTheme();
}

function applyTheme(theme: "light" | "dark") {
  if (typeof document === "undefined") {
    return;
  }
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
  window.localStorage.setItem(THEME_STORAGE_KEY, theme);
}

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const initialTheme = getActiveTheme();
    setTheme(initialTheme);
    applyTheme(initialTheme);

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
      if (stored !== "light" && stored !== "dark") {
        const nextTheme = media.matches ? "dark" : "light";
        setTheme(nextTheme);
        applyTheme(nextTheme);
      }
    };

    if (media.addEventListener) {
      media.addEventListener("change", handleChange);
    } else {
      media.addListener(handleChange);
    }

    setMounted(true);

    return () => {
      if (media.removeEventListener) {
        media.removeEventListener("change", handleChange);
      } else {
        media.removeListener(handleChange);
      }
    };
  }, []);

  const label = mounted ? (theme === "dark" ? "Dark" : "Light") : "Theme";

  return (
    <button
      type="button"
      onClick={() => {
        const nextTheme = theme === "dark" ? "light" : "dark";
        setTheme(nextTheme);
        applyTheme(nextTheme);
      }}
      className="rounded-full border border-zinc-200/60 bg-white/60 px-3 py-1 text-sm text-zinc-700 backdrop-blur hover:bg-white/80 dark:border-white/10 dark:bg-zinc-950/40 dark:text-zinc-200 dark:hover:bg-zinc-950/60"
      aria-label="Toggle theme"
    >
      {label}
    </button>
  );
}
