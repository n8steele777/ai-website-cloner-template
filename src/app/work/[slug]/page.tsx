import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { OffMenuWorkDetail } from "@/components/offmenu-work-detail";
import {
  offMenuResourceLinks,
  offMenuWorkNavigationLinks,
} from "@/lib/site-data";
import { buildWorkProjects, fetchSanityWorks } from "@/lib/sanity-work";

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

  return {
    title: `${project.title} | Studio Finity`,
    description: project.summary ?? `${project.title} — A Studio Finity case study.`,
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
