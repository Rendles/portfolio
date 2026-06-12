"use client";

// Настоящий Leam Widget, встроенный через iframe (заголовки сайта это разрешают).
import { useState } from "react";
import type { ExhibitProps } from "./types";

export default function LeamWidgetExhibit({ locale }: ExhibitProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative h-[min(70vh,640px)] w-full bg-[#101014]">
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-white/40">
          <span className="animate-pulse">
            {locale === "ru" ? "Виджет загружается…" : "Widget is loading…"}
          </span>
        </div>
      )}
      <iframe
        src="https://widget.leam.pro/"
        title="Leam Widget"
        className="h-full w-full border-0"
        loading="lazy"
        onLoad={() => setLoaded(true)}
        allow="fullscreen"
      />
    </div>
  );
}
