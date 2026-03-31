import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { OffMenuWorkDetail } from "@/components/offmenu-work-detail";
import {
  getWorkProjectBySlug,
  offMenuCaseStudies,
  offMenuWorkNavigationLinks,
  offMenuResourceLinks,
} from "@/lib/offmenu-data";

interface WorkPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  return offMenuCaseStudies.map((caseStudy) => ({
    slug: caseStudy.slug,
  }));
}

export async function generateMetadata({ params }: WorkPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getWorkProjectBySlug(slug);

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
  const project = getWorkProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  return (
    <OffMenuWorkDetail
      caseStudies={offMenuCaseStudies}
      navigationLinks={offMenuWorkNavigationLinks}
      project={project}
      resourceLinks={offMenuResourceLinks}
    />
  );
}
