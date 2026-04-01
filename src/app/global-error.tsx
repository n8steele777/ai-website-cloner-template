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
      <body className="min-h-screen bg-[#fafafa] font-sans text-[#0a0a0a] antialiased">
        <main className="mx-auto flex max-w-lg flex-col gap-6 px-6 py-24">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-neutral-500">
            Error
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-balance">
            Something went wrong
          </h1>
          <p className="text-base leading-relaxed text-neutral-600">
            Please try again. If the problem continues, return to the site later.
          </p>
          <button
            type="button"
            onClick={() => {
              reset();
            }}
            className="mt-2 inline-flex w-fit items-center justify-center rounded-full border border-[#0a0a0a] bg-[#0a0a0a] px-6 py-3 text-sm font-medium text-white"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
