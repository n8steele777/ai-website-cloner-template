import type { Metadata } from "next";
import { CaseStudyTransitionProvider } from "@/components/case-study-transition-provider";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("http://localhost:3000"),
  title: "Studio Finity",
  description:
    "Studio Finity is a design studio working across brand, digital, and visual storytelling.",
  authors: [{ name: "Studio Finity" }],
  creator: "Studio Finity",
  keywords: [
    "Studio Finity",
    "design studio",
    "brand identity",
    "web design",
    "digital experiences",
    "visual storytelling",
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
    title: "Studio Finity",
    description:
      "Studio Finity is a design studio working across brand, digital, and visual storytelling.",
    siteName: "Studio Finity",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/seo/opengraph.jpg",
        width: 1200,
        height: 630,
        alt: "Studio Finity",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Studio Finity",
    description:
      "Studio Finity is a design studio working across brand, digital, and visual storytelling.",
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
