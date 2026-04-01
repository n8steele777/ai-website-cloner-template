"use client";

import { useEffect } from "react";
import Link from "next/link";
import { StudioFinityHeader } from "@/components/studio-finity-header";
import { offMenuWorkNavigationLinks } from "@/lib/site-data";

export default function ErrorPage({
  error,
  reset: _reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  void _reset;
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <StudioFinityHeader links={offMenuWorkNavigationLinks}>
        <div className="relative min-h-dvh">
          <main
            id="main-content"
            className="mx-auto flex max-w-2xl flex-col gap-8 px-6 pb-24 pt-28 md:px-8 md:pt-36"
          >
        <p className="sf-eyebrow text-muted-foreground">Something went wrong</p>
        <h1 className="sf-title-xl text-balance">We couldn’t load this page</h1>
        <p className="sf-body-copy max-w-md text-muted-foreground">
          A temporary issue may have occurred. Return to the home page.
        </p>
        <div className="flex flex-wrap gap-3 sm:gap-4">
          <Link
            href="/"
            className="sf-caption inline-flex min-h-11 items-center justify-center rounded-full border border-border bg-background px-6 py-3 outline-none transition-[opacity,background-color] duration-280 ease-sf-out hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-foreground/18 focus-visible:ring-offset-2 focus-visible:ring-offset-background active:opacity-80"
          >
            Home
          </Link>
        </div>
          </main>
        </div>
      </StudioFinityHeader>
    </div>
  );
}
