"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import gsap from "gsap";
import { AnimatedWords } from "@/components/animated-words";
import { useCaseStudyTransition } from "@/components/case-study-transition-provider";
import { StudioFinityFullPageFooter } from "@/components/studio-finity-full-page-footer";
import { StudioFinityHeader } from "@/components/studio-finity-header";
import {
  WORK_INDEX_GRID_GAP_CLASSNAME,
  WORK_INDEX_GRID_IMAGE_SIZES,
  WorkIndexTileContent,
  WorkIndexTileMedia,
} from "@/components/work-index-tile";
import { fontsReadyPromise, GSAP_MOTION } from "@/lib/gsap-motion";
import { getWorkIndexCardBorderRadiusPx } from "@/lib/work-hero-frame";
import { offMenuHeroWords } from "@/lib/site-data";
import { cn } from "@/lib/utils";
import type {
  CosmosFeatureSection,
  CosmosHomepageData,
  CosmosMediaItem,
} from "@/types/cosmos";

interface CosmosHomepageProps {
  data: CosmosHomepageData;
}

type WhirlSizeName = "small" | "medium" | "large";

type WhirlImageConfig = {
  id: number;
  size: WhirlSizeName;
  src: string;
};

type WhirlSizeConfig = {
  area: number;
  height: number;
  width: number;
};

type SpiralPoint = {
  x: number;
  y: number;
};

type SpiralPath = {
  points: SpiralPoint[];
  tangents: SpiralPoint[];
  size: number;
};

const HERO_TURNS = 8;
const HERO_BASE_CAMERA_SIZE = 2500;
const HERO_PATH_RADIUS = 0.75 * HERO_BASE_CAMERA_SIZE;
const HERO_BURST = {
  duration: 3200,
  multiplier: 24,
  rampUp: 700,
};
const HERO_WHILR_SIZES: Record<WhirlSizeName, WhirlSizeConfig> = {
  small: { width: 56, height: 72, area: 9632 },
  medium: { width: 72, height: 96, area: 19111 },
  large: { width: 80, height: 120, area: 18700 },
};
const HERO_WHILR_SIZE_CYCLE: WhirlSizeName[] = ["medium", "large", "small"];

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function mapRange(
  value: number,
  inputMin: number,
  inputMax: number,
  outputMin: number,
  outputMax: number,
) {
  if (inputMax === inputMin) {
    return outputMax;
  }

  return outputMin + clamp((value - inputMin) / (inputMax - inputMin)) * (outputMax - outputMin);
}

function wrapRange(min: number, max: number, value: number) {
  const range = max - min;
  return ((value - min) % range + range) % range + min;
}

function spiralArcLength(turns: number, radius: number) {
  const tau = Math.PI * 2;
  let length = 0;
  let previousX = radius;
  let previousY = 0;

  for (let step = 1; step <= 1000; step += 1) {
    const progress = step / 1000;
    const angle = progress * turns * tau;
    const spiralRadius = radius * (1 - progress);
    const x = spiralRadius * Math.cos(angle);
    const y = -spiralRadius * Math.sin(angle);
    const dx = x - previousX;
    const dy = y - previousY;

    length += Math.sqrt(dx * dx + dy * dy);
    previousX = x;
    previousY = y;
  }

  return length;
}

function buildSpiralPath(turns: number, radius: number, detail = 4096): SpiralPath {
  const tau = Math.PI * 2;
  const rawPoints: SpiralPoint[] = [];
  const lengths = [0];

  for (let step = 0; step <= 16384; step += 1) {
    const progress = step / 16384;
    const angle = progress * turns * tau;
    const spiralRadius = radius * (1 - progress);
    const point = {
      x: spiralRadius * Math.cos(angle),
      y: -spiralRadius * Math.sin(angle),
    };

    rawPoints.push(point);

    if (step > 0) {
      const previous = rawPoints[step - 1];
      const dx = point.x - previous.x;
      const dy = point.y - previous.y;
      lengths.push(lengths[step - 1] + Math.sqrt(dx * dx + dy * dy));
    }
  }

  const totalLength = lengths[lengths.length - 1] ?? 0;
  const points: SpiralPoint[] = new Array(detail + 1);
  const tangents: SpiralPoint[] = new Array(detail + 1);
  let searchIndex = 0;

  for (let step = 0; step <= detail; step += 1) {
    const targetLength = (step / detail) * totalLength;

    while (searchIndex < 16384 && (lengths[searchIndex + 1] ?? 0) < targetLength) {
      searchIndex += 1;
    }

    const startLength = lengths[searchIndex] ?? 0;
    const endLength = lengths[searchIndex + 1] ?? startLength;
    const segmentProgress = endLength > startLength ? (targetLength - startLength) / (endLength - startLength) : 0;

    const startPoint = rawPoints[searchIndex] ?? rawPoints[rawPoints.length - 1] ?? { x: 0, y: 0 };
    const endPoint = rawPoints[Math.min(searchIndex + 1, 16384)] ?? startPoint;

    const x = startPoint.x + (endPoint.x - startPoint.x) * segmentProgress;
    const y = startPoint.y + (endPoint.y - startPoint.y) * segmentProgress;
    points[step] = { x, y };

    const pathProgress = (searchIndex + segmentProgress) / 16384;
    const angle = pathProgress * turns * tau;
    const spiralRadius = radius * (1 - pathProgress);
    const angleVelocity = turns * tau;
    const tangentX = -radius * Math.cos(angle) - spiralRadius * Math.sin(angle) * angleVelocity;
    const tangentY = radius * Math.sin(angle) - spiralRadius * Math.cos(angle) * angleVelocity;
    const tangentLength = Math.sqrt(tangentX * tangentX + tangentY * tangentY) || 1;

    tangents[step] = {
      x: tangentX / tangentLength,
      y: tangentY / tangentLength,
    };
  }

  return {
    points,
    size: detail,
    tangents,
  };
}

function getSizeFromArea(image: HTMLImageElement, size: WhirlSizeConfig) {
  if (!image.naturalWidth || !image.naturalHeight || !size.area) {
    return { width: size.width, height: size.height };
  }

  const aspectRatio = image.naturalWidth / image.naturalHeight;
  const height = Math.sqrt(size.area / aspectRatio);
  return {
    width: height * aspectRatio,
    height,
  };
}

function buildHeroWhirlImages(imageUrls: string[]): WhirlImageConfig[] {
  const imageCount = Math.max(10, Math.ceil(spiralArcLength(HERO_TURNS, HERO_PATH_RADIUS) / 250));

  return Array.from({ length: imageCount }, (_, index) => ({
    id: index,
    size: HERO_WHILR_SIZE_CYCLE[index % HERO_WHILR_SIZE_CYCLE.length]!,
    src: imageUrls[index % imageUrls.length]!,
  }));
}

function getHeroHeadlineThreshold(viewportHeight: number) {
  return 265 / (2 * viewportHeight) + 0.02;
}

export function CosmosHomepage({ data }: CosmosHomepageProps) {
  const [heroScrollProgress, setHeroScrollProgress] = useState(0);
  const [heroViewportHeight, setHeroViewportHeight] = useState(900);
  const [heroViewportWidth, setHeroViewportWidth] = useState(1440);
  const [activePrincipleIndex, setActivePrincipleIndex] = useState(0);
  const featuredThumbRefs = useRef<Array<HTMLDivElement | null>>([]);
  const featuredOpeningRef = useRef(false);
  const { prefetchCaseStudy, startCaseStudyTransition, state: caseStudyTransitionState } =
    useCaseStudyTransition();

  useLayoutEffect(() => {
    if (caseStudyTransitionState.isTransitioning) {
      return;
    }
    featuredOpeningRef.current = false;
  }, [caseStudyTransitionState.isTransitioning]);

  useEffect(() => {
    const onResize = () => {
      setHeroViewportHeight(window.innerHeight);
      setHeroViewportWidth(window.innerWidth);
    };

    const onScroll = () => {
      setHeroScrollProgress(clamp(window.scrollY / Math.max(window.innerHeight, 1)));
    };

    const frame = window.requestAnimationFrame(() => {
      onResize();
      onScroll();
    });
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const heroHeadlineThreshold = Math.max(0.01, getHeroHeadlineThreshold(heroViewportHeight) - 0.07);
  const heroHeadlineOpacity = mapRange(heroScrollProgress, 0, heroHeadlineThreshold, 1, 0);
  const heroHeadlineScale = mapRange(heroScrollProgress, 0, heroHeadlineThreshold, 1, 0.85);
  const heroHeadlineStyle: CSSProperties = {
    opacity: heroHeadlineOpacity,
    transformOrigin: "center center",
    transform: `scale(${heroHeadlineScale})`,
  };
  const filmHandoffProgress = clamp(
    (heroScrollProgress * heroViewportHeight) / Math.max(heroViewportHeight * 0.87, 1),
  );
  const activePrinciple =
    data.principles.items[activePrincipleIndex] ?? data.principles.items[0] ?? null;
  const featuredProjects = data.featuredWork.projects;

  function openFeaturedWork(index: number) {
    const project = featuredProjects[index];
    const thumb = featuredThumbRefs.current[index];

    if (
      !thumb ||
      !project ||
      featuredOpeningRef.current ||
      caseStudyTransitionState.isTransitioning
    ) {
      return;
    }

    const bounds = thumb.getBoundingClientRect();
    const cornerPx = getWorkIndexCardBorderRadiusPx();

    featuredOpeningRef.current = true;
    gsap.set(thumb, { opacity: 0 });
    void thumb.offsetHeight;

    startCaseStudyTransition({
      element: thumb,
      slug: project.slug,
      href: project.href,
      sourceBounds: {
        height: bounds.height,
        left: bounds.left,
        top: bounds.top,
        width: bounds.width,
      },
      thumbnail: project.image.src,
      thumbnailXl: project.imageXl,
      sourceBorderRadiusPx: cornerPx,
      sourceRadius: `${cornerPx}px`,
    });
  }

  return (
    <main className="min-h-screen bg-(--sf-bg) text-(--sf-text)">
      <StudioFinityHeader activeHref="/" links={data.headerLinks}>
        <section className="sticky top-0 z-0 flex h-dvh flex-col items-center justify-center overflow-hidden bg-(--sf-bg)">
          <CosmosHeroWhirl imageUrls={data.heroSpiralImages} filmProgress={filmHandoffProgress} />

          <div style={heroHeadlineStyle}>
            <HeroHeadline />
          </div>

          <div className="sf-cosmos-sticky-hero-fade pointer-events-none absolute inset-x-0 bottom-0 h-[308px]" />
        </section>

        <CosmosFilmHandoff
          progress={filmHandoffProgress}
          video={data.filmVideo}
          viewportWidth={heroViewportWidth}
        />

        <div className="relative z-20 bg-(--sf-bg)">
          <section className="sf-home-section">
          <div className="sf-home-section-inner sf-home-divider">
            <div className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr]">
              <SectionHeading section={data.brandIntro} titleClassName="max-w-[10ch]" />

              <div className="max-w-172">
                <p className="sf-editorial-lead">
                  {data.brandIntro.body}
                </p>
                <p className="sf-body-copy mt-6 max-w-xl">
                  {data.brandIntro.supportingText}
                </p>
              </div>
            </div>

            <BrandIntroShowcase media={data.heroMedia} />
          </div>
        </section>

        <section className="sf-home-section">
          <div className="sf-home-section-inner sf-home-divider">
            <div className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr]">
              <SectionHeading section={data.principles} titleClassName="max-w-[9ch]" />

              <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.62fr)]">
                <div className="space-y-1">
                  {data.principles.items.map((principle, index) => {
                    const isActive = index === activePrincipleIndex;

                    return (
                      <div key={`${principle.label}-${principle.title}`} className="border-b border-border">
                        <button
                          type="button"
                          className="group/principle flex w-full min-h-12 min-w-0 touch-manipulation items-start gap-4 rounded-sm py-4 text-left outline-none transition-colors duration-280 ease-sf-out focus-visible:ring-2 focus-visible:ring-foreground/15 focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:min-h-0"
                          aria-expanded={isActive}
                          aria-controls={`cosmos-principle-panel-${index}`}
                          onClick={() => setActivePrincipleIndex(index)}
                          onFocus={() => setActivePrincipleIndex(index)}
                          onMouseEnter={() => setActivePrincipleIndex(index)}
                        >
                          <span className="sf-caption mt-0.5 min-w-8 shrink-0">
                            {principle.label}
                          </span>
                          <span
                            id={`cosmos-principle-title-${index}`}
                            className={cn(
                              "sf-title-lg max-w-120 min-w-0 wrap-break-word transition-colors duration-280 ease-sf-out",
                              isActive ? "text-(--sf-text)" : "text-muted-foreground",
                            )}
                          >
                            {principle.title}
                          </span>
                        </button>

                        <div
                          id={`cosmos-principle-panel-${index}`}
                          className="pb-4 pl-12 lg:hidden"
                          role="region"
                          aria-labelledby={`cosmos-principle-title-${index}`}
                          hidden={!isActive}
                        >
                          <p className="sf-body-copy max-w-md wrap-break-word">
                            {principle.supportingText}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="hidden min-w-0 lg:block" aria-live="polite" aria-atomic="true">
                  {activePrinciple ? (
                    <div className="border-l border-border pl-6 pt-1">
                      <p className="sf-eyebrow">{activePrinciple.label}</p>
                      <p className="sf-body-copy mt-3 max-w-88 wrap-break-word">
                        {activePrinciple.supportingText}
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="sf-home-section">
          <div
            className={cn(
              "sf-home-section-inner sf-home-divider",
              "max-md:pt-14",
            )}
          >
            <div className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr]">
              <SectionHeading section={data.featuredWork} titleClassName="max-w-[7ch]" />

              <div className={cn("grid grid-cols-3", WORK_INDEX_GRID_GAP_CLASSNAME)}>
                {featuredProjects.map((project, index) => {
                  const imageSrc = project.imageXl ?? project.image.src;

                  return (
                    <Link
                      key={project.slug}
                      href={typeof project.href === "string" && project.href.length > 0 ? project.href : "/"}
                      aria-label={`Open ${project.title}`}
                      className="group block touch-manipulation outline-none focus-visible:ring-2 focus-visible:ring-foreground/12 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                      onMouseEnter={() => prefetchCaseStudy(project.href)}
                      onFocus={() => prefetchCaseStudy(project.href)}
                      onClick={(event) => {
                        event.preventDefault();
                        openFeaturedWork(index);
                      }}
                      onKeyDown={(event) => {
                        if (event.key !== "Enter" && event.key !== " ") {
                          return;
                        }
                        event.preventDefault();
                        openFeaturedWork(index);
                      }}
                    >
                      <WorkIndexTileContent
                        imageSrc={imageSrc}
                        imageAlt={project.image.alt}
                        density="workGrid"
                        lqip={project.image.lqip}
                        title={project.title}
                        titleAs="h3"
                        priority={index < 9}
                        quality={95}
                        sizes={WORK_INDEX_GRID_IMAGE_SIZES}
                        thumbRef={(element) => {
                          featuredThumbRefs.current[index] = element;
                        }}
                      />
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
        </div>

        <StudioFinityFullPageFooter />
      </StudioFinityHeader>
    </main>
  );
}

const HERO_INTRO_SWAP_MS = 1900;
const HERO_INTRO_SWAP_MS_REDUCED = 650;

const HERO_INTRO_LINE_DURATION = 0.85;
const HERO_INTRO_LINE_DELAY = 0.12;
const HERO_INTRO_STAGGER_EACH = 0.095;

const HERO_MAIN_LINE_DURATION = 0.72;
const HERO_MAIN_LINE_DELAY = 0.12;
/** Per-word stagger (object form is GSAP-recommended for readability). */
const HERO_MAIN_STAGGER = { each: 0.038 } satisfies gsap.StaggerVars;

/**
 * Opens with the two-line display hook, then matches `/work`: caption, max-w-[28ch],
 * word spans for wrapping. GSAP: context + matchMedia, data-attribute targets, font-aware rAF.
 */
function HeroHeadline() {
  const [showMainCopy, setShowMainCopy] = useState(false);
  const heroRootRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const root = heroRootRef.current;
    if (!root) {
      return;
    }

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add(GSAP_MOTION.reduce, () => {
        const nodes = gsap.utils.toArray<HTMLElement>("[data-hero-intro-line]", root);
        gsap.set(nodes, { y: 0, force3D: true, clearProps: "transform" });
      });

      mm.add(GSAP_MOTION.noPreference, () => {
        const nodes = gsap.utils.toArray<HTMLElement>("[data-hero-intro-line]", root);
        if (nodes.length === 0) {
          return;
        }

        gsap.set(nodes, { y: "115%", force3D: true });

        let fontRaceDone = false;
        const runReveal = () => {
          gsap.fromTo(
            nodes,
            { y: "115%", force3D: true },
            {
              y: 0,
              duration: HERO_INTRO_LINE_DURATION,
              delay: HERO_INTRO_LINE_DELAY,
              ease: "power4.out",
              stagger: { each: HERO_INTRO_STAGGER_EACH },
              force3D: true,
              immediateRender: false,
              overwrite: "auto",
              clearProps: "transform",
            },
          );
        };

        void fontsReadyPromise().then(() => {
          if (fontRaceDone) {
            return;
          }
          window.requestAnimationFrame(runReveal);
        });

        return () => {
          fontRaceDone = true;
          gsap.killTweensOf(nodes);
        };
      });
    }, root);

    return () => {
      ctx.revert();
    };
  }, []);

  useEffect(() => {
    const mm = gsap.matchMedia();

    mm.add(GSAP_MOTION.reduce, () => {
      const id = window.setTimeout(() => {
        setShowMainCopy(true);
      }, HERO_INTRO_SWAP_MS_REDUCED);
      return () => window.clearTimeout(id);
    });

    mm.add(GSAP_MOTION.noPreference, () => {
      const id = window.setTimeout(() => {
        setShowMainCopy(true);
      }, HERO_INTRO_SWAP_MS);
      return () => window.clearTimeout(id);
    });

    return () => {
      mm.revert();
    };
  }, []);

  useLayoutEffect(() => {
    if (!showMainCopy) {
      return;
    }

    const root = heroRootRef.current;
    if (!root) {
      return;
    }

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add(GSAP_MOTION.reduce, () => {
        const nodes = gsap.utils.toArray<HTMLElement>("[data-hero-word-inner]", root);
        gsap.set(nodes, { y: 0, force3D: true, clearProps: "transform" });
      });

      mm.add(GSAP_MOTION.noPreference, () => {
        const nodes = gsap.utils.toArray<HTMLElement>("[data-hero-word-inner]", root);
        if (nodes.length === 0) {
          return;
        }

        gsap.set(nodes, { y: "115%", force3D: true });

        let fontRaceDone = false;
        const runReveal = () => {
          gsap.fromTo(
            nodes,
            { y: "115%", force3D: true },
            {
              y: 0,
              duration: HERO_MAIN_LINE_DURATION,
              delay: HERO_MAIN_LINE_DELAY,
              ease: "power4.out",
              stagger: HERO_MAIN_STAGGER,
              force3D: true,
              immediateRender: false,
              overwrite: "auto",
              clearProps: "transform",
            },
          );
        };

        void fontsReadyPromise().then(() => {
          if (fontRaceDone) {
            return;
          }
          window.requestAnimationFrame(runReveal);
        });

        return () => {
          fontRaceDone = true;
          gsap.killTweensOf(nodes);
        };
      });
    }, root);

    return () => {
      ctx.revert();
    };
  }, [showMainCopy]);

  const introHidden = showMainCopy;

  return (
    <div ref={heroRootRef} className="relative z-10 grid w-full place-items-center px-5 md:px-8">
      <p
        className={cn(
          "col-start-1 row-start-1 flex max-w-[12ch] flex-col items-center text-center will-change-[opacity,transform]",
          "transition-[opacity,transform] duration-700 motion-reduce:transition-none",
          "ease-sf-out",
        )}
        style={{
          opacity: introHidden ? 0 : 1,
          pointerEvents: introHidden ? "none" : "auto",
          transform: introHidden ? "translateY(-0.25rem)" : "translateY(0)",
        }}
        aria-hidden={introHidden}
      >
        <span
          className="block overflow-hidden py-[0.15em]"
          style={{ marginBlock: "-0.15em" }}
        >
          <span
            data-hero-intro-line
            className="sf-brand-display block transform-gpu will-change-transform leading-[0.88] motion-reduce:will-change-auto"
          >
            Sharper
          </span>
        </span>
        <span
          className="block overflow-hidden py-[0.15em]"
          style={{ marginBlock: "-0.15em" }}
        >
          <span
            data-hero-intro-line
            className="sf-brand-display block transform-gpu will-change-transform leading-[0.88] motion-reduce:will-change-auto"
          >
            execution.
          </span>
        </span>
      </p>

      {showMainCopy ? (
        <h1 className="col-start-1 row-start-1 sf-caption pointer-events-auto max-w-[28ch] text-center text-balance leading-none text-(--sf-text) md:text-base">
          {offMenuHeroWords.map((word, index) => (
            <span
              key={`${word}-${index}`}
              className="inline-block overflow-hidden py-[0.15em]"
              style={{ marginBlock: "-0.15em" }}
            >
              <span
                data-hero-word-inner
                className="inline-block transform-gpu will-change-transform motion-reduce:will-change-auto"
              >
                {word}
                {"\u00A0"}
              </span>
            </span>
          ))}
        </h1>
      ) : null}
    </div>
  );
}

function CosmosHeroWhirl({
  imageUrls,
  filmProgress,
}: {
  imageUrls: string[];
  filmProgress: number;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const fieldRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const readyRef = useRef(false);
  const roundedCanvasCacheRef = useRef(
    new Map<string, { canvas: HTMLCanvasElement; height: number; width: number }>(),
  );
  const phaseRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);
  const lastFrameRef = useRef(0);
  const lastScrollSampleRef = useRef({ time: 0, y: 0 });
  const scrollVelocityRef = useRef(0);
  const visibleRef = useRef(true);
  const burstStartRef = useRef(0);
  const [cameraSize, setCameraSize] = useState(HERO_BASE_CAMERA_SIZE);
  const [ready, setReady] = useState(false);

  const whirlImages = useMemo(() => buildHeroWhirlImages(imageUrls), [imageUrls]);
  const spiralPath = useMemo(() => buildSpiralPath(HERO_TURNS, 0.75 * cameraSize), [cameraSize]);

  useEffect(() => {
    burstStartRef.current = performance.now();
  }, []);

  useEffect(() => {
    const updateCameraSize = () => {
      const viewportWidth = window.innerWidth;
      setCameraSize(viewportWidth > 1920 ? Math.round((viewportWidth / 1920) * HERO_BASE_CAMERA_SIZE) : HERO_BASE_CAMERA_SIZE);
    };

    updateCameraSize();
    window.addEventListener("resize", updateCameraSize);
    return () => window.removeEventListener("resize", updateCameraSize);
  }, []);

  useEffect(() => {
    const updateScrollVelocity = () => {
      const now = performance.now();
      const currentY = window.scrollY;
      const previous = lastScrollSampleRef.current;

      if (previous.time > 0) {
        const deltaTime = Math.max(now - previous.time, 16);
        scrollVelocityRef.current = ((currentY - previous.y) / deltaTime) * 1000;
      }

      lastScrollSampleRef.current = {
        time: now,
        y: currentY,
      };
    };

    updateScrollVelocity();
    window.addEventListener("scroll", updateScrollVelocity, { passive: true });
    return () => window.removeEventListener("scroll", updateScrollVelocity);
  }, []);

  useEffect(() => {
    const target = containerRef.current;

    if (!target) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = entry?.isIntersecting ?? false;
      },
      { threshold: 0 },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const field = fieldRef.current;

    if (!canvas || !container || !field || whirlImages.length === 0) {
      return;
    }

    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    const imageMap = new Map<string, HTMLImageElement>();
    let loadedCount = 0;
    const uniqueSources = [...new Set(whirlImages.map((item) => item.src))];
    readyRef.current = false;

    const markLoaded = () => {
      loadedCount += 1;
      if (loadedCount >= uniqueSources.length) {
        readyRef.current = true;
        setReady(true);
      }
    };

    uniqueSources.forEach((src) => {
      const image = new window.Image();
      // These hero images are only drawn to canvas and never read back, so
      // forcing anonymous CORS is unnecessary and can cause some CDNs to fail
      // the load in production.
      image.src = src;
      image.onload = markLoaded;
      image.onerror = markLoaded;
      imageMap.set(src, image);
    });

    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = field.clientWidth;
      const height = field.clientHeight;

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    };

    const getRoundedCanvas = (
      image: HTMLImageElement,
      width: number,
      height: number,
      radius: number,
    ) => {
      const key = `${image.currentSrc || image.src}:${width.toFixed(2)}:${height.toFixed(2)}`;
      const cached = roundedCanvasCacheRef.current.get(key);

      if (cached) {
        return cached;
      }

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const roundedCanvas = document.createElement("canvas");
      roundedCanvas.width = Math.ceil(width * dpr);
      roundedCanvas.height = Math.ceil(height * dpr);

      const roundedContext = roundedCanvas.getContext("2d");
      if (!roundedContext) {
        return null;
      }

      roundedContext.scale(dpr, dpr);
      roundedContext.beginPath();
      roundedContext.roundRect(0, 0, width, height, radius);
      roundedContext.clip();
      roundedContext.drawImage(image, 0, 0, width, height);
      roundedContext.strokeStyle = "rgba(17, 17, 17, 0.12)";
      roundedContext.lineWidth = 3;
      roundedContext.stroke();

      const nextCacheEntry = { canvas: roundedCanvas, height, width };
      roundedCanvasCacheRef.current.set(key, nextCacheEntry);
      return nextCacheEntry;
    };

    const draw = (timestamp: number) => {
      animationFrameRef.current = window.requestAnimationFrame(draw);

      if (!visibleRef.current) {
        lastFrameRef.current = timestamp;
        return;
      }

      const width = field.clientWidth;
      const height = field.clientHeight;
      if (!width || !height) {
        return;
      }

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const dt = lastFrameRef.current ? Math.min((timestamp - lastFrameRef.current) / 1000, 0.15) : 0;
      lastFrameRef.current = timestamp;
      const velocityDecay = 1 - Math.exp(-dt * 8);
      scrollVelocityRef.current += (0 - scrollVelocityRef.current) * velocityDecay;
      if (Math.abs(scrollVelocityRef.current) < 0.01) {
        scrollVelocityRef.current = 0;
      }

      const elapsed = timestamp - burstStartRef.current;
      let burstMultiplier = 1;
      if (elapsed < HERO_BURST.rampUp) {
        burstMultiplier = 1 + (HERO_BURST.multiplier - 1) * (elapsed / HERO_BURST.rampUp) ** 2;
      } else if (elapsed < HERO_BURST.duration) {
        const decayProgress = (elapsed - HERO_BURST.rampUp) / (HERO_BURST.duration - HERO_BURST.rampUp);
        burstMultiplier = 1 + (HERO_BURST.multiplier - 1) * (1 - decayProgress) ** 2;
      }

      const velocity = (0.32 + (Math.abs(scrollVelocityRef.current) / 1000) * 0.32 * 8) * burstMultiplier;
      phaseRef.current = wrapRange(0, 100, phaseRef.current + velocity * dt);

      const scaleX = (width * dpr) / cameraSize;
      const scaleY = ((width / height >= 1 ? width : height) * dpr) / cameraSize;
      const centerX = (width * dpr) / 2;
      const centerY = (height * dpr) / 2;
      const pathRadius = 0.75 * cameraSize;

      context.setTransform(1, 0, 0, 1, 0, 0);
      context.clearRect(0, 0, canvas.width, canvas.height);

      whirlImages.forEach((item, index) => {
        const slot = wrapRange(0, 100, phaseRef.current + (index / whirlImages.length - 0.5) * 100);
        const slotProgress = slot / 100;
        const pathIndexFloat = slotProgress * spiralPath.size;
        const pathIndex = Math.min(Math.floor(pathIndexFloat), spiralPath.size - 1);
        const pathMix = pathIndexFloat - pathIndex;

        const startPoint = spiralPath.points[pathIndex] ?? spiralPath.points[spiralPath.points.length - 1];
        const endPoint = spiralPath.points[pathIndex + 1] ?? startPoint;
        const startTangent = spiralPath.tangents[pathIndex] ?? { x: 1, y: 0 };
        const endTangent = spiralPath.tangents[pathIndex + 1] ?? startTangent;

        let x = startPoint.x + (endPoint.x - startPoint.x) * pathMix;
        let y = -(startPoint.y + (endPoint.y - startPoint.y) * pathMix);
        const tangent = {
          x: startTangent.x + (endTangent.x - startTangent.x) * pathMix,
          y: -(startTangent.y + (endTangent.y - startTangent.y) * pathMix),
        };

        const distance = Math.sqrt(x * x + y * y);
        if (distance > 0) {
          const spreadDistance = pathRadius * (distance / pathRadius) ** (1 / 0.95);
          const spreadFactor = spreadDistance / distance;
          x *= spreadFactor;
          y *= spreadFactor;
        }

        const alpha =
          slot < 8 ? slot / 8 : slot > 92 ? (100 - slot) / 8 : 1;
        if (alpha < 0.01) {
          return;
        }

        const image = imageMap.get(item.src);
        if (!image || !image.complete) {
          return;
        }

        const baseSize = getSizeFromArea(image, HERO_WHILR_SIZES[item.size]);
        const attenuationDistance = Math.sqrt(x * x + y * y);
        const attenuation = Math.min(attenuationDistance / pathRadius, 1) ** 0.35;
        const cached = getRoundedCanvas(image, baseSize.width, baseSize.height, 20);

        if (!cached) {
          return;
        }

        const angle = Math.atan2(tangent.y, tangent.x);
        const cos = Math.cos(angle) * attenuation;
        const sin = Math.sin(angle) * attenuation;
        const drawX = centerX + x * scaleX;
        const drawY = centerY + y * scaleY;
        const cullRadius = Math.max(baseSize.width, baseSize.height) * attenuation * Math.max(scaleX, scaleY);

        if (
          drawX + cullRadius < 0 ||
          drawX - cullRadius > canvas.width ||
          drawY + cullRadius < 0 ||
          drawY - cullRadius > canvas.height
        ) {
          return;
        }

        context.setTransform(cos * scaleX, sin * scaleY, -sin * scaleX, cos * scaleY, drawX, drawY);
        context.globalAlpha = alpha;
        context.drawImage(cached.canvas, -baseSize.width / 2, -baseSize.height / 2, baseSize.width, baseSize.height);
      });
    };

    resizeCanvas();
    animationFrameRef.current = window.requestAnimationFrame(draw);
    window.addEventListener("resize", resizeCanvas);

    return () => {
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [cameraSize, spiralPath, whirlImages]);

  return (
    <div
      ref={containerRef}
      aria-hidden
      className="pointer-events-none absolute -left-[10%] h-screen w-[120%]"
      style={{
        opacity: clamp(1 - (filmProgress - 0.25) / 0.15),
        top: "calc(50% - 50vh)",
        transition: "opacity 300ms linear",
        WebkitMaskImage:
          "radial-gradient(45% 45%, transparent 0% 50.5%, var(--sf-cosmos-veil) 90%)",
        contain: "layout style",
        maskImage:
          "radial-gradient(45% 45%, transparent 0% 50.5%, var(--sf-cosmos-veil) 90%)",
      }}
    >
      <div
        className="absolute inset-0 transition-opacity duration-2400 ease-sf-out"
        style={{ opacity: ready ? 1 : 0 }}
      >
        <div className="sf-cosmos-hero-scrim pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[30%]" />
        <div
          ref={fieldRef}
          className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            aspectRatio: "1",
            height: "max(2000px, 120vw)",
            width: "max(2000px, 120vw)",
          }}
        >
          <canvas
            ref={canvasRef}
            aria-hidden
            style={{ display: "block", height: "100%", pointerEvents: "none", width: "100%" }}
          />
        </div>
      </div>
    </div>
  );
}

function CosmosFilmHandoff({
  progress,
  video,
  viewportWidth,
}: {
  progress: number;
  video: CosmosMediaItem;
  viewportWidth: number;
}) {
  const topOffset = viewportWidth < 768 ? 92 : 143;
  const bottomOffset = viewportWidth < 768 ? 140 : 201;
  const minWidth = Math.min(Math.max(viewportWidth - 48, 280), 600);
  const maxWidth = Math.min(Math.max(viewportWidth - 40, 320), 866.65625);
  const videoWidth = minWidth + (maxWidth - minWidth) * progress;
  const videoHeight = videoWidth * 0.75;
  const shadowOpacity = mapRange(progress, 0.14, 0.58, 0.08, 0.18);

  return (
    <section className="relative">
      <div className="relative h-[130dvh] -translate-y-24">
        <div
          className="pointer-events-none sticky flex w-full flex-col"
          style={{
            marginBottom: `-${bottomOffset}px`,
            top: `${topOffset}px`,
            minHeight: `calc(100dvh - ${topOffset}px)`,
          }}
        >
          <div className="flex w-full flex-1 items-center justify-center px-2 sm:px-4">
            <div
              className="group/film pointer-events-auto cursor-pointer overflow-hidden rounded-xl bg-background/30"
              style={{
                boxShadow: `0 28px 80px rgba(17, 17, 17, ${shadowOpacity})`,
                height: `${videoHeight}px`,
                width: `${videoWidth}px`,
              }}
            >
              <div className="relative flex size-full items-center justify-center">
                <video
                  src={video.src}
                  aria-label={video.alt}
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="auto"
                  className="max-h-full w-auto max-w-full object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionHeading({
  section,
  titleClassName,
}: {
  section: CosmosFeatureSection;
  titleClassName?: string;
}) {
  return (
    <div>
      {section.eyebrow ? (
        <p className="sf-eyebrow mb-4">{section.eyebrow}</p>
      ) : null}
      <AnimatedWords
        as="h2"
        text={section.title}
        className={cn(
          "sf-display-page sf-display-tight",
          titleClassName,
        )}
        lineClassName="leading-[0.84]"
        triggerOnView
      />
    </div>
  );
}

function BrandIntroShowcase({ media }: { media: CosmosMediaItem[] }) {
  const showcaseMedia = media.slice(0, 9);

  if (showcaseMedia.length === 0) {
    return null;
  }

  return (
    <div className="mt-10 md:mt-14">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <p className="sf-eyebrow">Selected stills</p>
        <p className="sf-caption max-sm:text-[0.6875rem]">
          A glimpse into the visual language behind the work
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {showcaseMedia.map((item) => (
          <div key={item.src} className="group min-w-0">
            <WorkIndexTileMedia
              imageSrc={item.src}
              imageAlt={item.alt ?? "Studio Finity showcase image"}
              lqip={item.lqip}
              quality={88}
              sizes="(max-width: 1023px) 33vw, 28vw"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
