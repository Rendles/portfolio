"use client";

import { useEffect, useRef } from "react";
import Matter from "matter-js";
import type { Locale } from "@/content/site";

const ACCENT = "#c6ff3a";

const WORDS: { label: string; accent?: boolean }[] = [
  { label: "React" },
  { label: "Next.js", accent: true },
  { label: "TypeScript" },
  { label: "Figma", accent: true },
  { label: "GSAP" },
  { label: "Three.js" },
  { label: "Tailwind" },
  { label: "Redux" },
  { label: "Framer Motion" },
  { label: "Lenis" },
  { label: "WebGL", accent: true },
  { label: "Claude" },
  { label: "Ollama" },
  { label: "Recraft" },
  { label: "Vite" },
  { label: "i18n" },
];

const H = 48;
const REPEL_RADIUS = 150;
const widthFor = (s: string) => Math.min(260, Math.max(78, s.length * 12 + 44));

export function PhysicsPlayground({ locale }: { locale: Locale }) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const chipRefs = useRef<(HTMLDivElement | null)[]>([]);
  const apiRef = useRef<{ reset: () => void } | null>(null);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let width = scene.clientWidth;
    const height = scene.clientHeight;

    const { Engine, Runner, World, Bodies, Body, Mouse, MouseConstraint, Composite } =
      Matter;

    // нулевая гравитация — плашки парят, а не падают
    const engine = Engine.create({ gravity: { x: 0, y: 0, scale: 0 } });
    const world = engine.world;

    const wallOpts = { isStatic: true, restitution: 0.7, render: { visible: false } };
    const makeWalls = () => [
      Bodies.rectangle(width / 2, -40, width + 200, 80, wallOpts), // верх
      Bodies.rectangle(width / 2, height + 40, width + 200, 80, wallOpts), // низ
      Bodies.rectangle(-40, height / 2, 80, height * 2, wallOpts), // лево
      Bodies.rectangle(width + 40, height / 2, 80, height * 2, wallOpts), // право
    ];
    let walls = makeWalls();
    World.add(world, walls);

    const spread = () => ({
      x: 70 + Math.random() * Math.max(40, width - 140),
      y: 70 + Math.random() * Math.max(40, height - 140),
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
    });

    const bodies = WORDS.map((w) => {
      const bw = widthFor(w.label);
      const s = spread();
      const b = Bodies.rectangle(s.x, s.y, bw, H, {
        restitution: 0.7,
        frictionAir: 0.045, // мягкое затухание — со временем замирают
        chamfer: { radius: H / 2 },
        angle: (Math.random() - 0.5) * 0.6,
      });
      Body.setVelocity(b, { x: s.vx, y: s.vy });
      return b;
    });
    World.add(world, bodies);

    // мышь: и для перетаскивания, и для отслеживания позиции (отталкивание)
    const mouse = Mouse.create(scene);
    scene.removeEventListener(
      "wheel",
      (mouse as unknown as { mousewheel: EventListener }).mousewheel
    );
    const mc = MouseConstraint.create(engine, {
      mouse,
      constraint: { stiffness: 0.2, render: { visible: false } },
    });
    World.add(world, mc);

    let pointerInside = false;
    const onEnter = () => (pointerInside = true);
    const onLeave = () => (pointerInside = false);
    scene.addEventListener("pointerenter", onEnter);
    scene.addEventListener("pointerleave", onLeave);

    // отталкивание от курсора каждый кадр
    Matter.Events.on(engine, "beforeUpdate", () => {
      if (!pointerInside) return;
      const m = mouse.position;
      for (const b of bodies) {
        if (mc.body === b) continue; // тот, что схвачен — не отталкиваем
        const dx = b.position.x - m.x;
        const dy = b.position.y - m.y;
        const dist = Math.hypot(dx, dy) || 0.001;
        if (dist < REPEL_RADIUS) {
          const force = (0.03 * (1 - dist / REPEL_RADIUS)) * b.mass;
          Body.applyForce(b, b.position, {
            x: (dx / dist) * force,
            y: (dy / dist) * force,
          });
        }
      }
    });

    const runner = Runner.create();
    Runner.run(runner, engine);

    let raf = 0;
    const sync = () => {
      for (let i = 0; i < bodies.length; i++) {
        const el = chipRefs.current[i];
        if (!el) continue;
        const { position, angle } = bodies[i];
        el.style.transform = `translate(${position.x}px, ${position.y}px) translate(-50%, -50%) rotate(${angle}rad)`;
      }
      raf = requestAnimationFrame(sync);
    };
    raf = requestAnimationFrame(sync);

    apiRef.current = {
      reset: () =>
        bodies.forEach((b) => {
          const s = spread();
          Body.setPosition(b, { x: s.x, y: s.y });
          Body.setVelocity(b, { x: s.vx * 2.5, y: s.vy * 2.5 });
          Body.setAngularVelocity(b, (Math.random() - 0.5) * 0.3);
        }),
    };

    const onResize = () => {
      const w = scene.clientWidth;
      if (Math.abs(w - width) < 2) return;
      width = w;
      Composite.remove(world, walls);
      walls = makeWalls();
      World.add(world, walls);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      scene.removeEventListener("pointerenter", onEnter);
      scene.removeEventListener("pointerleave", onLeave);
      Runner.stop(runner);
      World.clear(world, false);
      Engine.clear(engine);
      apiRef.current = null;
    };
  }, []);

  return (
    <div className="relative">
      <div className="mb-6 flex items-end justify-between gap-4">
        <p className="max-w-md text-white/55">
          {locale === "ru"
            ? "Плашки парят сами по себе. Проведи курсором — разлетаются. Можно хватать и кидать."
            : "The chips float on their own. Sweep the cursor — they scatter. Grab and throw them too."}
        </p>
        <button
          onClick={() => apiRef.current?.reset()}
          data-cursor
          className="shrink-0 rounded-full border border-white/15 px-4 py-2 text-sm text-white/70 transition-colors hover:border-[#c6ff3a] hover:text-[#c6ff3a]"
        >
          {locale === "ru" ? "Разогнать ↻" : "Scatter ↻"}
        </button>
      </div>

      <div
        ref={sceneRef}
        className="relative h-[420px] w-full overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] sm:h-[460px]"
        style={{ cursor: "grab" }}
      >
        {WORDS.map((w, i) => (
          <div
            key={w.label}
            ref={(el) => {
              chipRefs.current[i] = el;
            }}
            className="absolute left-0 top-0 flex select-none items-center justify-center rounded-full text-sm font-semibold will-change-transform"
            style={{
              width: widthFor(w.label),
              height: H,
              background: w.accent ? ACCENT : "rgba(255,255,255,0.06)",
              color: w.accent ? "#08080a" : "#fff",
              border: w.accent ? "none" : "1px solid rgba(255,255,255,0.14)",
              backdropFilter: "blur(4px)",
            }}
          >
            {w.label}
          </div>
        ))}
      </div>
    </div>
  );
}
