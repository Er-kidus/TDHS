"use client";

import { useEffect } from "react";
import { useUiSettingsStore } from "@/stores/uiSettingsStore";

export function UiSettingsApplier() {
  const { font, fontSize, contrast, colorMode, language } = useUiSettingsStore();

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.font = font;
    root.dataset.fontSize = fontSize;
    root.dataset.contrast = contrast;
    root.dataset.colorMode = colorMode;
    root.lang = language;
  }, [font, fontSize, contrast, colorMode, language]);

  return null;
}
