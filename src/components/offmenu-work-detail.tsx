"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatedWords } from "@/components/animated-words";
import { StudioFinityHeader } from "@/components/studio-finity-header";
import { OffMenuWorkFooter } from "@/components/offmenu-work-footer";
import { OffMenuWorkHero } from "@/components/offmenu-work-hero";
import type { CaseStudy, NavLink, WorkGalleryItem, WorkProjectDetail } from "@/types/offmenu";

interface OffMenuWorkDetailProps {
  caseStudies: CaseStudy[];
  navigationLinks: NavLink[];
  project: WorkProjectDetail;
  resourceLinks: NavLink[];
}

export function OffMenuWorkDetail({
  caseStudies,
  navigationLinks,
  project,
  resourceLinks: _resourceLinks,
}: OffMenuWorkDetailProps) {
  void _resourceLinks;
  const relatedProjects = project.relatedSlugs
    .map((slug) => caseStudies.find((caseStudy) => caseStudy.slug === slug))
    .filter((caseStudy): caseStudy is CaseStudy => Boolean(caseStudy));
  const galleryBlocks = buildGalleryBlocks(project.galleryMedia);

  return (
    <main className="offmenu-shell bg-background text-foreground">
      <StudioFinityHeader
        activeHref="/work"
        links={navigationLinks}
        overlay
      />

      <div className="min-h-screen">
        <OffMenuWorkHero
          heroImage={project.heroImageLight}
          slug={project.slug}
          title={project.title}
        />

        <section className="px-6 pb-14 pt-24 md:px-12 md:pb-16 md:pt-28 lg:px-20" id="introduction">
          <div className="max-w-5xl">
            <span className="sf-eyebrow text-foreground">Introduction</span>
            <p className="sf-title-xl mt-8 max-w-4xl whitespace-pre-line">
              {project.introduction}
            </p>
          </div>
        </section>

        {galleryBlocks.length > 0 ? <WorkGallery blocks={galleryBlocks} /> : null}
      </div>

      {relatedProjects.length > 0 ? (
        <section className="px-4 pb-10 pt-18 md:px-6 md:pb-12 md:pt-20 lg:px-8">
          <AnimatedWords
            as="h2"
            text="Want to see more?"
            className="sf-title-xl mb-8 md:mb-10"
            triggerOnView
          />

          <div className="group/row flex flex-col gap-4 md:min-h-[32rem] md:flex-row md:gap-6 lg:min-h-[36rem]">
            {relatedProjects.map((relatedProject, index) => {
              const relatedImage = relatedProject.thumbnailLightXl;

              return (
                <Link
                  key={relatedProject.slug}
                  href={relatedProject.href}
                  className={
                    index === 0
                      ? "peer/left aspect-[1.18/1] flex-1 transition-[flex] duration-700 ease-[cubic-bezier(0.85,0.09,0.15,0.91)] md:h-full md:aspect-auto md:hover:flex-[1.55] md:peer-hover/right:flex-[0.92]"
                      : "peer/right aspect-[1.18/1] flex-1 transition-[flex] duration-700 ease-[cubic-bezier(0.85,0.09,0.15,0.91)] md:h-full md:aspect-auto md:hover:flex-[1.55] md:peer-hover/left:flex-[0.92]"
                  }
                >
                  <div className="flex h-full flex-col">
                    <div className="group relative block flex-1 cursor-pointer">
                      <div className="relative h-full w-full overflow-hidden rounded-2xl">
                        <Image
                          src={relatedImage}
                          alt={relatedProject.title}
                          fill
                          sizes="(max-width: 767px) 100vw, 50vw"
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                      </div>
                    </div>
                    <p className="sf-caption-strong mt-3 text-foreground">{relatedProject.title}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}

      <section className="flex flex-col items-center justify-center gap-8 px-6 pb-24 pt-18 text-center md:px-8 md:pb-28 md:pt-24">
        <AnimatedWords
          as="h2"
          text={project.ctaTitle}
          className="sf-title-xl text-center"
          triggerOnView
        />
        <a
          href={project.ctaHref}
          className="sf-interactive sf-pill-button sf-pill-button-primary text-base md:text-lg"
        >
          {project.ctaLabel}
        </a>
      </section>

      <OffMenuWorkFooter navigationLinks={navigationLinks} />
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
    <section className="px-4 pb-8 pt-4 md:px-6 md:pb-10 lg:px-8">
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
      className={`${cardClassName ?? ""} overflow-hidden rounded-[20px] bg-black/[0.03] md:rounded-[28px]`}
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
          width={item.width ?? 1400}
          height={item.height ?? Math.round((item.width ?? 1400) / fallbackAspectRatio)}
          sizes={sizes}
          className="h-full w-full object-cover"
        />
      )}
    </div>
  );
}
