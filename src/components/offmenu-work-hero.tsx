"use client";
/* eslint-disable @next/next/no-img-element */

// Native <img>: GSAP hero transition needs ref, naturalWidth/complete, and layered opacity handoff.

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { AnimatedWords } from "@/components/animated-words";
import { useCaseStudyTransition } from "@/components/case-study-transition-provider";
interface OffMenuWorkHeroProps {
  description?: string;
  heroImage: string;
  /** Sanity LQIP — soft blurred layer under the hero while the full image loads */
  heroLqip?: string;
  slug: string;
  title: string;
}

export function OffMenuWorkHero({
  description,
  heroImage,
  heroLqip,
  slug,
  title,
}: OffMenuWorkHeroProps) {
  const imageRef = useRef<HTMLImageElement>(null);
  const gradientRef = useRef<HTMLDivElement>(null);
  const readyRef = useRef(false);
  const { signalHeroReady, state } = useCaseStudyTransition();
  const transitionMatches = state.isTransitioning && state.slug === slug;
  const finalHeroImage = heroImage;
  const transitionHeroImage = transitionMatches
    ? state.thumbnailXl ?? state.thumbnail
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
    if (!gradientRef.current) {
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(gradientRef.current, { opacity: 1 });
      return;
    }

    const timeline = gsap.timeline();

    timeline.fromTo(
      gradientRef.current,
      { opacity: 0 },
      {
        opacity: 1,
        duration: transitionMatches ? 0.78 : 0.6,
        delay: transitionMatches ? 0.62 : 0.46,
        ease: "power4.out",
      },
    );

    return () => {
      timeline.kill();
    };
  }, [slug, transitionMatches]);

  return (
    <section className="relative min-h-screen">
      <div className="absolute inset-x-4 bottom-4 top-17 overflow-hidden rounded-3xl md:inset-x-4 md:bottom-4 md:top-18">
        {heroLqip ? (
          <div
            aria-hidden
            className="absolute inset-0 scale-110 bg-center bg-cover opacity-100"
            style={{
              backgroundImage: `url(${heroLqip})`,
              filter: "blur(28px)",
            }}
          />
        ) : null}
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
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        {showFinalOverlay ? (
          <img
            src={finalHeroImage}
            alt={title}
            className="absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-880 ease-sf-out"
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
          className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 motion-reduce:opacity-100"
        />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col justify-end p-8 md:px-16 md:pb-24 md:pt-16">
        <div className="text-white">
          <AnimatedWords
            as="h1"
            text={title}
            className="work-hero-title max-w-full text-balance sm:max-w-[min(100%,14ch)]"
            lineClassName="leading-[1.02]"
            delay={transitionMatches ? 0.3 : 0.35}
          />
          {description ? (
            <p className="mt-5 max-w-md wrap-break-word text-base leading-relaxed text-white/76 md:text-lg">
              {description}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
