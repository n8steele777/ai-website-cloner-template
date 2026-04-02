export interface NavLink {
  label: string;
  href: string;
  current?: boolean;
  disabled?: boolean;
  external?: boolean;
  /** Opens the site contact form instead of navigating (mailto remains on the link for no-JS fallback where applicable). */
  opensContactForm?: boolean;
}

export interface OrbitPosition {
  x: number;
  y: number;
  size: number;
}

export interface CaseStudy {
  slug: string;
  title: string;
  href: string;
  /** One-line preview under the title (SEO description or truncated intro). */
  summary: string;
  thumbnailLight: string;
  thumbnailDark: string;
  thumbnailLightXl: string;
  thumbnailDarkXl: string;
  /** Sanity `asset.metadata.lqip` — blur placeholder for thumbnails */
  thumbnailLqip?: string;
  desktopPosition: OrbitPosition;
  mobilePosition: OrbitPosition;
}

/** Desktop span from structured gallery items; omit for legacy grid behavior. */
export type WorkGalleryLayoutMode = "full" | "half";

export interface WorkGalleryItem {
  kind: "image" | "video";
  src: string;
  alt?: string;
  aspectRatio?: number;
  height?: number;
  lqip?: string;
  title?: string;
  width?: number;
  caption?: string;
  layout?: WorkGalleryLayoutMode;
  /** Sanity `_key` when present (stable list keys). */
  key?: string;
}

export interface WorkTextSection {
  label: string;
  content: string;
  size: "body" | "display";
}

export interface WorkProjectDetail {
  slug: string;
  title: string;
  heroImageLight: string;
  heroImageDark: string;
  heroLqip?: string;
  /** Scope / services list for left meta column (optional; from CMS or derived from category). */
  deliverables?: string[];
  introduction: string;
  summary?: string;
  galleryMedia: WorkGalleryItem[];
  relatedSlugs: string[];
  ctaTitle: string;
  ctaHref: string;
  ctaLabel: string;
}

export interface StudioRule {
  id: string;
  statement: string;
  reference?: {
    image: string;
    name: string;
    quote: string;
    rotation?: number;
  };
}

export interface StudioAboutContent {
  hero: string;
  introLabel: string;
  intro: string;
  location: string;
  rules: StudioRule[];
  expertise: string[];
  industries: string[];
  clients: string[];
}
