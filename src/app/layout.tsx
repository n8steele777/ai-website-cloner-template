import type { Metadata } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import localFont from "next/font/local";
import Script from "next/script";
import { AgentationProvider } from "@/components/agentation-provider";
import { CaseStudyTransitionProvider } from "@/components/case-study-transition-provider";
import { PageTransitionProvider } from "@/components/page-transition-provider";
import { SmoothScrollProvider } from "@/components/smooth-scroll-provider";
import "./globals.css";

const geistSans = GeistSans;
const geistMono = GeistMono;
const ohNavFont = localFont({
  src: "./fonts/PPNeueMontreal-Variable.woff2",
  display: "swap",
  variable: "--font-oh-pp",
  weight: "400 700",
});

function getSiteUrl() {
  const candidate =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000");

  return candidate.startsWith("http") ? candidate : `https://${candidate}`;
}

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
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
      { url: "/seo/favicon-light.svg" },
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
      var ua = navigator.userAgent;
      var isIOSWebKit = /iPhone|iPad|iPod/i.test(ua) && /AppleWebKit/i.test(ua);
      var isDesktopSafari = /Safari/i.test(ua) && !/Chrome|Chromium|EdgiOS|FxiOS|Android/i.test(ua);

      function updateOhMiniNavProgress() {
        var viewportHeight = window.innerHeight || 1;
        var revealStart = viewportHeight * 0.46;
        var revealEnd = viewportHeight * 0.87;
        var rawProgress = (window.scrollY - revealStart) / Math.max(revealEnd - revealStart, 1);
        var revealProgress = Math.min(1, Math.max(0, rawProgress));

        document.documentElement.style.setProperty("--sf-oh-mini-progress", String(revealProgress));
        document.documentElement.style.setProperty(
          "--sf-oh-mini-pointer",
          revealProgress > 0.04 ? "auto" : "none"
        );
      }

      if (isIOSWebKit || isDesktopSafari) {
        document.documentElement.classList.add("is-safari");
      }

      updateOhMiniNavProgress();
      window.addEventListener("scroll", updateOhMiniNavProgress, { passive: true });
      window.addEventListener("resize", updateOhMiniNavProgress);
    })();
  `;

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${ohNavFont.variable} h-full font-sans antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-background text-foreground font-sans">
        <Script id="studio-finity-theme-script" strategy="beforeInteractive">
          {themeScript}
        </Script>
        <SmoothScrollProvider>
          <CaseStudyTransitionProvider>
            <PageTransitionProvider>
              {children}
              <AgentationProvider />
            </PageTransitionProvider>
          </CaseStudyTransitionProvider>
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
