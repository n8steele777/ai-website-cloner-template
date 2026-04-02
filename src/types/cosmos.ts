import type { NavLink } from "@/types/offmenu";

export interface CosmosMediaItem {
  src: string;
  alt: string;
  kind?: "image" | "video";
  lqip?: string;
}

export interface CosmosButton {
  label: string;
  href: string;
  external?: boolean;
  variant?: "primary" | "secondary" | "ghost";
  opensContactForm?: boolean;
}

export interface CosmosFeatureSection {
  eyebrow?: string;
  title: string;
  body?: string;
}

export interface CosmosPrinciple {
  label: string;
  title: string;
  supportingText: string;
}

export interface CosmosFeaturedProject {
  title: string;
  slug: string;
  href: string;
  category: string;
  summary: string;
  image: CosmosMediaItem;
  /** Larger URL for case-study open transition overlay (matches `/work` grid). */
  imageXl?: string;
}

export interface CosmosFilterChip {
  label: string;
  value?: string;
}

export interface CosmosFooterGroup {
  label: string;
  links: NavLink[];
}

export interface CosmosHomepageData {
  headerLinks: NavLink[];
  heroTitle: string;
  heroButtons: CosmosButton[];
  heroSpiralImages: string[];
  heroMedia: CosmosMediaItem[];
  filmVideo: CosmosMediaItem;
  brandIntro: CosmosFeatureSection & {
    supportingText: string;
  };
  principles: CosmosFeatureSection & {
    items: CosmosPrinciple[];
  };
  featuredWork: CosmosFeatureSection & {
    projects: CosmosFeaturedProject[];
  };
  contactCta: {
    eyebrow?: string;
    title: string;
    supportingText: string;
    button: CosmosButton;
  };
}
