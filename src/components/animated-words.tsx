"use client";

import { useLayoutEffect, useRef, type ElementType } from "react";
import gsap from "gsap";
import { usePageTransition } from "@/components/page-transition-provider";
import { cn } from "@/lib/utils";

type AnimatedWordsProps<T extends ElementType = "p"> = {
  as?: T;
  className?: string;
  delay?: number;
  duration?: number;
  lineClassName?: string;
  rootMargin?: string;
  stagger?: number;
  text: string;
  threshold?: number;
  triggerOnView?: boolean;
};

export function AnimatedWords<T extends ElementType = "p">({
  as,
  className,
  delay = 0,
  duration = 0.82,
  lineClassName,
  rootMargin = "0px 0px -12% 0px",
  stagger = 0.03,
  text,
  threshold = 0,
  triggerOnView = false,
}: AnimatedWordsProps<T>) {
  const { pageReady } = usePageTransition();
  const Component = (as ?? "p") as ElementType;
  const rootRef = useRef<HTMLElement | null>(null);
  const wordRefs = useRef<HTMLSpanElement[]>([]);
  const hasAnimatedRef = useRef(false);
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const wordsByLine = lines.map((line) => line.split(/\s+/).filter(Boolean));
  const totalWords = wordsByLine.reduce((count, words) => count + words.length, 0);

  useLayoutEffect(() => {
    wordRefs.current = wordRefs.current.slice(0, totalWords);

    const words = wordRefs.current.filter(Boolean);
    const root = rootRef.current;

    if (!root || words.length === 0) {
      return;
    }

    let observer: IntersectionObserver | null = null;
    let timeline: gsap.core.Timeline | null = null;
    let cancelled = false;

    const animateIn = () => {
      if (cancelled || hasAnimatedRef.current) {
        return;
      }

      hasAnimatedRef.current = true;
      timeline?.kill();
      timeline = gsap.timeline({
        defaults: {
          duration,
          ease: "expo.out",
          overwrite: "auto",
        },
      });
      timeline.fromTo(
        words,
        {
          autoAlpha: 0,
          force3D: true,
          yPercent: 92,
        },
        {
          autoAlpha: 1,
          force3D: true,
          yPercent: 0,
          delay,
          stagger: {
            each: stagger,
            from: "start",
          },
          onComplete: () => {
            gsap.set(words, { clearProps: "willChange" });
          },
        },
      );
    };

    const ctx = gsap.context(() => {
      gsap.set(words, { willChange: "transform, opacity" });
    }, root);

    const init = () => {
      if (cancelled) {
        return;
      }

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(words, { autoAlpha: 1, yPercent: 0 });
        return;
      }

      if (hasAnimatedRef.current) {
        gsap.set(words, { autoAlpha: 1, yPercent: 0 });
        return;
      }

      gsap.set(words, {
        autoAlpha: 0,
        force3D: true,
        yPercent: 92,
      });

      if (!pageReady) {
        return;
      }

      if (!triggerOnView) {
        animateIn();
        return;
      }

      const rect = root.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
      const initiallyVisible = rect.bottom > 0 && rect.top < viewportHeight * 1.05;

      if (initiallyVisible) {
        animateIn();
        return;
      }

      const nextObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) {
              return;
            }

            nextObserver.unobserve(entry.target);
            animateIn();
          });
        },
        {
          rootMargin,
          threshold,
        },
      );

      nextObserver.observe(root);
      observer = nextObserver;
    };

    const readyPromise =
      "fonts" in document ? document.fonts.ready.catch(() => undefined) : Promise.resolve();

    void readyPromise.then(() => {
      window.requestAnimationFrame(init);
    });

    return () => {
      cancelled = true;
      gsap.killTweensOf(words);
      timeline?.kill();
      observer?.disconnect();
      ctx.revert();
    };
  }, [delay, duration, pageReady, rootMargin, stagger, text, threshold, totalWords, triggerOnView]);

  return (
    <Component
      ref={rootRef}
      aria-label={lines.join(" ")}
      className={className}
    >
      {wordsByLine.map((words, lineIndex) => {
        const line = lines[lineIndex] ?? "";

        return (
          <span
            key={`${line}-${lineIndex}`}
            aria-hidden="true"
            className={cn("block", lineClassName)}
          >
            {words.map((word, wordIndex) => {
              const flatWordIndex =
                wordsByLine
                  .slice(0, lineIndex)
                  .reduce((count, currentWords) => count + currentWords.length, 0) + wordIndex;

              return (
                <span
                  key={`${word}-${lineIndex}-${wordIndex}`}
                  className={cn("animated-word-wrap", wordIndex < words.length - 1 && "mr-[0.22em]")}
                >
                  <span
                    ref={(node) => {
                      if (node) {
                        wordRefs.current[flatWordIndex] = node;
                      }
                    }}
                    className="animated-word inline-block"
                  >
                    {word}
                  </span>
                </span>
              );
            })}
          </span>
        );
      })}
    </Component>
  );
}
