"use client";

import { useLayoutEffect, useRef, type ElementType } from "react";
import gsap from "gsap";
import SplitType from "split-type";
import { usePageTransition } from "@/components/page-transition-provider";
import { GSAP_MOTION, fontsReadyPromise } from "@/lib/gsap-motion";
import { cn } from "@/lib/utils";

export type AnimatedLinesPhraseHighlight = {
  className: string;
  phrase: string;
};

type AnimatedLinesProps<T extends ElementType = "p"> = {
  as?: T;
  /** If true (default), newline characters become spaces so wrapping follows width only. */
  collapseNewlines?: boolean;
  className?: string;
  delay?: number;
  duration?: number;
  lineClassName?: string;
  /** Wrap exact phrase matches in a span (for SplitType line mode); order is first match wins per phrase. */
  phraseHighlights?: readonly AnimatedLinesPhraseHighlight[];
  stagger?: number;
  text: string;
};

function escapeHtml(raw: string): string {
  return raw
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildSplitTargetHtml(
  plain: string,
  phraseHighlights: readonly AnimatedLinesPhraseHighlight[],
): string {
  let html = escapeHtml(plain);
  for (const { phrase, className } of phraseHighlights) {
    const trimmed = phrase.trim();
    if (!trimmed) {
      continue;
    }
    const escPhrase = escapeHtml(trimmed);
    const escClass = escapeHtml(className.trim());
    if (!html.includes(escPhrase)) {
      continue;
    }
    html = html.replace(escPhrase, `<span class="${escClass}">${escPhrase}</span>`);
  }
  return html;
}

function debounceResize(fn: () => void, ms: number) {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  return () => {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(fn, ms);
  };
}

export function AnimatedLines<T extends ElementType = "p">({
  as,
  className,
  collapseNewlines = true,
  delay = 0.08,
  duration = 1.02,
  lineClassName,
  phraseHighlights,
  stagger = 0.1,
  text,
}: AnimatedLinesProps<T>) {
  const { pageReady } = usePageTransition();
  const Component = (as ?? "p") as ElementType;
  const containerRef = useRef<HTMLElement | null>(null);
  const targetRef = useRef<HTMLSpanElement | null>(null);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const target = targetRef.current;
    if (!container || !target) {
      return;
    }

    let cancelled = false;
    let splitInstance: SplitType | null = null;
    let lineTimeline: gsap.core.Timeline | null = null;
    let gsapCtx: gsap.Context | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let removeMotionListener: (() => void) | undefined;

    let hasRevealed = false;
    let lastWidth = -1;

    const normalizedText = collapseNewlines ? text.replace(/\s*\n+\s*/g, " ").trim() : text;

    const getLines = (): HTMLElement[] =>
      splitInstance?.lines?.filter((el): el is HTMLElement => el instanceof HTMLElement) ?? [];

    const killLineMotion = () => {
      lineTimeline?.kill();
      lineTimeline = null;
      const nodes = getLines();
      if (nodes.length > 0) {
        gsap.killTweensOf(nodes);
      }
    };

    const applyReducedMotion = () => {
      killLineMotion();
      const lineNodes = getLines();
      if (lineNodes.length === 0) {
        return;
      }
      gsap.set(lineNodes, { autoAlpha: 1, yPercent: 0, clearProps: "willChange" });
    };

    const playLineReveal = () => {
      const lineNodes = getLines();
      if (lineNodes.length === 0 || cancelled) {
        return;
      }
      killLineMotion();

      if (!pageReady) {
        gsap.set(lineNodes, { autoAlpha: 0, force3D: true, yPercent: 38 });
        return;
      }

      if (hasRevealed) {
        gsap.set(lineNodes, { autoAlpha: 1, force3D: true, yPercent: 0, clearProps: "willChange" });
        return;
      }

      gsap.set(lineNodes, {
        autoAlpha: 0,
        force3D: true,
        willChange: "transform, opacity",
        yPercent: 38,
      });

      lineTimeline = gsap.timeline({
        defaults: {
          duration,
          ease: "power4.out",
          overwrite: "auto",
        },
        onComplete: () => {
          hasRevealed = true;
          gsap.set(lineNodes, { clearProps: "willChange" });
        },
      });
      lineTimeline.to(lineNodes, {
        autoAlpha: 1,
        delay,
        force3D: true,
        immediateRender: false,
        stagger: { each: stagger },
        yPercent: 0,
      });
    };

    const syncToMotionPreference = () => {
      if (cancelled) {
        return;
      }
      if (window.matchMedia(GSAP_MOTION.reduce).matches) {
        applyReducedMotion();
        return;
      }
      playLineReveal();
    };

    const resplit = () => {
      if (!splitInstance || cancelled) {
        return;
      }
      killLineMotion();
      splitInstance.split({});
      syncToMotionPreference();
    };

    const scheduleResplit = debounceResize(resplit, 200);

    const onWidthChange = (width: number) => {
      if (width === lastWidth || width <= 0) {
        return;
      }
      lastWidth = width;
      scheduleResplit();
    };

    void fontsReadyPromise().then(() => {
      window.requestAnimationFrame(() => {
        if (cancelled || !target) {
          return;
        }

        if (phraseHighlights?.length) {
          target.innerHTML = buildSplitTargetHtml(normalizedText, phraseHighlights);
        } else {
          target.textContent = normalizedText;
        }
        splitInstance = new SplitType(target, {
          lineClass: cn("block", lineClassName),
          tagName: "span",
          types: "lines",
        });

        gsapCtx = gsap.context(() => {
          const mm = gsap.matchMedia();
          mm.add(GSAP_MOTION.reduce, () => {
            applyReducedMotion();
            return () => {
              killLineMotion();
            };
          });
          mm.add(GSAP_MOTION.noPreference, () => {
            syncToMotionPreference();
            return () => {
              killLineMotion();
            };
          });
        }, container);

        lastWidth = container.getBoundingClientRect().width;

        const motionMql = window.matchMedia(GSAP_MOTION.reduce);
        const onPrefChange = () => syncToMotionPreference();
        motionMql.addEventListener("change", onPrefChange);
        removeMotionListener = () => motionMql.removeEventListener("change", onPrefChange);

        resizeObserver = new ResizeObserver((entries) => {
          const entry = entries[0];
          const w = entry?.contentRect.width ?? 0;
          onWidthChange(w);
        });
        resizeObserver.observe(container);
      });
    });

    return () => {
      cancelled = true;
      removeMotionListener?.();
      resizeObserver?.disconnect();
      killLineMotion();
      splitInstance?.revert();
      splitInstance = null;
      gsapCtx?.revert();
      gsapCtx = null;
    };
  }, [
    collapseNewlines,
    delay,
    duration,
    lineClassName,
    pageReady,
    phraseHighlights,
    stagger,
    text,
  ]);

  return (
    <Component ref={containerRef} className={className}>
      <span ref={targetRef} className="sf-split-type-root block w-full" />
    </Component>
  );
}
