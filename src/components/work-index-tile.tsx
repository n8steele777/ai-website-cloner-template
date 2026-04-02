"use client";

import Image from "next/image";
import type { Ref } from "react";
import { isSanityImageUrl, sanityImageLoader } from "@/lib/sanity-image-loader";
import { cn } from "@/lib/utils";

/** Default `sizes` for `/work` index (three columns through `lg`, then four / five). */
export const WORK_INDEX_GRID_IMAGE_SIZES =
  "(max-width: 1279px) 33vw, (max-width: 1535px) 24vw, min(420px, 20vw)";

/** Tighter `sizes` for homepage 3×3 featured grid (three columns at every breakpoint). */
export const WORK_INDEX_GRID_IMAGE_SIZES_COMPACT =
  "(max-width: 1023px) 33vw, (max-width: 1535px) 28vw, min(260px, 22vw)";

/**
 * Grid gutters for the `/work` index at every breakpoint. Use on the homepage featured grid so
 * spacing matches (including mobile).
 */
export const WORK_INDEX_GRID_GAP_CLASSNAME =
  "gap-x-6 gap-y-12 sm:gap-x-10 sm:gap-y-14 md:gap-x-12 md:gap-y-18 lg:gap-x-16 lg:gap-y-24 xl:gap-x-18 2xl:gap-x-20";

export interface WorkIndexTileMediaProps {
  imageSrc: string;
  imageAlt: string;
  lqip?: string;
  sizes?: string;
  priority?: boolean;
  quality?: number;
  thumbRef?: Ref<HTMLDivElement | null>;
  className?: string;
}

/**
 * Square thumbnail + elevated frame used on `/work`. Parent should include `group` for hover lift
 * (see `.group:hover .work-card-elevated` in globals.css).
 */
export function WorkIndexTileMedia({
  imageSrc,
  imageAlt,
  lqip,
  sizes = WORK_INDEX_GRID_IMAGE_SIZES,
  priority = false,
  quality = 95,
  thumbRef,
  className,
}: WorkIndexTileMediaProps) {
  return (
    <div
      className={cn(
        "work-card-elevated relative overflow-hidden rounded-3xl bg-background",
        className,
      )}
    >
      <div
        ref={thumbRef}
        data-work-thumb=""
        className="relative aspect-square w-full bg-muted/10"
      >
        <Image
          src={imageSrc}
          alt={imageAlt}
          blurDataURL={lqip}
          fill
          loader={isSanityImageUrl(imageSrc) ? sanityImageLoader : undefined}
          placeholder={lqip ? "blur" : "empty"}
          priority={priority}
          quality={quality}
          sizes={sizes}
          className="object-cover object-center"
        />
      </div>
    </div>
  );
}

export interface WorkIndexTileTitleProps {
  title: string;
  /** `workGrid` — `/work` index: smaller type in 3-up columns; one line with ellipsis below `xl`. */
  density?: "default" | "compact" | "workGrid";
  as?: "h2" | "h3";
}

export function WorkIndexTileTitle({
  title,
  density = "default",
  as: Tag = "h2",
}: WorkIndexTileTitleProps) {
  const titleGap =
    density === "compact"
      ? "mt-3 text-center sm:mt-4"
      : density === "workGrid"
        ? "mt-3 text-center sm:mt-5 md:mt-6"
        : "mt-5 text-center sm:mt-6";

  const titleTypography = cn(
    "min-w-0 text-center font-display font-semibold tracking-[var(--sf-tracking-title)] text-foreground",
    density === "compact"
      ? "break-words text-pretty text-[0.8125rem] sm:text-[0.875rem] lg:text-[0.9375rem] lg:leading-snug"
      : density === "workGrid"
        ? "max-xl:line-clamp-1 text-[0.65625rem] leading-[1.15] sm:text-[0.6875rem] md:text-[0.75rem] lg:text-[0.8125rem] xl:break-words xl:text-pretty xl:text-[0.9375rem] xl:leading-snug 2xl:text-[1.0625rem]"
        : "break-words text-pretty text-[0.9375rem] sm:text-base lg:text-[1.0625rem] lg:leading-snug",
  );

  return (
    <div className={titleGap}>
      <Tag className={titleTypography}>{title}</Tag>
    </div>
  );
}

export interface WorkIndexTileContentProps extends WorkIndexTileMediaProps {
  title: string;
  density?: "default" | "compact" | "workGrid";
  titleAs?: "h2" | "h3";
}

export function WorkIndexTileContent({
  title,
  density = "default",
  titleAs = "h2",
  ...media
}: WorkIndexTileContentProps) {
  return (
    <>
      <WorkIndexTileMedia {...media} />
      <WorkIndexTileTitle title={title} density={density} as={titleAs} />
    </>
  );
}
