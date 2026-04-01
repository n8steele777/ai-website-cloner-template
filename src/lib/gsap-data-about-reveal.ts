import gsap from "gsap";
import { GSAP_MOTION, fontsReadyPromise } from "@/lib/gsap-motion";

const REVEAL_ROOT_MARGIN = "0px 0px -12% 0px";
const VIEWPORT_VISIBILITY = 0.96;
const REVEAL_STAGGER_DELAY_EACH = 0.038;
const REVEAL_DURATION = 0.9;
const STAGGER_GROUP_STAGGER_EACH = 0.062;
const STAGGER_GROUP_DURATION = 0.72;

/**
 * Scroll-triggered reveal for `[data-about-reveal]`, optional `[data-about-stagger]` /
 * `[data-about-item]` groups. Uses gsap.context + matchMedia + font-ready rAF.
 */
export function mountDataAboutScrollReveals(root: HTMLElement, pageReady: boolean): () => void {
  let aborted = false;

  const ctx = gsap.context(() => {
    const mm = gsap.matchMedia();

    mm.add(GSAP_MOTION.reduce, () => {
      root
        .querySelectorAll<HTMLElement>(
          "[data-about-reveal], [data-about-stagger], [data-about-item]",
        )
        .forEach((el) => {
          gsap.set(el, { clearProps: "all" });
        });
    });

    mm.add(GSAP_MOTION.noPreference, () => {
      const segmentCleanups: Array<() => void> = [];

      const run = () => {
        if (aborted || !pageReady) {
          return;
        }

        const revealNodes = Array.from(root.querySelectorAll<HTMLElement>("[data-about-reveal]"));
        revealNodes.forEach((node, index) => {
          let observer: IntersectionObserver | null = null;
          let hasAnimated = false;

          const animate = () => {
            if (hasAnimated) {
              return;
            }
            hasAnimated = true;
            gsap.fromTo(
              node,
              {
                autoAlpha: 0,
                y: 28,
                filter: "blur(8px)",
                force3D: true,
              },
              {
                autoAlpha: 1,
                y: 0,
                filter: "blur(0px)",
                duration: REVEAL_DURATION,
                delay: index * REVEAL_STAGGER_DELAY_EACH,
                ease: "power4.out",
                immediateRender: false,
                overwrite: "auto",
                force3D: true,
                clearProps: "opacity,transform,filter,visibility",
              },
            );
          };

          const rect = node.getBoundingClientRect();
          const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
          if (rect.bottom > 0 && rect.top < viewportHeight * VIEWPORT_VISIBILITY) {
            animate();
          } else {
            gsap.set(node, { autoAlpha: 0, y: 28, filter: "blur(8px)", force3D: true });
            observer = new IntersectionObserver(
              (entries) => {
                entries.forEach((entry) => {
                  if (!entry.isIntersecting) {
                    return;
                  }
                  observer?.disconnect();
                  observer = null;
                  animate();
                });
              },
              { threshold: 0, rootMargin: REVEAL_ROOT_MARGIN },
            );
            observer.observe(node);
          }

          segmentCleanups.push(() => {
            observer?.disconnect();
            gsap.killTweensOf(node);
          });
        });

        const staggerGroups = Array.from(root.querySelectorAll<HTMLElement>("[data-about-stagger]"));
        staggerGroups.forEach((group) => {
          const items = Array.from(group.querySelectorAll<HTMLElement>("[data-about-item]"));
          const targetOpacities = items.map(
            (item) => Number.parseFloat(window.getComputedStyle(item).opacity) || 1,
          );

          if (items.length === 0) {
            return;
          }

          let observer: IntersectionObserver | null = null;
          let hasAnimated = false;

          const animate = () => {
            if (hasAnimated) {
              return;
            }
            hasAnimated = true;
            gsap.fromTo(
              items,
              { opacity: 0, y: 22, force3D: true },
              {
                opacity: (i) => targetOpacities[i] ?? 1,
                y: 0,
                duration: STAGGER_GROUP_DURATION,
                ease: "power4.out",
                stagger: { each: STAGGER_GROUP_STAGGER_EACH },
                immediateRender: false,
                overwrite: "auto",
                force3D: true,
                clearProps: "opacity,transform",
              },
            );
          };

          const rect = group.getBoundingClientRect();
          const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
          if (rect.bottom > 0 && rect.top < viewportHeight * VIEWPORT_VISIBILITY) {
            animate();
          } else {
            gsap.set(items, { opacity: 0, y: 22, force3D: true });
            observer = new IntersectionObserver(
              (entries) => {
                entries.forEach((entry) => {
                  if (!entry.isIntersecting) {
                    return;
                  }
                  observer?.disconnect();
                  observer = null;
                  animate();
                });
              },
              { threshold: 0, rootMargin: REVEAL_ROOT_MARGIN },
            );
            observer.observe(group);
          }

          segmentCleanups.push(() => {
            observer?.disconnect();
            gsap.killTweensOf(items);
          });
        });
      };

      void fontsReadyPromise().then(() => {
        window.requestAnimationFrame(() => {
          if (aborted) {
            return;
          }
          run();
        });
      });

      return () => {
        segmentCleanups.forEach((c) => c());
      };
    });
  }, root);

  return () => {
    aborted = true;
    ctx.revert();
  };
}
