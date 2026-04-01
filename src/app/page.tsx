import type {Metadata} from "next";
import {CosmosHomepage} from "@/components/cosmos-homepage";
import {buildCosmosHomepageData, homepageFeaturedWorkSlugs} from "@/lib/cosmos-data";
import {buildHomepageFeaturedProjects, fetchSanityWorks} from "@/lib/sanity-work";

export const metadata: Metadata = {
  title: "Studio Finity",
  description: "Studio Finity homepage with an editorial landing page experience.",
};

export default async function Home() {
  const works = await fetchSanityWorks();
  const homepageData = buildCosmosHomepageData(
    buildHomepageFeaturedProjects(works, homepageFeaturedWorkSlugs),
  );

  return <CosmosHomepage data={homepageData} />;
}
