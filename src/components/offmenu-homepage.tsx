"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ArrowLeftIcon, ArrowRightIcon } from "@/components/icons";
import { useCaseStudyTransition } from "@/components/case-study-transition-provider";
import { OffMenuHeader } from "@/components/offmenu-header";
import { useOffMenuTheme } from "@/hooks/use-offmenu-theme";
import type { CaseStudy, NavLink } from "@/types/offmenu";

interface OffMenuHomepageProps {
  caseStudies: CaseStudy[];
  heroWords: string[];
  navigationLinks: NavLink[];
  resourceLinks: NavLink[];
}

function clamp(value: number, min = 0, max = 1) {
  return Math.min(Math.max(value, min), max);
}

function smoothStep(value: number) {
  return value * value * value * (value * (6 * value - 15) + 10);
}

export function OffMenuHomepage({
  caseStudies,
  heroWords,
  navigationLinks,
  resourceLinks,
}: OffMenuHomepageProps) {
  const scrollTrackRef = useRef<HTMLDivElement>(null);
  const orbitFadeRef = useRef<HTMLDivElement>(null);
  const orbitStageRef = useRef<HTMLDivElement>(null);
  const orbitBubbleRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  const heroWordRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const titleOverlayRef = useRef<HTMLDivElement>(null);
  const titleItemRefs = useRef<Array<HTMLHeadingElement | null>>([]);
  const dotRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const hoverIndexRef = useRef<number | null>(null);
  const introOffsetRef = useRef(Math.PI);
  const activeIndexRef = useRef(0);
  const focusSmoothingRef = useRef(0);
  const frozenVisualStateRef = useRef<{
    activeIndex: number;
    rotation: number;
    smoothFocus: number;
    tiltX: number;
    tiltY: number;
    zoom: number;
  } | null>(null);
  const titleIndexRef = useRef(-1);
  const titleMountedRef = useRef(false);
  const titleVisibleRef = useRef(false);
  const headlineVisibleRef = useRef(false);
  const openingRef = useRef(false);
  const hoverScaleMapRef = useRef(new Map<number, number>());

  const rotationStateRef = useRef({ value: 0, velocity: 0 });
  const tiltYStateRef = useRef({ value: -0.6, velocity: 0 });
  const tiltXStateRef = useRef({ value: 0.5236, velocity: 0 });
  const targetRotationRef = useRef(0);
  const targetTiltYRef = useRef(-0.6);
  const targetTiltXRef = useRef(0.5236);
  const zoomStateRef = useRef({ value: 0 });

  const [activeIndex, setActiveIndex] = useState(0);
  const { themeMode, setThemeMode } = useOffMenuTheme();
  const { prefetchCaseStudy, startCaseStudyTransition, state: transitionState } =
    useCaseStudyTransition();
  const transitionActive = transitionState.isTransitioning;

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    openingRef.current = false;
    hoverIndexRef.current = null;
    activeIndexRef.current = 0;
    focusSmoothingRef.current = 0;
    frozenVisualStateRef.current = null;
    titleIndexRef.current = -1;
    titleMountedRef.current = false;
    titleVisibleRef.current = false;
    headlineVisibleRef.current = false;
    hoverScaleMapRef.current.clear();

    introOffsetRef.current = Math.PI;
    rotationStateRef.current = { value: 0, velocity: 0 };
    tiltYStateRef.current = { value: -0.6, velocity: 0 };
    tiltXStateRef.current = { value: 0.5236, velocity: 0 };
    targetRotationRef.current = 0;
    targetTiltYRef.current = -0.6;
    targetTiltXRef.current = 0.5236;
    zoomStateRef.current = { value: 0 };

    if (orbitFadeRef.current) {
      gsap.set(orbitFadeRef.current, { opacity: 0 });
    }

    if (titleOverlayRef.current) {
      gsap.set(titleOverlayRef.current, { opacity: 0 });
    }

    heroWordRefs.current.forEach((node) => {
      if (node) {
        gsap.set(node, { y: "115%" });
      }
    });

    titleItemRefs.current.forEach((node) => {
      if (node) {
        gsap.set(node, { y: "110%", opacity: 0 });
      }
    });
  }, []);

  useEffect(() => {
    if (!transitionState.isTransitioning) {
      openingRef.current = false;
    }
  }, [transitionState.isTransitioning]);

  useEffect(() => {
    let frameId = 0;
    const start = performance.now();

    const tick = () => {
      const progress = Math.min((performance.now() - start) / 3000, 1);
      introOffsetRef.current = Math.PI * Math.pow(1 - progress, 4);

      if (progress < 1) {
        frameId = window.requestAnimationFrame(tick);
      }
    };

    frameId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frameId);
  }, []);

  useEffect(() => {
    if (!orbitFadeRef.current) {
      return;
    }

    const animation = gsap.to(orbitFadeRef.current, {
      opacity: 1,
      duration: 1.5,
      ease: "power2.out",
    });

    return () => {
      animation.kill();
    };
  }, []);

  useEffect(() => {
    const nextIndex = activeIndex % caseStudies.length;
    const previousIndex = titleIndexRef.current;

    if (nextIndex === previousIndex) {
      return;
    }

    const firstPaint = previousIndex === -1;
    titleIndexRef.current = nextIndex;

    let direction: "up" | "down" = "down";

    if (!firstPaint) {
      const delta = nextIndex - previousIndex;
      direction =
        Math.abs(delta) > caseStudies.length / 2
          ? delta > 0
            ? "up"
            : "down"
          : delta > 0
            ? "down"
            : "up";
    }

    caseStudies.forEach((_, index) => {
      const node = titleItemRefs.current[index];

      if (!node) {
        return;
      }

      gsap.killTweensOf(node);

      if (index === nextIndex) {
        if (!titleMountedRef.current || firstPaint) {
          gsap.set(node, { y: "0%", opacity: 1 });
        } else {
          gsap.set(node, {
            y: direction === "down" ? "110%" : "-110%",
            opacity: 0,
          });
          gsap.to(node, {
            y: "0%",
            opacity: 1,
            duration: 0.5,
            ease: "power4.out",
          });
        }

        return;
      }

      if (index === previousIndex && !firstPaint) {
        gsap.to(node, {
          y: direction === "down" ? "-110%" : "110%",
          opacity: 0,
          duration: 0.3,
          ease: "power4.out",
        });
        return;
      }

      gsap.set(node, {
        y: index < nextIndex ? "-110%" : "110%",
        opacity: 0,
      });
    });

    titleMountedRef.current = true;
  }, [activeIndex, caseStudies]);

  useLayoutEffect(() => {
    const scrollTrack = scrollTrackRef.current;
    const orbitStage = orbitStageRef.current;
    const headlineNodes = heroWordRefs.current.filter(Boolean);
    const titleOverlay = titleOverlayRef.current;

    if (!scrollTrack || !orbitStage || headlineNodes.length === 0) {
      return;
    }

    let frameId = 0;
    let mounted = true;

    const setHeadlineVisible = (visible: boolean, immediate = false) => {
      if (headlineVisibleRef.current === visible) {
        return;
      }

      headlineVisibleRef.current = visible;
      gsap.killTweensOf(headlineNodes);

      if (immediate) {
        gsap.set(headlineNodes, { y: visible ? 0 : "115%" });
        return;
      }

      if (visible) {
        gsap.fromTo(
          headlineNodes,
          { y: "115%" },
          {
            y: 0,
            duration: 0.6,
            delay: 0.5,
            stagger: 0.03,
            ease: "power4.out",
          },
        );
      } else {
        gsap.to(headlineNodes, {
          y: "115%",
          duration: 0.6,
          stagger: { each: 0.02, from: "end" },
          ease: "power4.out",
        });
      }
    };

    const setTitleVisible = (visible: boolean, immediate = false) => {
      if (!titleOverlay || titleVisibleRef.current === visible) {
        return;
      }

      titleVisibleRef.current = visible;
      gsap.killTweensOf(titleOverlay);

      if (immediate) {
        gsap.set(titleOverlay, { opacity: visible ? 1 : 0 });
        return;
      }

      gsap.to(titleOverlay, {
        opacity: visible ? 1 : 0,
        duration: 0.6,
        ease: "power4.out",
      });
    };

    const render = () => {
      if (!mounted) {
        return;
      }

      if (openingRef.current && frozenVisualStateRef.current) {
        frameId = window.requestAnimationFrame(render);
        return;
      }

      const rect = scrollTrack.getBoundingClientRect();
      const scrollRange = rect.height - window.innerHeight;
      const progress = scrollRange <= 0 ? 0 : clamp(-rect.top / scrollRange);
      const fullRotation = Math.PI * 2;
      const step = fullRotation / caseStudies.length;
      const zoomSlotCount = Math.max(caseStudies.length - 1, 1);
      const zoomProgress = clamp((progress - 0.2) / 0.8);
      const zoomFocusPosition = zoomProgress * zoomSlotCount;
      const zoomSlotIndex = Math.min(Math.round(zoomFocusPosition), zoomSlotCount);
      const orbitFocusIndex =
        progress <= 0.2
          ? (() => {
              let initialFocus = Math.round(
                (-((progress / 0.2) * fullRotation + introOffsetRef.current) / step) %
                  caseStudies.length,
              );
              initialFocus =
                ((initialFocus % caseStudies.length) + caseStudies.length) % caseStudies.length;
              return initialFocus;
            })()
          : zoomFocusPosition;

      targetRotationRef.current =
        progress <= 0.2
          ? -((progress / 0.2) * fullRotation)
          : -fullRotation - zoomFocusPosition * step;
      targetTiltYRef.current = gsap.utils.interpolate(-0.6, 0, clamp(progress / 0.2));
      targetTiltXRef.current = gsap.utils.interpolate(0.5236, 0, clamp(progress / 0.2));

      setHeadlineVisible(progress < 0.15, false);
      setTitleVisible(progress >= 0.2, false);

      rotationStateRef.current = {
        value: targetRotationRef.current,
        velocity: 0,
      };
      tiltYStateRef.current = {
        value: targetTiltYRef.current,
        velocity: 0,
      };
      tiltXStateRef.current = {
        value: targetTiltXRef.current,
        velocity: 0,
      };
      zoomStateRef.current.value = smoothStep(zoomProgress);

      const rotation = rotationStateRef.current.value;
      const tiltY = tiltYStateRef.current.value;
      const tiltX = tiltXStateRef.current.value;
      const zoom = zoomStateRef.current.value;
      const compositeRotation = rotation + introOffsetRef.current;
      const sceneSize = Math.min(window.innerWidth, window.innerHeight);
      const orbitRadius = Math.max(400, sceneSize * 0.8);

      orbitStage.style.setProperty("--sphere-size-scale", `${0.6 + 0.4 * zoom}`);
      orbitStage.style.transform = `scale(${0.5 + 0.5 * zoom}) translateX(${zoom * orbitRadius + sceneSize * 0.05 * tiltY}px) translateY(${-sceneSize * 0.05 * tiltX}px)`;
      const roundedFocus = progress <= 0.2 ? orbitFocusIndex : zoomSlotIndex;

      let smoothFocus = focusSmoothingRef.current;
      let delta = roundedFocus - smoothFocus;
      const half = caseStudies.length / 2;

      if (progress <= 0.2 && Math.abs(delta) > half) {
        delta += delta > 0 ? -caseStudies.length : caseStudies.length;
      }

      smoothFocus += delta * 0.05;

      if (progress <= 0.2) {
        if (smoothFocus < 0) {
          smoothFocus += caseStudies.length;
        } else if (smoothFocus >= caseStudies.length) {
          smoothFocus -= caseStudies.length;
        }
      } else {
        smoothFocus = orbitFocusIndex;
      }

      focusSmoothingRef.current = smoothFocus;

      let dominantBubbleIndex = roundedFocus;
      let dominantBubbleScale = -Infinity;

      orbitBubbleRefs.current.forEach((bubble, index) => {
        if (!bubble) {
          return;
        }

        const angle = (index / caseStudies.length) * fullRotation + compositeRotation + Math.PI;
        let x = Math.cos(angle);
        let y = Math.sin(angle);
        let z = 0;

        const tiltYCos = Math.cos(tiltY);
        const tiltYSin = Math.sin(tiltY);
        const rotatedX = x * tiltYCos + z * tiltYSin;
        const rotatedZ = -x * tiltYSin + z * tiltYCos;
        x = rotatedX;
        z = rotatedZ;

        const tiltXCos = Math.cos(tiltX);
        const tiltXSin = Math.sin(tiltX);
        const rotatedY = y * tiltXCos - z * tiltXSin;
        z = y * tiltXSin + z * tiltXCos;
        y = rotatedY;

        let distance = Math.abs(index - smoothFocus);
        if (distance > half) {
          distance = caseStudies.length - distance;
        }

        const activeFocusScale = gsap.utils.interpolate(1, 1.85, zoom);
        const adjacentFocusScale = gsap.utils.interpolate(1, 1.13, zoom);
        const focusScale =
          distance <= 1
            ? activeFocusScale -
              smoothStep(distance) * (activeFocusScale - adjacentFocusScale)
            : distance <= 2
              ? adjacentFocusScale - smoothStep(distance - 1) * (adjacentFocusScale - 1)
              : 1;
        const depthScale = 1 + 0.1 * z;
        const previousHoverScale = hoverScaleMapRef.current.get(index) ?? 1;
        const targetHoverScale = hoverIndexRef.current === index ? 1.1 : 1;
        const nextHoverScale = previousHoverScale + (targetHoverScale - previousHoverScale) * 0.15;
        const visualScale = focusScale * depthScale;

        hoverScaleMapRef.current.set(index, nextHoverScale);

        if (progress >= 0.2 && visualScale > dominantBubbleScale) {
          dominantBubbleScale = visualScale;
          dominantBubbleIndex = index;
        }

        bubble.style.transform = `translate(${x * orbitRadius}px, ${-y * orbitRadius}px) scale(${visualScale * nextHoverScale})`;
      });

      dotRefs.current.forEach((dot, index) => {
        if (!dot) {
          return;
        }

        const angle = (index / caseStudies.length) * fullRotation + compositeRotation + Math.PI;
        const x = 18 * Math.cos(angle);
        const y = -(18 * Math.sin(angle));
        const dotSize = Math.min(5, ((fullRotation * 18) / caseStudies.length) * 0.6);
        const isActive = index === (progress >= 0.2 ? dominantBubbleIndex : roundedFocus);

        dot.style.transform = `translate(${x}px, ${y}px)`;
        dot.style.width = `${dotSize}px`;
        dot.style.height = `${dotSize}px`;
        dot.style.marginLeft = `${-dotSize / 2}px`;
        dot.style.marginTop = `${-dotSize / 2}px`;
        dot.style.opacity = isActive ? "1" : "0.4";
        dot.style.backgroundColor = isActive ? "" : "transparent";
        dot.style.border = isActive ? "none" : "1px solid currentColor";
      });

      const displayedIndex = progress >= 0.2 ? dominantBubbleIndex : roundedFocus;

      if (activeIndexRef.current !== displayedIndex) {
        activeIndexRef.current = displayedIndex;
        setActiveIndex(displayedIndex);
      }

      frozenVisualStateRef.current = {
        activeIndex: displayedIndex,
        rotation,
        smoothFocus,
        tiltX,
        tiltY,
        zoom,
      };

      frameId = window.requestAnimationFrame(render);
    };

    render();

    return () => {
      mounted = false;
      window.cancelAnimationFrame(frameId);
      gsap.killTweensOf(headlineNodes);
      if (titleOverlay) {
        gsap.killTweensOf(titleOverlay);
      }
    };
  }, [caseStudies.length]);

  useEffect(() => {
    document.body.classList.add("scrollbar-none");

    return () => {
      document.body.classList.remove("scrollbar-none");
    };
  }, []);

  function scrollToOrbitIndex(index: number) {
    const scrollTrack = scrollTrackRef.current;

    if (!scrollTrack) {
      return;
    }

    const targetTop =
      scrollTrack.offsetTop +
      (0.2 + 0.8 * (index / Math.max(caseStudies.length - 1, 1))) * scrollTrack.offsetHeight;

    window.scrollTo({
      top: targetTop,
      behavior: "smooth",
    });
  }

  function cycleCaseStudy(direction: "prev" | "next") {
    const currentIndex = activeIndexRef.current;
    const nextIndex =
      direction === "next"
        ? (currentIndex + 1) % caseStudies.length
        : (currentIndex - 1 + caseStudies.length) % caseStudies.length;

    scrollToOrbitIndex(nextIndex);
  }

  function openCaseStudy(index: number, element?: HTMLElement | null) {
    const target = element ?? orbitBubbleRefs.current[index];
    const caseStudy = caseStudies[index];

    if (!target || !caseStudy || openingRef.current || transitionState.isTransitioning) {
      return;
    }

    const bounds = target.getBoundingClientRect();

    openingRef.current = true;
    hoverIndexRef.current = null;
    gsap.set(target, { opacity: 0 });
    void target.offsetHeight;

    const thumbnail = themeMode === "dark" ? caseStudy.thumbnailDark : caseStudy.thumbnailLight;
    const thumbnailXl =
      themeMode === "dark" ? caseStudy.thumbnailDarkXl : caseStudy.thumbnailLightXl;

    startCaseStudyTransition({
      element: target,
      slug: caseStudy.slug,
      href: caseStudy.href,
      sourceBounds: {
        height: bounds.height,
        left: bounds.left,
        top: bounds.top,
        width: bounds.width,
      },
      thumbnail,
      thumbnailXl,
      sourceRadius: "50%",
    });
  }

  return (
    <main className="min-h-screen">
      <OffMenuHeader
        activeHref="/"
        navigationLinks={navigationLinks}
        resourceLinks={resourceLinks}
        themeMode={themeMode}
        onToggleTheme={() => setThemeMode((current) => (current === "light" ? "dark" : "light"))}
      />

      <div ref={scrollTrackRef} className="relative" style={{ height: "1000vh" }}>
        <section
          id="work"
          className="sticky top-0 h-screen w-full bg-background p-8"
        >
          <div
            ref={orbitFadeRef}
            className="absolute inset-0 z-10 overflow-hidden"
            style={{ opacity: 0 }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                ref={orbitStageRef}
                className="relative"
                style={{
                  width: "min(400vw, 100vh)",
                  height: "min(400vw, 100vh)",
                  containerType: "inline-size",
                }}
              >
                <div
                  className="absolute inset-0 grid place-items-center"
                  style={{ gridTemplateAreas: "'layer'" }}
                >
                  {caseStudies.map((caseStudy, index) => {
                    const imageSrc =
                      themeMode === "dark" ? caseStudy.thumbnailDark : caseStudy.thumbnailLight;

                    return (
                      <Link
                        key={caseStudy.slug}
                        href={caseStudy.href}
                        data-sphere-index={index}
                        aria-label={`Open ${caseStudy.title}`}
                        ref={(element) => {
                          orbitBubbleRefs.current[index] = element;
                        }}
                        className="group relative block overflow-hidden rounded-full"
                        style={{
                          gridArea: "layer",
                          width: "calc(clamp(120px, 25vw, 300px) * var(--sphere-size-scale, 1))",
                          height: "calc(clamp(120px, 25vw, 300px) * var(--sphere-size-scale, 1))",
                          borderRadius: "999999px",
                          backfaceVisibility: "hidden",
                        }}
                        onMouseEnter={() => {
                          hoverIndexRef.current = index;
                          prefetchCaseStudy(caseStudy.href);
                        }}
                        onMouseLeave={() => {
                          if (hoverIndexRef.current === index) {
                            hoverIndexRef.current = null;
                          }
                        }}
                        onFocus={() => prefetchCaseStudy(caseStudy.href)}
                        onPointerDown={(event) => {
                          if (event.button !== 0) {
                            return;
                          }

                          event.preventDefault();
                          openCaseStudy(index, event.currentTarget);
                        }}
                        onClick={(event) => {
                          event.preventDefault();
                        }}
                        onKeyDown={(event) => {
                          if (event.key !== "Enter" && event.key !== " ") {
                            return;
                          }

                          event.preventDefault();
                          openCaseStudy(index, event.currentTarget);
                        }}
                      >
                        <div className="absolute inset-0">
                          <img
                            src={imageSrc}
                            alt=""
                            width={600}
                            height={600}
                            decoding="async"
                            className="absolute inset-0 h-full w-full object-cover"
                          />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center">
            <h1 className="pointer-events-auto max-w-[28ch] text-center text-sm font-medium leading-none text-foreground md:text-base">
              {heroWords.map((word, index) => (
                <span
                  key={`${word}-${index}`}
                  className="inline-block overflow-hidden py-[0.15em]"
                  style={{ marginBlock: "-0.15em" }}
                >
                  <span
                    ref={(element) => {
                      heroWordRefs.current[index] = element;
                    }}
                    className="inline-block"
                    style={{ transform: "translateY(115%)" }}
                  >
                    {word}
                    {"\u00A0"}
                  </span>
                </span>
              ))}
            </h1>
          </div>

          <div
            ref={titleOverlayRef}
            className="fixed inset-0 z-50 h-screen w-screen bg-transparent text-background opacity-0 mix-blend-exclusion pointer-events-none dark:text-foreground"
            style={{
              visibility: transitionActive ? "hidden" : "visible",
            }}
          >
            <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 px-4">
              <div className="pointer-events-none flex w-full items-center justify-between">
                <button
                  type="button"
                  onClick={() => cycleCaseStudy("prev")}
                  className="pointer-events-auto flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-background text-foreground transition-opacity hover:opacity-70 sm:h-12 sm:w-12"
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => cycleCaseStudy("next")}
                  className="pointer-events-auto flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-background text-foreground transition-opacity hover:opacity-70 sm:h-12 sm:w-12"
                >
                  <ArrowRightIcon className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 px-8 md:bottom-4 md:top-auto md:translate-y-0">
              <div className="relative flex items-center justify-center overflow-hidden py-3">
                <div className="relative flex w-full justify-center pointer-events-none">
                  {caseStudies.map((caseStudy, index) => (
                    <div
                      key={`title-${caseStudy.slug}`}
                      className={index === 0 ? "" : "pointer-events-none absolute left-0 top-0 flex w-full justify-center"}
                    >
                      <span className="pointer-events-auto">
                        <h2
                          ref={(element) => {
                            titleItemRefs.current[index] = element;
                          }}
                          className="inline-block whitespace-nowrap text-center text-4xl font-medium"
                          style={{ transform: "translateY(110%)" }}
                        >
                          {caseStudy.title}
                        </h2>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div
            className="pointer-events-none fixed bottom-6 right-6 z-50"
            style={{
              height: 45,
              opacity: transitionActive ? 0 : 1,
              transition: "opacity 160ms ease-out",
              visibility: transitionActive ? "hidden" : "visible",
              width: 45,
            }}
          >
            <div className="relative flex h-full w-full items-center justify-center">
              {caseStudies.map((caseStudy, index) => (
                <span
                  key={`dot-${caseStudy.slug}`}
                  ref={(element) => {
                    dotRefs.current[index] = element;
                  }}
                  data-dot-index={index}
                  className="absolute rounded-full text-foreground"
                />
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
