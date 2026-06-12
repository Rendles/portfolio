import type { Metadata } from "next";
import "./globals.css";
import { AppProviders } from "@/providers/AppProviders";
import { ExhibitProvider } from "@/exhibits/ExhibitProvider";
import { ModeSwitcher } from "@/components/ModeSwitcher";

const SITE_URL = "https://portfolio-virid-five-19.vercel.app";
const TITLE = "Роман Шуклин — дизайнер интерфейсов и frontend-разработчик";
const DESCRIPTION =
  "Дизайн + код в одном лице. React, Next.js, продуктовые SaaS. Один контент — разные дизайн-языки.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: "/",
    siteName: "Роман Шуклин — портфолио",
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: TITLE }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/og.png"],
  },
};

// Нестандартные шрифты Fontshare для разных дизайн-режимов
const FONTS =
  "https://api.fontshare.com/v2/css?f[]=clash-display@400,500,600,700&f[]=cabinet-grotesk@400,500,700,800,900&f[]=boska@300,400,500,700&f[]=general-sans@400,500,600,700&f[]=space-mono@400,700&f[]=satoshi@400,500,700,900&display=swap";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" className="h-full">
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link rel="preconnect" href="https://cdn.fontshare.com" crossOrigin="" />
        <link rel="preconnect" href="https://cdn.simpleicons.org" />
        <link rel="stylesheet" href={FONTS} />
      </head>
      <body className="min-h-full">
        <AppProviders>
          <ExhibitProvider>
            {children}
            <ModeSwitcher />
          </ExhibitProvider>
        </AppProviders>
      </body>
    </html>
  );
}
