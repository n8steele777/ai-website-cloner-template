"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type CSSProperties, type SVGProps } from "react";
import { ArrowRightIcon } from "@/components/icons";
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [heroScrollProgress, setHeroScrollProgress] = useState(0);
  const [heroViewportHeight, setHeroViewportHeight] = useState(900);
  const [heroViewportWidth, setHeroViewportWidth] = useState(1440);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) {
        setMenuOpen(false);
      }

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
    <main className="min-h-screen bg-[#f9f7f3] font-cosmos text-[#101010]">
      <header className="sticky top-0 z-[200] hidden h-[105px] w-full items-center justify-between gap-[72px] px-3 py-6 text-[#111] md:flex md:px-8">
        <div className="relative z-20 flex min-w-0 items-center gap-1">
          <Link
            href="/"
            aria-label="Studio Finity home"
            className="hidden h-[54px] w-[54px] shrink-0 items-center justify-center rounded-full border border-black/10 bg-[#f5f2eb] lg:flex"
          >
            <img src="/cosmos-icon-light.svg" alt="" className="h-auto w-[22px]" />
          </Link>

          <button
            type="button"
            aria-expanded={menuOpen}
            aria-label="Toggle navigation"
            className="relative z-20 flex h-[54px] min-w-[140px] items-center justify-center gap-2 rounded-full border border-black/10 bg-[#f5f2eb] px-4 text-[14px] font-medium tracking-[-0.02em] xl:hidden"
            onClick={() => setMenuOpen((current) => !current)}
          >
            <span className="max-w-[12ch] truncate">{menuOpen ? "Close" : "Menu"}</span>
            <ChevronDownIcon
              className={cn("h-4 w-4 transition-transform duration-300", menuOpen && "rotate-180")}
            />
          </button>

          <div className="hidden h-[54px] items-center gap-6 rounded-full border border-black/10 bg-[#f5f2eb] px-8 text-[14px] font-medium tracking-[-0.02em] xl:flex">
            {data.headerLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-black/62 transition-colors hover:text-black"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="absolute inset-x-0 mx-auto hidden max-w-[600px] items-center justify-center md:flex">
          <div className="pointer-events-auto flex h-[54px] min-w-[392px] items-center rounded-full font-medium tracking-[-0.02em] transition-[flex-grow] duration-500 ease-out lg:min-w-[416px]">
            <div className="group relative flex h-full w-full flex-1 items-center gap-2 rounded-full border border-black/10 bg-[#f5f2eb] p-2">
              <div className="flex shrink-0 items-center gap-1">
                <SearchIcon className="ml-2 mr-0.5 h-4 w-4 text-black/42" />
              </div>
              <input
                type="text"
                readOnly
                value=""
                placeholder="Search Cosmos..."
                className="h-full w-full bg-transparent text-[14px] font-normal text-black outline-none placeholder:text-black/42"
              />
              <div className="flex items-center">
                <button type="button" className="flex h-9.5 w-9.5 items-center justify-center rounded-full">
                  <FocusIcon className="h-5 w-5 text-black/42" />
                </button>
                <button
                  type="button"
                  className="hidden h-9.5 w-9.5 items-center justify-center rounded-full lg:flex"
                >
                  <PaletteIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {data.headerActions.map((action) => (
            <TopNavActionLink key={action.label} action={action} />
          ))}
        </div>
      </header>

      <div className="px-4 pt-3 md:hidden">
        <div className="flex items-center justify-between gap-2">
          <Link
            href="/"
            aria-label="Studio Finity home"
            className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-full border border-black/10 bg-[#f5f2eb]"
          >
            <img src="/cosmos-icon-light.svg" alt="" className="h-auto w-5" />
          </Link>
          <button
            type="button"
            aria-expanded={menuOpen}
            aria-label="Toggle navigation"
            className="flex h-[48px] flex-1 items-center justify-center gap-2 rounded-full border border-black/10 bg-[#f5f2eb] px-4 text-[13px] font-medium tracking-[-0.02em]"
            onClick={() => setMenuOpen((current) => !current)}
          >
            {menuOpen ? "Close" : "Menu"}
            <ChevronDownIcon
              className={cn("h-4 w-4 transition-transform duration-300", menuOpen && "rotate-180")}
            />
          </button>
          <TopNavActionLink action={data.headerActions[1]} compact />
        </div>
        {menuOpen ? (
          <div className="mt-2 rounded-[24px] border border-black/10 bg-[#f5f2eb] p-4">
            <div className="flex flex-col gap-3 text-[14px] tracking-[-0.02em]">
              {data.headerLinks.map((link) => (
                <Link key={link.label} href={link.href} className="text-black/72">
                  {link.label}
                </Link>
              ))}
              <a href={data.headerActions[0].href} className="text-black/72">
                {data.headerActions[0].label}
              </a>
            </div>
          </div>
        ) : null}
      </div>

      <section className="sticky top-0 z-0 -mt-[72px] flex h-dvh flex-col items-center justify-center overflow-hidden bg-[#f9f7f3] md:-mt-[105px]">
        <CosmosHeroWhirl imageUrls={data.heroSpiralImages} filmProgress={filmHandoffProgress} />

        <div style={heroHeadlineStyle}>
          <div className="relative z-10 flex flex-col items-center gap-5">
            <CosmosWordmark className="h-auto w-25 text-[#111]" />

            <h1 className="font-cosmos text-pretty text-center text-[54px] font-[350] leading-none tracking-[-2.7px] text-[#111] md:text-[74px] md:tracking-[-3.7px]">
              Your space
              <br />
              for inspiration
            </h1>

            <div className="mt-2.5">
              <div className="flex gap-2">
                <HeroActionLink action={data.heroButtons[0]} className="pointer-events-auto lg:hidden" />
                <HeroActionLink
                  action={data.heroButtons[0]}
                  desktopPrimary
                  className="pointer-events-auto hidden lg:flex"
                />
                <HeroActionLink
                  action={data.heroButtons[1]}
                  desktopSecondary
                  className="pointer-events-auto hidden lg:flex"
                />
              </div>
            </div>
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
              <p className="text-[0.78rem] uppercase tracking-[0.18em] text-black/42">
                {data.searchWorld.sideLabel}
              </p>
              <p className="mt-4 text-[1.35rem] leading-[1.18] tracking-[-0.04em] text-black/82 md:text-[1.7rem]">
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
              <p className="text-lg tracking-[-0.04em] text-black/68 md:text-xl">{data.filters.body}</p>
            </div>

            <div className="grid gap-4">
              <div className="flex flex-wrap gap-2">
                {data.filters.chips.map((chip) => (
                  <span
                    key={chip.label}
                    className="rounded-full border border-black/10 bg-white/70 px-4 py-2 text-[0.83rem] tracking-[-0.03em] text-black/80"
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
              <div className="space-y-5 text-[0.98rem] leading-[1.35] tracking-[-0.03em] text-black/64 md:text-[1.06rem]">
                {data.attribution.credits.map((item) => (
                  <p key={item}>{item}</p>
                ))}
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-[0.82fr_1.18fr] md:items-end">
              <MediaTile item={data.attribution.media[0]} className="aspect-[0.8/1]" />
              <div className="space-y-6">
                <MediaTile item={data.attribution.media[1]} className="aspect-[0.95/1]" />
                <p className="max-w-[28rem] text-[1.15rem] leading-[1.2] tracking-[-0.04em] text-black/82 md:text-[1.5rem]">
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
            <div className="grid grid-cols-2 gap-x-6 gap-y-8 rounded-[28px] border border-black/8 bg-white/72 p-6 md:grid-cols-3">
              {data.teams.logos.map((logo, index) => (
                <div
                  key={`${logo.src}-${index}`}
                  className="flex h-14 items-center justify-center rounded-[18px] bg-[#f8f6f1]"
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
        <div className="mx-auto max-w-[1440px] rounded-[40px] bg-[#efebe1] px-6 py-14 md:px-10 md:py-18">
          <h2 className="max-w-[8ch] font-[family:var(--font-cosmos)] text-[3.1rem] leading-[0.98] tracking-[-0.06em] md:text-[4.75rem]">
            {data.finalCta.title}
          </h2>

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
        WebkitMaskImage: "radial-gradient(45% 45%, transparent 0% 50.5%, #F9F7F3 90%)",
        contain: "layout style",
        maskImage: "radial-gradient(45% 45%, transparent 0% 50.5%, #F9F7F3 90%)",
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
              "linear-gradient(to bottom, transparent 0%, rgba(249,247,243,0.45) 30%, rgba(249,247,243,0.8) 55%, #F9F7F3 80%)",
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
            className="pointer-events-auto mb-7 flex cursor-pointer items-center gap-2"
            style={{ opacity: buttonOpacity }}
          >
            <span className="inline-flex h-4 w-4 items-center justify-center text-black/72">
              <ArrowRightIcon className="h-4 w-4" />
            </span>
            <p className="font-cosmos text-[1.05rem] tracking-[-0.04em] text-black/85">{cta}</p>
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

function CosmosWordmark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="89" height="15" viewBox="0 0 89 15" fill="none" {...props}>
      <path d="M83.5012 15C80.0429 15 77.7929 13.125 77.5012 10.3333H80.1887C80.6262 12 81.9804 12.625 83.5012 12.625C85.0637 12.625 86.1471 11.8542 86.1471 10.7708C86.1471 9.58333 85.2721 9.10417 83.3346 8.6875L82.0637 8.41667C79.9387 7.95833 77.9804 6.85417 77.9804 4.35417C77.9804 1.875 80.1262 0 83.2304 0C86.4387 0 88.2929 1.75 88.7512 4.47917H86.0637C85.7304 3.08333 84.7929 2.35417 83.2304 2.35417C81.6887 2.35417 80.7304 3.125 80.7304 4.14583C80.7304 5.1875 81.6054 5.60417 83.2929 6L84.5637 6.29167C86.8971 6.83333 88.9596 7.83333 88.9596 10.5208C88.9596 13.125 86.7929 15 83.5012 15Z" fill="currentColor" />
      <path d="M69.1056 15C64.9181 15 61.7097 11.8542 61.7097 7.5C61.7097 3.14583 64.9181 0 69.1056 0C73.2931 0 76.5014 3.14583 76.5014 7.5C76.5014 11.8542 73.2931 15 69.1056 15ZM69.1056 12.5C71.7931 12.5 73.6264 10.3125 73.6264 7.5C73.6264 4.6875 71.7931 2.5 69.1056 2.5C66.4181 2.5 64.5847 4.6875 64.5847 7.5C64.5847 10.3125 66.4181 12.5 69.1056 12.5Z" fill="currentColor" />
      <path d="M47.1996 14.6875H44.7205V0.3125H48.7621L52.408 11.0625L56.0955 0.3125H59.9705V14.6875H57.4705V3L53.5955 14.6875H51.1163L47.1996 2.9375V14.6875Z" fill="currentColor" />
      <path d="M37.366 15C33.9076 15 31.6576 13.125 31.366 10.3333H34.0535C34.491 12 35.8451 12.625 37.366 12.625C38.9285 12.625 40.0118 11.8542 40.0118 10.7708C40.0118 9.58333 39.1368 9.10417 37.1993 8.6875L35.9285 8.41667C33.8035 7.95833 31.8451 6.85417 31.8451 4.35417C31.8451 1.875 33.991 0 37.0951 0C40.3035 0 42.1576 1.75 42.616 4.47917H39.9285C39.5951 3.08333 38.6576 2.35417 37.0951 2.35417C35.5535 2.35417 34.5951 3.125 34.5951 4.14583C34.5951 5.1875 35.4701 5.60417 37.1576 6L38.4285 6.29167C40.7618 6.83333 42.8243 7.83333 42.8243 10.5208C42.8243 13.125 40.6576 15 37.366 15Z" fill="currentColor" />
      <path d="M22.9703 15C18.7828 15 15.5745 11.8542 15.5745 7.5C15.5745 3.14583 18.7828 0 22.9703 0C27.1578 0 30.3661 3.14583 30.3661 7.5C30.3661 11.8542 27.1578 15 22.9703 15ZM22.9703 12.5C25.6578 12.5 27.4911 10.3125 27.4911 7.5C27.4911 4.6875 25.6578 2.5 22.9703 2.5C20.2828 2.5 18.4495 4.6875 18.4495 7.5C18.4495 10.3125 20.2828 12.5 22.9703 12.5Z" fill="currentColor" />
      <path d="M7.39583 15C3.27083 15 0 11.8958 0 7.52083C0 3.16667 3.27083 0 7.39583 0C11.0417 0 13.8542 2.3125 14.5 5.75H11.6458C11.0833 3.83333 9.52083 2.5 7.39583 2.5C4.72917 2.5 2.875 4.625 2.875 7.5C2.875 10.3333 4.72917 12.5 7.39583 12.5C9.45833 12.5 11 11.2708 11.6042 9.45833H14.4792C13.7917 12.75 11.0208 15 7.39583 15Z" fill="currentColor" />
    </svg>
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
              <p className="mb-4 text-[0.78rem] uppercase tracking-[0.18em] text-black/42">
                {section.eyebrow}
              </p>
            ) : null}
            <h2
              className={cn(
                "font-[family:var(--font-cosmos)] text-[3rem] leading-[0.98] tracking-[-0.055em] text-[#111] md:text-[4.125rem]",
                titleClassName,
              )}
            >
              {section.title}
            </h2>
          </div>
          <div>{content}</div>
        </div>
      </div>
    </section>
  );
}

function MediaTile({ item, className }: { item: CosmosMediaItem; className?: string }) {
  return (
    <div className={cn("overflow-hidden rounded-[30px] bg-white/70 shadow-[0_18px_50px_rgba(0,0,0,0.06)]", className)}>
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

function TopNavActionLink({
  action,
  compact = false,
}: {
  action: CosmosButton;
  compact?: boolean;
}) {
  const className = cn(
    "relative inline-flex select-none items-center justify-center gap-x-1 rounded-full border border-transparent transition-all duration-200",
    action.variant === "primary"
      ? "bg-[#111] text-white hover:opacity-90"
      : "text-[#111] hover:bg-black/[0.04]",
    compact
      ? "h-[48px] min-w-[48px] px-4 py-3 text-[13px] font-medium tracking-[-0.02em]"
      : "h-12 px-6 py-4 text-[15px] font-medium tracking-[-0.02em]",
  );

  const label = compact ? "Work" : action.label;

  if (action.external || action.href.startsWith("mailto:")) {
    return (
      <a
        href={action.href}
        target={action.href.startsWith("http") ? "_blank" : undefined}
        rel={action.href.startsWith("http") ? "noreferrer" : undefined}
        className={className}
      >
        {label}
      </a>
    );
  }

  return (
    <Link href={action.href} className={className}>
      {label}
    </Link>
  );
}

function HeroActionLink({
  action,
  className,
  desktopPrimary = false,
  desktopSecondary = false,
}: {
  action: CosmosButton;
  className?: string;
  desktopPrimary?: boolean;
  desktopSecondary?: boolean;
}) {
  const actionClassName = cn(
    "relative inline-flex cursor-pointer select-none items-center justify-center gap-x-1 rounded-full transition-all",
    desktopPrimary
      ? "h-14 border border-transparent bg-[#111] px-6 py-4 text-[16px] font-medium tracking-[-0.02em] text-white"
      : desktopSecondary
        ? "h-14 border border-black/12 bg-transparent px-6 py-4 text-[16px] font-medium tracking-[-0.02em] text-[#111] hover:bg-black/[0.03]"
        : "h-12 border border-transparent bg-[#111] px-6 py-4 text-[15px] font-medium tracking-[-0.02em] text-white",
    className,
  );

  if (action.external || action.href.startsWith("mailto:")) {
    return (
      <a
        href={action.href}
        target={action.href.startsWith("http") ? "_blank" : undefined}
        rel={action.href.startsWith("http") ? "noreferrer" : undefined}
        className={actionClassName}
      >
        {action.label}
      </a>
    );
  }

  return (
    <Link href={action.href} className={actionClassName}>
      {action.label}
    </Link>
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
    "inline-flex items-center gap-2 rounded-full px-5 py-3 text-[0.92rem] tracking-[-0.03em] transition-transform duration-200 hover:-translate-y-0.5",
    action.variant === "primary"
      ? "bg-[#101010] text-white"
      : action.variant === "ghost"
        ? "text-black/72"
        : "border border-black/10 bg-white/76 text-black",
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
    <Link href={action.href} className={sharedClassName}>
      {action.label}
    </Link>
  );
}

function SearchIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" {...props}>
      <path stroke="currentColor" strokeWidth="1.75" d="M20.25 20.25 16 16" />
      <circle cx="10.75" cy="10.75" r="7.5" stroke="currentColor" strokeWidth="1.754" />
    </svg>
  );
}

function FocusIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" {...props}>
      <path
        fill="currentColor"
        d="M8.498 11.996a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0m5.2.009a1.7 1.7 0 1 0-3.4-.02 1.7 1.7 0 0 0 3.4.02M18.195 15.002h1.795a.4.4 0 0 1 .008.054c0 .355.009.71 0 1.064a3.9 3.9 0 0 1-.837 2.326 3.95 3.95 0 0 1-2.356 1.47q-.38.08-.768.08h-1.021c-.018-.066-.022-1.693-.005-1.8h.984a2.16 2.16 0 0 0 1.85-1.01c.229-.342.35-.744.349-1.156v-1.0250000000000001M15.001 5.798V4.01a.2.2 0 0 1 .045-.01c.392 0 .786-.01 1.177.01.917.042 1.79.407 2.462 1.032a3.99 3.99 0 0 1 1.306 2.925v1.028h-1.8v-.087c0-.325.006-.65 0-.976a2.185 2.185 0 0 0-1.453-2 2 2 0 0 0-.694-.128H15M4.004 15.001h1.792v.985c-.004.411.11.815.33 1.163a2.17 2.17 0 0 0 1.9 1.041h.963v1.795l-.058.006c-.347 0-.694.007-1.04 0a3.9 3.9 0 0 1-2.115-.672 3.95 3.95 0 0 1-1.633-2.247 3.9 3.9 0 0 1-.147-1.067v-1.008M4.007 8.994v-.048c-.006-.382-.012-.768.002-1.145a3.8 3.8 0 0 1 .524-1.791A3.96 3.96 0 0 1 6.75 4.202a3.9 3.9 0 0 1 1.236-.2h1.0090000000000001v1.797H7.958A2.2 2.2 0 0 0 5.8 7.989v1.004z"
      />
    </svg>
  );
}

function PaletteIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" {...props}>
      <ellipse cx="6.796" cy="17.118" fill="#4694F6" rx="1.952" ry="1.941" />
      <ellipse cx="17.205" cy="17.231" fill="#C877CB" rx="1.952" ry="1.941" />
      <ellipse cx="6.796" cy="6.882" fill="#81B386" rx="1.952" ry="1.941" />
      <ellipse cx="17.205" cy="6.769" fill="#9C6030" rx="1.952" ry="1.941" />
      <ellipse cx="19.548" cy="11.686" fill="#A0213E" rx="1.952" ry="1.941" />
      <ellipse cx="12.001" cy="4.441" fill="#EBB042" rx="1.952" ry="1.941" />
      <ellipse cx="4.452" cy="11.686" fill="#77CDD0" rx="1.952" ry="1.941" />
      <ellipse cx="12" cy="19.559" fill="#6951F5" rx="1.952" ry="1.941" />
    </svg>
  );
}

function ChevronDownIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M4.25 9.25 12 17l7.75-7.75"
      />
    </svg>
  );
}

function FooterGroup({ group }: { group: CosmosFooterGroup }) {
  return (
    <div>
      <p className="mb-3 text-[0.78rem] uppercase tracking-[0.18em] text-black/42">{group.label}</p>
      <div className="flex flex-wrap gap-x-5 gap-y-2 text-[0.95rem] tracking-[-0.03em] text-black/72">
        {group.links.map((link) =>
          link.external || link.href.startsWith("mailto:") ? (
            <a
              key={link.label}
              href={link.href}
              target={link.href.startsWith("http") ? "_blank" : undefined}
              rel={link.href.startsWith("http") ? "noreferrer" : undefined}
              className="transition-opacity hover:opacity-60"
            >
              {link.label}
            </a>
          ) : (
            <Link key={link.label} href={link.href} className="transition-opacity hover:opacity-60">
              {link.label}
            </Link>
          ),
        )}
      </div>
    </div>
  );
}
