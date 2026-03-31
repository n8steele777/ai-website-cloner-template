"use client";

import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";

export function SmoothScrollProvider({
  children,
}: {
  children: ReactNode;
}) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const lenis = new Lenis({
      autoRaf: true,
      gestureOrientation: "vertical",
      lerp: 0.085,
      smoothWheel: true,
      syncTouch: false,
      touchMultiplier: 1,
      wheelMultiplier: 0.9,
    });

    window.__studioFinityLenis = lenis;
    document.documentElement.classList.add("lenis");

    return () => {
      delete window.__studioFinityLenis;
      document.documentElement.classList.remove("lenis");
      lenis.destroy();
    };
  }, []);

  return children;
}
