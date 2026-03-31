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
  searchWorld: CosmosFeatureSection & {
    sideLabel: string;
    sideBody: string;
    gallery: CosmosMediaItem[];
  };
  filters: CosmosFeatureSection & {
    chips: CosmosFilterChip[];
    media: CosmosMediaItem[];
  };
  attribution: CosmosFeatureSection & {
    credits: string[];
    media: CosmosMediaItem[];
  };
  teams: CosmosFeatureSection & {
    logos: CosmosMediaItem[];
    gallery: CosmosMediaItem[];
  };
  finalCta: {
    title: string;
    buttons: CosmosButton[];
  };
  footerGroups: CosmosFooterGroup[];
}
