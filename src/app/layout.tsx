import type { Metadata } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import localFont from "next/font/local";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ReactGrabDev } from "@/components/react-grab-dev";
import { ContactDialogProvider } from "@/components/contact-dialog-provider";
import { CaseStudyTransitionProvider } from "@/components/case-study-transition-provider";
import { PageTransitionProvider } from "@/components/page-transition-provider";
import { SmoothScrollProvider } from "@/components/smooth-scroll-provider";
import { getSiteUrl } from "@/lib/site-url";
import "./globals.css";

const geistSans = GeistSans;
const geistMono = GeistMono;
const ohNavFont = localFont({
  src: "./fonts/PPNeueMontreal-Variable.woff2",
  display: "swap",
  variable: "--font-oh-pp",
  weight: "400 700",
});

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
      {
        url: "/logos/Favi%20Dark.png",
        type: "image/png",
        sizes: "200x200",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/logos/Favi%20Light.png",
        type: "image/png",
        sizes: "200x200",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/logos/Favi%20Dark.png",
        type: "image/png",
        sizes: "200x200",
      },
    ],
    apple: {
      url: "/logos/Favi%20Dark.png",
      type: "image/png",
      sizes: "200x200",
    },
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
        url: "/logos/SF-Social-Share.png",
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
    images: ["/logos/SF-Social-Share.png"],
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

      if (isIOSWebKit || isDesktopSafari) {
        document.documentElement.classList.add("is-safari");
      }
    })();
  `;

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${ohNavFont.variable} h-full font-sans antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link crossOrigin="anonymous" href="https://cdn.sanity.io" rel="preconnect" />
        <link href="https://cdn.sanity.io" rel="dns-prefetch" />
      </head>
      <body className="min-h-full bg-background text-foreground font-sans">
        <ReactGrabDev />
        <Script id="studio-finity-theme-script" strategy="beforeInteractive">
          {themeScript}
        </Script>
        <ContactDialogProvider>
          <SmoothScrollProvider>
            <CaseStudyTransitionProvider>
              <PageTransitionProvider>
                {children}
              </PageTransitionProvider>
            </CaseStudyTransitionProvider>
          </SmoothScrollProvider>
        </ContactDialogProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
