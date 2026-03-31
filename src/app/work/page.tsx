import type { Metadata } from "next";
import { OffMenuHomepage } from "@/components/offmenu-homepage";
import {
  homepageCaseStudies,
  offMenuHeroWords,
  offMenuResourceLinks,
  offMenuWorkNavigationLinks,
} from "@/lib/offmenu-data";

export const metadata: Metadata = {
  title: "Work | Studio Finity",
  description: "Selected Studio Finity work in the floating-circles work index.",
};

export default function WorkIndexPage() {
  return (
    <OffMenuHomepage
      caseStudies={homepageCaseStudies}
      heroWords={offMenuHeroWords}
      navigationLinks={offMenuWorkNavigationLinks}
      resourceLinks={offMenuResourceLinks}
    />
  );
}
