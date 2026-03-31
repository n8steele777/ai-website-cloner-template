import { OffMenuHomepage } from "@/components/offmenu-homepage";
import {
  homepageCaseStudies,
  offMenuHeroWords,
  offMenuResourceLinks,
  offMenuWorkNavigationLinks,
} from "@/lib/offmenu-data";

export default function Home() {
  return (
    <OffMenuHomepage
      caseStudies={homepageCaseStudies}
      heroWords={offMenuHeroWords}
      navigationLinks={offMenuWorkNavigationLinks}
      resourceLinks={offMenuResourceLinks}
    />
  );
}
