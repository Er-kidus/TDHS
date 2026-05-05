import { create } from "zustand";
import { persist } from "zustand/middleware";

export type FontFamily = "inter" | "noto-ethiopic";
export type FontSize = "sm" | "md" | "lg" | "xl";
export type ContrastMode = "normal" | "high";
export type ColorMode = "default" | "protanopia" | "deuteranopia" | "tritanopia";
export type Language = "en" | "am";

type UiSettings = {
  language: Language;
  font: FontFamily;
  fontSize: FontSize;
  contrast: ContrastMode;
  colorMode: ColorMode;
  setLanguage: (language: Language) => void;
  setFont: (font: FontFamily) => void;
  setFontSize: (fontSize: FontSize) => void;
  setContrast: (contrast: ContrastMode) => void;
  setColorMode: (colorMode: ColorMode) => void;
};

export const useUiSettingsStore = create<UiSettings>()(
  persist(
    (set) => ({
      language: "en",
      font: "inter",
      fontSize: "md",
      contrast: "normal",
      colorMode: "default",
      setLanguage: (language) => set({ language }),
      setFont: (font) => set({ font }),
      setFontSize: (fontSize) => set({ fontSize }),
      setContrast: (contrast) => set({ contrast }),
      setColorMode: (colorMode) => set({ colorMode }),
    }),
    { name: "tenadam-ui-settings" }
  )
);
