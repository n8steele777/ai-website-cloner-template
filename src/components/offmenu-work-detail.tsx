"use client";

import Image from "next/image";
import Link from "next/link";
import { OffMenuHeader } from "@/components/offmenu-header";
import { OffMenuWorkFooter } from "@/components/offmenu-work-footer";
import { OffMenuWorkHero } from "@/components/offmenu-work-hero";
import { useOffMenuTheme } from "@/hooks/use-offmenu-theme";
import type { CaseStudy, NavLink, WorkMediaImage, WorkProjectDetail } from "@/types/offmenu";

interface OffMenuWorkDetailProps {
  caseStudies: CaseStudy[];
  navigationLinks: NavLink[];
  project: WorkProjectDetail;
  resourceLinks: NavLink[];
}

export function OffMenuWorkDetail({
  caseStudies,
  navigationLinks,
  project,
  resourceLinks,
}: OffMenuWorkDetailProps) {
  const { themeMode, setThemeMode } = useOffMenuTheme();
  const creditsStatement = buildCreditsStatement(project);
  const relatedProjects = project.relatedSlugs
    .map((slug) => caseStudies.find((caseStudy) => caseStudy.slug === slug))
    .filter((caseStudy): caseStudy is CaseStudy => Boolean(caseStudy));
  const [primaryFigure, secondaryFigure, ...remainingFigures] = project.galleryImages;
  const twoUpFigures = remainingFigures.slice(0, 2);
  const trailingFigures = remainingFigures.slice(2);

  return (
    <main className="offmenu-shell bg-background text-foreground">
      <OffMenuHeader
        activeHref="/work"
        navigationLinks={navigationLinks}
        resourceLinks={resourceLinks}
        themeMode={themeMode}
        onToggleTheme={() => setThemeMode((current) => (current === "light" ? "dark" : "light"))}
      />

      <div className="min-h-screen">
        <OffMenuWorkHero
          heroImageDark={project.heroImageDark}
          heroImageLight={project.heroImageLight}
          slug={project.slug}
          themeMode={themeMode}
          title={project.title}
        />

        <section className="px-6 pb-16 pt-28 md:px-12 lg:px-20" id="introduction">
          <div className="flex flex-col gap-16">
            <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
              <div className="flex flex-col gap-8">
                <span className="text-sm font-medium">Introduction</span>
                <p className="max-w-5xl whitespace-pre-line text-2xl font-medium leading-tight md:text-3xl">
                  {project.introduction}
                </p>
              </div>

              <div className="flex w-full flex-col gap-8 lg:max-w-md lg:justify-self-end">
                <span className="text-sm font-medium">Details</span>
                <ul className="text-sm font-medium [&>li]:mb-0 [&>li]:list-none [&>li]:items-center [&>li]:gap-2 [&>li]:border-t [&>li]:border-foreground/10 [&>li]:py-3 lg:[&>li]:flex">
                  {project.details.map((detail, index) => (
                    <li key={`${detail.label}-${index}`}>
                      <span className="flex-1 text-foreground/40">{detail.label}</span>
                      <span>{detail.value}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {project.scopeItems.length > 0 ? (
              <div className="flex max-w-md flex-col gap-4">
                <span className="text-sm font-medium">Scope</span>
                <ul className="space-y-2 text-sm font-medium">
                  {project.scopeItems.map((item, index) => (
                    <li key={`${item}-${index}`} className="flex items-start gap-3">
                      <span className="min-w-8 text-foreground/40">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </section>

        {project.summary ? (
          <WorkNarrative
            label="Overview"
            content={project.summary}
            size="body"
          />
        ) : null}

        {primaryFigure ? <WorkFigure image={primaryFigure} /> : null}

        {creditsStatement ? (
          <WorkNarrative
            label="Credits"
            content={creditsStatement}
            size="display"
          />
        ) : null}

        {secondaryFigure ? <WorkFigure image={secondaryFigure} /> : null}

        {twoUpFigures.length > 0 ? (
          <section className="px-4 py-4 md:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-3 lg:gap-4">
              {twoUpFigures.map((image, index) => (
                <div key={`${image.src}-${index}`} className="overflow-hidden rounded-lg md:rounded-2xl">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    width={1200}
                    height={1200}
                    sizes="(max-width: 767px) 100vw, 50vw"
                    className="h-auto w-full object-cover"
                  />
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {trailingFigures.map((image, index) => (
          <WorkFigure key={`${image.src}-${index}`} image={image} />
        ))}
      </div>

      <section className="px-4 pb-4 pt-24 md:px-6 lg:px-8">
        <h2 className="-mb-12 text-2xl font-medium md:text-4xl">Want to see more?</h2>

        <div className="py-16 md:py-24">
          <div className="group/row flex flex-col md:h-[68vh] md:flex-row">
            {relatedProjects.map((relatedProject, index) => {
              const relatedImage =
                themeMode === "dark"
                  ? relatedProject.thumbnailDarkXl
                  : relatedProject.thumbnailLightXl;

              return (
                <Link
                  key={relatedProject.slug}
                  href={relatedProject.href}
                  className={
                    index === 0
                      ? "peer/left aspect-[2/3] flex-1 pb-2 transition-[flex] duration-700 ease-[cubic-bezier(0.85,0.09,0.15,0.91)] md:h-full md:aspect-auto md:pr-2 md:hover:flex-[1.75] md:peer-hover/right:flex-1"
                      : "peer/right aspect-square flex-1 pt-2 transition-[flex] duration-700 ease-[cubic-bezier(0.85,0.09,0.15,0.91)] md:h-full md:aspect-auto md:pl-2 md:hover:flex-[1.75] md:peer-hover/left:flex-1"
                  }
                >
                  <div className="flex h-full flex-col">
                    <div className="group relative block flex-1 cursor-pointer">
                      <div className="relative h-full w-full overflow-hidden rounded-2xl">
                        <Image
                          src={relatedImage}
                          alt={relatedProject.title}
                          fill
                          sizes="(max-width: 767px) 100vw, 50vw"
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                      </div>
                    </div>
                    <p className="mt-3 text-sm font-medium text-foreground">{relatedProject.title}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="flex flex-col items-center justify-center gap-8 pb-35 pt-24">
        <h2 className="text-center text-3xl font-medium md:text-4xl lg:text-5xl">
          {project.ctaTitle}
        </h2>
        <a
          href={project.ctaHref}
          className="rounded-full bg-foreground px-8 py-4 text-lg font-medium text-background transition-opacity hover:opacity-80"
        >
          {project.ctaLabel}
        </a>
      </section>

      <OffMenuWorkFooter navigationLinks={navigationLinks} />
    </main>
  );
}

function buildCreditsStatement(project: WorkProjectDetail) {
  if (!project.credits) {
    return null;
  }

  const roles = project.credits.roles
    .map((role) => role.replace(/,+$/g, "").trim())
    .filter(Boolean);
  const names = project.credits.names
    .map((name) => name.trim())
    .filter(Boolean);

  if (roles.length === 0 && names.length === 0) {
    return null;
  }

  if (roles.length > 0 && names.length > 0) {
    return `${roles.join(", ")} by ${names.join(", ")}.`;
  }

  if (roles.length > 0) {
    return roles.join(", ");
  }

  return names.join(", ");
}

function WorkNarrative({
  content,
  label,
  size,
}: {
  content: string;
  label: string;
  size: "body" | "display";
}) {
  return (
    <section className="px-6 py-10 md:px-12 lg:px-20">
      <div className="flex max-w-4xl flex-col gap-5">
        <span className="text-sm font-medium text-foreground/40">{label}</span>
        <p
          className={
            size === "display"
              ? "max-w-3xl text-xl font-medium leading-tight md:text-3xl"
              : "max-w-3xl text-base font-medium leading-tight md:text-lg"
          }
        >
          {content}
        </p>
      </div>
    </section>
  );
}

function WorkFigure({ image }: { image: WorkMediaImage }) {
  return (
    <figure className="px-4 py-4 md:px-6 lg:px-8">
      <div className="relative w-full overflow-hidden rounded-lg md:rounded-2xl">
        <Image
          src={image.src}
          alt={image.alt}
          width={1800}
          height={1200}
          sizes="100vw"
          className="h-auto w-full object-cover"
        />
      </div>
    </figure>
  );
}
