"use client";

import Link from "next/link";
import { useEffect } from "react";
import "./globals.css";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const ctaClassName =
    "sf-caption mt-2 inline-flex w-fit min-h-11 items-center justify-center rounded-full border border-border bg-background px-6 py-3 outline-none transition-[opacity,background-color] duration-280 ease-sf-out hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-foreground/18 focus-visible:ring-offset-2 focus-visible:ring-offset-background active:opacity-80";

  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <main className="mx-auto flex max-w-lg flex-col gap-6 px-6 py-24">
          <p className="sf-eyebrow text-muted-foreground">Error</p>
          <h1 className="sf-title-xl text-balance">Something went wrong</h1>
          <p className="sf-body-copy max-w-prose">
            If the problem continues, return to the site later or go home.
          </p>
          <div className="mt-2 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={reset}
              className={ctaClassName}
            >
              Try again
            </button>
            <Link href="/" className={ctaClassName}>
              Home
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
