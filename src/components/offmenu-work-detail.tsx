"use client";

import Image from "next/image";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatedWords } from "@/components/animated-words";
import { isSanityImageUrl, sanityImageLoader } from "@/lib/sanity-image-loader";
import { StudioFinityHeader } from "@/components/studio-finity-header";
import { OffMenuWorkHero } from "@/components/offmenu-work-hero";
import { usePageTransition } from "@/components/page-transition-provider";
import { mountDataAboutScrollReveals } from "@/lib/gsap-data-about-reveal";
import type { NavLink, WorkGalleryItem, WorkProjectDetail } from "@/types/offmenu";

interface OffMenuWorkDetailProps {
  navigationLinks: NavLink[];
  project: WorkProjectDetail;
  resourceLinks: NavLink[];
}

export function OffMenuWorkDetail({
  navigationLinks,
  project,
  resourceLinks: _resourceLinks,
}: OffMenuWorkDetailProps) {
  void _resourceLinks;
  const { pageReady } = usePageTransition();
  const introRootRef = useRef<HTMLElement | null>(null);

  useLayoutEffect(() => {
    const root = introRootRef.current;
    if (!root) {
      return;
    }
    return mountDataAboutScrollReveals(root, pageReady);
  }, [pageReady]);

  const galleryBlocks = buildGalleryBlocks(project.galleryMedia);

  return (
    <main className="offmenu-shell bg-background text-foreground">
      <StudioFinityHeader activeHref="/work" links={navigationLinks}>
        <div className="min-h-screen">
          <OffMenuWorkHero
            heroImage={project.heroImageLight}
            heroLqip={project.heroLqip}
            slug={project.slug}
            title={project.title}
          />

          <section
            ref={introRootRef}
            className="p-6 md:p-8 lg:p-10 xl:p-12"
            id="introduction"
          >
            <div className="max-w-5xl">
              <span data-about-reveal className="sf-eyebrow text-foreground">
                Introduction
              </span>
              <p
                data-about-reveal
                className="sf-title-xl mt-8 max-w-4xl wrap-break-word whitespace-pre-line"
              >
                {project.introduction}
              </p>
            </div>
          </section>

          {galleryBlocks.length > 0 ? <WorkGallery blocks={galleryBlocks} /> : null}
        </div>

        <section className="flex flex-col items-center justify-center gap-8 p-8 text-center md:p-10 lg:p-12">
          <AnimatedWords
            as="h2"
            text={project.ctaTitle}
            className="sf-title-xl text-center"
            lineClassName="leading-[1.04]"
            triggerOnView
          />
          <a
            href={project.ctaHref}
            className="sf-interactive sf-pill-button sf-pill-button-primary text-base md:text-lg"
          >
            {project.ctaLabel}
          </a>
        </section>
      </StudioFinityHeader>
    </main>
  );
}

type GalleryBlock =
  | {
      items: [WorkGalleryItem];
      type: "feature";
    }
  | {
      items: [WorkGalleryItem, WorkGalleryItem];
      type: "pair";
    }
  | {
      items: [WorkGalleryItem, WorkGalleryItem, WorkGalleryItem];
      type: "triptych";
    };

function buildGalleryBlocks(items: WorkGalleryItem[]): GalleryBlock[] {
  const blocks: GalleryBlock[] = [];
  let index = 0;
  let useFeature = true;

  while (index < items.length) {
    const remaining = items.length - index;

    if (useFeature || remaining === 1) {
      blocks.push({
        type: "feature",
        items: [items[index]!],
      });
      index += 1;
      useFeature = false;
      continue;
    }

    if (remaining >= 3) {
      blocks.push({
        type: "triptych",
        items: [items[index]!, items[index + 1]!, items[index + 2]!],
      });
      index += 3;
      useFeature = true;
      continue;
    }

    blocks.push({
      type: "pair",
      items: [items[index]!, items[index + 1]!],
    });
    index += 2;
    useFeature = true;
  }

  return blocks;
}

function WorkGallery({ blocks }: { blocks: GalleryBlock[] }) {
  return (
    <section className="p-4 md:p-6 lg:p-8">
      <div className="space-y-4 md:space-y-6">
        {blocks.map((block, index) => {
          if (block.type === "feature") {
            return (
              <div key={`${block.items[0].src}-${index}`} className="overflow-hidden rounded-[20px] md:rounded-[28px]">
                <WorkGalleryCard item={block.items[0]} fallbackAspectRatio={1.45} sizes="100vw" />
              </div>
            );
          }

          if (block.type === "pair") {
            return (
              <div
                key={`${block.items[0].src}-${block.items[1].src}-${index}`}
                className="grid grid-cols-1 gap-4 md:grid-cols-[1.15fr_0.85fr] md:gap-6"
              >
                <WorkGalleryCard item={block.items[0]} fallbackAspectRatio={0.95} sizes="(max-width: 767px) 100vw, 58vw" />
                <WorkGalleryCard item={block.items[1]} fallbackAspectRatio={0.82} sizes="(max-width: 767px) 100vw, 42vw" />
              </div>
            );
          }

          return (
            <div
              key={`${block.items[0].src}-${block.items[1].src}-${block.items[2].src}-${index}`}
              className="grid grid-cols-1 gap-4 md:grid-cols-[0.95fr_1.1fr] md:grid-rows-2 md:gap-6"
            >
              <WorkGalleryCard
                item={block.items[0]}
                cardClassName="md:row-span-2"
                fallbackAspectRatio={0.9}
                sizes="(max-width: 767px) 100vw, 44vw"
              />
              <WorkGalleryCard
                item={block.items[1]}
                fallbackAspectRatio={1.25}
                sizes="(max-width: 767px) 100vw, 56vw"
              />
              <WorkGalleryCard
                item={block.items[2]}
                fallbackAspectRatio={1.25}
                sizes="(max-width: 767px) 100vw, 56vw"
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}

function WorkGalleryCard({
  cardClassName,
  item,
  fallbackAspectRatio,
  sizes,
}: {
  cardClassName?: string;
  item: WorkGalleryItem;
  fallbackAspectRatio: number;
  sizes: string;
}) {
  const defaultAspectRatio =
    item.aspectRatio ??
    (item.width && item.height ? item.width / item.height : item.kind === "video" ? 16 / 9 : fallbackAspectRatio);
  const [aspectRatio, setAspectRatio] = useState(defaultAspectRatio);

  useEffect(() => {
    setAspectRatio(defaultAspectRatio);
  }, [defaultAspectRatio]);

  return (
    <div
      className={`${cardClassName ?? ""} overflow-hidden rounded-[20px] bg-black/3 md:rounded-[28px]`}
      style={{ aspectRatio: `${aspectRatio}` }}
    >
      {item.kind === "video" ? (
        <video
          src={item.src}
          aria-label={item.alt ?? item.title ?? "Gallery video"}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className="h-full w-full object-cover"
          onLoadedMetadata={(event) => {
            const { videoHeight, videoWidth } = event.currentTarget;

            if (videoWidth > 0 && videoHeight > 0) {
              setAspectRatio(videoWidth / videoHeight);
            }
          }}
        />
      ) : (
        <Image
          src={item.src}
          alt={item.alt ?? item.title ?? "Gallery image"}
          blurDataURL={item.lqip}
          width={item.width ?? 1400}
          height={item.height ?? Math.round((item.width ?? 1400) / fallbackAspectRatio)}
          loader={isSanityImageUrl(item.src) ? sanityImageLoader : undefined}
          placeholder={item.lqip ? "blur" : "empty"}
          sizes={sizes}
          className="h-full w-full object-cover"
        />
      )}
    </div>
  );
}
