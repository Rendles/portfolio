"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Locale } from "@/content/site";
import { DEFAULT_MODE, type ModeId } from "@/modes/registry";

type AppState = {
  mode: ModeId;
  setMode: (m: ModeId) => void;
  locale: Locale;
  setLocale: (l: Locale) => void;
  toggleLocale: () => void;
};

const AppCtx = createContext<AppState | null>(null);

export function useApp(): AppState {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp must be used within <AppProviders>");
  return ctx;
}

export function AppProviders({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ModeId>(DEFAULT_MODE);
  const [locale, setLocaleState] = useState<Locale>("ru");

  // Восстановление из localStorage после монтирования (избегаем гидрации).
  useEffect(() => {
    const savedMode = localStorage.getItem("mode") as ModeId | null;
    const savedLocale = localStorage.getItem("locale") as Locale | null;
    if (savedMode) setModeState(savedMode);
    if (savedLocale) setLocaleState(savedLocale);
  }, []);

  const setMode = (m: ModeId) => {
    setModeState(m);
    localStorage.setItem("mode", m);
  };
  const setLocale = (l: Locale) => {
    setLocaleState(l);
    localStorage.setItem("locale", l);
  };
  const toggleLocale = () => setLocale(locale === "ru" ? "en" : "ru");

  return (
    <AppCtx.Provider value={{ mode, setMode, locale, setLocale, toggleLocale }}>
      {children}
    </AppCtx.Provider>
  );
}
