"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import { motion } from "motion/react";
import { featuredProjects, site, type Project, type ProjectLink } from "@/content/site";
import { ui, type Locale } from "@/lib/i18n";
import { useApp } from "@/providers/AppProviders";
import { GameEmbed } from "@/demos/GameEmbed";

/* живое демо Sprouter — только на клиенте, без SSR */
const SprouterDemo = dynamic(
  () => import("@/demos/sprouter/SprouterDemo").then((m) => m.SprouterDemo),
  {
    ssr: false,
    loading: () => (
      <div className="h-[440px] w-full animate-pulse bg-white/[0.04]" />
    ),
  }
);

/* ─── палитра ─── */
const ACCENT = "#7cc6ff";
const BG = "#070b14";

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

/* дрейфующие цветные орбы под стеклом */
const ORBS = [
  { color: "#4f7cff", size: 48, top: "-8%", left: "-6%", gx: "60px", gy: "40px", dur: 22 },
  { color: "#7cc6ff", size: 40, top: "20%", left: "62%", gx: "-50px", gy: "30px", dur: 26 },
  { color: "#b06bff", size: 44, top: "58%", left: "8%", gx: "40px", gy: "-50px", dur: 30 },
  { color: "#33e0c0", size: 36, top: "75%", left: "70%", gx: "-40px", gy: "-30px", dur: 24 },
];

/* ─── стеклянная карточка ─── */
function Glass({
  children,
  className = "",
  radius = "rounded-3xl",
}: {
  children: React.ReactNode;
  className?: string;
  radius?: string;
}) {
  return (
    <div
      className={`relative ${radius} border border-white/15 bg-white/[0.06] backdrop-blur-2xl ${className}`}
      style={{
        boxShadow:
          "inset 0 1px 0 0 rgba(255,255,255,0.22), inset 0 -1px 0 0 rgba(255,255,255,0.04), 0 24px 60px -20px rgba(0,0,0,0.7)",
      }}
    >
      {children}
    </div>
  );
}

/* пилюля-ссылка проекта: live — акцентная, github/store — прозрачная с границей */
function LinkPill({
  link,
  locale,
  small = false,
}: {
  link: ProjectLink;
  locale: Locale;
  small?: boolean;
}) {
  const size = small
    ? "px-3 py-1 text-[11px]"
    : "px-4 py-1.5 text-xs";
  const tone =
    link.kind === "live"
      ? "border-[#7cc6ff]/40 bg-[#7cc6ff]/15 text-[#bfe0ff] hover:bg-[#7cc6ff]/30"
      : "border-white/20 bg-transparent text-white/70 hover:border-white/40 hover:text-white";
  return (
    <a
      href={link.href}
      target="_blank"
      rel="noopener noreferrer"
      className={`rounded-full border font-medium transition-colors ${size} ${tone}`}
    >
      {link.label[locale]} ↗
    </a>
  );
}

/* подпись-команда секции */
function SectionHead({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div className="mb-10">
      <div className="mb-3 inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-[#7cc6ff]/70">
        <span className="h-px w-8 bg-[#7cc6ff]/50" />
        {kicker}
      </div>
      <h2
        className="text-3xl font-semibold tracking-tight text-white sm:text-5xl"
        style={{ fontFamily: "var(--font-satoshi)" }}
      >
        {title}
      </h2>
    </div>
  );
}

/* стеклянная рамка с живым демо Sprouter: некликабельная, с ярлыком LIVE */
function SprouterFrame({ locale }: { locale: Locale }) {
  return (
    <div className="relative">
      {/* свечение за рамкой */}
      <div
        className="pointer-events-none absolute -inset-3 rounded-[2rem] opacity-60 blur-2xl"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 40%, rgba(19,214,163,0.30), transparent 70%)",
        }}
      />
      <div
        className="relative overflow-hidden rounded-3xl border border-white/15"
        style={{
          boxShadow:
            "0 0 0 1px rgba(19,214,163,0.14), inset 0 1px 0 0 rgba(255,255,255,0.16), 0 30px 70px -28px rgba(19,214,163,0.45)",
        }}
      >
        {/* демо живёт само по себе — кликов не принимает */}
        <div className="pointer-events-none select-none" aria-hidden="true">
          <SprouterDemo locale={locale} />
        </div>
        <span className="absolute right-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full border border-[#13d6a3]/40 bg-[#04101e]/75 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#3ee8bd]">
          <span
            className="size-1.5 animate-pulse rounded-full bg-[#13d6a3]"
            style={{ boxShadow: "0 0 8px #13d6a3" }}
          />
          LIVE
        </span>
      </div>
    </div>
  );
}

/* декоративный визуал для full-карточек без живого демо */
function DecorVisual({ project: p, locale }: { project: Project; locale: Locale }) {
  return (
    <div
      className="relative flex min-h-[240px] items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] lg:min-h-[300px]"
      style={{ boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.08)" }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(70% 85% at 50% 115%, ${p.accent}38, transparent 65%)`,
        }}
      />
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 size-72 -translate-x-1/2 -translate-y-1/2 rounded-full border"
        style={{ borderColor: `${p.accent}2e` }}
      />
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 size-48 -translate-x-1/2 -translate-y-1/2 rounded-full border"
        style={{ borderColor: `${p.accent}1f` }}
      />
      <span
        className="select-none text-[6.5rem] font-semibold leading-none lg:text-[8rem]"
        style={{
          fontFamily: "var(--font-satoshi)",
          color: p.accent,
          textShadow: `0 0 60px ${p.accent}77`,
        }}
        aria-hidden="true"
      >
        {p.title[0]}
      </span>
      <div className="absolute inset-x-0 bottom-4 flex flex-wrap justify-center gap-1.5 px-4">
        {p.tags.map((t) => (
          <span
            key={t.en}
            className="rounded-full border border-white/12 bg-[#070b14]/55 px-2.5 py-1 text-[10px] uppercase tracking-wider text-white/55"
          >
            {t[locale]}
          </span>
        ))}
      </div>
    </div>
  );
}

/* большая стеклянная карточка full-проекта: текст + визуальный блок, лево/право чередуются */
function FullCard({
  project: p,
  index,
  flip,
  locale,
}: {
  project: Project;
  index: number;
  flip: boolean;
  locale: Locale;
}) {
  const head = { fontFamily: "var(--font-satoshi)" };
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.45 }}
    >
      <Glass className="group/card relative overflow-hidden p-6 transition-colors hover:border-white/30 sm:p-8">
        {/* акцентное свечение проекта */}
        <div
          className={`pointer-events-none absolute -top-20 size-56 rounded-full opacity-35 blur-3xl transition-opacity duration-500 group-hover/card:opacity-60 ${
            flip ? "-left-20" : "-right-20"
          }`}
          style={{ background: p.accent }}
        />
        <div className="relative grid items-center gap-8 lg:grid-cols-2">
          {/* текст */}
          <div className={flip ? "lg:order-2" : undefined}>
            <div className="flex items-center justify-between">
              <span
                className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] uppercase tracking-wider"
                style={{ color: p.solo ? "#ffd27c" : "rgba(255,255,255,0.6)" }}
              >
                {p.solo ? ui.project.solo[locale] : "team"} · {p.year}
              </span>
              <span className="text-xs uppercase tracking-wider text-white/40">
                0{index + 1}
              </span>
            </div>

            <h3 className="mt-5 text-3xl font-semibold text-white sm:text-4xl" style={head}>
              {p.title}
            </h3>
            <div className="mt-1 text-sm text-[#7cc6ff]/80">{p.kind[locale]}</div>

            <p className="mt-4 text-sm leading-relaxed text-white/65 sm:text-base">
              {p.summary[locale]}
            </p>

            <div className="mt-5 flex flex-wrap gap-1.5">
              {p.stack.map((s) => (
                <span
                  key={s}
                  className="rounded-full border border-white/12 bg-white/5 px-2.5 py-1 text-[11px] text-white/60"
                >
                  {s}
                </span>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
              <span className="text-[11px] uppercase tracking-wider text-white/45">
                {p.role[locale]}
              </span>
              {p.links.length > 0 ? (
                <span className="flex flex-wrap items-center gap-2">
                  {p.links.map((l) => (
                    <LinkPill key={l.href} link={l} locale={locale} />
                  ))}
                </span>
              ) : (
                <span className="text-[11px] uppercase tracking-wider text-white/35">
                  {ui.project.noLink[locale]}
                </span>
              )}
            </div>
          </div>

          {/* визуальный блок */}
          <div className={flip ? "lg:order-1" : undefined}>
            {p.id === "sprouter" ? (
              <SprouterFrame locale={locale} />
            ) : (
              <DecorVisual project={p} locale={locale} />
            )}
          </div>
        </div>
      </Glass>
    </motion.div>
  );
}

/* широкая игровая карточка Gravity Smash: кликабельный GameEmbed + инфострока */
function GameCard({ project: p, locale }: { project: Project; locale: Locale }) {
  const head = { fontFamily: "var(--font-satoshi)" };
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.45 }}
    >
      <Glass className="group/card relative overflow-hidden p-5 transition-colors hover:border-white/30 sm:p-6">
        <div
          className="pointer-events-none absolute -right-20 -top-20 size-56 rounded-full opacity-30 blur-3xl"
          style={{ background: p.accent }}
        />
        <div className="relative">
          <div className="mb-4 flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <h3 className="text-2xl font-semibold text-white sm:text-3xl" style={head}>
              {p.title}
            </h3>
            <span className="text-sm text-[#7cc6ff]/80">{p.kind[locale]}</span>
            <span className="text-[11px] uppercase tracking-wider text-white/40">
              {p.year}
            </span>
          </div>

          {/* стеклянная рамка с игрой — кликам не мешаем */}
          <div
            className="relative overflow-hidden rounded-3xl border border-white/15"
            style={{
              boxShadow: `0 0 0 1px ${p.accent}24, inset 0 1px 0 0 rgba(255,255,255,0.14), 0 30px 70px -28px ${p.accent}66`,
            }}
          >
            <GameEmbed
              locale={locale}
              title="Gravity Smash"
              src="https://gravity-smash.vercel.app/"
              accent="#9d6bff"
            />
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="max-w-2xl text-sm leading-relaxed text-white/65">
              {p.summary[locale]}
            </p>
            <span className="flex flex-wrap items-center gap-2">
              {p.links.map((l) => (
                <LinkPill key={l.href} link={l} locale={locale} />
              ))}
            </span>
          </div>
        </div>
      </Glass>
    </motion.div>
  );
}

/* маленькая компактная карточка: без своего backdrop-blur — только полупрозрачный фон */
function CompactCard({
  project: p,
  index,
  locale,
}: {
  project: Project;
  index: number;
  locale: Locale;
}) {
  const head = { fontFamily: "var(--font-satoshi)" };
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      className="h-full"
    >
      <div
        className="flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.05] p-5 transition-colors hover:border-white/25 hover:bg-white/[0.075]"
        style={{ boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.10)" }}
      >
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2">
            <span
              className="size-1.5 shrink-0 rounded-full"
              style={{ background: p.accent, boxShadow: `0 0 8px ${p.accent}` }}
            />
            <span className="text-base font-semibold text-white" style={head}>
              {p.title}
            </span>
          </span>
          <span className="shrink-0 text-[11px] uppercase tracking-wider text-white/40">
            {p.year}
          </span>
        </div>
        <div className="mt-1.5 text-xs text-[#7cc6ff]/75">{p.kind[locale]}</div>
        <div className="mt-4 flex flex-1 flex-wrap items-end gap-1.5">
          {p.links.length > 0 ? (
            p.links.map((l) => (
              <LinkPill key={l.href} link={l} locale={locale} small />
            ))
          ) : (
            <span className="text-[10px] uppercase tracking-wider text-white/35">
              {ui.project.noLink[locale]}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ─── режим ─── */
export function GlassMode() {
  const { locale } = useApp();
  const heroRef = useRef<HTMLDivElement>(null);

  const onHeroMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = heroRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  const head = { fontFamily: "var(--font-satoshi)" };

  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{ background: BG, color: "#e8f0ff", fontFamily: "var(--font-general)" }}
    >
      {/* фон: дрейфующие орбы + сетка света */}
      <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">
        {ORBS.map((o, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-60 blur-[90px]"
            style={
              {
                width: `${o.size}vmax`,
                height: `${o.size}vmax`,
                top: o.top,
                left: o.left,
                background: o.color,
                "--gx": o.gx,
                "--gy": o.gy,
                animation: `gl-drift ${o.dur}s ease-in-out infinite`,
              } as React.CSSProperties
            }
          />
        ))}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 90% at 50% -10%, rgba(124,198,255,0.10), transparent 60%)",
          }}
        />
        {/* зернистость/виньетка для глубины */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(140% 140% at 50% 40%, transparent 55%, rgba(0,0,0,0.55))",
          }}
        />
      </div>

      <div className="relative z-10">
        {/* HEADER */}
        <header className="sticky top-3 z-40 mx-auto mt-3 max-w-6xl px-3">
          <Glass radius="rounded-full" className="flex items-center justify-between px-5 py-2.5">
            <span className="text-sm font-semibold tracking-tight text-white" style={head}>
              {site.name[locale]}
            </span>
            <nav className="hidden gap-7 text-sm text-white/65 md:flex">
              {[ui.nav.work, ui.nav.about, ui.nav.skills, ui.nav.ai, ui.nav.contact].map(
                (item, i) => (
                  <a
                    key={i}
                    href={["#g-work", "#g-about", "#g-skills", "#g-ai", "#g-contact"][i]}
                    className="transition-colors hover:text-white"
                  >
                    {item[locale]}
                  </a>
                )
              )}
            </nav>
            <a
              href={`mailto:${site.contacts.email}`}
              className="rounded-full border border-[#7cc6ff]/40 bg-[#7cc6ff]/15 px-4 py-1.5 text-xs font-medium text-[#bfe0ff] transition-colors hover:bg-[#7cc6ff]/25"
            >
              {ui.hero.cta[locale]}
            </a>
          </Glass>
        </header>

        {/* HERO */}
        <section className="mx-auto max-w-6xl px-4 pb-16 pt-14 sm:pt-20">
          <div
            ref={heroRef}
            onMouseMove={onHeroMove}
            className="group/hero relative overflow-hidden rounded-[2rem] border border-white/15 bg-white/[0.05] p-8 backdrop-blur-2xl sm:p-14"
            style={{
              boxShadow:
                "inset 0 1px 0 0 rgba(255,255,255,0.22), 0 30px 80px -24px rgba(0,0,0,0.8)",
            }}
          >
            {/* блик за курсором */}
            <div
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/hero:opacity-100"
              style={{
                background:
                  "radial-gradient(380px circle at var(--mx, 50%) var(--my, 0%), rgba(124,198,255,0.18), transparent 70%)",
              }}
            />

            <div className="relative">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs uppercase tracking-[0.18em] text-white/75">
                <span className="size-2 rounded-full bg-[#7cc6ff]" style={{ boxShadow: `0 0 10px ${ACCENT}` }} />
                {ui.hero.available[locale]}
              </span>

              <h1
                className="mt-7 text-[clamp(2.6rem,9vw,7rem)] font-semibold leading-[0.98] tracking-tight text-white"
                style={head}
              >
                {site.name[locale]}
              </h1>

              <p className="mt-4 text-lg uppercase tracking-[0.2em] text-[#7cc6ff]/80 sm:text-xl">
                {site.roles[locale]}
              </p>

              <p className="mt-7 max-w-xl text-lg leading-relaxed text-white/70 sm:text-xl">
                {site.tagline[locale]}
              </p>

              <div className="mt-9 flex flex-wrap gap-3">
                <a
                  href={`mailto:${site.contacts.email}`}
                  className="rounded-full bg-[#7cc6ff] px-7 py-3.5 text-sm font-semibold text-[#04101e] transition-transform hover:scale-[1.03]"
                  style={{ boxShadow: `0 10px 40px -8px ${ACCENT}99` }}
                >
                  {ui.hero.cta[locale]}
                </a>
                <a
                  href="#g-work"
                  className="rounded-full border border-white/20 bg-white/5 px-7 py-3.5 text-sm font-medium text-white/80 backdrop-blur transition-colors hover:bg-white/10"
                >
                  {ui.hero.scroll[locale]} ↓
                </a>
              </div>
            </div>
          </div>

          {/* STATS */}
          <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">
            {site.stats.map((s, i) => (
              <Glass key={i} className="p-6">
                <div className="text-4xl font-semibold text-white sm:text-5xl" style={head}>
                  {s.value}
                </div>
                <div className="mt-2 text-xs uppercase tracking-wider text-white/55">
                  {s.label[locale]}
                </div>
              </Glass>
            ))}
          </div>
        </section>

        {/* WORK */}
        <section id="g-work" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16">
          <SectionHead kicker={ui.nav.work[locale]} title={ui.sections.workTitle[locale]} />
          <div className="space-y-20 sm:space-y-24">
            {site.workGroups.map((g) => {
              const full = g.projects.filter((p) => p.tier === "full");
              const game = g.projects.find((p) => p.id === "gravitysmash");
              const compact = g.projects.filter(
                (p) => p.tier === "compact" && p.id !== "gravitysmash"
              );
              return (
                <div key={g.id}>
                  {/* плашка группы: заголовок + blurb */}
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.4 }}
                    className="mb-7"
                  >
                    <div
                      className="inline-flex max-w-full flex-col gap-1 rounded-2xl border border-white/12 bg-white/[0.05] px-6 py-4 backdrop-blur-xl"
                      style={{
                        boxShadow:
                          "inset 0 1px 0 0 rgba(255,255,255,0.16), 0 16px 44px -18px rgba(0,0,0,0.6)",
                      }}
                    >
                      <h3
                        className="text-xl font-semibold tracking-tight text-white sm:text-2xl"
                        style={{ ...head, textShadow: `0 0 24px ${ACCENT}55` }}
                      >
                        {g.title[locale]}
                      </h3>
                      <p className="text-sm text-white/55">{g.blurb[locale]}</p>
                    </div>
                  </motion.div>

                  <div className="space-y-6">
                    {full.map((p, i) => (
                      <FullCard
                        key={p.id}
                        project={p}
                        index={featuredProjects.indexOf(p)}
                        flip={i % 2 === 1}
                        locale={locale}
                      />
                    ))}

                    {game && <GameCard project={game} locale={locale} />}

                    {compact.length > 0 && (
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {compact.map((p, i) => (
                          <CompactCard key={p.id} project={p} index={i} locale={locale} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ABOUT */}
        <section id="g-about" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16">
          <SectionHead kicker={ui.nav.about[locale]} title={ui.sections.aboutTitle[locale]} />
          <Glass className="p-8 sm:p-12">
            <p className="max-w-3xl text-xl leading-relaxed text-white/80 sm:text-2xl" style={head}>
              {site.about[locale]}
            </p>
          </Glass>
        </section>

        {/* SKILLS */}
        <section id="g-skills" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16">
          <SectionHead kicker={ui.nav.skills[locale]} title={ui.sections.skillsTitle[locale]} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {site.skills.map((g, i) => (
              <Glass key={i} className="p-6">
                <div className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#7cc6ff]">
                  {g.label[locale]}
                </div>
                <ul className="space-y-2 text-sm text-white/70">
                  {g.items.map((it) => (
                    <li key={it} className="flex items-center gap-2">
                      <span className="size-1.5 rounded-full bg-[#7cc6ff]/60" />
                      {it}
                    </li>
                  ))}
                </ul>
              </Glass>
            ))}
          </div>
        </section>

        {/* AI */}
        <section id="g-ai" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16">
          <Glass className="overflow-hidden p-8 sm:p-12">
            <div
              className="pointer-events-none absolute -left-20 -top-20 size-72 rounded-full opacity-40 blur-3xl"
              style={{ background: "#b06bff" }}
            />
            <div className="relative">
              <div className="mb-3 inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-[#7cc6ff]/70">
                <span className="h-px w-8 bg-[#7cc6ff]/50" />
                {ui.nav.ai[locale]}
              </div>
              <h2 className="text-3xl font-semibold text-white sm:text-5xl" style={head}>
                {site.ai.title[locale]}
              </h2>
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/70">
                {site.ai.body[locale]}
              </p>
              <div className="mt-7 flex flex-wrap gap-2.5">
                {site.ai.tools.map((t) => {
                  const slug = AI_SLUGS[t];
                  return (
                    <span
                      key={t}
                      className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-2 text-sm text-white/80 backdrop-blur"
                    >
                      {slug ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={`https://cdn.simpleicons.org/${slug}/7cc6ff`}
                          alt={t}
                          width={16}
                          height={16}
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <span className="grid size-4 place-items-center rounded-full bg-[#7cc6ff] text-[9px] font-bold text-[#04101e]">
                          {t[0]}
                        </span>
                      )}
                      {t}
                    </span>
                  );
                })}
              </div>
            </div>
          </Glass>
        </section>

        {/* CONTACT */}
        <section id="g-contact" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20">
          <div className="text-center">
            <div className="mb-4 text-xs uppercase tracking-[0.3em] text-[#7cc6ff]/70">
              {ui.sections.contactSub[locale]}
            </div>
            <h2
              className="text-[clamp(2.6rem,9vw,6rem)] font-semibold leading-none text-white"
              style={head}
            >
              {ui.sections.contactTitle[locale]}
            </h2>
          </div>

          <div className="mx-auto mt-10 grid max-w-3xl gap-4 sm:grid-cols-2">
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
                className="block"
              >
                <Glass className="flex items-center justify-between p-5 transition-colors hover:border-white/30 hover:bg-white/[0.09]">
                  <span className="text-xs uppercase tracking-wider text-white/45">{c.label}</span>
                  <span className="text-base font-medium text-white sm:text-lg">{c.value} ↗</span>
                </Glass>
              </a>
            ))}
          </div>
        </section>

        {/* FOOTER */}
        <footer className="mx-auto max-w-6xl px-4 py-8">
          <div className="flex flex-col items-center justify-between gap-2 text-xs uppercase tracking-wider text-white/40 sm:flex-row">
            <span>© 2026 {site.name[locale]}</span>
            <span>Liquid Glass · Next.js</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
