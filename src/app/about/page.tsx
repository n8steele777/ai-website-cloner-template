import type { Metadata } from "next";
import { StudioFinityAbout } from "@/components/studio-finity-about";
import {
  offMenuNavigationLinks,
  offMenuResourceLinks,
  studioFinityAboutContent,
} from "@/lib/site-data";

export const metadata: Metadata = {
  title: "About | Studio Finity",
  description:
    "Studio Finity is a design studio working across brand, digital, and visual storytelling from Denver, Colorado.",
};

export default function AboutPage() {
  return (
    <StudioFinityAbout
      content={studioFinityAboutContent}
      navigationLinks={offMenuNavigationLinks}
      resourceLinks={offMenuResourceLinks}
    />
  );
}
