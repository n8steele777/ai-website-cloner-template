"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import gsap from "gsap";
import { scrollToInstant } from "@/lib/smooth-scroll";

interface PageTransitionContextValue {
  canTransitionHref: (href: string) => boolean;
  contentRef: RefObject<HTMLDivElement | null>;
  navigateWithTransition: (href: string) => void;
  pageReady: boolean;
  prefetchHref: (href: string) => void;
}

type TransitionClickEvent = {
  altKey: boolean;
  button: number;
  ctrlKey: boolean;
  defaultPrevented: boolean;
  metaKey: boolean;
  shiftKey: boolean;
};

const PageTransitionContext = createContext<PageTransitionContextValue | null>(null);

function isModifiedEvent(event: TransitionClickEvent) {
  return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
}

function isWorkDetailHref(href: string) {
  return /^\/work\/[^/]+$/.test(href);
}

export function PageTransitionProvider({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const contentRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const veilRef = useRef<HTMLDivElement>(null);
  const previousPathRef = useRef(pathname);
  const pendingHrefRef = useRef<string | null>(null);
  const isTransitioningRef = useRef(false);
  const [pageReady, setPageReady] = useState(true);

  const canTransitionHref = useCallback(
    (href: string) => {
      if (typeof href !== "string" || href.length === 0 || !href.startsWith("/")) {
        return false;
      }

      if (href === pathname || href.startsWith("#")) {
        return false;
      }

      if (isWorkDetailHref(href)) {
        return false;
      }

      return true;
    },
    [pathname],
  );

  const prefetchHref = useCallback(
    (href: string) => {
      if (!canTransitionHref(href)) {
        return;
      }

      router.prefetch(href);
    },
    [canTransitionHref, router],
  );

  const resetOverlay = useCallback(() => {
    const overlay = overlayRef.current;
    const veil = veilRef.current;
    const content = contentRef.current;

    if (!overlay || !veil || !content) {
      return;
    }

    gsap.set(overlay, { autoAlpha: 0, pointerEvents: "none" });
    gsap.set(veil, { autoAlpha: 0 });
    gsap.set(content, { clearProps: "opacity,transform,filter" });
  }, []);

  const navigateWithTransition = useCallback(
    (href: string) => {
      if (!canTransitionHref(href) || isTransitioningRef.current) {
        router.push(href);
        return;
      }

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        router.push(href);
        return;
      }

      const overlay = overlayRef.current;
      const veil = veilRef.current;
      const content = contentRef.current;

      if (!overlay || !veil || !content) {
        router.push(href);
        return;
      }

      pendingHrefRef.current = href;
      isTransitioningRef.current = true;
      setPageReady(false);

      const timeline = gsap.timeline();

      timeline.set(overlay, { autoAlpha: 1, pointerEvents: "auto" });
      timeline.set(veil, { autoAlpha: 0, backdropFilter: "blur(0px)" });
      timeline.to(
        content,
        {
          duration: 0.52,
          ease: "power4.out",
          filter: "blur(12px)",
          opacity: 0.72,
          y: -12,
        },
        0,
      );
      timeline.to(
        veil,
        {
          autoAlpha: 1,
          backdropFilter: "blur(22px)",
          duration: 0.58,
          ease: "power3.out",
        },
        0,
      );
      timeline.add(() => {
        router.push(href, { scroll: true });
      }, 0.36);
    },
    [canTransitionHref, router],
  );

  useEffect(() => {
    if (previousPathRef.current === pathname) {
      return;
    }

    previousPathRef.current = pathname;
    scrollToInstant(0);

    const pendingHref = pendingHrefRef.current;
    if (!pendingHref) {
      resetOverlay();
      requestAnimationFrame(() => {
        setPageReady(true);
      });
      return;
    }

    const overlay = overlayRef.current;
    const veil = veilRef.current;
    const content = contentRef.current;

    if (!overlay || !veil || !content) {
      pendingHrefRef.current = null;
      isTransitioningRef.current = false;
      requestAnimationFrame(() => {
        setPageReady(true);
      });
      return;
    }

    const timeline = gsap.timeline({
      onComplete: () => {
        pendingHrefRef.current = null;
        isTransitioningRef.current = false;
        setPageReady(true);
        resetOverlay();
      },
    });

    timeline.set(content, {
      filter: "blur(12px)",
      opacity: 0,
      y: 18,
    });
    timeline.to(
      veil,
      {
        autoAlpha: 0,
        backdropFilter: "blur(0px)",
        duration: 0.48,
        ease: "power3.out",
      },
      0.05,
    );
    timeline.add(() => {
      setPageReady(true);
    }, 0.15);
    timeline.to(
      content,
      {
        duration: 0.72,
        ease: "power4.out",
        filter: "blur(0px)",
        opacity: 1,
        y: 0,
      },
      0.15,
    );
    timeline.set(overlay, { pointerEvents: "none" });
  }, [pathname, resetOverlay]);

  const value = useMemo<PageTransitionContextValue>(
    () => ({
      canTransitionHref,
      contentRef,
      navigateWithTransition,
      pageReady,
      prefetchHref,
    }),
    [canTransitionHref, navigateWithTransition, pageReady, prefetchHref],
  );

  return (
    <PageTransitionContext.Provider value={value}>
      {children}
      <div
        ref={overlayRef}
        className="pointer-events-none fixed inset-0 z-500 opacity-0"
        aria-hidden="true"
      >
        <div
          ref={veilRef}
          className="absolute inset-0 bg-background/94 backdrop-blur-[22px]"
        />
      </div>
    </PageTransitionContext.Provider>
  );
}

export function usePageTransition() {
  const context = useContext(PageTransitionContext);

  if (!context) {
    throw new Error("usePageTransition must be used within a PageTransitionProvider");
  }

  return context;
}

export function shouldHandleTransitionClick(
  href: string,
  event: TransitionClickEvent,
  canTransitionHref: (href: string) => boolean,
) {
  if (typeof href !== "string" || href.length === 0) {
    return false;
  }

  if (event.defaultPrevented) {
    return false;
  }

  if (event.button !== 0 || isModifiedEvent(event)) {
    return false;
  }

  return canTransitionHref(href);
}
