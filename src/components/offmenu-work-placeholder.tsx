"use client";

import Link from "next/link";
import { StudioFinityHeader } from "@/components/studio-finity-header";
import { OffMenuWorkFooter } from "@/components/offmenu-work-footer";
import { OffMenuWorkHero } from "@/components/offmenu-work-hero";
import type { CaseStudy, NavLink } from "@/types/offmenu";

interface OffMenuWorkPlaceholderProps {
  caseStudy: CaseStudy;
  navigationLinks: NavLink[];
  resourceLinks: NavLink[];
}

export function OffMenuWorkPlaceholder({
  caseStudy,
  navigationLinks,
  resourceLinks: _resourceLinks,
}: OffMenuWorkPlaceholderProps) {
  void _resourceLinks;
  return (
    <main className="offmenu-shell min-h-screen bg-background text-foreground">
      <StudioFinityHeader activeHref="/work" links={navigationLinks}>
        <OffMenuWorkHero
          description="The full case study is still being rebuilt, but this route is live so the homepage orbit and work navigation already have a real destination."
          heroImage={caseStudy.thumbnailLightXl}
          heroLqip={caseStudy.thumbnailLqip}
          slug={caseStudy.slug}
          title={caseStudy.title}
        />

        <section className="px-6 pb-24 pt-4 md:px-12 lg:px-20">
        <div className="sf-panel mx-auto hidden max-w-sm rounded-[1.5rem] p-6 text-foreground md:block">
          <p className="sf-eyebrow">In progress</p>
          <p className="sf-title-md mt-4">
            Flex is the fully cloned base right now. The remaining work pages can inherit the same
            structure next.
          </p>
          <Link
            href="/work/flex"
            className="sf-interactive sf-pill-button sf-pill-button-secondary mt-6 text-sm"
          >
            Open Flex case study
          </Link>
        </div>
        </section>

        <OffMenuWorkFooter navigationLinks={navigationLinks} />
      </StudioFinityHeader>
    </main>
  );
}
