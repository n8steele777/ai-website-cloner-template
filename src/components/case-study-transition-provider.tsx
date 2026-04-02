"use client";

/* eslint-disable @next/next/no-img-element */

// Native <img>: fixed overlay “flight” uses seamless src swaps and opacity handoff.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { flushSync } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import gsap from "gsap";
import { getSmoothScrollInstance, scrollToInstant } from "@/lib/smooth-scroll";
import { getWorkHeroTargetRect } from "@/lib/work-hero-frame";

interface TransitionRequest {
  element: HTMLElement;
  href: string;
  slug: string;
  sourceBounds?: FrozenBounds;
  thumbnail: string;
  thumbnailXl?: string;
  /** Card / thumbnail corner radius in px (grid tiles). Omit for circle (50%) handoff. */
  sourceBorderRadiusPx?: number;
  sourceRadius?: string;
}

interface FrozenBounds {
  height: number;
  left: number;
  top: number;
  width: number;
}

interface TransitionState {
  href: string;
  isTransitioning: boolean;
  slug: string | null;
  sourceBorderRadiusPx: number | null;
  sourceBounds: FrozenBounds | null;
  sourceRadius: string;
  thumbnail: string | null;
  thumbnailXl: string | null;
}

interface CaseStudyTransitionContextValue {
  prefetchCaseStudy: (href: string) => void;
  signalHeroReady: () => void;
  startCaseStudyTransition: (request: TransitionRequest) => void;
  state: TransitionState;
}

const defaultState: TransitionState = {
  href: "",
  isTransitioning: false,
  slug: null,
  sourceBorderRadiusPx: null,
  sourceBounds: null,
  sourceRadius: "50%",
  thumbnail: null,
  thumbnailXl: null,
};

const CaseStudyTransitionContext = createContext<CaseStudyTransitionContextValue | null>(null);

function scrollToTopNow() {
  scrollToInstant(0);
}

function roundPixelRect(bounds: FrozenBounds): FrozenBounds {
  return {
    height: Math.round(bounds.height),
    left: Math.round(bounds.left),
    top: Math.round(bounds.top),
    width: Math.round(bounds.width),
  };
}

export function CaseStudyTransitionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const overlayRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const sourceElementRef = useRef<HTMLElement | null>(null);
  const completionResolverRef = useRef<(() => void) | null>(null);
  const completionTimeoutRef = useRef<number | null>(null);
  const previousPathRef = useRef(pathname);
  const startedRef = useRef(false);
  const [state, setState] = useState<TransitionState>(defaultState);

  useEffect(() => {
    if (pathname !== previousPathRef.current) {
      scrollToTopNow();
      requestAnimationFrame(() => {
        scrollToTopNow();
      });
      previousPathRef.current = pathname;
    }
  }, [pathname]);

  const cleanupTransition = useCallback(() => {
    if (completionTimeoutRef.current !== null) {
      window.clearTimeout(completionTimeoutRef.current);
      completionTimeoutRef.current = null;
    }

    if (sourceElementRef.current) {
      sourceElementRef.current.style.opacity = "";
      sourceElementRef.current = null;
    }

    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";

    completionResolverRef.current = null;
    startedRef.current = false;
    setState(defaultState);
    getSmoothScrollInstance()?.start();
  }, []);

  const signalHeroReady = useCallback(() => {
    completionResolverRef.current?.();
    completionResolverRef.current = null;
  }, []);

  const navigateToWorkPage = useCallback(
    (href: string) => {
      scrollToTopNow();
      router.push(href, { scroll: true });

      const pending = new Promise<void>((resolve) => {
        completionResolverRef.current = resolve;
      });

      completionTimeoutRef.current = window.setTimeout(() => {
        completionResolverRef.current?.();
        completionResolverRef.current = null;
      }, 2000);

      pending.then(() => {
        cleanupTransition();
      });
    },
    [cleanupTransition, router],
  );

  useLayoutEffect(() => {
    if (!state.isTransitioning || !state.sourceBounds || !overlayRef.current) {
      return;
    }

    const overlay = overlayRef.current;
    const backdrop = backdropRef.current;
    gsap.killTweensOf(overlay);
    if (backdrop) {
      gsap.killTweensOf(backdrop);
    }

    const sourceBounds = roundPixelRect(state.sourceBounds);
    const sourceRadius = state.sourceRadius || "50%";
    const target = getWorkHeroTargetRect();

    if (sourceElementRef.current) {
      sourceElementRef.current.style.opacity = "0";
    }

    const tw = target.width;
    const th = target.height;
    const isCircle =
      state.sourceBorderRadiusPx == null &&
      sourceRadius === "50%" &&
      Math.abs(sourceBounds.width - sourceBounds.height) <= 1;
    const fromBorderRadius =
      state.sourceBorderRadiusPx != null
        ? state.sourceBorderRadiusPx
        : isCircle
          ? sourceBounds.width / 2
          : target.borderRadius;

    // Animate width/height/position — not scaleX/scaleY. The card thumb is square and the hero is
    // a wider frame; non-uniform scale distorts object-cover and jumps the crop vs the grid tile.
    gsap.set(overlay, {
      borderRadius: fromBorderRadius,
      height: sourceBounds.height,
      left: sourceBounds.left,
      overflow: "hidden",
      position: "fixed",
      top: sourceBounds.top,
      width: sourceBounds.width,
      x: 0,
      y: 0,
      scaleX: 1,
      scaleY: 1,
    });

    if (backdrop) {
      gsap.fromTo(
        backdrop,
        { opacity: 0 },
        {
          opacity: 0.28,
          duration: 0.56,
          ease: "power3.out",
        },
      );
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      navigateToWorkPage(state.href);
      return () => {
        gsap.killTweensOf(overlay);
        if (backdrop) {
          gsap.killTweensOf(backdrop);
        }
      };
    }

    gsap.to(overlay, {
      borderRadius: target.borderRadius,
      duration: isCircle ? 1.02 : 0.98,
      ease: "power3.inOut",
      height: th,
      left: target.left,
      top: target.top,
      width: tw,
      onComplete: () => {
        navigateToWorkPage(state.href);
      },
    });

    return () => {
      gsap.killTweensOf(overlay);
      if (backdrop) {
        gsap.killTweensOf(backdrop);
      }
    };
  }, [
    navigateToWorkPage,
    state.href,
    state.isTransitioning,
    state.sourceBorderRadiusPx,
    state.sourceBounds,
    state.sourceRadius,
  ]);

  const contextValue = useMemo<CaseStudyTransitionContextValue>(
    () => ({
      prefetchCaseStudy: (href) => {
        if (typeof href !== "string" || href.length === 0) {
          return;
        }
        router.prefetch(href);
      },
      signalHeroReady,
      startCaseStudyTransition: (request) => {
        if (startedRef.current) {
          return;
        }

        const bounds =
          request.sourceBounds ??
          (() => {
            const rect = request.element.getBoundingClientRect();

            return {
              height: rect.height,
              left: rect.left,
              top: rect.top,
              width: rect.width,
            };
          })();

        sourceElementRef.current = request.element;
        startedRef.current = true;

        flushSync(() => {
          setState({
            href: request.href,
            isTransitioning: true,
            slug: request.slug,
            sourceBorderRadiusPx:
              request.sourceBorderRadiusPx != null ? request.sourceBorderRadiusPx : null,
            sourceBounds: bounds,
            sourceRadius: request.sourceRadius ?? "50%",
            thumbnail: request.thumbnail,
            thumbnailXl: request.thumbnailXl ?? null,
          });
        });

        getSmoothScrollInstance()?.stop();
        void sourceElementRef.current.offsetHeight;
        document.documentElement.style.overflow = "hidden";
        document.body.style.overflow = "hidden";

        if (request.thumbnailXl && request.thumbnailXl !== request.thumbnail) {
          const image = new window.Image();
          image.decoding = "async";
          image.src = request.thumbnailXl;
        }
      },
      state,
    }),
    [router, signalHeroReady, state],
  );

  return (
    <CaseStudyTransitionContext.Provider value={contextValue}>
      {children}
      {state.isTransitioning && state.thumbnail && state.sourceBounds ? (
        <div className="pointer-events-none fixed inset-0 z-280">
        <div ref={backdropRef} className="absolute inset-0 bg-background opacity-0" />
        <div
          ref={overlayRef}
          className="relative isolate will-change-transform"
          style={{
            overflow: "hidden",
            position: "fixed",
          }}
        >
            <img
              src={state.thumbnailXl ?? state.thumbnail}
              alt=""
              decoding="async"
              fetchPriority="high"
              className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center"
            />
          </div>
        </div>
      ) : null}
    </CaseStudyTransitionContext.Provider>
  );
}

export function useCaseStudyTransition() {
  const context = useContext(CaseStudyTransitionContext);

  if (!context) {
    throw new Error("useCaseStudyTransition must be used within CaseStudyTransitionProvider");
  }

  return context;
}
