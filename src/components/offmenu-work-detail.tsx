"use client";

import Image from "next/image";
import { useLayoutEffect, useRef } from "react";
import { isSanityImageUrl, sanityImageLoader } from "@/lib/sanity-image-loader";
import { StudioFinityFullPageFooter } from "@/components/studio-finity-full-page-footer";
import { StudioFinityHeader } from "@/components/studio-finity-header";
import { OffMenuWorkHero } from "@/components/offmenu-work-hero";
import { usePageTransition } from "@/components/page-transition-provider";
import { mountDataAboutScrollReveals } from "@/lib/gsap-data-about-reveal";
import { cn } from "@/lib/utils";
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

          {project.galleryMedia.length > 0 ? <WorkGallery items={project.galleryMedia} /> : null}
        </div>

        <StudioFinityFullPageFooter />
      </StudioFinityHeader>
    </main>
  );
}

function WorkGallery({ items }: { items: WorkGalleryItem[] }) {
  /** After the lead full-width tile, if the remainder count is odd the last tile spans both columns. */
  const remainderAfterLeadOdd = items.length > 1 && (items.length - 1) % 2 === 1;

  return (
    <section className="w-full pb-8 pt-4 md:pb-12 md:pt-6" aria-label="Project gallery">
      <div className="mx-auto w-full max-w-[2400px] px-3 sm:px-4 md:px-5 lg:px-6">
        <div className="grid w-full grid-cols-1 items-start gap-3 sm:gap-4 md:grid-cols-2 md:gap-5 lg:gap-6 xl:gap-8">
          {items.map((item, index) => {
            const isLead = index === 0;
            const isTailFullWidth =
              remainderAfterLeadOdd && index === items.length - 1 && !isLead;

            return (
              <WorkGalleryTile
                key={`${item.src}-${index}`}
                item={item}
                className={cn(
                  "min-w-0",
                  (isLead || isTailFullWidth) && "md:col-span-2",
                )}
                sizes={
                  isLead || isTailFullWidth
                    ? "(max-width: 767px) 100vw, min(100vw, 2400px)"
                    : "(max-width: 767px) 100vw, 50vw"
                }
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

function WorkGalleryTile({
  className,
  item,
  sizes,
}: {
  className?: string;
  item: WorkGalleryItem;
  sizes: string;
}) {
  const fallbackW = item.width ?? 1600;
  const intrinsicRatio =
    item.width && item.height
      ? item.width / item.height
      : item.aspectRatio ?? (item.kind === "video" ? 16 / 9 : 4 / 3);
  const fallbackH = item.height ?? Math.round(fallbackW / intrinsicRatio);

  return (
    <div
      className={cn(
        "overflow-hidden rounded-[20px] bg-muted/30 ring-1 ring-border/90 shadow-(--sf-shadow-media-md) md:rounded-[28px]",
        className,
      )}
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
          className="block h-auto w-full rounded-[20px] md:rounded-[28px]"
        />
      ) : (
        <Image
          src={item.src}
          alt={item.alt ?? item.title ?? "Gallery image"}
          blurDataURL={item.lqip}
          width={fallbackW}
          height={fallbackH}
          loader={isSanityImageUrl(item.src) ? sanityImageLoader : undefined}
          placeholder={item.lqip ? "blur" : "empty"}
          sizes={sizes}
          className="block h-auto w-full rounded-[20px] md:rounded-[28px]"
        />
      )}
    </div>
  );
}
