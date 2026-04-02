"use client";

import Image from "next/image";
import { useLayoutEffect, useRef } from "react";
import { imageLoader, isSanityImageUrl } from "@/lib/sanity-image-loader";
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
  const hasWorkMeta = Boolean(project.deliverables && project.deliverables.length > 0);

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
            className="border-border/70 border-t px-4 py-12 md:py-16 lg:py-20"
            id="introduction"
          >
            <div
              className={cn(
                "mx-auto w-full max-w-[2400px]",
                hasWorkMeta &&
                  "grid grid-cols-1 gap-10 md:grid-cols-[minmax(0,17.5rem)_minmax(0,1fr)] md:items-start md:gap-0 lg:grid-cols-[minmax(0,19.5rem)_minmax(0,1fr)]",
              )}
            >
              {hasWorkMeta ? <WorkDetailMetaColumn deliverables={project.deliverables} /> : null}
              <div
                className={cn(
                  "min-w-0",
                  hasWorkMeta && "md:border-border md:border-l md:pl-8 lg:pl-12",
                  !hasWorkMeta && "mx-auto max-w-5xl",
                )}
              >
                <p
                  data-about-reveal
                  className={cn(
                    "sf-title-xl text-balance wrap-break-word whitespace-pre-line tracking-[-0.02em]",
                    !hasWorkMeta && "max-w-4xl",
                  )}
                >
                  {project.introduction}
                </p>
              </div>
            </div>
          </section>

          {project.galleryMedia.length > 0 ? <WorkGallery items={project.galleryMedia} /> : null}
        </div>

        <StudioFinityFullPageFooter />
      </StudioFinityHeader>
    </main>
  );
}

function WorkDetailMetaColumn({ deliverables }: { deliverables?: string[] }) {
  if (!deliverables?.length) {
    return null;
  }

  return (
    <div className="md:pr-6 lg:pr-8">
      <div data-about-reveal className="border-border border-l pl-4">
        <dl>
          <dt className="text-[0.8125rem] font-medium text-muted-foreground">Deliverables</dt>
          <dd className="m-0 mt-2">
            <ul className="list-none space-y-1 p-0">
              {deliverables.map((line, index) => (
                <li
                  key={`${index}-${line}`}
                  className="text-base font-normal leading-snug text-foreground"
                >
                  {line}
                </li>
              ))}
            </ul>
          </dd>
        </dl>
      </div>
    </div>
  );
}

function workGallerySizes(
  item: WorkGalleryItem,
  index: number,
  total: number,
  remainderAfterLeadOdd: boolean,
): { sizes: string; spanFull: boolean } {
  const full = "(max-width: 767px) 100vw, min(100vw, 2400px)";
  const half = "(max-width: 767px) 100vw, 50vw";

  if (item.layout === "full") {
    return { spanFull: true, sizes: full };
  }
  if (item.layout === "half") {
    return { spanFull: false, sizes: half };
  }

  /** Legacy: first item full width; odd tail after lead may span 2. */
  const isLead = index === 0;
  const isTailFullWidth = remainderAfterLeadOdd && index === total - 1 && !isLead;
  const spanFull = isLead || isTailFullWidth;
  return { spanFull, sizes: spanFull ? full : half };
}

function WorkGallery({ items }: { items: WorkGalleryItem[] }) {
  /** After the lead full-width tile, if the remainder count is odd the last tile spans both columns (legacy only). */
  const remainderAfterLeadOdd = items.length > 1 && (items.length - 1) % 2 === 1;

  return (
    <section className="w-full pb-8 pt-4 md:pb-12 md:pt-6" aria-label="Project gallery">
      <div className="mx-auto w-full max-w-[2400px] px-4">
        <div className="grid w-full grid-cols-1 items-start gap-1.5 sm:gap-2 md:grid-cols-2 md:gap-2 lg:gap-2.5 xl:gap-3">
          {items.map((item, index) => {
            const { sizes, spanFull } = workGallerySizes(
              item,
              index,
              items.length,
              remainderAfterLeadOdd,
            );

            return (
              <WorkGalleryTile
                key={item.key ?? `${item.src}-${index}`}
                item={item}
                className={cn(spanFull && "md:col-span-2")}
                sizes={sizes}
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
    <div className={cn("flex min-w-0 flex-col", className)}>
      <div
        className={cn(
          "overflow-hidden rounded-lg bg-muted/30 ring-1 ring-border/90 shadow-(--sf-shadow-media-md) md:rounded-xl",
        )}
      >
        {item.kind === "video" ? (
          <video
            src={item.src}
            aria-label={item.alt ?? item.title ?? item.caption ?? "Gallery video"}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            className="block h-auto w-full rounded-lg md:rounded-xl"
          />
        ) : (
          <Image
            src={item.src}
            alt={item.alt ?? item.title ?? "Gallery image"}
            blurDataURL={item.lqip}
            width={fallbackW}
            height={fallbackH}
            loader={isSanityImageUrl(item.src) ? imageLoader : undefined}
            placeholder={item.lqip ? "blur" : "empty"}
            sizes={sizes}
            className="block h-auto w-full rounded-lg md:rounded-xl"
          />
        )}
      </div>
      {item.caption ? (
        <p className="mt-2 text-sm leading-snug text-muted-foreground whitespace-pre-line">
          {item.caption}
        </p>
      ) : null}
    </div>
  );
}
