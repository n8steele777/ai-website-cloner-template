"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { AnimatedWords } from "@/components/animated-words";
import { ArrowRightIcon } from "@/components/icons";
import { StudioFinityHeader } from "@/components/studio-finity-header";
import { TransitionLink } from "@/components/transition-link";
import { cn } from "@/lib/utils";
import type {
  CosmosButton,
  CosmosFeatureSection,
  CosmosFooterGroup,
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

  return (
    <main className="min-h-screen bg-[var(--sf-bg)] text-[var(--sf-text)]">
      <StudioFinityHeader links={data.headerLinks} actions={data.headerActions} activeHref="/" />

      <section className="sticky top-0 z-0 -mt-[72px] flex h-dvh flex-col items-center justify-center overflow-hidden bg-[var(--sf-bg)] md:-mt-[105px]">
        <CosmosHeroWhirl imageUrls={data.heroSpiralImages} filmProgress={filmHandoffProgress} />

        <div style={heroHeadlineStyle}>
          <div className="relative z-10 flex flex-col items-center gap-5">
            <img
              src="/logos/Studio%20Finity%20Text%20Logo.png"
              alt="STUDIO FINITY"
              className="h-auto w-[min(220px,38vw)] max-w-full md:w-[min(280px,26vw)]"
            />

            <AnimatedWords
              as="h1"
              text={"Your space\nfor inspiration"}
              className="font-cosmos text-pretty text-center text-[54px] font-[350] leading-none tracking-[-0.04em] text-[var(--sf-text)] md:text-[74px]"
              lineClassName="leading-none"
              delay={0.2}
            />

          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[308px] bg-[linear-gradient(to_bottom,transparent_0%,rgba(255,255,255,0.6)_35%,rgba(255,255,255,0.9)_60%,white_84%)]" />
      </section>

      <CosmosFilmHandoff
        cta={data.filmCta}
        progress={filmHandoffProgress}
        video={data.filmVideo}
        viewportWidth={heroViewportWidth}
      />

      <SectionFrame
        section={data.searchWorld}
        className="px-4 py-22 md:px-6 md:py-30"
        titleClassName="max-w-[10ch]"
        content={
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <div className="max-w-[22rem]">
              <p className="sf-eyebrow">{data.searchWorld.sideLabel}</p>
              <p className="sf-copy-soft mt-4 text-[1.35rem] leading-[1.18] tracking-[0em] md:text-[1.7rem]">
                {data.searchWorld.sideBody}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-[1.3fr_0.9fr]">
              <MediaTile item={data.searchWorld.gallery[0]} className="aspect-[1.45/1]" />
              <div className="grid gap-4">
                <MediaTile item={data.searchWorld.gallery[1]} className="aspect-[0.88/1]" />
                <MediaTile item={data.searchWorld.gallery[2]} className="aspect-[1.02/1]" />
              </div>
            </div>
          </div>
        }
      />

      <SectionFrame
        section={data.filters}
        className="px-4 py-22 md:px-6 md:py-30"
        titleClassName="max-w-[8ch]"
        content={
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div className="max-w-[30rem]">
              <p className="sf-copy-muted text-lg tracking-[0em] md:text-xl">{data.filters.body}</p>
            </div>

            <div className="grid gap-4">
              <div className="flex flex-wrap gap-2">
                {data.filters.chips.map((chip) => (
                  <span
                    key={chip.label}
                    className="sf-panel rounded-full px-4 py-2 text-[0.83rem] tracking-[0em]"
                  >
                    {chip.label}
                  </span>
                ))}
              </div>

              <div className="grid gap-4 md:grid-cols-[1.15fr_0.85fr]">
                <MediaTile item={data.filters.media[0]} className="aspect-[1.34/1]" />
                <MediaTile item={data.filters.media[1]} className="aspect-[0.92/1]" />
              </div>
            </div>
          </div>
        }
      />

      <SectionFrame
        section={data.attribution}
        className="px-4 py-22 md:px-6 md:py-30"
        titleClassName="max-w-[9ch]"
        content={
          <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
            <div>
              <div className="sf-copy-muted space-y-5 text-[0.98rem] leading-[1.35] tracking-[0em] md:text-[1.06rem]">
                {data.attribution.credits.map((item) => (
                  <p key={item}>{item}</p>
                ))}
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-[0.82fr_1.18fr] md:items-end">
              <MediaTile item={data.attribution.media[0]} className="aspect-[0.8/1]" />
              <div className="space-y-6">
                <MediaTile item={data.attribution.media[1]} className="aspect-[0.95/1]" />
                <p className="sf-copy-soft max-w-[28rem] text-[1.15rem] leading-[1.2] tracking-[0em] md:text-[1.5rem]">
                  {data.attribution.body}
                </p>
              </div>
            </div>
          </div>
        }
      />

      <SectionFrame
        section={data.teams}
        className="px-4 py-22 md:px-6 md:py-30"
        titleClassName="max-w-[11ch]"
        content={
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div className="sf-panel grid grid-cols-2 gap-x-6 gap-y-8 rounded-[28px] p-6 md:grid-cols-3">
              {data.teams.logos.map((logo, index) => (
                <div
                  key={`${logo.src}-${index}`}
                  className="flex h-14 items-center justify-center rounded-[18px] bg-[var(--sf-surface)]"
                >
                  <img src={logo.src} alt={logo.alt} className="max-h-7 w-auto max-w-[90%] object-contain" />
                </div>
              ))}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {data.teams.gallery.map((item, index) => (
                <MediaTile
                  key={`${item.src}-${index}`}
                  item={item}
                  className={index === 0 ? "aspect-[0.9/1]" : index === 1 ? "aspect-[0.9/1]" : "aspect-[1.1/1]"}
                />
              ))}
            </div>
          </div>
        }
      />

      <section className="px-4 pb-20 pt-8 md:px-6 md:pb-28">
        <div className="mx-auto max-w-[1440px] rounded-[40px] bg-[var(--sf-surface-strong)] px-6 py-14 md:px-10 md:py-18">
          <AnimatedWords
            as="h2"
            text={data.finalCta.title}
            className="max-w-[8ch] font-[family:var(--font-cosmos)] text-[3.1rem] leading-[0.98] tracking-[-0.04em] md:text-[4.75rem]"
            triggerOnView
          />

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {data.finalCta.buttons.map((button) => (
              <ActionLink key={button.label} action={button} />
            ))}
          </div>
        </div>
      </section>

      <footer className="px-4 pb-8 md:px-6 md:pb-10">
        <div className="mx-auto max-w-[1440px] border-t border-black/10 pt-5">
          <div className="grid gap-8 md:grid-cols-2">
            {data.footerGroups.map((group) => (
              <FooterGroup key={group.label} group={group} />
            ))}
          </div>
        </div>
      </footer>
    </main>
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
      const image = new Image();
      image.crossOrigin = "anonymous";
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
      roundedContext.strokeStyle = "rgba(0,0,0,0.12)";
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
      className="pointer-events-none absolute -left-[10%] h-screen w-[120%]"
      style={{
        opacity: clamp(1 - (filmProgress - 0.25) / 0.15),
        top: "calc(50% - 50vh)",
        transition: "opacity 220ms linear",
        WebkitMaskImage: "radial-gradient(45% 45%, transparent 0% 50.5%, #F7F7F8 90%)",
        contain: "layout style",
        maskImage: "radial-gradient(45% 45%, transparent 0% 50.5%, #F7F7F8 90%)",
      }}
    >
      <div
        className="absolute inset-0 transition-opacity duration-[2000ms] ease-out"
        style={{ opacity: ready ? 1 : 0 }}
      >
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[30%]"
          style={{
            background:
              "linear-gradient(to bottom, transparent 0%, rgba(247,247,248,0.45) 30%, rgba(247,247,248,0.8) 55%, #F7F7F8 80%)",
          }}
        />
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
            style={{ display: "block", height: "100%", pointerEvents: "none", width: "100%" }}
          />
        </div>
      </div>
    </div>
  );
}

function CosmosFilmHandoff({
  cta,
  progress,
  video,
  viewportWidth,
}: {
  cta: string;
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
  const buttonOpacity = clamp(1 - (progress - 0.2) / 0.24);
  const shadowOpacity = mapRange(progress, 0.14, 0.58, 0.08, 0.18);

  return (
    <section className="relative">
      <div className="relative h-[130dvh] -translate-y-24">
        <div
          className="pointer-events-none sticky flex h-dvh flex-col items-center justify-start"
          style={{
            marginBottom: `-${bottomOffset}px`,
            top: `${topOffset}px`,
          }}
        >
          <button
            type="button"
            className="sf-interactive pointer-events-auto mb-7 flex cursor-pointer items-center gap-2 rounded-full px-2 py-1"
            style={{ opacity: buttonOpacity }}
          >
            <span className="sf-copy-muted inline-flex h-4 w-4 items-center justify-center">
              <ArrowRightIcon className="h-4 w-4" />
            </span>
            <p className="sf-copy-soft text-[1.05rem] tracking-[0em]">{cta}</p>
          </button>

          <div
            className="group/film pointer-events-auto cursor-pointer overflow-hidden rounded-xl bg-white/30"
            style={{
              boxShadow: `0 28px 80px rgba(0,0,0,${shadowOpacity})`,
              height: `${videoHeight}px`,
              width: `${videoWidth}px`,
            }}
          >
            <div className="relative size-full">
              <video
                src={video.src}
                aria-label={video.alt}
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                className="mx-auto h-full w-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionFrame({
  section,
  content,
  className,
  titleClassName,
}: {
  section: CosmosFeatureSection;
  content: React.ReactNode;
  className?: string;
  titleClassName?: string;
}) {
  return (
    <section className={className}>
      <div className="mx-auto max-w-[1440px]">
        <div className="grid gap-10 border-t border-black/10 pt-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            {section.eyebrow ? (
              <p className="sf-eyebrow mb-4">{section.eyebrow}</p>
            ) : null}
            <AnimatedWords
              as="h2"
              text={section.title}
              className={cn(
                "font-[family:var(--font-cosmos)] text-[3rem] leading-[0.98] tracking-[-0.04em] text-[#111] md:text-[4.125rem]",
                titleClassName,
              )}
              triggerOnView
            />
          </div>
          <div>{content}</div>
        </div>
      </div>
    </section>
  );
}

function MediaTile({ item, className }: { item: CosmosMediaItem; className?: string }) {
  return (
    <div className={cn("sf-panel overflow-hidden rounded-[30px]", className)}>
      {item.kind === "video" ? (
        <video
          src={item.src}
          autoPlay
          loop
          muted
          playsInline
          className="h-full w-full object-cover"
        />
      ) : (
        <img src={item.src} alt={item.alt} className="h-full w-full object-cover" />
      )}
    </div>
  );
}

function ActionLink({
  action,
  className,
}: {
  action: CosmosButton;
  className?: string;
}) {
  const sharedClassName = cn(
    "sf-interactive sf-pill-button items-center gap-2 text-[0.92rem] tracking-[0em]",
    action.variant === "primary"
      ? "sf-pill-button-primary"
      : action.variant === "ghost"
        ? "sf-inline-link px-2 py-2"
        : "sf-pill-button-secondary",
    className,
  );

  if (action.external || action.href.startsWith("mailto:")) {
    return (
      <a
        href={action.href}
        target={action.href.startsWith("http") ? "_blank" : undefined}
        rel={action.href.startsWith("http") ? "noreferrer" : undefined}
        className={sharedClassName}
      >
        {action.label}
      </a>
    );
  }

  return (
    <TransitionLink href={action.href} className={sharedClassName}>
      {action.label}
    </TransitionLink>
  );
}

function FooterGroup({ group }: { group: CosmosFooterGroup }) {
  return (
    <div>
      <p className="sf-eyebrow mb-3">{group.label}</p>
      <div className="sf-copy-muted flex flex-wrap gap-x-5 gap-y-2 text-[0.95rem] tracking-[0em]">
        {group.links.map((link) =>
          link.external || link.href.startsWith("mailto:") ? (
            <a
              key={link.label}
              href={link.href}
              target={link.href.startsWith("http") ? "_blank" : undefined}
              rel={link.href.startsWith("http") ? "noreferrer" : undefined}
              className="sf-inline-link"
            >
              {link.label}
            </a>
          ) : (
            <TransitionLink key={link.label} href={link.href} className="sf-inline-link">
              {link.label}
            </TransitionLink>
          ),
        )}
      </div>
    </div>
  );
}
