"use client";

import { useLayoutEffect, useMemo, useRef, type ElementType } from "react";
import gsap from "gsap";
import { usePageTransition } from "@/components/page-transition-provider";
import { GSAP_MOTION, fontsReadyPromise } from "@/lib/gsap-motion";
import { cn } from "@/lib/utils";

type AnimatedWordsProps<T extends ElementType = "p"> = {
  as?: T;
  /** Animate each newline-separated line as one unit (smoother for multi-word hero copy). */
  byLine?: boolean;
  className?: string;
  delay?: number;
  duration?: number;
  highlightClassName?: string;
  highlightWords?: string[];
  lineClassName?: string;
  rootMargin?: string;
  stagger?: number;
  text: string;
  threshold?: number;
  triggerOnView?: boolean;
};

const VIEWPORT_VISIBILITY = 0.96;

export function AnimatedWords<T extends ElementType = "p">({
  as,
  byLine = false,
  className,
  delay = 0,
  duration = 1.02,
  highlightClassName,
  highlightWords = [],
  lineClassName,
  rootMargin = "0px 0px -12% 0px",
  stagger = 0.04,
  text,
  threshold = 0,
  triggerOnView = false,
}: AnimatedWordsProps<T>) {
  const { pageReady } = usePageTransition();
  const Component = (as ?? "p") as ElementType;
  const rootRef = useRef<HTMLElement | null>(null);
  const lineRefs = useRef<HTMLSpanElement[]>([]);
  const wordRefs = useRef<HTMLSpanElement[]>([]);

  const lines = useMemo(
    () =>
      text
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
    [text],
  );
  const wordsByLine = useMemo(() => lines.map((line) => line.split(/\s+/).filter(Boolean)), [lines]);
  const totalWords = useMemo(() => wordsByLine.reduce((count, words) => count + words.length, 0), [wordsByLine]);

  useLayoutEffect(() => {
    lineRefs.current = lineRefs.current.slice(0, lines.length);
    wordRefs.current = wordRefs.current.slice(0, totalWords);

    const root = rootRef.current;
    const lineNodes = lineRefs.current.filter(Boolean);
    let wordOffset = 0;
    const lineWordGroups = wordsByLine.map((lineWords) => {
      const group = wordRefs.current.slice(wordOffset, wordOffset + lineWords.length).filter(Boolean);
      wordOffset += lineWords.length;
      return group;
    });

    if (!root || lineNodes.length === 0) {
      return;
    }

    let cancelled = false;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      if (byLine) {
        mm.add(GSAP_MOTION.reduce, () => {
          gsap.set(lineNodes, { autoAlpha: 1, yPercent: 0, clearProps: "willChange" });
        });

        mm.add(GSAP_MOTION.noPreference, () => {
          let lineTimeline: gsap.core.Timeline | null = null;
          let fontRaceDone = false;

          const initByLine = () => {
            if (cancelled || fontRaceDone) {
              return;
            }

            gsap.set(lineNodes, {
              autoAlpha: 0,
              force3D: true,
              willChange: "transform, opacity",
              yPercent: 38,
            });

            if (!pageReady) {
              return;
            }

            lineTimeline = gsap.timeline({
              defaults: {
                duration,
                ease: "power4.out",
                overwrite: "auto",
              },
              onComplete: () => {
                gsap.set(lineNodes, { clearProps: "willChange" });
              },
            });
            lineTimeline.to(lineNodes, {
              autoAlpha: 1,
              delay,
              stagger: { each: stagger },
              force3D: true,
              immediateRender: false,
              yPercent: 0,
            });
          };

          void fontsReadyPromise().then(() => {
            window.requestAnimationFrame(initByLine);
          });

          return () => {
            fontRaceDone = true;
            lineTimeline?.kill();
            gsap.killTweensOf(lineNodes);
          };
        });
      } else {
        mm.add(GSAP_MOTION.reduce, () => {
          lineWordGroups.forEach((lineWords) => {
            if (lineWords.length === 0) {
              return;
            }
            gsap.set(lineWords, { autoAlpha: 1, yPercent: 0, clearProps: "willChange" });
          });
        });

        mm.add(GSAP_MOTION.noPreference, () => {
          const observers: IntersectionObserver[] = [];
          const timelines = new Map<number, gsap.core.Timeline>();
          const animatedLines = new Set<number>();
          let fontRaceDone = false;

          lineWordGroups.forEach((lineWords) => {
            if (lineWords.length === 0) {
              return;
            }
            gsap.set(lineWords, { willChange: "transform, opacity" });
          });

          const animateLine = (lineIndex: number) => {
            const lineWords = lineWordGroups[lineIndex];

            if (cancelled || fontRaceDone || animatedLines.has(lineIndex) || !lineWords || lineWords.length === 0) {
              return;
            }

            animatedLines.add(lineIndex);
            timelines.get(lineIndex)?.kill();

            const timeline = gsap.timeline({
              defaults: {
                duration,
                ease: "power4.out",
                overwrite: "auto",
              },
            });
            timelines.set(lineIndex, timeline);

            timeline.fromTo(
              lineWords,
              {
                autoAlpha: 0,
                force3D: true,
                immediateRender: false,
                yPercent: 92,
              },
              {
                autoAlpha: 1,
                force3D: true,
                yPercent: 0,
                delay: delay + lineIndex * Math.min(stagger * 2, 0.12),
                stagger: {
                  each: stagger,
                  from: "start",
                },
                onComplete: () => {
                  gsap.set(lineWords, { clearProps: "willChange" });
                },
              },
            );
          };

          const init = () => {
            if (cancelled || fontRaceDone) {
              return;
            }

            lineWordGroups.forEach((lineWords) => {
              if (lineWords.length === 0) {
                return;
              }

              gsap.set(lineWords, {
                autoAlpha: 0,
                force3D: true,
                yPercent: 92,
              });
            });

            if (!pageReady) {
              return;
            }

            const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
            const visibilityThreshold = triggerOnView ? threshold : 0;

            lineNodes.forEach((lineNode, lineIndex) => {
              const rect = lineNode.getBoundingClientRect();
              const initiallyVisible = rect.bottom > 0 && rect.top < viewportHeight * VIEWPORT_VISIBILITY;

              if (initiallyVisible) {
                animateLine(lineIndex);
              }

              const observer = new IntersectionObserver(
                (entries) => {
                  entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                      animateLine(lineIndex);
                      observer.unobserve(entry.target);
                    }
                  });
                },
                {
                  rootMargin,
                  threshold: visibilityThreshold,
                },
              );

              observer.observe(lineNode);
              observers.push(observer);
            });
          };

          void fontsReadyPromise().then(() => {
            window.requestAnimationFrame(init);
          });

          return () => {
            fontRaceDone = true;
            lineWordGroups.forEach((lineWords) => {
              if (lineWords.length === 0) {
                return;
              }
              gsap.killTweensOf(lineWords);
            });
            timelines.forEach((timeline) => timeline.kill());
            observers.forEach((observer) => observer.disconnect());
          };
        });
      }
    }, root);

    return () => {
      cancelled = true;
      ctx.revert();
    };
  }, [
    byLine,
    delay,
    duration,
    lines.length,
    pageReady,
    rootMargin,
    stagger,
    text,
    threshold,
    totalWords,
    triggerOnView,
    wordsByLine,
  ]);

  return (
    <Component ref={rootRef} aria-label={lines.join(" ")} className={className}>
      {wordsByLine.map((words, lineIndex) => {
        const line = lines[lineIndex] ?? "";

        return (
          <span
            key={`${line}-${lineIndex}`}
            aria-hidden="true"
            ref={(node) => {
              if (node) {
                lineRefs.current[lineIndex] = node;
              }
            }}
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
                    className={cn(
                      "animated-word inline-block",
                      highlightWords.includes(word.replace(/[.,!?;:]+$/g, "")) ? highlightClassName : null,
                    )}
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
