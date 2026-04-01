import type { MetadataRoute } from "next";
import { fetchSanityWorks } from "@/lib/sanity-work";
import { getSiteUrl } from "@/lib/site-url";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl().replace(/\/$/, "");
  const now = new Date();

  const staticPaths: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/work`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
  ];

  const works = await fetchSanityWorks();
  const workEntries: MetadataRoute.Sitemap = works.map((work) => ({
    url: `${base}/work/${work.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticPaths, ...workEntries];
}
