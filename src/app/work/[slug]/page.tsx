import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { OffMenuWorkDetail } from "@/components/offmenu-work-detail";
import {
  offMenuResourceLinks,
  offMenuWorkNavigationLinks,
} from "@/lib/site-data";
import { buildWorkProjects, fetchSanityWorks } from "@/lib/sanity-work";
import { getSiteUrl } from "@/lib/site-url";

interface WorkPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const works = await fetchSanityWorks();

  return works.map((work) => ({
    slug: work.slug,
  }));
}

export async function generateMetadata({ params }: WorkPageProps): Promise<Metadata> {
  const { slug } = await params;
  const works = await fetchSanityWorks();
  const project = buildWorkProjects(works).find((entry) => entry.slug === slug);

  if (!project) {
    return {};
  }

  const description =
    project.summary?.trim() ?? `${project.title} — A Studio Finity case study.`;
  const base = getSiteUrl().replace(/\/$/, "");
  const defaultShareImage = `${base}/logos/SF-Social-Share.png`;
  const hero = project.heroImageLight?.trim();
  const ogImageUrl =
    hero && (hero.startsWith("https://") || hero.startsWith("http://"))
      ? hero
      : defaultShareImage;

  return {
    title: `${project.title} | Studio Finity`,
    description,
    openGraph: {
      title: `${project.title} | Studio Finity`,
      description,
      images: [{ url: ogImageUrl, alt: project.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${project.title} | Studio Finity`,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function WorkPage({ params }: WorkPageProps) {
  const { slug } = await params;
  const works = await fetchSanityWorks();
  const project = buildWorkProjects(works).find((entry) => entry.slug === slug);

  if (!project) {
    notFound();
  }

  return (
    <OffMenuWorkDetail
      navigationLinks={offMenuWorkNavigationLinks}
      project={project}
      resourceLinks={offMenuResourceLinks}
    />
  );
}
