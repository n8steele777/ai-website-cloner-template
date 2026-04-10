"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { useCaseStudyTransition } from "@/components/case-study-transition-provider";
import { StudioFinityHeader } from "@/components/studio-finity-header";
import { scrollToInstant } from "@/lib/smooth-scroll";
import {
  WORK_INDEX_GRID_GAP_CLASSNAME,
  WORK_INDEX_GRID_IMAGE_SIZES,
  WorkIndexTileContent,
} from "@/components/work-index-tile";
import { getWorkIndexCardBorderRadiusPx } from "@/lib/work-hero-frame";
import { cn } from "@/lib/utils";
import type { CaseStudy, NavLink } from "@/types/offmenu";

interface OffMenuHomepageProps {
  caseStudies: CaseStudy[];
  heroWords: string[];
  navigationLinks: NavLink[];
  resourceLinks: NavLink[];
}

export function OffMenuHomepage({
  caseStudies,
  heroWords: _heroWords,
  navigationLinks,
  resourceLinks: _resourceLinks,
}: OffMenuHomepageProps) {
  void _heroWords;
  void _resourceLinks;

  const gridSectionRef = useRef<HTMLElement>(null);
  const thumbRefs = useRef<Array<HTMLDivElement | null>>([]);
  const openingRef = useRef(false);
  const didIntroRef = useRef(false);

  const { prefetchCaseStudy, startCaseStudyTransition, state: transitionState } =
    useCaseStudyTransition();

  const n = caseStudies.length;

  useLayoutEffect(() => {
    scrollToInstant(0);
    openingRef.current = false;
  }, []);

  useLayoutEffect(() => {
    if (transitionState.isTransitioning) {
      return;
    }
    openingRef.current = false;
  }, [transitionState.isTransitioning]);

  useEffect(() => {
    if (n === 0 || didIntroRef.current) {
      return;
    }

    let cancelled = false;
    let revertIntro: (() => void) | undefined;
    let innerRaf = 0;

    const outerRaf = requestAnimationFrame(() => {
      innerRaf = requestAnimationFrame(() => {
        if (cancelled || didIntroRef.current) {
          return;
        }

        const root = gridSectionRef.current;
        const cards = root?.querySelectorAll("[data-work-card]");
        if (!root || !cards?.length) {
          return;
        }

        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        didIntroRef.current = true;

        if (reduceMotion) {
          gsap.set(cards, { opacity: 1, y: 0, filter: "none" });
          return;
        }

        const intro = gsap.context(() => {
          gsap.fromTo(
            cards,
            {
              opacity: 0,
              y: 28,
              filter: "blur(10px)",
              force3D: true,
            },
            {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              duration: 1.42,
              ease: "power4.out",
              stagger: { each: 0.1, from: "start" },
            },
          );
        }, root);

        revertIntro = () => {
          intro.revert();
        };
      });
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(outerRaf);
      cancelAnimationFrame(innerRaf);
      revertIntro?.();
    };
  }, [n]);

  function openCaseStudy(index: number) {
    const caseStudy = caseStudies[index];
    const thumb = thumbRefs.current[index];

    if (!thumb || !caseStudy || openingRef.current || transitionState.isTransitioning) {
      return;
    }

    const bounds = thumb.getBoundingClientRect();
    const cornerPx = getWorkIndexCardBorderRadiusPx();

    const didStart = startCaseStudyTransition({
      element: thumb,
      slug: caseStudy.slug,
      href: caseStudy.href,
      sourceBounds: {
        height: bounds.height,
        left: bounds.left,
        top: bounds.top,
        width: bounds.width,
      },
      thumbnail: caseStudy.thumbnailLight,
      thumbnailXl: caseStudy.thumbnailLightXl,
      sourceBorderRadiusPx: cornerPx,
      sourceRadius: `${cornerPx}px`,
    });

    if (!didStart) {
      return;
    }

    openingRef.current = true;
  }

  if (n === 0) {
    return (
      <StudioFinityHeader activeHref="/work" links={navigationLinks}>
        <main className="flex min-h-screen items-center justify-center bg-background pt-14 md:pt-17">
          <p className="text-foreground/60 text-sm">No projects yet.</p>
        </main>
      </StudioFinityHeader>
    );
  }

  return (
    <StudioFinityHeader activeHref="/work" links={navigationLinks}>
      <main className="min-h-screen bg-background pt-16 md:pt-17">
        <section
          ref={gridSectionRef}
          className="mx-auto w-full max-w-[min(100%,2200px)] px-4 pb-4 pt-10 sm:px-6 sm:pb-6 sm:pt-8 md:p-8 lg:p-10 xl:p-12 2xl:p-14"
        >
          <ul
            className={cn(
              "grid list-none",
              WORK_INDEX_GRID_GAP_CLASSNAME,
              "grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5",
            )}
          >
            {caseStudies.map((caseStudy, index) => {
              const imageSrc = caseStudy.thumbnailLightXl || caseStudy.thumbnailLight;

              return (
                <li key={caseStudy.slug} data-work-card="" className="min-w-0">
                  <Link
                    href={
                      typeof caseStudy.href === "string" && caseStudy.href.length > 0
                        ? caseStudy.href
                        : "/"
                    }
                    aria-label={`Open ${caseStudy.title}`}
                    className="group block touch-manipulation outline-none sf-no-tap-highlight focus-visible:ring-2 focus-visible:ring-foreground/12 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    onMouseEnter={() => prefetchCaseStudy(caseStudy.href)}
                    onFocus={() => prefetchCaseStudy(caseStudy.href)}
                    onClick={(event) => {
                      event.preventDefault();
                      openCaseStudy(index);
                    }}
                    onKeyDown={(event) => {
                      if (event.key !== "Enter" && event.key !== " ") {
                        return;
                      }
                      event.preventDefault();
                      openCaseStudy(index);
                    }}
                  >
                    <WorkIndexTileContent
                      imageSrc={imageSrc}
                      imageAlt=""
                      density="workGrid"
                      lqip={caseStudy.thumbnailLqip}
                      priority={index < 9}
                      quality={95}
                      sizes={WORK_INDEX_GRID_IMAGE_SIZES}
                      thumbRef={(element) => {
                        thumbRefs.current[index] = element;
                      }}
                      title={caseStudy.title}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      </main>
    </StudioFinityHeader>
  );
}
