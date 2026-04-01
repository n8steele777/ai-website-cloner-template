"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { AnimatedWords } from "@/components/animated-words";
import { isSanityImageUrl, sanityImageLoader } from "@/lib/sanity-image-loader";
import { StudioFinityHeader } from "@/components/studio-finity-header";
import { OffMenuWorkFooter } from "@/components/offmenu-work-footer";
import { OffMenuWorkHero } from "@/components/offmenu-work-hero";
import { usePageTransition } from "@/components/page-transition-provider";
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
  const { pageReady } = usePageTransition();
  const introRootRef = useRef<HTMLElement | null>(null);

  useLayoutEffect(() => {
    const root = introRootRef.current;

    if (!root) {
      return;
    }

    let cancelled = false;
    const cleanups: Array<() => void> = [];

    const readyPromise =
      "fonts" in document ? document.fonts.ready.catch(() => undefined) : Promise.resolve();

    void readyPromise.then(() => {
      if (cancelled || !pageReady) {
        return;
      }

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        root.querySelectorAll<HTMLElement>("[data-about-reveal]").forEach((node) => {
          gsap.set(node, { clearProps: "all" });
        });
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
            },
            {
              autoAlpha: 1,
              y: 0,
              filter: "blur(0px)",
              duration: 0.9,
              delay: index * 0.038,
              ease: "power4.out",
              clearProps: "opacity,transform,filter,visibility",
            },
          );
        };

        const rect = node.getBoundingClientRect();
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
        if (rect.bottom > 0 && rect.top < viewportHeight * 0.96) {
          animate();
        } else {
          gsap.set(node, { autoAlpha: 0, y: 28, filter: "blur(8px)" });
          observer = new IntersectionObserver(
            (entries) => {
              entries.forEach((entry) => {
                if (!entry.isIntersecting) {
                  return;
                }

                observer?.disconnect();
                animate();
              });
            },
            { threshold: 0, rootMargin: "0px 0px -12% 0px" },
          );
          observer.observe(node);
        }

        cleanups.push(() => {
          observer?.disconnect();
          gsap.killTweensOf(node);
        });
      });
    });

    return () => {
      cancelled = true;
      cleanups.forEach((cleanup) => cleanup());
    };
  }, [pageReady]);

  const relatedProjects = project.relatedSlugs
    .map((slug) => caseStudies.find((caseStudy) => caseStudy.slug === slug))
    .filter((caseStudy): caseStudy is CaseStudy => Boolean(caseStudy));
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

        {relatedProjects.length > 0 ? (
          <section className="p-4 md:p-6 lg:p-8">
          <AnimatedWords
            as="h2"
            text="Want to see more?"
            className="sf-title-xl mb-8 md:mb-10"
            lineClassName="leading-[1.04]"
            triggerOnView
          />

          <div className="group/row flex flex-col gap-4 md:min-h-128 md:flex-row md:items-stretch md:gap-6 lg:min-h-144">
            {relatedProjects.map((relatedProject, index) => {
              const relatedImage = relatedProject.thumbnailLightXl;

              return (
                <Link
                  key={relatedProject.slug}
                  href={relatedProject.href}
                  className={
                    index === 0
                      ? "peer/left flex min-h-0 flex-1 flex-col transition-[flex] duration-880 ease-sf-out md:h-full md:hover:flex-[1.55] md:peer-hover/right:flex-[0.92]"
                      : "peer/right flex min-h-0 flex-1 flex-col transition-[flex] duration-880 ease-sf-out md:h-full md:hover:flex-[1.55] md:peer-hover/left:flex-[0.92]"
                  }
                >
                  <div className="relative aspect-[1.18/1] w-full min-h-0 shrink-0 overflow-hidden rounded-2xl md:flex-1 md:basis-0 md:aspect-auto">
                    <Image
                      src={relatedImage}
                      alt={relatedProject.title}
                      blurDataURL={relatedProject.thumbnailLqip}
                      fill
                      loader={
                        isSanityImageUrl(relatedImage) ? sanityImageLoader : undefined
                      }
                      placeholder={relatedProject.thumbnailLqip ? "blur" : "empty"}
                      sizes="(max-width: 767px) 100vw, 50vw"
                      className="object-cover"
                    />
                  </div>
                  <p className="sf-caption-strong mt-3 min-w-0 shrink-0 wrap-break-word text-foreground">
                    {relatedProject.title}
                  </p>
                </Link>
              );
            })}
          </div>
          </section>
        ) : null}

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

        <OffMenuWorkFooter navigationLinks={navigationLinks} />
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
