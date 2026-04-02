"use client";

import { useContactDialog } from "@/components/contact-dialog-provider";
import { ShimmerText } from "@/components/ui/shimmer-text";
import { cn } from "@/lib/utils";

/** Shared fluid display scale for headline + contact (matches fill behavior). */
const footerDisplayClassName = cn(
  "sf-display-tight font-display text-[clamp(1.35rem,4.1vw,5.75rem)]",
);

export function StudioFinityFullPageFooter() {
  const { openContact } = useContactDialog();

  return (
    <footer
      className={cn(
        "relative z-10 flex w-full flex-col bg-background text-foreground",
        "min-h-[max(100dvh,32rem)] justify-center py-16 md:py-20",
      )}
    >
      <div className="sf-page-pad w-full">
        <div className="sf-page-content max-md:px-0">
          <div
            className={cn(
              "flex min-w-0 flex-col gap-5 text-left md:gap-6",
            )}
          >
            <div className="min-w-0 w-full">
              <h2
                className={cn(
                  footerDisplayClassName,
                  "text-(--sf-text-quiet)!",
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
              aria-haspopup="dialog"
              onClick={() => openContact()}
              className={cn(
                "w-max max-w-none cursor-pointer text-left",
                "transition-opacity duration-280 ease-sf-out hover:opacity-80",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/18",
                "focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              )}
            >
              <ShimmerText
                className={footerDisplayClassName}
                duration={2.75}
                delay={0.35}
              >
                Get in touch.
              </ShimmerText>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
