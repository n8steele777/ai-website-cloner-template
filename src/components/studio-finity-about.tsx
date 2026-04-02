"use client";

import { useLayoutEffect, useRef } from "react";
import {
  AnimatedLines,
  type AnimatedLinesPhraseHighlight,
} from "@/components/animated-lines";
import { StudioFinityFullPageFooter } from "@/components/studio-finity-full-page-footer";
import { StudioGroundRules } from "@/components/studio-ground-rules";
import { StudioFinityHeader } from "@/components/studio-finity-header";
import { usePageTransition } from "@/components/page-transition-provider";
import { mountDataAboutScrollReveals } from "@/lib/gsap-data-about-reveal";
import type { NavLink, StudioAboutContent } from "@/types/offmenu";

const ABOUT_HERO_PHRASE_HIGHLIGHTS: readonly AnimatedLinesPhraseHighlight[] = [
  { phrase: "Studio Finity", className: "sf-text-quiet" },
];

interface StudioFinityAboutProps {
  content: StudioAboutContent;
  navigationLinks: NavLink[];
  resourceLinks: NavLink[];
}

export function StudioFinityAbout({
  content,
  navigationLinks,
  resourceLinks: _resourceLinks,
}: StudioFinityAboutProps) {
  void _resourceLinks;
  const { pageReady } = usePageTransition();
  const rootRef = useRef<HTMLElement | null>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) {
      return;
    }
    return mountDataAboutScrollReveals(root, pageReady);
  }, [pageReady]);

  return (
    <main ref={rootRef} className="offmenu-shell min-h-screen bg-background text-foreground">
      <StudioFinityHeader activeHref="/about" links={navigationLinks}>
        <section className="relative min-h-[64dvh] sf-page-pad pb-16 pt-18 md:min-h-[78vh] md:pb-32 md:pt-32">
          <div className="sf-page-content max-md:px-0 relative overflow-hidden rounded-[22px] pb-12 pt-11 md:rounded-[28px] md:pb-28 md:pt-20 lg:pb-32">
            <div className="relative px-3 pt-14 md:px-0 md:pt-32">
              <AnimatedLines
                as="h1"
                text={content.hero}
                className="about-hero-display sf-display-tight max-w-[13ch]"
                lineClassName="leading-[0.84]"
                phraseHighlights={ABOUT_HERO_PHRASE_HIGHLIGHTS}
                delay={0.08}
                stagger={0.1}
              />
            </div>
          </div>
        </section>

        <section className="hidden lg:block sf-page-pad pb-18 pt-12 md:pb-32 md:pt-20">
          <div className="sf-page-content max-md:px-0 mx-auto max-w-[1040px]">
            <StudioGroundRules rules={content.rules} />
          </div>
        </section>

        <section className="sf-page-pad pb-22 pt-14 md:pb-36 md:pt-24">
          <div className="sf-page-content max-md:px-0 grid gap-12 lg:grid-cols-[1.55fr_0.8fr] lg:gap-18">
            <div>
              <p data-about-reveal className="sf-eyebrow">
                Expertise
              </p>
              <div data-about-stagger className="about-expertise-display mt-4 md:mt-5">
                {content.expertise.map((item) => (
                  <p key={item} data-about-item>{item}</p>
                ))}
              </div>
            </div>

            <div>
              <p data-about-reveal className="sf-eyebrow">
                Industries
              </p>
              <div data-about-stagger className="sf-body-large mt-4 flex max-w-[20rem] flex-col gap-2.5 text-foreground/92 md:mt-6">
                {content.industries.map((item) => (
                  <p key={item} data-about-item>{item}</p>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="sf-page-pad pb-26 pt-16 md:pb-44 md:pt-28">
          <div className="sf-page-content max-md:px-0 mx-auto max-w-[760px]">
            <p data-about-reveal className="sf-eyebrow">
              Clients
            </p>
            <div data-about-stagger className="about-clients-display mt-5 md:mt-6">
              {content.clients.map((client) => (
                <p key={client} data-about-item>{client}</p>
              ))}
            </div>
          </div>
        </section>

        <StudioFinityFullPageFooter />
      </StudioFinityHeader>
    </main>
  );
}
