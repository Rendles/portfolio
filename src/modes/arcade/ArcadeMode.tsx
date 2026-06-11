"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { site } from "@/content/site";
import { ui } from "@/lib/i18n";
import { useApp } from "@/providers/AppProviders";

/* ─── палитра терминала ─── */
const GREEN = "#34ff8a";
const AMBER = "#ffb000";
const BG = "#050806";

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

/* ─── эффект печати ─── */
function useTypewriter(
  text: string,
  { speed = 34, delay = 0, enabled = true }: { speed?: number; delay?: number; enabled?: boolean } = {}
) {
  const [out, setOut] = useState(enabled ? "" : text);
  useEffect(() => {
    if (!enabled) {
      setOut(text);
      return;
    }
    setOut("");
    let i = 0;
    let tid: ReturnType<typeof setTimeout>;
    const start = setTimeout(function tick() {
      i += 1;
      setOut(text.slice(0, i));
      if (i < text.length) tid = setTimeout(tick, speed);
    }, delay);
    return () => {
      clearTimeout(start);
      clearTimeout(tid);
    };
  }, [text, speed, delay, enabled]);
  return out;
}

/* ─── мигающий каретка ─── */
function Caret({ on = true }: { on?: boolean }) {
  if (!on) return null;
  return (
    <span
      className="ml-0.5 inline-block h-[1em] w-[0.6ch] translate-y-[0.12em] bg-current align-baseline"
      style={{ animation: "hp-blink 1s steps(1) infinite" }}
    />
  );
}

/* ─── живые часы UTC ─── */
function useClock() {
  const [t, setT] = useState("--:--:--");
  useEffect(() => {
    const fmt = () => {
      const d = new Date();
      const p = (n: number) => String(n).padStart(2, "0");
      setT(`${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`);
    };
    fmt();
    const id = setInterval(fmt, 1000);
    return () => clearInterval(id);
  }, []);
  return t;
}

/* ─── boot-секвенция (оверлей при входе в режим) ─── */
function BootOverlay({ onDone, ru }: { onDone: () => void; ru: boolean }) {
  const lines = [
    "> initializing rendles.sys ...",
    "> loading design_modules ......... OK",
    "> mounting /projects ............. OK",
    "> auth guest@rendles ............. GRANTED",
    "> render mode: ARCADE_TERMINAL",
  ];
  const [shown, setShown] = useState(0);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    const ids: ReturnType<typeof setTimeout>[] = [];
    lines.forEach((_, i) => {
      ids.push(setTimeout(() => setShown(i + 1), 160 + i * 200));
    });
    ids.push(setTimeout(() => doneRef.current(), 160 + lines.length * 200 + 520));
    return () => ids.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-[70] flex flex-col justify-center px-6 sm:px-16"
      style={{ background: BG, fontFamily: "var(--font-mono)", color: GREEN }}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      onClick={onDone}
    >
      <div className="mx-auto w-full max-w-2xl text-sm sm:text-base">
        {lines.slice(0, shown).map((l, i) => (
          <div key={i} className="leading-relaxed">
            {l.includes("OK") || l.includes("GRANTED") ? (
              <>
                <span>{l.replace(/(OK|GRANTED)$/, "")}</span>
                <span style={{ color: AMBER }}>{l.match(/(OK|GRANTED)$/)?.[0]}</span>
              </>
            ) : (
              l
            )}
          </div>
        ))}
        <span style={{ animation: "hp-blink 1s steps(1) infinite" }}>█</span>
        <div className="mt-8 text-xs opacity-40">
          {ru ? "[ нажми, чтобы пропустить ]" : "[ click to skip ]"}
        </div>
      </div>
    </motion.div>
  );
}

/* ─── рамка-панель с угловыми скобками ─── */
function Panel({
  children,
  className = "",
  label,
}: {
  children: React.ReactNode;
  className?: string;
  label?: string;
}) {
  return (
    <div
      className={`relative border border-[#34ff8a]/30 bg-[#34ff8a]/[0.025] ${className}`}
    >
      {label && (
        <span className="absolute -top-2.5 left-4 bg-[#050806] px-2 font-mono text-[10px] uppercase tracking-[0.25em] text-[#34ff8a]/70">
          {label}
        </span>
      )}
      {children}
    </div>
  );
}

/* ─── секция-заголовок ─── */
function SectionHead({ cmd, title }: { cmd: string; title: string }) {
  return (
    <div className="mb-8">
      <div className="font-mono text-xs uppercase tracking-[0.2em] text-[#34ff8a]/50">
        <span className="text-[#34ff8a]">guest@rendles</span>:~$ {cmd}
      </div>
      <h2
        className="mt-2 text-3xl font-bold uppercase tracking-tight sm:text-5xl"
        style={{ fontFamily: "var(--font-mono)", textShadow: `0 0 22px ${GREEN}55` }}
      >
        {title}
      </h2>
    </div>
  );
}

/* ─── режим ─── */
export function ArcadeMode() {
  const { locale } = useApp();
  const ru = locale === "ru";
  const reduce = useReducedMotion();
  const [booted, setBooted] = useState(false);
  const clock = useClock();

  const typed = useTypewriter(site.tagline[locale], {
    speed: 26,
    delay: 200,
    enabled: !reduce && booted,
  });

  const mono = { fontFamily: "var(--font-mono)" };

  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{ background: BG, color: "#d6ffe8", ...mono }}
    >
      {/* boot */}
      <AnimatePresence>
        {!booted && !reduce && (
          <BootOverlay key="boot" ru={ru} onDone={() => setBooted(true)} />
        )}
      </AnimatePresence>

      {/* CRT-оверлей: сканлайны + виньетка + мерцание */}
      {!reduce && (
        <div className="pointer-events-none fixed inset-0 z-[60]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, rgba(0,0,0,0.18) 0px, rgba(0,0,0,0.18) 1px, transparent 1px, transparent 3px)",
              animation: "arc-flicker 6s infinite",
            }}
          />
          <div
            className="absolute inset-x-0 h-[28vh] opacity-[0.07]"
            style={{
              background: `linear-gradient(180deg, transparent, ${GREEN}, transparent)`,
              animation: "arc-scan 7s linear infinite",
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(120% 120% at 50% 50%, transparent 55%, rgba(0,0,0,0.55) 100%)",
            }}
          />
        </div>
      )}

      {/* свечение фона */}
      <div
        className="pointer-events-none fixed left-1/2 top-0 -z-0 size-[80vmax] -translate-x-1/2 -translate-y-1/3 rounded-full opacity-20 blur-[140px]"
        style={{ background: GREEN }}
      />

      <div className="relative z-10">
        {/* HUD-шапка */}
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-[#34ff8a]/25 bg-[#050806]/85 px-4 py-2.5 backdrop-blur-sm sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="flex gap-1.5">
              <span className="size-2.5 rounded-full bg-[#ff5f56]" />
              <span className="size-2.5 rounded-full bg-[#ffbd2e]" />
              <span className="size-2.5 rounded-full bg-[#34ff8a]" />
            </span>
            <span className="text-xs uppercase tracking-[0.15em] text-[#34ff8a]/80">
              rendles@portfolio: ~/arcade
            </span>
          </div>
          <nav className="hidden gap-5 text-xs uppercase md:flex">
            {[ui.nav.work, ui.nav.about, ui.nav.skills, ui.nav.ai, ui.nav.contact].map(
              (item, i) => (
                <a
                  key={i}
                  href={["#a-work", "#a-about", "#a-skills", "#a-ai", "#a-contact"][i]}
                  className="text-[#34ff8a]/60 transition-colors hover:text-[#34ff8a]"
                >
                  {item[locale]}
                </a>
              )
            )}
          </nav>
          <span className="hidden text-xs tabular-nums text-[#34ff8a]/70 sm:inline">
            {clock} UTC{new Date().getTimezoneOffset() <= 0 ? "+" : "-"}
          </span>
        </header>

        {/* HERO */}
        <section className="px-4 py-12 sm:px-8 sm:py-20">
          <div className="mb-7 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 border border-[#34ff8a]/40 px-3 py-1.5 text-xs uppercase tracking-wider text-[#34ff8a]">
              <span
                className="size-2 rounded-full bg-[#34ff8a]"
                style={{ animation: "arc-pulse-ring 1.8s infinite" }}
              />
              {ui.hero.available[locale]}
            </span>
            <span className="text-xs uppercase tracking-[0.2em] text-[#34ff8a]/50">
              {site.roles[locale]}
            </span>
          </div>

          <h1
            className="text-[clamp(2.6rem,12vw,9rem)] font-bold uppercase leading-[0.9] tracking-tight"
            style={{ textShadow: `0 0 30px ${GREEN}66, 0 0 60px ${GREEN}22` }}
          >
            {site.name[locale].split(" ").map((w, i) => (
              <span key={i} className="block">
                <span className="text-[#34ff8a]/40">{i === 0 ? "> " : "  "}</span>
                {w}
              </span>
            ))}
          </h1>

          <div className="mt-8 max-w-xl text-base text-[#34ff8a]/90 sm:text-lg">
            <span className="text-[#34ff8a]/50">$ </span>
            {reduce ? site.tagline[locale] : typed}
            <Caret on={!reduce} />
          </div>

          <div className="mt-9 flex flex-wrap gap-3">
            <a
              href={`mailto:${site.contacts.email}`}
              className="group inline-flex items-center gap-2 border border-[#34ff8a] bg-[#34ff8a]/10 px-6 py-3 text-sm font-bold uppercase tracking-wider text-[#34ff8a] transition-all hover:bg-[#34ff8a] hover:text-[#050806]"
              style={{ boxShadow: `0 0 24px ${GREEN}33` }}
            >
              <span className="opacity-60 group-hover:opacity-100">[ENTER]</span>
              {ui.hero.cta[locale]}
            </a>
            <a
              href="#a-work"
              className="inline-flex items-center gap-2 border border-[#34ff8a]/30 px-6 py-3 text-sm uppercase tracking-wider text-[#34ff8a]/70 transition-colors hover:border-[#34ff8a]/70 hover:text-[#34ff8a]"
            >
              {ui.hero.scroll[locale]} ↓
            </a>
          </div>
        </section>

        {/* STATS — SYSTEM STATUS */}
        <section className="px-4 sm:px-8">
          <Panel label="system status" className="grid grid-cols-2 md:grid-cols-4">
            {site.stats.map((s, i) => (
              <div
                key={i}
                className="border-[#34ff8a]/20 p-5 [&:not(:last-child)]:border-r [&:nth-child(-n+2)]:border-b md:[&:nth-child(-n+2)]:border-b-0"
              >
                <div
                  className="text-4xl font-bold sm:text-5xl"
                  style={{ textShadow: `0 0 18px ${GREEN}55` }}
                >
                  {s.value}
                </div>
                <div className="mt-2 text-[11px] uppercase tracking-wider text-[#34ff8a]/50">
                  {s.label[locale]}
                </div>
              </div>
            ))}
          </Panel>
        </section>

        {/* WORK — MODULES */}
        <section id="a-work" className="scroll-mt-16 px-4 py-16 sm:px-8">
          <SectionHead cmd="ls ./projects --detail" title={ui.sections.workTitle[locale]} />
          <div className="grid gap-5 md:grid-cols-2">
            {site.projects.map((p, i) => (
              <motion.article
                key={p.id}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.3, delay: (i % 2) * 0.05 }}
                className="group relative border border-[#34ff8a]/25 bg-[#34ff8a]/[0.02] p-5 transition-all hover:border-[#34ff8a]/70 hover:bg-[#34ff8a]/[0.05]"
                style={{ boxShadow: "0 0 0 rgba(52,255,138,0)" }}
              >
                <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-[#34ff8a]/50">
                  <span>module_{String(i + 1).padStart(2, "0")}</span>
                  <span style={{ color: p.solo ? AMBER : undefined }}>
                    {p.solo ? `[${ui.project.solo[locale]}]` : "[team]"} · {p.year}
                  </span>
                </div>

                <h3
                  className="mt-2 text-2xl font-bold uppercase sm:text-3xl"
                  style={{ textShadow: `0 0 18px ${GREEN}44` }}
                >
                  {p.title}
                </h3>
                <div className="mt-1 text-xs uppercase tracking-wider text-[#34ff8a]/60">
                  {p.kind[locale]}
                </div>

                <p className="mt-3 text-sm leading-relaxed text-[#d6ffe8]/75">
                  <span className="text-[#34ff8a]/40">{"// "}</span>
                  {p.summary[locale]}
                </p>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {p.stack.map((s) => (
                    <span
                      key={s}
                      className="border border-[#34ff8a]/25 px-2 py-0.5 text-[11px] text-[#34ff8a]/70"
                    >
                      {s}
                    </span>
                  ))}
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-[#34ff8a]/15 pt-4">
                  <span className="text-[11px] uppercase tracking-wider text-[#34ff8a]/45">
                    {p.role[locale]}
                  </span>
                  {p.link ? (
                    <a
                      href={p.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 border border-[#34ff8a]/50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#34ff8a] transition-colors hover:bg-[#34ff8a] hover:text-[#050806]"
                    >
                      [run] {ui.project.visit[locale]} ↗
                    </a>
                  ) : (
                    <span className="text-[11px] uppercase tracking-wider text-[#34ff8a]/35">
                      {ui.project.noLink[locale]}
                    </span>
                  )}
                </div>
              </motion.article>
            ))}
          </div>
        </section>

        {/* ABOUT */}
        <section id="a-about" className="scroll-mt-16 px-4 py-16 sm:px-8">
          <SectionHead cmd="cat about.txt" title={ui.sections.aboutTitle[locale]} />
          <Panel className="p-6 sm:p-8" label="about.txt">
            <p className="max-w-3xl text-lg leading-relaxed text-[#d6ffe8]/85 sm:text-xl">
              {site.about[locale]}
            </p>
          </Panel>
        </section>

        {/* SKILLS */}
        <section id="a-skills" className="scroll-mt-16 px-4 py-16 sm:px-8">
          <SectionHead cmd="tree ./skills" title={ui.sections.skillsTitle[locale]} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {site.skills.map((g, i) => (
              <Panel key={i} label={`0${i + 1}`} className="p-5">
                <div className="mb-3 text-sm font-bold uppercase tracking-wider text-[#34ff8a]">
                  {g.label[locale]}/
                </div>
                <ul className="space-y-1.5 text-sm text-[#d6ffe8]/75">
                  {g.items.map((it) => (
                    <li key={it} className="flex gap-2">
                      <span className="text-[#34ff8a]/40">├─</span>
                      {it}
                    </li>
                  ))}
                </ul>
              </Panel>
            ))}
          </div>
        </section>

        {/* AI */}
        <section
          id="a-ai"
          className="scroll-mt-16 border-y border-[#34ff8a]/25 bg-[#34ff8a]/[0.03] px-4 py-16 sm:px-8"
        >
          <SectionHead cmd="./run ai_toolchain --status" title={site.ai.title[locale]} />
          <p className="max-w-2xl text-lg leading-relaxed text-[#d6ffe8]/85">
            {site.ai.body[locale]}
          </p>
          <div className="mt-7 flex flex-wrap gap-2.5">
            {site.ai.tools.map((t) => {
              const slug = AI_SLUGS[t];
              return (
                <span
                  key={t}
                  className="inline-flex items-center gap-2 border border-[#34ff8a]/40 bg-[#050806] px-3.5 py-2 text-sm uppercase tracking-wider text-[#34ff8a]"
                >
                  {slug ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`https://cdn.simpleicons.org/${slug}/34ff8a`}
                      alt={t}
                      width={16}
                      height={16}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <span className="grid size-4 place-items-center bg-[#34ff8a] text-[9px] font-black text-[#050806]">
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
        <section id="a-contact" className="scroll-mt-16 px-4 py-20 sm:px-8">
          <div className="font-mono text-xs uppercase tracking-[0.2em] text-[#34ff8a]/50">
            <span className="text-[#34ff8a]">guest@rendles</span>:~$ ./connect
          </div>
          <h2
            className="mt-3 text-[clamp(2.4rem,10vw,7rem)] font-bold uppercase leading-[0.9]"
            style={{ textShadow: `0 0 30px ${GREEN}55` }}
          >
            {ui.sections.contactTitle[locale]}
          </h2>
          <p className="mt-4 max-w-md text-[#34ff8a]/60">{ui.sections.contactSub[locale]}</p>

          <Panel className="mt-10 grid sm:grid-cols-2" label="./connect">
            {[
              { label: "EMAIL", value: site.contacts.email, href: `mailto:${site.contacts.email}` },
              { label: "TELEGRAM", value: site.contacts.telegram, href: site.contacts.telegramHref },
              { label: "PHONE", value: site.contacts.phone, href: site.contacts.phoneHref },
              { label: "GITHUB", value: site.contacts.github, href: site.contacts.githubHref },
            ].map((c) => (
              <a
                key={c.label}
                href={c.href}
                target={c.href.startsWith("http") ? "_blank" : undefined}
                rel="noopener noreferrer"
                className="group flex items-center justify-between border-[#34ff8a]/20 p-5 transition-colors hover:bg-[#34ff8a]/10 [&:nth-child(-n+2)]:border-b sm:[&:nth-child(odd)]:border-r"
              >
                <span className="text-xs uppercase tracking-wider text-[#34ff8a]/45">
                  {c.label}
                </span>
                <span className="text-base font-bold text-[#34ff8a] sm:text-lg">
                  {c.value} ↗
                </span>
              </a>
            ))}
          </Panel>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-[#34ff8a]/25 px-4 py-5 text-xs uppercase tracking-wider text-[#34ff8a]/50 sm:px-8">
          <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
            <span>© 2026 {site.name[locale]}</span>
            <span>{"// "}arcade_terminal · next.js · no template</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
