"use client";

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

  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <main className="mx-auto flex max-w-lg flex-col gap-6 px-6 py-24">
          <p className="sf-eyebrow text-muted-foreground">Error</p>
          <h1 className="sf-title-xl text-balance">Something went wrong</h1>
          <p className="sf-body-copy max-w-prose">
            Please try again. If the problem continues, return to the site later.
          </p>
          <button
            type="button"
            onClick={() => {
              reset();
            }}
            className="mt-2 inline-flex w-fit items-center justify-center rounded-full border border-primary bg-primary px-6 py-3 text-sm font-medium text-primary-foreground"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
