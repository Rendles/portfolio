"use client";

import dynamic from "next/dynamic";
import { motion } from "motion/react";
import {
  allProjects,
  site,
  type Locale,
  type Project,
  type ProjectLink,
} from "@/content/site";
import { GameEmbed } from "@/demos/GameEmbed";
import { ui } from "@/lib/i18n";
import { useApp } from "@/providers/AppProviders";

const INK = "#0a0a0a";
const PAPER = "#f3f1e7";
const PALETTE = ["#ffe800", "#2b50ff", "#ff4d6d", "#b6ff3a", "#ff6a2b"];
const FONT = { fontFamily: "var(--font-cabinet)" };

// Живое демо тяжёлое — грузим только на клиенте и только когда дошли до кода.
const SprouterDemo = dynamic(
  () => import("@/demos/sprouter/SprouterDemo").then((m) => m.SprouterDemo),
  {
    ssr: false,
    loading: () => (
      <div className="grid h-[440px] w-full place-items-center bg-[#0d1117] font-mono text-xs font-bold uppercase tracking-[0.25em] text-white/50">
        LOADING_DEMO…
      </div>
    ),
  }
);

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

/* ─── helpers ─── */

function Marquee({ text }: { text: string }) {
  const chunk = `${text}  ★  `;
  const row = chunk.repeat(8);
  return (
    <div className="overflow-hidden border-y-[3px] border-black bg-black py-2">
      <div className="flex whitespace-nowrap" style={{ width: "200%" }}>
        <span
          className="font-mono text-sm font-bold uppercase tracking-widest text-[#ffe800]"
          style={{ animation: "hp-flow 24s linear infinite" }}
        >
          {row}
        </span>
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-black/60">
      {children}
    </span>
  );
}

/* ─── work section pieces ─── */

// Кнопки ссылок: live — залитая, github/store — рамочные.
function LinkButtons({ links, locale }: { links: ProjectLink[]; locale: Locale }) {
  if (links.length === 0) {
    return (
      <span className="font-mono text-[11px] font-bold uppercase text-black/40">
        {ui.project.noLink[locale]}
      </span>
    );
  }
  return (
    <span className="flex flex-wrap gap-2">
      {links.map((l) => (
        <a
          key={l.href}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          className={
            l.kind === "live"
              ? "border-[3px] border-black bg-black px-4 py-1.5 font-mono text-xs font-bold uppercase text-white transition-colors hover:bg-[#ffe800] hover:text-black"
              : "border-[3px] border-black bg-white px-4 py-1.5 font-mono text-xs font-bold uppercase text-black transition-colors hover:bg-black hover:text-white"
          }
        >
          {l.label[locale]} ↗
        </a>
      ))}
    </span>
  );
}

function StackChips({ stack }: { stack: string[] }) {
  return (
    <div className="mt-4 flex flex-wrap gap-1.5">
      {stack.map((s) => (
        <span
          key={s}
          className="border-2 border-black px-2 py-0.5 font-mono text-[11px] font-bold uppercase"
        >
          {s}
        </span>
      ))}
    </div>
  );
}

// Декоративная плашка full-карточки: кричащий цвет, крупный номер, штриховка.
function DecorPlate({ p, idx, locale }: { p: Project; idx: number; locale: Locale }) {
  return (
    <>
      <span
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(-45deg, #000 0 3px, transparent 3px 16px)",
        }}
      />
      <span className="absolute left-4 top-3 font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-black/60">
        {p.id}_{p.year}.raw
      </span>
      <div className="relative text-center">
        <div
          className="text-[clamp(5rem,11vw,9rem)] font-black leading-none text-black"
          style={FONT}
        >
          {String(idx).padStart(2, "0")}
        </div>
        <div className="mt-2 inline-block border-[3px] border-black bg-[#f3f1e7] px-3 py-1 font-mono text-xs font-bold uppercase shadow-[4px_4px_0_#000]">
          {p.title}
        </div>
      </div>
      <span className="absolute bottom-3 right-4 font-mono text-[10px] font-bold uppercase text-black/60">
        {p.tags.map((t) => `#${t[locale]}`).join(" ")}
      </span>
    </>
  );
}

// БОЛЬШАЯ карточка tier="full" — на всю ширину. Если передан demo —
// визуальный блок идёт во всю ширину под текстом; иначе двухколоночная
// композиция с чередованием сторон (flip).
function FullCard({
  p,
  idx,
  flip,
  locale,
  demo,
}: {
  p: Project;
  idx: number;
  flip: boolean;
  locale: Locale;
  demo?: React.ReactNode;
}) {
  const textBlock = (
    <div className="flex h-full flex-col p-5 sm:p-7">
      <Label>{p.kind[locale]}</Label>
      <h3 className="mt-1 text-3xl font-black uppercase sm:text-4xl" style={FONT}>
        {p.title}
      </h3>
      <p className="mt-3 max-w-2xl text-sm font-medium leading-relaxed">
        {p.summary[locale]}
      </p>
      <StackChips stack={p.stack} />
      <div className="mt-auto pt-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-t-[3px] border-black pt-4">
          <span className="font-mono text-xs font-bold uppercase text-black/60">
            {p.role[locale]}
          </span>
          <LinkButtons links={p.links} locale={locale} />
        </div>
      </div>
    </div>
  );

  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.3 }}
      className="border-[3px] border-black bg-white shadow-[10px_10px_0_#000]"
    >
      {/* шапка карточки в акцентном цвете проекта */}
      <div
        className="flex items-center justify-between border-b-[3px] border-black px-5 py-2.5"
        style={{ background: p.accent }}
      >
        <span className="font-mono text-xs font-black uppercase tracking-widest">
          FILE_{String(idx).padStart(2, "0")}
        </span>
        <span className="font-mono text-xs font-bold uppercase">
          {p.solo ? ui.project.solo[locale] : "TEAM"} · {p.year}
        </span>
      </div>

      {demo ? (
        <>
          {textBlock}
          <div className="border-t-[3px] border-black bg-black/[0.03] p-5 pt-7 sm:p-7 sm:pt-8">
            <div className="relative">
              <span className="absolute -top-3.5 left-5 z-20 inline-flex items-center gap-1.5 border-[3px] border-black bg-[#b6ff3a] px-2.5 py-0.5 font-mono text-[10px] font-black uppercase tracking-widest shadow-[3px_3px_0_#000]">
                <span
                  className="size-1.5 rounded-full bg-black"
                  style={{ animation: "hp-blink 1.2s steps(1) infinite" }}
                />
                LIVE DEMO
              </span>
              <div className="overflow-hidden border-[3px] border-black shadow-[8px_8px_0_#000]">
                {demo}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="grid md:grid-cols-2">
          <div className={flip ? "md:order-last" : ""}>{textBlock}</div>
          <div
            className={`relative grid min-h-[240px] place-items-center overflow-hidden border-t-[3px] border-black md:border-t-0 ${
              flip ? "md:order-first md:border-r-[3px]" : "md:border-l-[3px]"
            }`}
            style={{ background: p.accent }}
          >
            <DecorPlate p={p} idx={idx} locale={locale} />
          </div>
        </div>
      )}
    </motion.article>
  );
}

// МАЛЕНЬКАЯ карточка tier="compact": ховер — полная инверсия.
function CompactCard({ p, num, locale }: { p: Project; num: number; locale: Locale }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.25 }}
      className="group flex flex-col border-[3px] border-black bg-white p-4 shadow-[6px_6px_0_#000] transition-all hover:translate-x-[3px] hover:translate-y-[3px] hover:bg-black hover:text-white hover:shadow-[2px_2px_0_#000]"
    >
      <div className="flex items-baseline justify-between font-mono text-xs font-bold">
        <span className="text-black/40 group-hover:text-white/50">
          {String(num).padStart(2, "0")}
        </span>
        <span className="uppercase">{p.year}</span>
      </div>
      <h4 className="mt-2 text-xl font-black uppercase" style={FONT}>
        {p.title}
      </h4>
      <p className="mt-1 font-mono text-[11px] font-bold uppercase tracking-wider text-black/60 group-hover:text-white/60">
        {p.kind[locale]}
      </p>
      <div className="mt-auto pt-4">
        <div className="flex flex-wrap gap-x-3 gap-y-1 border-t-2 border-black pt-3 font-mono text-xs font-bold uppercase group-hover:border-white/40">
          {p.links.length > 0 ? (
            p.links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-2 underline-offset-4 transition-colors hover:bg-[#ffe800] hover:text-black group-hover:decoration-[#ffe800]"
              >
                [{l.label[locale]} ↗]
              </a>
            ))
          ) : (
            <span className="text-black/40 group-hover:text-white/40">
              {ui.project.noLink[locale]}
            </span>
          )}
        </div>
      </div>
    </motion.article>
  );
}

// ШИРОКАЯ игровая карточка (gravitysmash): GameEmbed кликабельный —
// постер → iframe, поверх ничего не перехватываем.
function GameCard({ p, locale }: { p: Project; locale: Locale }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.3 }}
      className="border-[3px] border-black bg-white shadow-[10px_10px_0_#000]"
    >
      <div
        className="flex items-center justify-between border-b-[3px] border-black px-5 py-2.5"
        style={{ background: p.accent }}
      >
        <span className="font-mono text-xs font-black uppercase tracking-widest">
          ▶ PLAYABLE
        </span>
        <span className="font-mono text-xs font-bold uppercase">
          {p.solo ? ui.project.solo[locale] : "TEAM"} · {p.year}
        </span>
      </div>
      <div className="border-b-[3px] border-black">
        <GameEmbed
          locale={locale}
          title="Gravity Smash"
          src="https://gravity-smash.vercel.app/"
          accent="#9d6bff"
        />
      </div>
      {/* инфострока */}
      <div className="flex flex-col gap-3 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h4 className="text-2xl font-black uppercase" style={FONT}>
              {p.title}
            </h4>
            <Label>{p.kind[locale]}</Label>
          </div>
          <p className="mt-1 max-w-2xl text-sm font-medium leading-relaxed">
            {p.summary[locale]}
          </p>
        </div>
        <div className="shrink-0">
          <LinkButtons links={p.links} locale={locale} />
        </div>
      </div>
    </motion.article>
  );
}

/* ─── mode ─── */

export function BrutalMode() {
  const { locale } = useApp();
  const font = { fontFamily: "var(--font-cabinet)" };
  const mono = { fontFamily: "var(--font-mono)" };

  return (
    <div
      className="min-h-screen"
      style={{ background: PAPER, color: INK, ...mono }}
    >
      {/* TOP BAR */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b-[3px] border-black bg-[#ffe800] px-4 py-2.5">
        <span className="font-mono text-xs font-bold uppercase tracking-[0.15em]">
          ШУКЛИН_РОМАН.EXE
        </span>
        <nav className="hidden gap-5 font-mono text-xs font-bold uppercase md:flex">
          {[ui.nav.work, ui.nav.about, ui.nav.skills, ui.nav.ai, ui.nav.contact].map(
            (item, i) => (
              <a
                key={i}
                href={["#b-work", "#b-about", "#b-skills", "#b-ai", "#b-contact"][i]}
                className="border-b-2 border-transparent hover:border-black"
              >
                [{item[locale]}]
              </a>
            )
          )}
        </nav>
        <span className="font-mono text-xs font-bold uppercase">
          {site.location[locale]}
        </span>
      </header>

      {/* HERO */}
      <section className="border-b-[3px] border-black px-4 py-10 sm:px-8 sm:py-16">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 border-[3px] border-black bg-white px-3 py-1.5 font-mono text-xs font-bold uppercase shadow-[5px_5px_0_#000]">
            <span
              className="size-2.5 rounded-full bg-[#22c55e]"
              style={{ animation: "hp-blink 1.2s steps(1) infinite" }}
            />
            {ui.hero.available[locale]}
          </span>
          <Label>{site.roles[locale]}</Label>
        </div>

        <h1
          className="text-[clamp(3rem,15vw,12rem)] font-black uppercase leading-[0.82] tracking-tight"
          style={font}
        >
          {site.name[locale].split(" ").map((w, i) => (
            <span key={i} className="block">
              {i === 1 ? (
                <span className="bg-black px-2 text-[#ffe800]">{w}</span>
              ) : (
                w
              )}
            </span>
          ))}
        </h1>

        <div className="mt-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <p className="max-w-md border-l-[5px] border-black pl-4 text-lg font-medium">
            {site.tagline[locale]}
          </p>
          <a
            href={`mailto:${site.contacts.email}`}
            className="inline-block border-[3px] border-black bg-[#ffe800] px-7 py-4 text-base font-black uppercase shadow-[7px_7px_0_#000] transition-all hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[2px_2px_0_#000]"
            style={font}
          >
            {ui.hero.cta[locale]} →
          </a>
        </div>
      </section>

      <Marquee text={site.skills.flatMap((g) => g.items).join("  /  ")} />

      {/* STATS */}
      <section className="grid grid-cols-2 border-b-[3px] border-black md:grid-cols-4">
        {site.stats.map((s, i) => (
          <div
            key={i}
            className="border-black p-6 [&:not(:last-child)]:border-r-[3px] [&:nth-child(-n+2)]:border-b-[3px] md:[&:nth-child(-n+2)]:border-b-0"
          >
            <div className="text-5xl font-black sm:text-6xl" style={font}>
              {s.value}
            </div>
            <div className="mt-2 font-mono text-xs font-bold uppercase tracking-wider text-black/60">
              {s.label[locale]}
            </div>
          </div>
        ))}
      </section>

      {/* WORK */}
      <section id="b-work" className="scroll-mt-16 border-b-[3px] border-black px-4 py-12 sm:px-8">
        <div className="mb-10 flex items-end justify-between">
          <h2 className="text-4xl font-black uppercase sm:text-6xl" style={font}>
            {ui.sections.workTitle[locale]}
          </h2>
          <Label>// {String(allProjects.length).padStart(2, "0")} PROJECTS</Label>
        </div>

        <div className="space-y-16 sm:space-y-20">
          {site.workGroups.map((g, gi) => {
            const groupColor = PALETTE[gi % PALETTE.length];
            const full = g.projects.filter((p) => p.tier === "full");
            const compact = g.projects.filter((p) => p.tier === "compact");
            const game = compact.find((p) => p.id === "gravitysmash");
            const smalls = compact.filter((p) => p.id !== "gravitysmash");
            const smallsOffset = full.length + (game ? 1 : 0);
            return (
              <div key={g.id}>
                {/* огромный заголовок группы */}
                <motion.div
                  initial={{ opacity: 0, x: -28 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.3 }}
                  className="mb-8"
                >
                  <div className="flex flex-wrap items-center gap-4">
                    <h3
                      className="inline-block border-[3px] border-black bg-black px-4 py-2 text-3xl font-black uppercase leading-none text-white sm:px-6 sm:py-3 sm:text-5xl md:text-6xl"
                      style={{ ...font, boxShadow: `10px 10px 0 ${groupColor}` }}
                    >
                      {g.title[locale]}
                    </h3>
                    <span
                      className="hidden border-[3px] border-black px-2.5 py-1 font-mono text-sm font-black sm:inline-block"
                      style={{ background: groupColor }}
                    >
                      {String(gi + 1).padStart(2, "0")}
                    </span>
                    <Label>
                      // {String(g.projects.length).padStart(2, "0")} FILES
                    </Label>
                  </div>
                  <p className="mt-6 max-w-2xl font-mono text-xs font-bold uppercase tracking-wider text-black/60">
                    &gt; {g.blurb[locale]}
                  </p>
                </motion.div>

                {/* большие карточки во всю ширину */}
                {full.length > 0 && (
                  <div className="space-y-10">
                    {full.map((p, i) => (
                      <FullCard
                        key={p.id}
                        p={p}
                        idx={i + 1}
                        flip={i % 2 === 1}
                        locale={locale}
                        demo={
                          p.id === "sprouter" ? (
                            <SprouterDemo locale={locale} />
                          ) : undefined
                        }
                      />
                    ))}
                  </div>
                )}

                {/* широкая игровая карточка */}
                {game && (
                  <div className={full.length > 0 ? "mt-10" : ""}>
                    <GameCard p={game} locale={locale} />
                  </div>
                )}

                {/* сетка маленьких карточек */}
                {smalls.length > 0 && (
                  <div
                    className={`grid gap-5 sm:grid-cols-2 lg:grid-cols-3 ${
                      full.length > 0 || game ? "mt-8" : ""
                    }`}
                  >
                    {smalls.map((p, i) => (
                      <CompactCard
                        key={p.id}
                        p={p}
                        num={smallsOffset + i + 1}
                        locale={locale}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ABOUT */}
      <section id="b-about" className="scroll-mt-16 border-b-[3px] border-black px-4 py-12 sm:px-8">
        <Label>// ABOUT</Label>
        <h2 className="mt-2 max-w-4xl text-3xl font-black uppercase leading-tight sm:text-5xl" style={font}>
          {site.about[locale]}
        </h2>
      </section>

      {/* SKILLS */}
      <section id="b-skills" className="scroll-mt-16 border-b-[3px] border-black px-4 py-12 sm:px-8">
        <h2 className="mb-8 text-4xl font-black uppercase sm:text-6xl" style={font}>
          {ui.sections.skillsTitle[locale]}
        </h2>
        <div className="grid gap-0 border-[3px] border-black sm:grid-cols-2 lg:grid-cols-4">
          {site.skills.map((g, i) => (
            <div
              key={i}
              className="border-black p-5 [&:not(:last-child)]:border-b-[3px] lg:[&:not(:last-child)]:border-b-0 lg:[&:not(:last-child)]:border-r-[3px]"
              style={{ background: i % 2 ? "transparent" : "rgba(0,0,0,0.03)" }}
            >
              <div
                className="mb-3 inline-block border-2 border-black px-2 py-0.5 text-sm font-black uppercase"
                style={{ background: PALETTE[i % PALETTE.length] }}
              >
                {g.label[locale]}
              </div>
              <ul className="space-y-1.5 font-mono text-sm font-medium">
                {g.items.map((it) => (
                  <li key={it}>&gt; {it}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* AI */}
      <section id="b-ai" className="scroll-mt-16 border-b-[3px] border-black bg-black px-4 py-12 text-white sm:px-8">
        <Label>
          <span className="text-[#ffe800]">// AI TOOLCHAIN</span>
        </Label>
        <h2 className="mt-2 text-4xl font-black uppercase text-[#ffe800] sm:text-6xl" style={font}>
          {site.ai.title[locale]}
        </h2>
        <p className="mt-5 max-w-2xl text-lg font-medium leading-relaxed">{site.ai.body[locale]}</p>
        <div className="mt-7 flex flex-wrap gap-2.5">
          {site.ai.tools.map((t) => {
            const slug = AI_SLUGS[t];
            return (
              <span
                key={t}
                className="inline-flex items-center gap-2 border-[3px] border-[#ffe800] bg-black px-3.5 py-2 font-mono text-sm font-bold uppercase text-white"
              >
                {slug ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`https://cdn.simpleicons.org/${slug}/ffe800`}
                    alt={t}
                    width={16}
                    height={16}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <span className="grid size-4 place-items-center bg-[#ffe800] text-[9px] font-black text-black">
                    {t[0]}
                  </span>
                )}
                {t}
              </span>
            );
          })}
        </div>
      </section>

      {/* CONTACT */}
      <section id="b-contact" className="scroll-mt-16 px-4 py-14 sm:px-8">
        <Label>// {ui.sections.contactSub[locale]}</Label>
        <h2 className="mt-2 text-[clamp(2.5rem,12vw,9rem)] font-black uppercase leading-[0.85]" style={font}>
          {ui.sections.contactTitle[locale]}
        </h2>

        <div className="mt-10 grid border-[3px] border-black sm:grid-cols-2">
          {[
            { label: "EMAIL", value: site.contacts.email, href: `mailto:${site.contacts.email}` },
            { label: "TELEGRAM", value: site.contacts.telegram, href: site.contacts.telegramHref },
            { label: "PHONE", value: site.contacts.phone, href: site.contacts.phoneHref },
            { label: "GITHUB", value: site.contacts.github, href: site.contacts.githubHref },
          ].map((c, i) => (
            <a
              key={c.label}
              href={c.href}
              target={c.href.startsWith("http") ? "_blank" : undefined}
              rel="noopener noreferrer"
              className={`group flex items-center justify-between border-black p-5 transition-colors hover:bg-black hover:text-[#ffe800] [&:nth-child(-n+2)]:border-b-[3px] sm:[&:nth-child(odd)]:border-r-[3px] ${
                i < 2 ? "" : ""
              }`}
            >
              <span className="font-mono text-xs font-bold uppercase text-black/50 group-hover:text-[#ffe800]/70">
                {c.label}
              </span>
              <span className="text-lg font-black" style={font}>
                {c.value} ↗
              </span>
            </a>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t-[3px] border-black bg-[#ffe800] px-4 py-5 sm:px-8">
        <div className="flex flex-col items-center justify-between gap-2 font-mono text-xs font-bold uppercase sm:flex-row">
          <span>© 2026 {site.name[locale]}</span>
          <span>BUILT RAW · NEXT.JS · NO TEMPLATE</span>
        </div>
      </footer>
    </div>
  );
}
