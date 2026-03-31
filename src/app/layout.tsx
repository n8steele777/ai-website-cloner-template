import type { Metadata } from "next";
import { CaseStudyTransitionProvider } from "@/components/case-study-transition-provider";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.offmenu.design"),
  title: "Off Menu — AI-Native Studio for Agentic Interfaces",
  description:
    "Product studio designing agentic interfaces. AI-accelerated exploration meets expert judgment to ship faster.",
  authors: [{ name: "Off Menu", url: "https://www.offmenu.design" }],
  creator: "Off Menu",
  keywords: [
    "AI product studio",
    "product design",
    "software development",
    "agentic interfaces",
    "AI-native design",
    "UI/UX design",
    "brand design",
  ],
  manifest: "/seo/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/seo/favicon.ico", sizes: "256x256", type: "image/x-icon" },
      { url: "/seo/favicon-light.svg", media: "(prefers-color-scheme: light)" },
      { url: "/seo/favicon-dark.svg", media: "(prefers-color-scheme: dark)" },
    ],
  },
  openGraph: {
    title: "Off Menu — AI-Native Studio for Agentic Interfaces",
    description:
      "Product studio designing agentic interfaces. AI-accelerated exploration meets expert judgment to ship faster.",
    siteName: "Off Menu",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/seo/opengraph.jpg",
        width: 1200,
        height: 630,
        alt: "Off Menu",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Off Menu — AI-Native Studio for Agentic Interfaces",
    description:
      "Product studio designing agentic interfaces. AI-accelerated exploration meets expert judgment to ship faster.",
    images: ["/seo/opengraph.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const themeScript = `
    (function() {
      try {
        var savedTheme = window.localStorage.getItem("offmenu-theme");
        if (savedTheme === "dark") {
          document.documentElement.classList.add("dark");
        }
      } catch (error) {}

      var ua = navigator.userAgent;
      var isIOSWebKit = /iPhone|iPad|iPod/i.test(ua) && /AppleWebKit/i.test(ua);
      var isDesktopSafari = /Safari/i.test(ua) && !/Chrome|Chromium|EdgiOS|FxiOS|Android/i.test(ua);
      if (isIOSWebKit || isDesktopSafari) {
        document.documentElement.classList.add("is-safari");
      }
    })();
  `;

  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full bg-background text-foreground">
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <CaseStudyTransitionProvider>{children}</CaseStudyTransitionProvider>
      </body>
    </html>
  );
}
