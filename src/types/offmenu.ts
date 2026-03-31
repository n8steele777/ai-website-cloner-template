export type ThemeMode = "light" | "dark";

export interface NavLink {
  label: string;
  href: string;
  current?: boolean;
  disabled?: boolean;
  external?: boolean;
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
  thumbnailLight: string;
  thumbnailDark: string;
  thumbnailLightXl: string;
  thumbnailDarkXl: string;
  desktopPosition: OrbitPosition;
  mobilePosition: OrbitPosition;
}

export interface WorkDetail {
  label: string;
  value: string;
}

export interface WorkMediaImage {
  src: string;
  alt: string;
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
  introduction: string;
  summary?: string;
  details: WorkDetail[];
  credits?: {
    roles: string[];
    names: string[];
  };
  galleryImages: WorkMediaImage[];
  relatedSlugs: string[];
  ctaTitle: string;
  ctaHref: string;
  ctaLabel: string;
}

export interface StudioRule {
  id: string;
  statement: string;
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
