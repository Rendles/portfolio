"use client";

import { useRef } from "react";
import { motion } from "motion/react";
import { site } from "@/content/site";
import { ui } from "@/lib/i18n";
import { useApp } from "@/providers/AppProviders";

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
          <div className="grid gap-5 md:grid-cols-2">
            {site.projects.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: (i % 2) * 0.06 }}
              >
                <Glass className="group/card relative h-full overflow-hidden p-6 transition-colors hover:border-white/30 sm:p-7">
                  {/* акцентное свечение проекта */}
                  <div
                    className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full opacity-40 blur-3xl transition-opacity duration-500 group-hover/card:opacity-70"
                    style={{ background: p.accent }}
                  />
                  <div className="relative">
                    <div className="flex items-center justify-between">
                      <span
                        className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] uppercase tracking-wider"
                        style={{ color: p.solo ? "#ffd27c" : "rgba(255,255,255,0.6)" }}
                      >
                        {p.solo ? ui.project.solo[locale] : "team"} · {p.year}
                      </span>
                      <span className="text-xs uppercase tracking-wider text-white/40">
                        0{i + 1}
                      </span>
                    </div>

                    <h3 className="mt-4 text-2xl font-semibold text-white sm:text-3xl" style={head}>
                      {p.title}
                    </h3>
                    <div className="mt-1 text-sm text-[#7cc6ff]/80">{p.kind[locale]}</div>

                    <p className="mt-4 text-sm leading-relaxed text-white/65">{p.summary[locale]}</p>

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

                    <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                      <span className="text-[11px] uppercase tracking-wider text-white/45">
                        {p.role[locale]}
                      </span>
                      {p.link ? (
                        <a
                          href={p.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-full border border-[#7cc6ff]/40 bg-[#7cc6ff]/15 px-4 py-1.5 text-xs font-medium text-[#bfe0ff] transition-colors hover:bg-[#7cc6ff]/30"
                        >
                          {ui.project.visit[locale]} ↗
                        </a>
                      ) : (
                        <span className="text-[11px] uppercase tracking-wider text-white/35">
                          {ui.project.noLink[locale]}
                        </span>
                      )}
                    </div>
                  </div>
                </Glass>
              </motion.div>
            ))}
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
