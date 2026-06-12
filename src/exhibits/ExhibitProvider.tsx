"use client";

// Контекст открытия экспонатов: любой режим вызывает openExhibit(projectId),
// витрина рендерится одна на всё приложение поверх текущего режима.
import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { allProjects, type Project } from "@/content/site";
import { useApp } from "@/providers/AppProviders";
import { ExhibitOverlay } from "./ExhibitOverlay";

type ExhibitState = {
  openExhibit: (projectId: string) => void;
  closeExhibit: () => void;
};

const ExhibitCtx = createContext<ExhibitState | null>(null);

export function useExhibit(): ExhibitState {
  const ctx = useContext(ExhibitCtx);
  if (!ctx) throw new Error("useExhibit must be used within <ExhibitProvider>");
  return ctx;
}

export function ExhibitProvider({ children }: { children: ReactNode }) {
  const { locale } = useApp();
  const [project, setProject] = useState<Project | null>(null);

  const openExhibit = useCallback((projectId: string) => {
    setProject(allProjects.find((p) => p.id === projectId) ?? null);
  }, []);
  const closeExhibit = useCallback(() => setProject(null), []);

  return (
    <ExhibitCtx.Provider value={{ openExhibit, closeExhibit }}>
      {children}
      <ExhibitOverlay project={project} locale={locale} onClose={closeExhibit} />
    </ExhibitCtx.Provider>
  );
}
