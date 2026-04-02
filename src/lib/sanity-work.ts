import type { SanityImageSource } from "@sanity/image-url";
import { groq } from "next-sanity";
import { buildSanityCdnImageUrl } from "@/lib/sanity-cdn-url";
import type { CosmosFeaturedProject } from "@/types/cosmos";
import type {
  CaseStudy,
  WorkGalleryItem,
  WorkGalleryLayoutMode,
  WorkProjectDetail,
} from "@/types/offmenu";
import { client } from "@/sanity/client";
import { urlFor } from "@/sanity/lib/image";

interface SanityImageField {
  _type?: string;
  alt?: string;
  lqip?: string;
  url?: string;
  asset?: { _ref: string; _type?: string };
  crop?: {
    bottom?: number;
    left?: number;
    right?: number;
    top?: number;
  };
  hotspot?: {
    height?: number;
    width?: number;
    x?: number;
    y?: number;
  };
}

interface SanityGalleryMediaField {
  _key?: string;
  _type?: string;
  alt?: string;
  title?: string;
  caption?: string;
  layout?: string;
  /** Structured gallery row (Sanity `galleryItem` object). */
  image?: SanityGalleryMediaField;
  video?: SanityGalleryMediaField;
  asset?: { _ref: string; _type?: string };
  crop?: SanityImageField["crop"];
  hotspot?: SanityImageField["hotspot"];
  metadata?: {
    dimensions?: {
      aspectRatio?: number;
      height?: number;
      width?: number;
    };
    lqip?: string;
  };
  url?: string;
}

interface SanityWorkDocument {
  _id: string;
  category?: string;
  deliverables?: string[];
  galleryMedia?: SanityGalleryMediaField[];
  heroImage?: SanityImageField;
  introduction?: string;
  media?: {
    mainLongerVideo?: string;
    shortVideo?: string;
  };
  orderRank?: number;
  seo?: {
    description?: string;
  };
  slug: string;
  title: string;
}

const ALL_WORKS_QUERY = groq`*[
  _type == "work"
  && defined(slug.current)
]|order(orderRank asc, title asc){
  _id,
  title,
  "slug": slug.current,
  category,
  deliverables,
  introduction,
  orderRank,
  "media": media{
    "shortVideo": shortVideo.asset->url,
    "mainLongerVideo": mainLongerVideo.asset->url
  },
  seo{
    description
  },
  "heroImage": heroImage{
    _type,
    alt,
    crop,
    hotspot,
    asset,
    "lqip": asset->metadata.lqip,
    "url": asset->url
  },
  "galleryMedia": galleryMedia[]{
    _key,
    _type,
    caption,
    layout,
    alt,
    title,
    crop,
    hotspot,
    asset,
    "image": image{
      _type,
      alt,
      crop,
      hotspot,
      asset,
      "metadata": asset->metadata{
        dimensions,
        lqip
      },
      "url": asset->url
    },
    "video": video{
      title,
      asset,
      "url": asset->url
    },
    "metadata": asset->metadata{
      dimensions,
      lqip
    },
    "url": asset->url
  }
}`;

const workFetchOptions = { next: { revalidate: 120 } };

function workImageAt(
  image: SanityImageField | undefined,
  opts: { width: number; quality?: number },
): string {
  const q = opts.quality ?? 82;
  const w = Math.round(opts.width);
  if (!image) {
    return "";
  }
  if (image._type === "image" && image.asset?._ref) {
    return urlFor(image as SanityImageSource)
      .width(w)
      .quality(q)
      .auto("format")
      .fit("max")
      .url();
  }
  return image.url ? buildSanityCdnImageUrl(image.url, { w, q }) : "";
}

function galleryImageSrc(item: SanityGalleryMediaField, opts: { width: number; quality?: number }): string {
  if (item._type === "file") {
    return item.url ?? "";
  }
  if (item._type === "image" && item.asset?._ref) {
    const source: SanityImageSource = {
      _type: "image",
      asset: item.asset,
      crop: item.crop,
      hotspot: item.hotspot,
    };
    const w = Math.round(opts.width);
    const q = opts.quality ?? 82;
    return urlFor(source).width(w).quality(q).auto("format").fit("max").url();
  }
  return item.url ? buildSanityCdnImageUrl(item.url, { w: opts.width, q: opts.quality ?? 82 }) : "";
}

function firstGalleryImageUrlFromEntries(entries: SanityGalleryMediaField[] | undefined): string | undefined {
  if (!entries) {
    return undefined;
  }
  for (const item of entries) {
    if (item._type === "galleryItem" && item.image?.url) {
      return item.image.url;
    }
    if (item._type === "image" && item.url) {
      return item.url;
    }
  }
  return undefined;
}

function primaryImageFallbackUrl(work: SanityWorkDocument): string | undefined {
  return work.heroImage?.url ?? firstGalleryImageUrlFromEntries(work.galleryMedia);
}

function getPrimaryImageUrl(work: SanityWorkDocument, opts: { width: number; quality?: number }): string {
  const hero = work.heroImage;
  if (hero && hero._type === "image" && hero.asset?._ref) {
    return workImageAt(hero, opts);
  }
  const raw = primaryImageFallbackUrl(work);
  return raw ? buildSanityCdnImageUrl(raw, { w: opts.width, q: opts.quality ?? 82 }) : "";
}

function hasPrimaryVisual(work: SanityWorkDocument): boolean {
  return Boolean(
    (work.heroImage?._type === "image" && work.heroImage.asset?._ref) ||
      work.heroImage?.url ||
      work.galleryMedia?.some((item) => {
        if (item._type === "galleryItem") {
          const img = item.image;
          return Boolean(img?.asset?._ref || img?.url);
        }
        return item._type === "image" && Boolean(item.asset?._ref || item.url);
      }),
  );
}

function fallbackText(value: string | undefined, fallback: string) {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : fallback;
}

/** Split category text on newlines or slashes (used for labels and deliverables fallback). */
function splitCategoryIntoParts(category: string): string[] {
  return category
    .split(/\r?\n|\s*\/\s*/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function formatCategoryLabel(category: string | undefined) {
  const trimmed = category?.trim();

  if (!trimmed) {
    return "Selected work";
  }

  const parts = splitCategoryIntoParts(trimmed);
  return parts.length > 0 ? parts.join(" / ") : "Selected work";
}

function getPrimaryAlt(work: SanityWorkDocument) {
  const fromStructured = work.galleryMedia?.find(
    (item) => item._type === "galleryItem" && item.image?.alt,
  )?.image?.alt;
  const fromLegacy = work.galleryMedia?.find((item) => item._type === "image" && item.alt)?.alt;

  return (
    work.heroImage?.alt ?? fromStructured ?? fromLegacy ?? `${work.title} image`
  );
}

function getPrimaryLqip(work: SanityWorkDocument): string | undefined {
  const hero = work.heroImage?.lqip?.trim();
  if (hero) {
    return hero;
  }
  const structured = work.galleryMedia?.find(
    (item) => item._type === "galleryItem" && item.image?.metadata?.lqip,
  )?.image?.metadata?.lqip;
  const legacy = work.galleryMedia?.find(
    (item) => item._type === "image" && item.metadata?.lqip,
  )?.metadata?.lqip;
  const fromGallery = structured ?? legacy;

  return fromGallery?.trim() || undefined;
}

function normalizeGalleryLayout(raw: string | undefined): WorkGalleryLayoutMode | undefined {
  if (raw === "full" || raw === "half") {
    return raw;
  }
  return undefined;
}

function mapGalleryEntryToWorkItem(item: SanityGalleryMediaField): WorkGalleryItem | null {
  if (item._type === "galleryItem") {
    const layout = normalizeGalleryLayout(item.layout);
    const caption = item.caption?.trim() || undefined;
    const videoField = item.video;
    if (videoField?.url) {
      return {
        kind: "video",
        src: videoField.url,
        title: videoField.title,
        caption,
        layout,
        key: item._key,
      };
    }
    const imageField = item.image;
    if (imageField && (imageField.asset?._ref || imageField.url)) {
      const asImage: SanityGalleryMediaField = {
        ...imageField,
        _type: "image",
      };
      const dimensions = imageField.metadata?.dimensions;
      return {
        kind: "image",
        src: galleryImageSrc(asImage, { width: 2200, quality: 82 }),
        alt: imageField.alt,
        aspectRatio: dimensions?.aspectRatio,
        height: dimensions?.height,
        lqip: imageField.metadata?.lqip,
        width: dimensions?.width,
        caption,
        layout,
        key: item._key,
      };
    }
    return null;
  }

  if (item._type === "file" && item.url) {
    return {
      kind: "video",
      src: item.url,
      title: item.title,
      key: item._key,
    };
  }

  if (item._type === "image" && (item.url || item.asset?._ref)) {
    const dimensions = item.metadata?.dimensions;
    return {
      kind: "image",
      src: galleryImageSrc(item, { width: 2200, quality: 82 }),
      alt: item.alt,
      aspectRatio: dimensions?.aspectRatio,
      height: dimensions?.height,
      lqip: item.metadata?.lqip,
      title: item.title,
      width: dimensions?.width,
      key: item._key,
    };
  }

  return null;
}

function buildGalleryMedia(work: SanityWorkDocument): WorkGalleryItem[] {
  const mixedMedia = (work.galleryMedia ?? [])
    .map((item) => mapGalleryEntryToWorkItem(item))
    .filter((entry): entry is WorkGalleryItem => entry !== null && Boolean(entry.src));

  if (mixedMedia.length > 0) {
    return mixedMedia;
  }

  return [work.media?.mainLongerVideo, work.media?.shortVideo]
    .filter((url): url is string => Boolean(url))
    .map((url, index) => ({
      kind: "video" as const,
      src: url,
      title: index === 0 ? `${work.title} main video` : `${work.title} short video`,
    }));
}

export async function fetchSanityWorks() {
  return client.fetch<SanityWorkDocument[]>(ALL_WORKS_QUERY, {}, workFetchOptions);
}

function caseStudySummary(work: SanityWorkDocument): string {
  const raw = work.seo?.description?.trim() || work.introduction?.trim() || "";
  if (!raw) {
    return "";
  }

  const oneLine = raw.replace(/\s+/g, " ").trim();

  return oneLine.length > 120 ? `${oneLine.slice(0, 117).trim()}…` : oneLine;
}

export function buildCaseStudies(works: SanityWorkDocument[]): CaseStudy[] {
  return works
    .filter((work) => hasPrimaryVisual(work))
    .map((work) => {
      const imageSrc = getPrimaryImageUrl(work, { width: 2200, quality: 92 });

      return {
        slug: work.slug,
        title: work.title,
        href: `/work/${work.slug}`,
        summary: caseStudySummary(work),
        thumbnailLight: imageSrc,
        thumbnailDark: imageSrc,
        thumbnailLightXl: getPrimaryImageUrl(work, { width: 2800, quality: 94 }),
        thumbnailDarkXl: getPrimaryImageUrl(work, { width: 2800, quality: 94 }),
        thumbnailLqip: getPrimaryLqip(work),
        desktopPosition: { x: 0, y: 0, size: 0 },
        mobilePosition: { x: 0, y: 0, size: 0 },
      };
    });
}

function normalizeWorkDeliverables(work: SanityWorkDocument): string[] | undefined {
  if (Array.isArray(work.deliverables)) {
    const list = work.deliverables
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter(Boolean);
    if (list.length > 0) {
      return list;
    }
  }
  const cat = work.category?.trim();
  if (!cat) {
    return undefined;
  }
  const parts = splitCategoryIntoParts(cat);
  return parts.length > 0 ? parts : undefined;
}

export function buildWorkProjects(works: SanityWorkDocument[]): WorkProjectDetail[] {
  return works.map((work, index) => {
    const nextOne = works[(index + 1) % works.length]?.slug;
    const nextTwo = works[(index + 2) % works.length]?.slug;
    const heroImage = getPrimaryImageUrl(work, { width: 2200, quality: 82 });
    const galleryMedia = buildGalleryMedia(work).map((item) => ({
      ...item,
      alt:
        item.kind === "image"
          ? fallbackText(item.alt, `${work.title} gallery image`)
          : fallbackText(item.title, `${work.title} gallery video`),
    }));

    return {
      slug: work.slug,
      title: work.title,
      heroImageLight: heroImage,
      heroImageDark: heroImage,
      heroLqip: getPrimaryLqip(work),
      deliverables: normalizeWorkDeliverables(work),
      introduction: fallbackText(work.introduction, work.seo?.description ?? `${work.title} case study.`),
      summary: fallbackText(work.seo?.description, work.introduction ?? ""),
      galleryMedia,
      relatedSlugs: [nextOne, nextTwo].filter((slug): slug is string => Boolean(slug)),
      ctaTitle: "Let's build something.",
      ctaHref: "mailto:hello@studio-finity.com",
      ctaLabel: "Get in touch",
    };
  });
}

/** Homepage featured grid is 3×3; pin order via slugs, then fill from Sanity catalog. */
export const HOMEPAGE_FEATURED_PROJECT_CAP = 9;

function sanityWorkToFeaturedProject(work: SanityWorkDocument): CosmosFeaturedProject | null {
  const src = getPrimaryImageUrl(work, { width: 1800, quality: 80 });
  if (!src) {
    return null;
  }

  return {
    category: formatCategoryLabel(work.category),
    slug: work.slug,
    href: `/work/${work.slug}`,
    image: {
      src,
      alt: getPrimaryAlt(work),
      lqip: getPrimaryLqip(work),
    },
    imageXl: getPrimaryImageUrl(work, { width: 2800, quality: 94 }),
    summary: fallbackText(work.seo?.description, work.introduction ?? ""),
    title: work.title,
  };
}

export function buildHomepageFeaturedProjects(
  works: SanityWorkDocument[],
  featuredSlugs: string[],
  cap: number = HOMEPAGE_FEATURED_PROJECT_CAP,
): CosmosFeaturedProject[] {
  const usedSlugs = new Set<string>();
  const projects: CosmosFeaturedProject[] = [];

  for (const slug of featuredSlugs) {
    if (projects.length >= cap) {
      break;
    }
    const work = works.find((w) => w.slug === slug);
    if (!work || usedSlugs.has(work.slug)) {
      continue;
    }
    const project = sanityWorkToFeaturedProject(work);
    if (!project) {
      continue;
    }
    usedSlugs.add(work.slug);
    projects.push(project);
  }

  for (const work of works) {
    if (projects.length >= cap) {
      break;
    }
    if (usedSlugs.has(work.slug)) {
      continue;
    }
    const project = sanityWorkToFeaturedProject(work);
    if (!project) {
      continue;
    }
    usedSlugs.add(work.slug);
    projects.push(project);
  }

  return projects;
}
