/** Shared GSAP + accessibility constants for scroll and hero animations. */

export const GSAP_MOTION = {
  reduce: "(prefers-reduced-motion: reduce)",
  noPreference: "(prefers-reduced-motion: no-preference)",
} as const;

export function fontsReadyPromise(): Promise<unknown> {
  return "fonts" in document ? document.fonts.ready.catch(() => undefined) : Promise.resolve();
}
