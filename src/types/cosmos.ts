import type { NavLink } from "@/types/offmenu";

export interface CosmosMediaItem {
  src: string;
  alt: string;
  kind?: "image" | "video";
}

export interface CosmosButton {
  label: string;
  href: string;
  external?: boolean;
  variant?: "primary" | "secondary" | "ghost";
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
  href: string;
  category: string;
  summary: string;
  image: CosmosMediaItem;
}

export interface CosmosCapability {
  title: string;
  description: string;
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
  headerActions: CosmosButton[];
  heroTitle: string;
  heroButtons: CosmosButton[];
  heroSpiralImages: string[];
  heroMedia: CosmosMediaItem[];
  filmCta: string;
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
  capabilities: CosmosFeatureSection & {
    items: CosmosCapability[];
  };
  contactCta: {
    eyebrow?: string;
    title: string;
    supportingText: string;
    button: CosmosButton;
  };
}
