"use client";

import { useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { site, type Locale, type Project } from "@/content/site";
import { ui } from "@/lib/i18n";
import { useApp } from "@/providers/AppProviders";

const PAPER = "#f6f5f1";
const INK = "#1a1916";
const ACCENT = "#a85a3c"; // тёплая глина — используется минимально

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

const serif = { fontFamily: "var(--font-boska)" };
const sans = { fontFamily: "var(--font-satoshi)" };
const mono = { fontFamily: "var(--font-mono)" };

function Reveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span
      className="text-[11px] uppercase tracking-[0.28em] text-black/45"
      style={mono}
    >
      {children}
    </span>
  );
}

export function MinimalMode() {
  const { locale } = useApp();

  return (
    <div className="min-h-screen" style={{ background: PAPER, color: INK, ...sans }}>
      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b border-black/10 bg-[#f6f5f1]/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 sm:px-10">
          <span className="text-lg" style={serif}>
            Р. Шуклин
          </span>
          <nav className="hidden gap-8 md:flex">
            {[ui.nav.work, ui.nav.about, ui.nav.skills, ui.nav.ai, ui.nav.contact].map(
              (item, i) => (
                <a
                  key={i}
                  href={["#m-work", "#m-about", "#m-skills", "#m-ai", "#m-contact"][i]}
                  className="group relative text-sm text-black/70 transition-colors hover:text-black"
                >
                  {item[locale]}
                  <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-current transition-transform duration-300 group-hover:scale-x-100" />
                </a>
              )
            )}
          </nav>
          <span className="flex items-center gap-2 text-xs text-black/55" style={mono}>
            <span className="size-1.5 rounded-full" style={{ background: ACCENT }} />
            {ui.hero.available[locale]}
          </span>
        </div>
      </header>

      {/* HERO */}
      <section className="mx-auto max-w-6xl px-6 pb-20 pt-20 sm:px-10 sm:pb-28 sm:pt-28">
        <Eyebrow>{site.roles[locale]}</Eyebrow>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 text-[clamp(3rem,11vw,9rem)] font-medium leading-[0.95] tracking-[-0.02em]"
          style={serif}
        >
          {site.name[locale]}
        </motion.h1>

        <div className="mt-12 grid gap-8 border-t border-black/10 pt-8 md:grid-cols-[1.5fr_1fr]">
          <p className="max-w-xl text-2xl font-normal leading-snug text-black/80" style={serif}>
            {site.tagline[locale]}
          </p>
          <div className="flex flex-col gap-3 text-sm text-black/60">
            <div className="flex justify-between border-b border-black/10 pb-2">
              <span style={mono} className="uppercase tracking-wider text-black/40">
                {locale === "ru" ? "Локация" : "Location"}
              </span>
              <span>{site.location[locale]}</span>
            </div>
            <div className="flex justify-between border-b border-black/10 pb-2">
              <span style={mono} className="uppercase tracking-wider text-black/40">
                {locale === "ru" ? "Опыт" : "Since"}
              </span>
              <span>2022 →</span>
            </div>
            <a
              href={`mailto:${site.contacts.email}`}
              className="mt-2 inline-flex w-fit items-center gap-2 border-b border-black pb-1 text-base text-black transition-colors hover:text-[#a85a3c]"
            >
              {ui.hero.cta[locale]} <span aria-hidden>→</span>
            </a>
          </div>
        </div>
      </section>

      {/* WORK */}
      <section id="m-work" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-16 sm:px-10">
        <Reveal>
          <div className="mb-10 flex items-baseline justify-between border-b border-black/10 pb-4">
            <h2 className="text-3xl font-normal sm:text-4xl" style={serif}>
              {ui.sections.workTitle[locale]}
            </h2>
            <Eyebrow>{ui.sections.workSub[locale]}</Eyebrow>
          </div>
        </Reveal>

        <div>
          {site.workGroups.map((group, gi) => {
            const offset = site.workGroups
              .slice(0, gi)
              .reduce((n, g) => n + g.projects.length, 0);
            return (
              <div key={group.id} className={gi > 0 ? "mt-16 border-t border-black/10 pt-14" : ""}>
                <Reveal>
                  <div className="mb-6 max-w-2xl">
                    <Eyebrow>{group.title[locale]}</Eyebrow>
                    <p className="mt-2.5 text-sm font-light leading-relaxed text-black/50">
                      {group.blurb[locale]}
                    </p>
                  </div>
                </Reveal>
                <div>
                  {group.projects.map((p, i) =>
                    p.tier === "full" ? (
                      <WorkRow key={p.id} project={p} index={offset + i} locale={locale} />
                    ) : (
                      <CompactRow key={p.id} project={p} index={offset + i} locale={locale} />
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ABOUT */}
      <section id="m-about" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-24 sm:px-10">
        <div className="grid gap-10 md:grid-cols-[1fr_2fr]">
          <Reveal>
            <Eyebrow>{ui.sections.aboutTitle[locale]}</Eyebrow>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="text-2xl font-normal leading-relaxed text-black/85 sm:text-[2rem]" style={serif}>
              {site.about[locale]}
            </p>
          </Reveal>
        </div>
      </section>

      {/* SKILLS */}
      <section id="m-skills" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-16 sm:px-10">
        <Reveal>
          <h2 className="mb-12 text-3xl font-normal sm:text-4xl" style={serif}>
            {ui.sections.skillsTitle[locale]}
          </h2>
        </Reveal>
        <div className="grid gap-10 border-t border-black/10 pt-10 sm:grid-cols-2 lg:grid-cols-4">
          {site.skills.map((g, i) => (
            <Reveal key={i} delay={i * 0.07}>
              <div>
                <h3 className="mb-4 flex items-center gap-2 text-sm" style={mono}>
                  <span className="text-black/35">{String(i + 1).padStart(2, "0")}</span>
                  <span className="uppercase tracking-wider">{g.label[locale]}</span>
                </h3>
                <ul className="space-y-2.5">
                  {g.items.map((it) => (
                    <li key={it} className="text-black/70">
                      {it}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* AI */}
      <section id="m-ai" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-24 sm:px-10">
        <div className="grid gap-10 border-t border-black/10 pt-10 md:grid-cols-[1fr_2fr]">
          <Reveal>
            <Eyebrow>{site.ai.title[locale]}</Eyebrow>
          </Reveal>
          <Reveal delay={0.1}>
            <div>
              <p className="text-xl font-normal leading-relaxed text-black/80" style={serif}>
                {site.ai.body[locale]}
              </p>
              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
                {site.ai.tools.map((t) => {
                  const slug = AI_SLUGS[t];
                  return (
                    <span key={t} className="inline-flex items-center gap-2 text-sm text-black/65">
                      {slug ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={`https://cdn.simpleicons.org/${slug}/1a1916`}
                          alt={t}
                          width={15}
                          height={15}
                          loading="lazy"
                          className="opacity-70"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <span className="size-1.5 rounded-full" style={{ background: ACCENT }} />
                      )}
                      {t}
                    </span>
                  );
                })}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* CONTACT */}
      <section id="m-contact" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-24 sm:px-10">
        <Reveal>
          <Eyebrow>{ui.sections.contactSub[locale]}</Eyebrow>
          <a
            href={`mailto:${site.contacts.email}`}
            className="group mt-5 block w-fit text-[clamp(2.5rem,8vw,6.5rem)] font-medium leading-none tracking-[-0.02em] transition-colors hover:text-[#a85a3c]"
            style={serif}
          >
            {site.contacts.email}
            <span className="block h-px w-0 bg-[#a85a3c] transition-all duration-500 group-hover:w-full" />
          </a>

          <div className="mt-12 flex flex-wrap gap-x-10 gap-y-4 border-t border-black/10 pt-8 text-sm">
            {[
              { label: "Telegram", value: site.contacts.telegram, href: site.contacts.telegramHref },
              { label: "Phone", value: site.contacts.phone, href: site.contacts.phoneHref },
              { label: "GitHub", value: site.contacts.github, href: site.contacts.githubHref },
            ].map((c) => (
              <a
                key={c.label}
                href={c.href}
                target={c.href.startsWith("http") ? "_blank" : undefined}
                rel="noopener noreferrer"
                className="group flex items-center gap-3 text-black/70 transition-colors hover:text-black"
              >
                <span style={mono} className="uppercase tracking-wider text-black/40">
                  {c.label}
                </span>
                <span className="relative">
                  {c.value}
                  <span className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-current transition-transform duration-300 group-hover:scale-x-100" />
                </span>
              </a>
            ))}
          </div>
        </Reveal>
      </section>

      {/* FOOTER */}
      <footer className="mx-auto max-w-6xl border-t border-black/10 px-6 py-8 sm:px-10">
        <div className="flex flex-col justify-between gap-2 text-xs text-black/45 sm:flex-row" style={mono}>
          <span>© 2026 {site.name[locale]}</span>
          <span className="uppercase tracking-wider">{site.location[locale]}</span>
        </div>
      </footer>
    </div>
  );
}

function ProjectLinks({ project, locale }: { project: Project; locale: Locale }) {
  if (project.links.length === 0) {
    return <span className="text-sm font-light text-black/35">{ui.project.noLink[locale]}</span>;
  }

  return (
    <span className="flex flex-wrap items-baseline gap-x-5 gap-y-1">
      {project.links.map((l) => (
        <a
          key={l.href}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          className="group/link inline-flex items-baseline gap-1 text-sm text-black/60 transition-colors hover:text-[#a85a3c]"
        >
          <span className="relative">
            {l.label[locale]}
            <span className="absolute -bottom-0.5 left-0 h-px w-full bg-current opacity-30 transition-opacity duration-300 group-hover/link:opacity-100" />
          </span>
          <span
            className="text-xs transition-transform duration-300 group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5"
            aria-hidden
          >
            ↗
          </span>
        </a>
      ))}
    </span>
  );
}

function WorkRow({
  project,
  index,
  locale,
}: {
  project: Project;
  index: number;
  locale: Locale;
}) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      <div
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className="group border-b border-black/10 py-7"
      >
        <div className="flex items-baseline justify-between gap-4">
          <div className="flex items-baseline gap-5">
            <span className="text-sm text-black/35" style={mono}>
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3
              className="text-3xl font-normal tracking-[-0.01em] transition-transform duration-500 group-hover:translate-x-2 sm:text-5xl"
              style={serif}
            >
              {project.title}
            </h3>
          </div>
          <span className="hidden shrink-0 text-sm text-black/45 sm:block">
            {project.year} · {project.solo ? ui.project.solo[locale] : locale === "ru" ? "команда" : "team"}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 pl-0 sm:pl-10">
          <p className="text-sm text-black/55">{project.kind[locale]}</p>
          <ProjectLinks project={project} locale={locale} />
        </div>

        <motion.div
          initial={false}
          animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden sm:pl-10"
        >
          <p className="max-w-2xl pt-4 text-black/70">{project.summary[locale]}</p>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 pb-1 text-xs text-black/45" style={mono}>
            {project.stack.map((s) => (
              <span key={s}>{s}</span>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function CompactRow({
  project,
  index,
  locale,
}: {
  project: Project;
  index: number;
  locale: Locale;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1.5 border-b border-black/[0.07] py-4">
        <span className="text-xs text-black/30" style={mono}>
          {String(index + 1).padStart(2, "0")}
        </span>
        <h3 className="text-xl font-normal tracking-[-0.01em]" style={serif}>
          {project.title}
        </h3>
        <span className="text-sm font-light text-black/50">{project.kind[locale]}</span>
        <span className="text-xs text-black/40" style={mono}>
          {project.year}
        </span>
        <span className="ml-auto">
          <ProjectLinks project={project} locale={locale} />
        </span>
      </div>
    </motion.div>
  );
}
