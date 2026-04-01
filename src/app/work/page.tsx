import type { Metadata } from "next";
import { OffMenuHomepage } from "@/components/offmenu-homepage";
import {
  offMenuHeroWords,
  offMenuResourceLinks,
  offMenuWorkNavigationLinks,
} from "@/lib/site-data";
import { buildCaseStudies, fetchSanityWorks } from "@/lib/sanity-work";

export const metadata: Metadata = {
  title: "Work | Studio Finity",
  description: "Selected Studio Finity projects — an editorial work grid.",
};

export default async function WorkIndexPage() {
  const works = await fetchSanityWorks();

  return (
    <OffMenuHomepage
      caseStudies={buildCaseStudies(works)}
      heroWords={offMenuHeroWords}
      navigationLinks={offMenuWorkNavigationLinks}
      resourceLinks={offMenuResourceLinks}
    />
  );
}
