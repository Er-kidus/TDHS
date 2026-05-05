"use client";

import en from "@/locales/en.json";
import am from "@/locales/am.json";
import { useUiSettingsStore } from "@/stores/uiSettingsStore";

const dictionaries = { en, am };

type DictKey = keyof typeof en;

export function useI18n() {
  const language = useUiSettingsStore((s) => s.language);
  const setLanguage = useUiSettingsStore((s) => s.setLanguage);
  const dict = dictionaries[language] ?? dictionaries.en;

  function t(key: DictKey): string {
    return (dict[key] as string) ?? (dictionaries.en[key] as string) ?? key;
  }

  return { t, language, setLanguage, locale: language, setLocale: setLanguage };
}
