"use client";

/* eslint-disable @next/next/no-img-element */

// Native <img>: fixed overlay “flight” uses seamless src swaps and opacity handoff.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { flushSync } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import gsap from "gsap";
import { scrollToInstant } from "@/lib/smooth-scroll";

interface TransitionRequest {
  element: HTMLElement;
  href: string;
  slug: string;
  sourceBounds?: FrozenBounds;
  thumbnail: string;
  thumbnailXl?: string;
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
  sourceBounds: FrozenBounds | null;
  sourceRadius: string;
  thumbnail: string | null;
  thumbnailXl: string | null;
  thumbnailXlLoaded: boolean;
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
  sourceBounds: null,
  sourceRadius: "50%",
  thumbnail: null,
  thumbnailXl: null,
  thumbnailXlLoaded: false,
};

const CaseStudyTransitionContext = createContext<CaseStudyTransitionContextValue | null>(null);

function scrollToTopNow() {
  scrollToInstant(0);
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

  useEffect(() => {
    if (!state.isTransitioning || !state.sourceBounds || !overlayRef.current || startedRef.current) {
      return;
    }

    startedRef.current = true;

    const overlay = overlayRef.current;
    const sourceBounds = state.sourceBounds;
    const sourceRadius = state.sourceRadius || "50%";

    if (sourceElementRef.current) {
      sourceElementRef.current.style.opacity = "0";
    }

    gsap.set(overlay, {
      position: "fixed",
      top: sourceBounds.top,
      left: sourceBounds.left,
      width: sourceBounds.width,
      height: sourceBounds.height,
      borderRadius: sourceRadius,
      overflow: "hidden",
    });

    if (backdropRef.current) {
      gsap.fromTo(
        backdropRef.current,
        { opacity: 0 },
        {
          opacity: 0.28,
          duration: 0.45,
          ease: "power2.out",
        },
      );
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      navigateToWorkPage(state.href);
      return;
    }

    const targetWidth = window.innerWidth - 32;
    const targetHeight = window.innerHeight - 96;

    if (sourceRadius === "50%") {
      const sourceCenterX = sourceBounds.left + sourceBounds.width / 2;
      const sourceCenterY = sourceBounds.top + sourceBounds.height / 2;
      const finalCenterX = 16 + targetWidth / 2;
      const finalCenterY = 80 + targetHeight / 2;

      const stageOneWidth = sourceBounds.width * 1.03;
      const stageOneHeight = sourceBounds.height * 0.97;
      const stageTwoWidth = Math.max(sourceBounds.width * 1.32, window.innerWidth * 0.5);
      const stageTwoHeight = Math.max(sourceBounds.height * 0.72, window.innerHeight * 0.5);
      const stageThreeWidth = Math.max(sourceBounds.width * 1.56, window.innerWidth * 0.58);
      const stageThreeHeight = Math.max(sourceBounds.height * 0.82, window.innerHeight * 0.56);

      const stageOneCenterX = gsap.utils.interpolate(sourceCenterX, finalCenterX, 0.08);
      const stageOneCenterY = gsap.utils.interpolate(sourceCenterY, finalCenterY, 0.08);
      const stageTwoCenterX = gsap.utils.interpolate(sourceCenterX, finalCenterX, 0.2);
      const stageTwoCenterY = gsap.utils.interpolate(sourceCenterY, finalCenterY, 0.24);
      const stageThreeCenterX = gsap.utils.interpolate(sourceCenterX, finalCenterX, 0.36);
      const stageThreeCenterY = gsap.utils.interpolate(sourceCenterY, finalCenterY, 0.42);

      const timeline = gsap.timeline({
        onComplete: () => {
          navigateToWorkPage(state.href);
        },
      });

      timeline.to(overlay, {
        top: stageOneCenterY - stageOneHeight / 2,
        left: stageOneCenterX - stageOneWidth / 2,
        width: stageOneWidth,
        height: stageOneHeight,
        borderRadius: `${stageOneWidth / 2}px`,
        duration: 0.14,
        ease: "power2.out",
      });

      timeline.to(overlay, {
        top: stageTwoCenterY - stageTwoHeight / 2,
        left: stageTwoCenterX - stageTwoWidth / 2,
        width: stageTwoWidth,
        height: stageTwoHeight,
        borderRadius: "180px",
        duration: 0.24,
        ease: "power3.inOut",
      });

      timeline.to(overlay, {
        top: stageThreeCenterY - stageThreeHeight / 2,
        left: stageThreeCenterX - stageThreeWidth / 2,
        width: stageThreeWidth,
        height: stageThreeHeight,
        borderRadius: "108px",
        duration: 0.32,
        ease: "power3.inOut",
      });

      timeline.to(overlay, {
        top: 80,
        left: 16,
        width: targetWidth,
        height: targetHeight,
        borderRadius: "24px",
        duration: 0.42,
        ease: "power4.inOut",
      });

      timeline.to({}, { duration: 0.12 });

      return;
    }

    gsap.to(overlay, {
      top: 80,
      left: 16,
      width: targetWidth,
      height: targetHeight,
      borderRadius: "24px",
      duration: 0.7,
      ease: "power2.inOut",
      onComplete: () => {
        navigateToWorkPage(state.href);
      },
    });
  }, [navigateToWorkPage, state]);

  const contextValue = useMemo<CaseStudyTransitionContextValue>(
    () => ({
      prefetchCaseStudy: (href) => {
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

        flushSync(() => {
          setState({
            href: request.href,
            isTransitioning: true,
            slug: request.slug,
            sourceBounds: bounds,
            sourceRadius: request.sourceRadius ?? "50%",
            thumbnail: request.thumbnail,
            thumbnailXl: request.thumbnailXl ?? null,
            thumbnailXlLoaded: false,
          });
        });

        void sourceElementRef.current.offsetHeight;
        document.documentElement.style.overflow = "hidden";
        document.body.style.overflow = "hidden";

        if (request.thumbnailXl && request.thumbnailXl !== request.thumbnail) {
          const image = new window.Image();
          image.decoding = "async";
          image.onload = () => {
            setState((current) =>
              current.slug === request.slug
                ? { ...current, thumbnailXlLoaded: true }
                : current,
            );
          };
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
        <div className="pointer-events-none fixed inset-0 z-40">
        <div ref={backdropRef} className="absolute inset-0 bg-background opacity-0" />
        <div
          ref={overlayRef}
          className="relative will-change-[transform,border-radius]"
          style={{
              position: "fixed",
              top: state.sourceBounds.top,
              left: state.sourceBounds.left,
              width: state.sourceBounds.width,
              height: state.sourceBounds.height,
              borderRadius: state.sourceRadius,
              overflow: "hidden",
            }}
          >
            <img
              src={state.thumbnail}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
            {state.thumbnailXl ? (
              <img
                src={state.thumbnailXl}
                alt=""
                className="absolute inset-0 h-full w-full object-cover transition-opacity duration-300"
                style={{ opacity: Number(state.thumbnailXlLoaded) }}
              />
            ) : null}
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
