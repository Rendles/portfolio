"use client";

// Реестр экспонатов: id проекта → ленивый компонент + подпись для витрины.
import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type { L } from "@/content/site";
import type { ExhibitProps } from "./types";

function ExhibitLoading() {
  return (
    <div className="flex h-72 items-center justify-center text-sm text-white/40">
      <span className="animate-pulse">loading…</span>
    </div>
  );
}

export type ExhibitEntry = {
  component: ComponentType<ExhibitProps>;
  // Подпись в шапке витрины: что это — реконструкция или настоящий продукт.
  note: L;
};

export const exhibits: Record<string, ExhibitEntry> = {
  sprouter: {
    component: dynamic(() => import("./SprouterExhibit"), {
      ssr: false,
      loading: ExhibitLoading,
    }),
    note: {
      ru: "Интерактивная реконструкция фрагмента продукта — данные демонстрационные",
      en: "An interactive reconstruction of a product fragment — demo data",
    },
  },
  int3grate: {
    component: dynamic(() => import("./Int3grateExhibit"), {
      ssr: false,
      loading: ExhibitLoading,
    }),
    note: {
      ru: "Интерактивная реконструкция фрагмента продукта — данные демонстрационные",
      en: "An interactive reconstruction of a product fragment — demo data",
    },
  },
  dataprana: {
    component: dynamic(() => import("./DatapranaExhibit"), {
      ssr: false,
      loading: ExhibitLoading,
    }),
    note: {
      ru: "Интерактивная реконструкция фрагмента продукта — данные демонстрационные",
      en: "An interactive reconstruction of a product fragment — demo data",
    },
  },
  leamwidget: {
    component: dynamic(() => import("./LeamWidgetExhibit"), {
      ssr: false,
      loading: ExhibitLoading,
    }),
    note: {
      ru: "Настоящий виджет, встроен с widget.leam.pro",
      en: "The real widget, embedded from widget.leam.pro",
    },
  },
};

export function getExhibit(projectId: string): ExhibitEntry | null {
  return exhibits[projectId] ?? null;
}

export function hasExhibit(projectId: string): boolean {
  return projectId in exhibits;
}
