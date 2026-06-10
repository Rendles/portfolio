import type { Metadata } from "next";
import "./globals.css";
import { AppProviders } from "@/providers/AppProviders";
import { ModeSwitcher } from "@/components/ModeSwitcher";

export const metadata: Metadata = {
  title: "Роман Шуклин — дизайнер интерфейсов и frontend-разработчик",
  description:
    "Портфолио: дизайн + код. React, Next.js, продуктовые SaaS. Один контент — разные дизайн-языки.",
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
          {children}
          <ModeSwitcher />
        </AppProviders>
      </body>
    </html>
  );
}
