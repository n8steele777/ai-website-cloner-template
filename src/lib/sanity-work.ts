import {groq} from "next-sanity";
import type {CosmosFeaturedProject} from "@/types/cosmos";
import type {CaseStudy, WorkGalleryItem, WorkProjectDetail} from "@/types/offmenu";
import {client} from "@/sanity/client";

interface SanityImageField {
  alt?: string;
  url?: string;
}

interface SanityGalleryMediaField {
  _key?: string;
  _type?: string;
  alt?: string;
  asset?: {
    metadata?: {
      dimensions?: {
        aspectRatio?: number;
        height?: number;
        width?: number;
      };
    };
  };
  title?: string;
  url?: string;
}

interface SanityWorkDocument {
  _id: string;
  category?: string;
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
    alt,
    "url": asset->url
  },
  "galleryMedia": galleryMedia[]{
    _key,
    _type,
    alt,
    title,
    "asset": asset->{
      metadata{
        dimensions
      }
    },
    "url": asset->url
  }
}`;

const workFetchOptions = {next: {revalidate: 30}};

function optimizeSanityImageUrl(
  url: string | undefined,
  {quality = 82, width}: {quality?: number; width: number},
) {
  if (!url) {
    return "";
  }

  try {
    const optimizedUrl = new URL(url);
    optimizedUrl.searchParams.set("auto", "format");
    optimizedUrl.searchParams.set("fit", "max");
    optimizedUrl.searchParams.set("q", String(quality));
    optimizedUrl.searchParams.set("w", String(width));
    return optimizedUrl.toString();
  } catch {
    return url;
  }
}

function fallbackText(value: string | undefined, fallback: string) {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : fallback;
}

function formatCategoryLabel(category: string | undefined) {
  const trimmed = category?.trim();

  if (!trimmed) {
    return "Selected work";
  }

  return trimmed.split(/\s+/).join(" / ");
}

function getPrimaryImage(work: SanityWorkDocument) {
  return (
    work.heroImage?.url ??
    work.galleryMedia?.find((item) => item._type === "image" && item.url)?.url ??
    ""
  );
}

function getPrimaryAlt(work: SanityWorkDocument) {
  return (
    work.heroImage?.alt ??
    work.galleryMedia?.find((item) => item._type === "image" && item.alt)?.alt ??
    `${work.title} image`
  );
}

function buildGalleryMedia(work: SanityWorkDocument): WorkGalleryItem[] {
  const mixedMedia = (work.galleryMedia ?? [])
    .filter((item): item is SanityGalleryMediaField & {_type: string; url: string} => Boolean(item._type && item.url))
    .map((item) => {
      const kind: WorkGalleryItem["kind"] = item._type === "file" ? "video" : "image";
      const dimensions = item.asset?.metadata?.dimensions;

      return {
        kind,
        src: item._type === "file" ? item.url : optimizeSanityImageUrl(item.url, {width: 2200, quality: 82}),
        alt: item.alt,
        aspectRatio: dimensions?.aspectRatio,
        height: dimensions?.height,
        title: item.title,
        width: dimensions?.width,
      };
    });

  if (mixedMedia.length > 0) {
    return mixedMedia;
  }

  return [work.media?.mainLongerVideo, work.media?.shortVideo]
    .filter((url): url is string => Boolean(url))
    .map((url, index) => ({
      kind: "video",
      src: url,
      title: index === 0 ? `${work.title} main video` : `${work.title} short video`,
    }));
}

export async function fetchSanityWorks() {
  return client.fetch<SanityWorkDocument[]>(ALL_WORKS_QUERY, {}, workFetchOptions);
}

export function buildCaseStudies(works: SanityWorkDocument[]): CaseStudy[] {
  return works
    .filter((work) => Boolean(getPrimaryImage(work)))
    .map((work) => {
      const image = getPrimaryImage(work);

      return {
        slug: work.slug,
        title: work.title,
        href: `/work/${work.slug}`,
        thumbnailLight: optimizeSanityImageUrl(image, {width: 900, quality: 78}),
        thumbnailDark: optimizeSanityImageUrl(image, {width: 900, quality: 78}),
        thumbnailLightXl: optimizeSanityImageUrl(image, {width: 1800, quality: 82}),
        thumbnailDarkXl: optimizeSanityImageUrl(image, {width: 1800, quality: 82}),
        desktopPosition: {x: 0, y: 0, size: 0},
        mobilePosition: {x: 0, y: 0, size: 0},
      };
    });
}

export function buildWorkProjects(works: SanityWorkDocument[]): WorkProjectDetail[] {
  return works.map((work, index) => {
    const nextOne = works[(index + 1) % works.length]?.slug;
    const nextTwo = works[(index + 2) % works.length]?.slug;
    const heroImage = optimizeSanityImageUrl(getPrimaryImage(work), {width: 2200, quality: 82});
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

export function buildHomepageFeaturedProjects(
  works: SanityWorkDocument[],
  featuredSlugs: string[],
): CosmosFeaturedProject[] {
  return featuredSlugs
    .map((slug) => works.find((work) => work.slug === slug))
    .filter((work): work is SanityWorkDocument => Boolean(work))
    .map((work) => ({
      category: formatCategoryLabel(work.category),
      href: `/work/${work.slug}`,
      image: {
        src: optimizeSanityImageUrl(getPrimaryImage(work), {width: 1800, quality: 80}),
        alt: getPrimaryAlt(work),
      },
      summary: fallbackText(work.seo?.description, work.introduction ?? ""),
      title: work.title,
    }))
    .filter((project) => Boolean(project.image.src));
}
