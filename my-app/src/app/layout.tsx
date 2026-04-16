import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { LanguageProvider } from "@/components/providers/LanguageProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "AI Pulse - AI与机器人前沿追踪",
  description: "聚合全球AI和机器人领域最新科研动态，实时追踪技术突破与开源项目",
  keywords: ["AI", "人工智能", "机器人", "Robotics", "arXiv", "GitHub", "科研", "论文"],
  authors: [{ name: "AI Pulse Team" }],
  openGraph: {
    title: "AI Pulse - AI与机器人前沿追踪",
    description: "聚合全球AI和机器人领域最新科研动态，实时追踪技术突破与开源项目",
    type: "website",
    locale: "zh_CN",
  },
};

// Theme initialization script - runs before React hydrates
const themeScript = `
  (function() {
    try {
      const savedTheme = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const theme = savedTheme || (prefersDark ? 'dark' : 'light');
      document.documentElement.classList.add(theme);
    } catch (e) {
      document.documentElement.classList.add('dark');
    }
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {themeScript}
        </Script>
      </head>
      <body className="min-h-full flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300">
        <QueryProvider>
          <ThemeProvider>
            <LanguageProvider>
              {children}
            </LanguageProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
