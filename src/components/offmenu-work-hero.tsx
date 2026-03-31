"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useCaseStudyTransition } from "@/components/case-study-transition-provider";
import type { ThemeMode } from "@/types/offmenu";

interface OffMenuWorkHeroProps {
  description?: string;
  heroImageDark: string;
  heroImageLight: string;
  slug: string;
  themeMode: ThemeMode;
  title: string;
}

export function OffMenuWorkHero({
  description,
  heroImageDark,
  heroImageLight,
  slug,
  themeMode,
  title,
}: OffMenuWorkHeroProps) {
  const imageRef = useRef<HTMLImageElement>(null);
  const gradientRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const readyRef = useRef(false);
  const { signalHeroReady, state } = useCaseStudyTransition();
  const transitionMatches = state.isTransitioning && state.slug === slug;
  const finalHeroImage = themeMode === "dark" ? heroImageDark : heroImageLight;
  const transitionHeroImage = transitionMatches
    ? state.thumbnailXlLoaded && state.thumbnailXl
      ? state.thumbnailXl
      : state.thumbnail
    : null;
  const displayImage = transitionHeroImage ?? finalHeroImage;
  const showFinalOverlay = Boolean(transitionHeroImage && transitionHeroImage !== finalHeroImage);
  const [loadedFinalSrc, setLoadedFinalSrc] = useState<string | null>(null);
  const heroReadyImage = showFinalOverlay ? finalHeroImage : displayImage;

  useEffect(() => {
    readyRef.current = false;
  }, [displayImage, transitionMatches]);

  useEffect(() => {
    if (!transitionMatches || !showFinalOverlay) {
      return;
    }

    const image = new window.Image();
    image.decoding = "async";
    image.onload = () => {
      setLoadedFinalSrc(finalHeroImage);
    };
    image.src = finalHeroImage;
  }, [finalHeroImage, showFinalOverlay, transitionMatches]);

  useEffect(() => {
    if (!transitionMatches || readyRef.current) {
      return;
    }

    if (heroReadyImage === finalHeroImage && showFinalOverlay && loadedFinalSrc !== finalHeroImage) {
      return;
    }

    if (!imageRef.current) {
      return;
    }

    if (heroReadyImage !== displayImage && loadedFinalSrc !== finalHeroImage) {
      return;
    }

    if (imageRef.current.complete && imageRef.current.naturalWidth > 0) {
      readyRef.current = true;
      signalHeroReady();
    }
  }, [
    displayImage,
    finalHeroImage,
    heroReadyImage,
    loadedFinalSrc,
    showFinalOverlay,
    signalHeroReady,
    transitionMatches,
  ]);

  useLayoutEffect(() => {
    if (
      !titleRef.current ||
      !gradientRef.current ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const timeline = gsap.timeline();

    timeline.fromTo(
      gradientRef.current,
      { opacity: transitionMatches ? 0 : 1 },
      {
        opacity: 1,
        duration: transitionMatches ? 0.58 : 0.24,
        delay: transitionMatches ? 0.2 : 0,
        ease: "power3.out",
      },
    );

    timeline.fromTo(
      titleRef.current,
      { y: 30, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.72,
        delay: transitionMatches ? 0.02 : 0.24,
        ease: "power3.out",
        clearProps: "transform,opacity",
      },
      transitionMatches ? "<" : ">"
    );

    return () => {
      timeline.kill();
    };
  }, [slug, transitionMatches]);

  return (
    <section className="relative min-h-screen">
      <div className="absolute inset-x-4 bottom-4 top-20 overflow-hidden rounded-[24px]">
        <img
          ref={imageRef}
          src={displayImage}
          alt={title}
          onLoad={() => {
            if (transitionMatches && !readyRef.current && !showFinalOverlay) {
              readyRef.current = true;
              signalHeroReady();
            }
          }}
          className="absolute inset-0 h-full w-full object-cover"
        />
        {showFinalOverlay ? (
          <img
            src={finalHeroImage}
            alt={title}
            className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-out"
            style={{ opacity: loadedFinalSrc === finalHeroImage ? 1 : 0 }}
            onLoad={() => {
              setLoadedFinalSrc(finalHeroImage);
              if (transitionMatches && !readyRef.current) {
                readyRef.current = true;
                signalHeroReady();
              }
            }}
          />
        ) : null}
        <div
          ref={gradientRef}
          className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"
        />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col justify-end p-8 md:px-16 md:pb-24 md:pt-16">
        <div className="text-white">
          <h1
            ref={titleRef}
            className="text-3xl font-medium text-white md:text-4xl"
          >
            {title}
          </h1>
          {description ? (
            <p className="mt-5 max-w-md text-base leading-relaxed text-white/76 md:text-lg">
              {description}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
