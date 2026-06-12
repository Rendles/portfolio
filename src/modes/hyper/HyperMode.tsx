"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import Lenis from "lenis";
import {
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  type Variants,
} from "motion/react";
import { site, type L, type Locale, type Project } from "@/content/site";
import { ui } from "@/lib/i18n";
import { useApp } from "@/providers/AppProviders";
import { ShaderBackground } from "./ShaderBackground";
import { HyperCursor } from "./HyperCursor";
import { WorkSlider } from "./WorkSlider";
import { PhysicsPlayground } from "./PhysicsPlayground";
import { SkillsWheel } from "./SkillsWheel";

const ACCENT = "#c6ff3a";

const MORE_WORK: L = { ru: "И ещё", en: "More work" };

// группы, в которых есть компактные проекты (для блока «остальные работы»)
const compactGroups = site.workGroups
  .map((g) => ({
    id: g.id,
    title: g.title,
    blurb: g.blurb,
    projects: g.projects.filter((p) => p.tier === "compact"),
  }))
  .filter((g) => g.projects.length > 0);

/* ─── helpers ─────────────────────────────────────────────── */

function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function Marquee({ items, reverse = false }: { items: string[]; reverse?: boolean }) {
  const row = [...items, ...items];
  return (
    <div className="flex overflow-hidden whitespace-nowrap">
      <motion.div
        className="flex shrink-0 gap-8 pr-8"
        animate={{ x: reverse ? ["-50%", "0%"] : ["0%", "-50%"] }}
        transition={{ duration: 26, repeat: Infinity, ease: "linear" }}
      >
        {row.map((it, i) => (
          <span
            key={i}
            className="text-4xl font-semibold text-white/15 sm:text-6xl"
            style={{ fontFamily: "var(--font-clash)" }}
          >
            {it}
            <span style={{ color: ACCENT }} className="px-4">
              ✦
            </span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}

function MagneticCTA({ children }: { children: ReactNode }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 14 });
  const sy = useSpring(y, { stiffness: 200, damping: 14 });

  return (
    <motion.a
      href={`mailto:${site.contacts.email}`}
      data-cursor
      style={{ x: sx, y: sy }}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - r.left - r.width / 2) * 0.4);
        y.set((e.clientY - r.top - r.height / 2) * 0.4);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
      className="inline-flex items-center gap-3 rounded-full bg-[#c6ff3a] px-8 py-4 text-base font-bold text-black"
    >
      {children}
    </motion.a>
  );
}

const letterVariants: Variants = {
  hidden: { y: "110%" },
  show: (i: number) => ({
    y: "0%",
    transition: { duration: 0.8, delay: 0.15 + i * 0.04, ease: [0.22, 1, 0.36, 1] },
  }),
};

function KineticTitle({ text }: { text: string }) {
  return (
    <h1
      className="text-[clamp(3rem,13vw,11rem)] font-bold uppercase leading-[0.85] tracking-tight"
      style={{ fontFamily: "var(--font-clash)" }}
    >
      {text.split(" ").map((word, wi) => (
        <span key={wi} className="mr-[0.2em] inline-block">
          {word.split("").map((ch, ci) => (
            <span key={ci} className="inline-block overflow-hidden align-bottom">
              <motion.span
                className="inline-block"
                custom={wi * 6 + ci}
                variants={letterVariants}
                initial="hidden"
                animate="show"
              >
                {ch}
              </motion.span>
            </span>
          ))}
        </span>
      ))}
    </h1>
  );
}

// Слаги логотипов на cdn.simpleicons.org (undefined → буквенный бейдж)
const AI_SLUGS: Record<string, string | undefined> = {
  Claude: "claude",
  GPT: "openai",
  Codex: "openai",
  Gemini: "googlegemini",
  DeepSeek: "deepseek",
  Ollama: "ollama",
  OpenClaw: undefined,
  Recraft: "recraft",
  Framer: "framer",
};

function AiToolChip({ name }: { name: string }) {
  const slug = AI_SLUGS[name];
  return (
    <span className="inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-black/30 px-4 py-2 text-sm text-white/80 backdrop-blur transition-colors hover:border-white/35">
      {slug ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`https://cdn.simpleicons.org/${slug}/white`}
          alt={name}
          width={16}
          height={16}
          loading="lazy"
          className="opacity-90"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      ) : (
        <span className="grid size-4 place-items-center rounded-full bg-white/20 text-[9px] font-bold text-white">
          {name[0]}
        </span>
      )}
      {name}
    </span>
  );
}

function CompactRow({ project, locale }: { project: Project; locale: Locale }) {
  return (
    <div
      className="group flex flex-col gap-2 px-5 py-4 transition-colors hover:bg-white/[0.03] sm:flex-row sm:items-center sm:gap-5"
      style={{ "--pa": project.accent } as CSSProperties}
    >
      <span
        className="shrink-0 text-base font-semibold text-white transition-colors group-hover:text-[var(--pa)] sm:w-40"
        style={{ fontFamily: "var(--font-clash)" }}
      >
        {project.title}
      </span>
      <span className="shrink-0 text-[11px] uppercase tracking-wider text-white/40 sm:w-48">
        {project.kind[locale]} · {project.year}
      </span>
      <span className="min-w-0 flex-1 truncate text-sm text-white/55">
        {project.summary[locale]}
      </span>
      {project.links.length > 0 && (
        <span className="flex shrink-0 flex-wrap items-center gap-1.5">
          {project.links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor
              className="rounded-full border border-white/15 px-2.5 py-1 text-[11px] text-white/60 transition-colors hover:border-[var(--pa)] hover:text-[var(--pa)]"
            >
              {l.label[locale]} ↗
            </a>
          ))}
        </span>
      )}
    </div>
  );
}

/* ─── mode ────────────────────────────────────────────────── */

export function HyperMode() {
  const { locale } = useApp();
  const heroRef = useRef<HTMLElement>(null);

  // Lenis smooth scroll
  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1 });
    let raf = 0;
    const loop = (t: number) => {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);

  // параллакс героя по скроллу
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 180]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const skillsFlat = site.skills.flatMap((g) => g.items).slice(0, 9);

  return (
    <div className="relative cursor-none overflow-x-clip text-white">
      <ShaderBackground />
      <HyperCursor />

      {/* top bar */}
      <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-5 py-4 sm:px-8">
        <span
          className="text-lg font-bold tracking-tight"
          style={{ fontFamily: "var(--font-clash)" }}
        >
          Р/Ш
        </span>
        <nav className="hidden gap-7 text-sm text-white/55 md:flex">
          {[ui.nav.work, ui.nav.about, ui.nav.skills, ui.nav.ai, ui.nav.contact].map(
            (item, i) => (
              <a
                key={i}
                href={["#work", "#about", "#skills", "#ai", "#contact"][i]}
                className="transition-colors hover:text-white"
              >
                {item[locale]}
              </a>
            )
          )}
        </nav>
        <span className="hidden items-center gap-2 text-xs text-white/55 sm:flex">
          <span className="relative flex size-2">
            <span
              className="absolute inline-flex size-full animate-ping rounded-full opacity-75"
              style={{ background: ACCENT }}
            />
            <span className="relative inline-flex size-2 rounded-full" style={{ background: ACCENT }} />
          </span>
          {ui.hero.available[locale]}
        </span>
      </header>

      {/* HERO */}
      <motion.section
        ref={heroRef}
        style={{ y: heroY, opacity: heroOpacity }}
        className="relative flex min-h-screen flex-col justify-center px-5 pt-24 sm:px-8"
      >
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-5 text-sm uppercase tracking-[0.3em] text-white/50"
        >
          {site.roles[locale]}
        </motion.p>

        <KineticTitle text={site.name[locale]} />

        <div className="mt-8 flex flex-col gap-7 md:flex-row md:items-end md:justify-between">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="max-w-md text-lg leading-relaxed text-white/65"
          >
            {site.tagline[locale]}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75 }}
          >
            <MagneticCTA>
              {ui.hero.cta[locale]} <span aria-hidden>→</span>
            </MagneticCTA>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[11px] uppercase tracking-[0.3em] text-white/40"
        >
          {ui.hero.scroll[locale]} ↓
        </motion.div>
      </motion.section>

      {/* MARQUEE */}
      <section className="border-y border-white/10 py-6">
        <Marquee items={skillsFlat} />
      </section>

      {/* STATS */}
      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {site.stats.map((s, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <div className="border-l border-white/15 pl-4">
                <div
                  className="text-5xl font-bold sm:text-6xl"
                  style={{ fontFamily: "var(--font-clash)", color: ACCENT }}
                >
                  {s.value}
                </div>
                <div className="mt-2 text-sm text-white/50">{s.label[locale]}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* WORK */}
      <section id="work" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-16 sm:px-8">
        <Reveal>
          <div className="mb-12 flex flex-col gap-3">
            <h2
              className="text-4xl font-bold sm:text-6xl"
              style={{ fontFamily: "var(--font-clash)" }}
            >
              {ui.sections.workTitle[locale]}
            </h2>
            <p className="max-w-lg text-white/55">{ui.sections.workSub[locale]}</p>
          </div>
        </Reveal>

        <WorkSlider locale={locale} />

        {/* остальные работы — компактные строки по группам */}
        <div className="mt-24">
          <Reveal>
            <h3
              className="text-3xl font-bold sm:text-4xl"
              style={{ fontFamily: "var(--font-clash)" }}
            >
              {MORE_WORK[locale]}
            </h3>
          </Reveal>
          <div className="mt-8 flex flex-col gap-12">
            {compactGroups.map((g, gi) => (
              <Reveal key={g.id} delay={gi * 0.06}>
                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  <h4
                    className="text-xl font-semibold"
                    style={{ fontFamily: "var(--font-clash)" }}
                  >
                    {g.title[locale]}
                  </h4>
                  <p className="text-xs text-white/40">{g.blurb[locale]}</p>
                </div>
                <div className="mt-4 divide-y divide-white/10 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
                  {g.projects.map((p) => (
                    <CompactRow key={p.id} project={p} locale={locale} />
                  ))}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-24 sm:px-8">
        <div className="grid gap-10 md:grid-cols-[1fr_1.4fr] md:items-center">
          <Reveal>
            <h2
              className="text-4xl font-bold sm:text-6xl"
              style={{ fontFamily: "var(--font-clash)" }}
            >
              {ui.sections.aboutTitle[locale]}
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="text-2xl font-light leading-snug text-white/80 sm:text-3xl">
              {site.about[locale]}
            </p>
          </Reveal>
        </div>
      </section>

      {/* SKILLS — вращающееся колесо */}
      <SkillsWheel locale={locale} />

      {/* PHYSICS PLAYGROUND */}
      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <Reveal>
          <h2
            className="mb-3 text-4xl font-bold sm:text-6xl"
            style={{ fontFamily: "var(--font-clash)" }}
          >
            {locale === "ru" ? "Поиграй со стеком" : "Play with the stack"}
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <PhysicsPlayground locale={locale} />
        </Reveal>
      </section>

      {/* AI */}
      <section id="ai" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-24 sm:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-white/10 p-8 sm:p-14">
            <div
              className="pointer-events-none absolute -right-1/4 -top-1/2 size-[60vmax] rounded-full opacity-30 blur-[120px]"
              style={{ background: ACCENT }}
            />
            <h2
              className="relative text-4xl font-bold sm:text-6xl"
              style={{ fontFamily: "var(--font-clash)" }}
            >
              {site.ai.title[locale]}
            </h2>
            <p className="relative mt-6 max-w-2xl text-xl leading-relaxed text-white/70">
              {site.ai.body[locale]}
            </p>
            <div className="relative mt-8 flex flex-wrap gap-2.5">
              {site.ai.tools.map((t) => (
                <AiToolChip key={t} name={t} />
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* CONTACT */}
      <section id="contact" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-24 sm:px-8">
        <Reveal>
          <p className="text-sm uppercase tracking-[0.3em] text-white/45">
            {ui.sections.contactSub[locale]}
          </p>
          <a
            href={`mailto:${site.contacts.email}`}
            data-cursor
            className="mt-4 block text-[clamp(2.5rem,9vw,8rem)] font-bold leading-none transition-colors hover:text-[#c6ff3a]"
            style={{ fontFamily: "var(--font-clash)" }}
          >
            {ui.sections.contactTitle[locale]}
          </a>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Email", value: site.contacts.email, href: `mailto:${site.contacts.email}` },
              { label: "Telegram", value: site.contacts.telegram, href: site.contacts.telegramHref },
              { label: "Phone", value: site.contacts.phone, href: site.contacts.phoneHref },
              { label: "GitHub", value: site.contacts.github, href: site.contacts.githubHref },
            ].map((c) => (
              <a
                key={c.label}
                href={c.href}
                target={c.href.startsWith("http") ? "_blank" : undefined}
                rel="noopener noreferrer"
                data-cursor
                className="group rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition-colors hover:border-[#c6ff3a]/50"
              >
                <span className="text-xs uppercase tracking-[0.2em] text-white/40">{c.label}</span>
                <span className="mt-2 block text-white/80 transition-colors group-hover:text-white">
                  {c.value}
                </span>
              </a>
            ))}
          </div>
        </Reveal>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 px-5 py-10 sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 text-sm text-white/40 sm:flex-row">
          <span>© {site.name[locale]} · {site.location[locale]}</span>
          <span>{locale === "ru" ? "Сделано на Next.js — один контент, разные дизайн-языки." : "Built with Next.js — one content, many design languages."}</span>
        </div>
      </footer>
    </div>
  );
}
