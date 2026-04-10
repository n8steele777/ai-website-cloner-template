"use client";

import { AnimatedWords } from "@/components/animated-words";
import { useContactDialog } from "@/components/contact-dialog-provider";
import { cn } from "@/lib/utils";

/** Matches homepage section `AnimatedWords` timing (`cosmos-homepage` HOMEPAGE_LINE_REVEAL). */
const FOOTER_LINE_REVEAL = {
  delay: 0,
  duration: 1.02,
  rootMargin: "0px 0px -12% 0px",
  stagger: 0.04,
} as const;

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
              <AnimatedWords
                as="h2"
                text="Let's make something the world won't see coming."
                className={cn(
                  footerDisplayClassName,
                  "text-(--sf-text-quiet)!",
                  "w-full max-w-full text-balance md:w-max md:max-w-none md:whitespace-nowrap",
                )}
                lineClassName="max-md:leading-[0.92]"
                delay={FOOTER_LINE_REVEAL.delay}
                duration={FOOTER_LINE_REVEAL.duration}
                revealGroupOnView
                rootMargin={FOOTER_LINE_REVEAL.rootMargin}
                stagger={FOOTER_LINE_REVEAL.stagger}
                triggerOnView
              />
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
              <AnimatedWords
                as="span"
                text="Get in touch."
                className={cn(footerDisplayClassName, "text-(--sf-text-quiet)")}
                delay={FOOTER_LINE_REVEAL.stagger * 4}
                duration={FOOTER_LINE_REVEAL.duration}
                revealGroupOnView
                rootMargin={FOOTER_LINE_REVEAL.rootMargin}
                stagger={FOOTER_LINE_REVEAL.stagger}
                triggerOnView
              />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
