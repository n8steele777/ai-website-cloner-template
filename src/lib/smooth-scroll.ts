import type Lenis from "lenis";

declare global {
  interface Window {
    __studioFinityLenis?: Lenis;
  }
}

export function getSmoothScrollInstance() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.__studioFinityLenis ?? null;
}

export function scrollToInstant(target = 0) {
  const lenis = getSmoothScrollInstance();

  if (lenis) {
    lenis.scrollTo(target, { immediate: true });
  }

  window.scrollTo({ top: target, left: 0, behavior: "auto" });
  document.documentElement.scrollTop = target;
  document.body.scrollTop = target;
}

export function scrollToSmooth(target: number) {
  const lenis = getSmoothScrollInstance();

  if (lenis) {
    lenis.scrollTo(target);
    return;
  }

  window.scrollTo({
    top: target,
    left: 0,
    behavior: "smooth",
  });
}
