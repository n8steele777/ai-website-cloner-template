"use client";

import Image from "next/image";
import { useContactDialog } from "@/components/contact-dialog-provider";
import { cn } from "@/lib/utils";

const FOOTER_LOGO_SRC = "/logos/SF-Logo-Dark.png";

/** Shared fluid display scale for headline + contact (matches fill behavior). */
const footerDisplayClassName = cn(
  "sf-display-tight font-display text-[clamp(1.35rem,4.1vw,5.75rem)]",
);

export function StudioFinityFullPageFooter() {
  const { openContact } = useContactDialog();

  return (
    <footer
      className={cn(
        "relative z-10 flex w-full min-h-dvh flex-col justify-end bg-[#f2f2f2] text-foreground",
      )}
    >
      <div
        className={cn(
          "flex w-full min-w-0 flex-col gap-5 md:gap-6",
          "pb-[max(2.5rem,8vw)] pl-[max(1rem,8vw)] pr-6 pt-16 md:pb-[max(3rem,8vw)] md:pl-[max(1.5rem,8vw)]",
        )}
      >
        <Image
          src={FOOTER_LOGO_SRC}
          alt="Studio Finity"
          width={168}
          height={40}
          sizes="168px"
          className="h-[26px] w-auto max-w-[min(168px,100%)] shrink-0 self-start object-contain md:h-8"
        />

        <div className="min-w-0 w-full max-w-[calc(100vw-2rem)] md:max-w-none">
          <h2
            className={cn(
              footerDisplayClassName,
              "w-full max-w-full text-balance md:w-max md:max-w-none md:whitespace-nowrap",
              "max-md:leading-[0.92]",
            )}
          >
            Let&apos;s make something{" "}
            <br className="md:hidden" aria-hidden />
            the world won&apos;t see coming.
          </h2>
        </div>

        <button
          type="button"
          aria-label="Open contact form"
          onClick={() => openContact()}
          className={cn(
            footerDisplayClassName,
            "w-max max-w-none text-left",
            "transition-opacity duration-280 ease-sf-out hover:opacity-80",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/18",
            "focus-visible:ring-offset-2 focus-visible:ring-offset-[#f2f2f2]",
          )}
        >
          <span className="sf-text-quiet">Contact us</span>
        </button>
      </div>
    </footer>
  );
}
