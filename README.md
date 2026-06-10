# Roman Shuklin — Portfolio

Bilingual (RU/EN) personal portfolio of **Roman Shuklin** — interface designer & frontend developer.

The twist: it's not one design — it's a **design-mode engine**. The same content is rendered through completely different design languages you can switch on the fly. The site itself is the demo of range (design) and skill (code).

🔗 **Live:** https://portfolio-virid-five-19.vercel.app

## Modes

| Mode | Vibe |
| --- | --- |
| **HYPERMODE** | Wild, fast, loaded — WebGL shader background, custom cursor, Lenis smooth scroll, a 3D project slider, a real physics playground (matter.js) and a scroll-driven skills wheel |
| **Brutalism** | Raw & loud — monospace, hard black borders, offset shadows, flat screaming colors, hover inversion |
| **Minimal** | Restrained & refined — editorial serif typography, generous whitespace, hairlines, subtle motion |
| **Liquid Glass** | _in progress_ |
| **Arcade / Terminal** | _in progress_ |

Each mode is its own set of components rendering one shared, style-agnostic content source. Language (RU/EN) and the selected mode persist across reloads.

## Stack

- **Next.js 16** (App Router) · **React 19** · **TypeScript**
- **Tailwind CSS v4**
- **Motion** (Framer Motion) · **GSAP** · **Lenis**
- **Three.js** / **@react-three/fiber** — WebGL shader background
- **matter.js** — physics playground
- Fonts via **Fontshare** (Clash Display, Boska, Cabinet Grotesk, Satoshi, Space Mono)

## Architecture

```
src/
├── content/site.ts       # single bilingual content source (style-agnostic)
├── lib/i18n.ts           # UI strings + locale helper
├── providers/            # mode + language context (persisted)
├── components/           # ModeSwitcher (shared chrome)
├── modes/
│   ├── registry.ts       # mode metadata
│   ├── hyper/            # HYPERMODE (shader, cursor, 3D slider, physics, wheel)
│   ├── brutal/           # Brutalism
│   └── minimal/          # Minimal
└── app/                  # layout, page (mode renderer), globals
```

## Development

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
```

---

Built from scratch, no template.
