"use client";

import { useEffect } from "react";
import Link from "next/link";
import { StudioFinityHeader } from "@/components/studio-finity-header";
import { offMenuWorkNavigationLinks } from "@/lib/site-data";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <StudioFinityHeader links={offMenuWorkNavigationLinks} />
      <main
        id="main-content"
        className="mx-auto flex max-w-2xl flex-col gap-8 px-6 pb-24 pt-32 md:px-8 md:pt-40"
      >
        <p className="sf-eyebrow text-muted-foreground">Something went wrong</p>
        <h1 className="sf-title-xl text-balance">We couldn’t load this page</h1>
        <p className="sf-body-copy max-w-md text-muted-foreground">
          A temporary issue may have occurred. Try again, or return to the home page.
        </p>
        <div className="flex flex-wrap gap-4">
          <button
            type="button"
            onClick={() => {
              reset();
            }}
            className="sf-caption inline-flex items-center justify-center rounded-full border border-foreground bg-foreground px-6 py-3 text-background transition-opacity hover:opacity-85"
          >
            Try again
          </button>
          <Link
            href="/"
            className="sf-caption inline-flex items-center justify-center rounded-full border border-foreground/20 px-6 py-3 transition-opacity hover:opacity-70"
          >
            Home
          </Link>
        </div>
      </main>
    </div>
  );
}
