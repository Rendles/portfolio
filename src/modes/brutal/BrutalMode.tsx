"use client";

import { motion } from "motion/react";
import { allProjects, site } from "@/content/site";
import { useExhibit } from "@/exhibits/ExhibitProvider";
import { hasExhibit } from "@/exhibits/registry";
import { ui } from "@/lib/i18n";
import { useApp } from "@/providers/AppProviders";

const INK = "#0a0a0a";
const PAPER = "#f3f1e7";
const PALETTE = ["#ffe800", "#2b50ff", "#ff4d6d", "#b6ff3a", "#ff6a2b"];

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

/* ─── mode ─── */

export function BrutalMode() {
  const { locale } = useApp();
  const { openExhibit } = useExhibit();
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

        <div className="space-y-14">
          {site.workGroups.map((g, gi) => {
            const groupColor = PALETTE[gi % PALETTE.length];
            const full = g.projects.filter((p) => p.tier === "full");
            const compact = g.projects.filter((p) => p.tier === "compact");
            return (
              <div key={g.id}>
                {/* group header */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.25 }}
                  className="mb-6"
                >
                  <div className="flex flex-wrap items-baseline gap-3">
                    <span
                      className="inline-block border-[3px] border-black bg-black px-4 py-1.5 text-2xl font-black uppercase text-white sm:text-4xl"
                      style={{ ...font, boxShadow: `6px 6px 0 ${groupColor}` }}
                    >
                      {g.title[locale]}
                    </span>
                    <Label>// {String(gi + 1).padStart(2, "0")}</Label>
                  </div>
                  <p className="mt-4 max-w-2xl font-mono text-xs font-bold uppercase tracking-wider text-black/60">
                    &gt; {g.blurb[locale]}
                  </p>
                </motion.div>

                {/* full cards */}
                {full.length > 0 && (
                  <div className="grid gap-6 md:grid-cols-2">
                    {full.map((p, i) => {
                      const color = PALETTE[(gi + i) % PALETTE.length];
                      return (
                        <motion.article
                          key={p.id}
                          initial={{ opacity: 0, y: 24 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true, margin: "-40px" }}
                          transition={{ duration: 0.25 }}
                          className="group border-[3px] border-black bg-white shadow-[8px_8px_0_#000] transition-all hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-[2px_2px_0_#000]"
                        >
                          <div
                            className="flex items-center justify-between border-b-[3px] border-black px-5 py-3"
                            style={{ background: color }}
                          >
                            <span className="text-3xl font-black" style={font}>
                              {String(i + 1).padStart(2, "0")}
                            </span>
                            <span className="font-mono text-xs font-bold uppercase">
                              {p.solo ? ui.project.solo[locale] : "TEAM"} · {p.year}
                            </span>
                          </div>
                          <div className="p-5">
                            <Label>{p.kind[locale]}</Label>
                            <h3 className="mt-1 text-2xl font-black uppercase sm:text-3xl" style={font}>
                              {p.title}
                            </h3>
                            <p className="mt-3 text-sm font-medium leading-relaxed">{p.summary[locale]}</p>

                            <div className="mt-4 flex flex-wrap gap-1.5">
                              {p.stack.map((s) => (
                                <span
                                  key={s}
                                  className="border-2 border-black px-2 py-0.5 font-mono text-[11px] font-bold uppercase"
                                >
                                  {s}
                                </span>
                              ))}
                            </div>

                            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t-[3px] border-black pt-4">
                              <span className="font-mono text-xs font-bold uppercase text-black/60">
                                {p.role[locale]}
                              </span>
                              {p.links.length > 0 || hasExhibit(p.id) ? (
                                <span className="flex flex-wrap gap-2">
                                  {hasExhibit(p.id) && (
                                    <button
                                      type="button"
                                      onClick={() => openExhibit(p.id)}
                                      className="border-[3px] border-black bg-[#ffe800] px-4 py-1.5 font-mono text-xs font-bold uppercase text-black shadow-[4px_4px_0_#000] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-black hover:text-[#ffe800] hover:shadow-[1px_1px_0_#000]"
                                    >
                                      ▶ {ui.project.demo[locale]}
                                    </button>
                                  )}
                                  {p.links.map((l) => (
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
                              ) : (
                                <span className="font-mono text-[11px] font-bold uppercase text-black/40">
                                  {ui.project.noLink[locale]}
                                </span>
                              )}
                            </div>
                          </div>
                        </motion.article>
                      );
                    })}
                  </div>
                )}

                {/* compact rows */}
                {compact.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.25 }}
                    className={`border-[3px] border-black bg-white shadow-[8px_8px_0_#000] ${full.length > 0 ? "mt-6" : ""}`}
                  >
                    {compact.map((p, i) => (
                      <div
                        key={p.id}
                        className="group/row flex flex-wrap items-baseline gap-x-4 gap-y-1 px-4 py-3 transition-colors hover:bg-black hover:text-white sm:px-5 [&:not(:last-child)]:border-b-[3px] [&:not(:last-child)]:border-black"
                      >
                        <span className="font-mono text-xs font-bold text-black/40 group-hover/row:text-white/50">
                          {String(full.length + i + 1).padStart(2, "0")}
                        </span>
                        <span className="text-lg font-black uppercase" style={font}>
                          {p.title}
                        </span>
                        <span className="hidden font-mono text-[11px] font-bold uppercase text-black/60 group-hover/row:text-white/60 md:inline">
                          {p.kind[locale]}
                        </span>
                        <span className="ml-auto flex flex-wrap items-baseline gap-x-3 gap-y-1 font-mono text-xs font-bold uppercase">
                          <span className="text-black/50 group-hover/row:text-white/60">{p.year}</span>
                          {p.links.length > 0 ? (
                            p.links.map((l) => (
                              <a
                                key={l.href}
                                href={l.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline decoration-2 underline-offset-4 transition-colors hover:bg-[#ffe800] hover:text-black group-hover/row:decoration-[#ffe800]"
                              >
                                [{l.label[locale]} ↗]
                              </a>
                            ))
                          ) : (
                            <span className="text-black/40 group-hover/row:text-white/40">
                              {ui.project.noLink[locale]}
                            </span>
                          )}
                        </span>
                      </div>
                    ))}
                  </motion.div>
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
