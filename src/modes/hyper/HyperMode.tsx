"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import dynamic from "next/dynamic";
import Lenis from "lenis";
import {
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  type Variants,
} from "motion/react";
import { site, type Locale, type Project, type WorkGroup } from "@/content/site";
import { ui } from "@/lib/i18n";
import { useApp } from "@/providers/AppProviders";
import { ShaderBackground } from "./ShaderBackground";
import { HyperCursor } from "./HyperCursor";
import { PhysicsPlayground } from "./PhysicsPlayground";
import { SkillsWheel } from "./SkillsWheel";
import { GameEmbed } from "@/demos/GameEmbed";

// живое демо Sprouter — отдельный чанк, грузится только на клиенте
const SprouterDemo = dynamic(
  () => import("@/demos/sprouter/SprouterDemo").then((m) => m.SprouterDemo),
  { ssr: false }
);

const ACCENT = "#c6ff3a";

// сквозная нумерация full-проектов (для декоративных плашек и чередования)
const fullIndexById = new Map<string, number>();
{
  let n = 0;
  for (const g of site.workGroups)
    for (const p of g.projects) if (p.tier === "full") fullIndexById.set(p.id, n++);
}

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

/* ─── work section ────────────────────────────────────────── */

function LinkButtons({ project, locale }: { project: Project; locale: Locale }) {
  if (project.links.length === 0) {
    return (
      <span className="text-[11px] uppercase tracking-wider text-white/35">
        {ui.project.noLink[locale]}
      </span>
    );
  }
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {project.links.map((l) =>
        l.kind === "live" ? (
          <a
            key={l.href}
            href={l.href}
            target="_blank"
            rel="noopener noreferrer"
            data-cursor
            className="inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-bold text-black transition-transform hover:scale-105"
            style={{ background: project.accent }}
          >
            {l.label[locale]} ↗
          </a>
        ) : (
          <a
            key={l.href}
            href={l.href}
            target="_blank"
            rel="noopener noreferrer"
            data-cursor
            className="inline-flex items-center gap-1.5 rounded-full border px-5 py-2.5 text-sm font-semibold transition-transform hover:scale-105"
            style={{ borderColor: `${project.accent}66`, color: project.accent }}
          >
            {l.label[locale]} ↗
          </a>
        )
      )}
    </div>
  );
}

// декоративная плашка full-проекта (позже сюда встанет живое демо)
function VisualPlate({ project, num }: { project: Project; num: number }) {
  return (
    <div
      className="relative flex h-[300px] items-center justify-center overflow-hidden rounded-2xl border border-white/10 sm:h-[440px]"
      style={{ background: `linear-gradient(135deg, ${project.accent}30, #0a0a0e 72%)` }}
    >
      <span
        aria-hidden
        className="absolute -bottom-10 -right-4 select-none text-[12rem] font-bold leading-none opacity-20 sm:text-[16rem]"
        style={{ fontFamily: "var(--font-clash)", color: project.accent }}
      >
        {project.title.slice(0, 2)}
      </span>
      <span
        aria-hidden
        className="absolute left-6 top-5 text-6xl font-bold"
        style={{ fontFamily: "var(--font-clash)", color: project.accent }}
      >
        {String(num + 1).padStart(2, "0")}
      </span>
      <span className="absolute right-5 top-6 rounded-full bg-black/45 px-3 py-1 text-[10px] uppercase tracking-wider text-white/70 backdrop-blur">
        {project.year}
      </span>
      <span
        className="select-none text-4xl font-bold uppercase tracking-tight opacity-80 sm:text-5xl"
        style={{ fontFamily: "var(--font-clash)", color: project.accent }}
      >
        {project.title}
      </span>
    </div>
  );
}

// рамка живого демо Sprouter — самоиграющее, некликабельное
function SprouterFrame({ project, locale }: { project: Project; locale: Locale }) {
  return (
    <div className="relative">
      <div
        className="overflow-hidden rounded-2xl border border-white/10"
        style={{
          boxShadow: `0 0 36px ${project.accent}26, 0 0 90px ${project.accent}12`,
        }}
      >
        <SprouterDemo locale={locale} />
      </div>
      <span
        className="absolute left-1/2 top-0 z-20 inline-flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[9px] font-medium tracking-[0.2em]"
        style={{
          borderColor: `${project.accent}55`,
          background: "#0a0a0e",
          color: project.accent,
        }}
      >
        <span
          className="size-1.5 animate-pulse rounded-full"
          style={{ background: project.accent }}
        />
        LIVE DEMO
      </span>
    </div>
  );
}

// большая карточка full-проекта: текст + визуальный блок, чередуем лево/право
function FullProjectCard({ project, locale }: { project: Project; locale: Locale }) {
  const num = fullIndexById.get(project.id) ?? 0;
  const flip = num % 2 === 1;
  return (
    <Reveal>
      <div className="grid items-center gap-8 md:grid-cols-2 lg:gap-14">
        <div className={flip ? "md:order-2" : undefined}>
          <p className="text-[11px] uppercase tracking-[0.25em] text-white/45">
            {project.kind[locale]}
          </p>
          <h4
            className="mt-2 text-4xl font-bold text-white sm:text-5xl"
            style={{ fontFamily: "var(--font-clash)" }}
          >
            {project.title}
          </h4>
          <p className="mt-3 text-sm text-white/50">
            {project.role[locale]} · {project.year}
          </p>
          <p className="mt-5 max-w-xl leading-relaxed text-white/65">
            {project.summary[locale]}
          </p>
          <div className="mt-5 flex flex-wrap gap-1.5">
            {project.stack.map((s) => (
              <span
                key={s}
                className="rounded-full border border-white/12 px-2.5 py-1 text-[11px] text-white/55"
              >
                {s}
              </span>
            ))}
          </div>
          <div className="mt-7">
            <LinkButtons project={project} locale={locale} />
          </div>
        </div>

        <div className={flip ? "md:order-1" : undefined}>
          {project.id === "sprouter" ? (
            <SprouterFrame project={project} locale={locale} />
          ) : (
            <VisualPlate project={project} num={num} />
          )}
        </div>
      </div>
    </Reveal>
  );
}

// маленькая карточка compact-проекта
function CompactCard({ project, locale }: { project: Project; locale: Locale }) {
  return (
    <div
      className="group flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition-colors hover:border-[var(--pa)] hover:bg-white/[0.04]"
      style={{ "--pa": project.accent } as CSSProperties}
    >
      <h5
        className="text-lg font-semibold text-white transition-colors group-hover:text-[var(--pa)]"
        style={{ fontFamily: "var(--font-clash)" }}
      >
        {project.title}
      </h5>
      <p className="mt-1 text-[11px] uppercase tracking-wider text-white/40">
        {project.kind[locale]} · {project.year}
      </p>
      <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-white/55">
        {project.summary[locale]}
      </p>
      {project.links.length > 0 && (
        <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-4">
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
        </div>
      )}
    </div>
  );
}

// широкая игровая карточка (gravitysmash): играбельный embed + инфострока
function GameProjectCard({ project, locale }: { project: Project; locale: Locale }) {
  return (
    <Reveal>
      <div
        className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]"
        style={{ "--pa": project.accent } as CSSProperties}
      >
        <GameEmbed
          locale={locale}
          title="Gravity Smash"
          src="https://gravity-smash.vercel.app/"
          accent="#9d6bff"
        />
        <div className="flex flex-col gap-2 border-t border-white/10 px-5 py-4 sm:flex-row sm:items-center sm:gap-5">
          <span
            className="shrink-0 text-base font-semibold text-white"
            style={{ fontFamily: "var(--font-clash)" }}
          >
            {project.title}
          </span>
          <span className="shrink-0 text-[11px] uppercase tracking-wider text-white/40">
            {project.kind[locale]} · {project.year}
          </span>
          <span className="min-w-0 flex-1 text-sm text-white/55 sm:truncate">
            {project.summary[locale]}
          </span>
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
        </div>
      </div>
    </Reveal>
  );
}

// подсекция группы работ: заголовок + большие карточки + сетка маленьких
function WorkGroupSection({
  group,
  index,
  locale,
}: {
  group: WorkGroup;
  index: number;
  locale: Locale;
}) {
  const full = group.projects.filter((p) => p.tier === "full");
  const game = group.projects.find((p) => p.id === "gravitysmash");
  const compact = group.projects.filter(
    (p) => p.tier === "compact" && p.id !== "gravitysmash"
  );

  return (
    <div>
      <Reveal>
        <div className="flex items-baseline gap-4">
          <span
            className="font-mono text-sm tracking-[0.2em]"
            style={{ color: ACCENT }}
          >
            {String(index + 1).padStart(2, "0")}
          </span>
          <h3
            className="text-[clamp(2rem,5.5vw,3.75rem)] font-bold leading-tight text-white"
            style={{ fontFamily: "var(--font-clash)" }}
          >
            {group.title[locale]}
          </h3>
        </div>
        <p className="mt-3 max-w-xl text-white/55">{group.blurb[locale]}</p>
      </Reveal>

      {full.length > 0 && (
        <div className="mt-14 flex flex-col gap-20 sm:gap-28">
          {full.map((p) => (
            <FullProjectCard key={p.id} project={p} locale={locale} />
          ))}
        </div>
      )}

      {game && (
        <div className="mt-14">
          <GameProjectCard project={game} locale={locale} />
        </div>
      )}

      {compact.length > 0 && (
        <Reveal delay={0.08} className="mt-10">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {compact.map((p) => (
              <CompactCard key={p.id} project={p} locale={locale} />
            ))}
          </div>
        </Reveal>
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

        {/* группы работ — каждая как полноценная подсекция */}
        <div className="mt-4 flex flex-col gap-28 sm:gap-36">
          {site.workGroups.map((g, gi) => (
            <WorkGroupSection key={g.id} group={g} index={gi} locale={locale} />
          ))}
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
