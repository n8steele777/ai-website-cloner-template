"use client";

import Link from "next/link";
import { OffMenuHeader } from "@/components/offmenu-header";
import { OffMenuWorkFooter } from "@/components/offmenu-work-footer";
import { OffMenuWorkHero } from "@/components/offmenu-work-hero";
import { useOffMenuTheme } from "@/hooks/use-offmenu-theme";
import type { CaseStudy, NavLink } from "@/types/offmenu";

interface OffMenuWorkPlaceholderProps {
  caseStudy: CaseStudy;
  navigationLinks: NavLink[];
  resourceLinks: NavLink[];
}

export function OffMenuWorkPlaceholder({
  caseStudy,
  navigationLinks,
  resourceLinks,
}: OffMenuWorkPlaceholderProps) {
  const { themeMode, setThemeMode } = useOffMenuTheme();

  return (
    <main className="offmenu-shell min-h-screen bg-background text-foreground">
      <OffMenuHeader
        activeHref="/"
        navigationLinks={navigationLinks}
        resourceLinks={resourceLinks}
        themeMode={themeMode}
        onToggleTheme={() => setThemeMode((current) => (current === "light" ? "dark" : "light"))}
        variant="work"
      />

      <OffMenuWorkHero
        description="The full case study is still being rebuilt, but this route is live so the homepage orbit and work navigation already have a real destination."
        heroImageDark={caseStudy.thumbnailDarkXl}
        heroImageLight={caseStudy.thumbnailLightXl}
        slug={caseStudy.slug}
        themeMode={themeMode}
        title={caseStudy.title}
      />

      <section className="px-6 pb-24 pt-4 md:px-12 lg:px-20">
        <div className="offmenu-glass mx-auto hidden max-w-sm rounded-[1.5rem] p-6 text-foreground md:block">
          <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-foreground/50">
            In progress
          </p>
          <p className="mt-4 text-lg font-medium leading-tight">
            Flex is the fully cloned base right now. The remaining work pages can inherit the same
            structure next.
          </p>
          <Link
            href="/work/flex"
            className="offmenu-glass-button mt-6 inline-flex rounded-full px-5 py-3 text-sm font-medium text-foreground transition-opacity hover:opacity-80"
          >
            Open Flex case study
          </Link>
        </div>
      </section>

      <OffMenuWorkFooter navigationLinks={navigationLinks} />
    </main>
  );
}
