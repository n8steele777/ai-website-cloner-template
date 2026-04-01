"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { AnimatedWords } from "@/components/animated-words";
import { StudioGroundRules } from "@/components/studio-ground-rules";
import { StudioFinityHeader } from "@/components/studio-finity-header";
import { usePageTransition } from "@/components/page-transition-provider";
import type { NavLink, StudioAboutContent } from "@/types/offmenu";

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

    let cancelled = false;
    const cleanups: Array<() => void> = [];

    const readyPromise =
      "fonts" in document ? document.fonts.ready.catch(() => undefined) : Promise.resolve();

    void readyPromise.then(() => {
      if (cancelled || !pageReady) {
        return;
      }

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        root.querySelectorAll<HTMLElement>("[data-about-reveal], [data-about-stagger]").forEach((node) => {
          gsap.set(node, { clearProps: "all" });
        });
        return;
      }

      const revealNodes = Array.from(root.querySelectorAll<HTMLElement>("[data-about-reveal]"));
      revealNodes.forEach((node, index) => {
        let observer: IntersectionObserver | null = null;
        let hasAnimated = false;

        const animate = () => {
          if (hasAnimated) {
            return;
          }

          hasAnimated = true;
          gsap.fromTo(
            node,
            {
              autoAlpha: 0,
              y: 28,
              filter: "blur(8px)",
            },
            {
              autoAlpha: 1,
              y: 0,
              filter: "blur(0px)",
              duration: 0.72,
              delay: index * 0.03,
              ease: "power3.out",
              clearProps: "opacity,transform,filter,visibility",
            },
          );
        };

        const rect = node.getBoundingClientRect();
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
        if (rect.bottom > 0 && rect.top < viewportHeight * 0.96) {
          animate();
        } else {
          gsap.set(node, { autoAlpha: 0, y: 28, filter: "blur(8px)" });
          observer = new IntersectionObserver(
            (entries) => {
              entries.forEach((entry) => {
                if (!entry.isIntersecting) {
                  return;
                }

                observer?.disconnect();
                animate();
              });
            },
            { threshold: 0, rootMargin: "0px 0px -12% 0px" },
          );
          observer.observe(node);
        }

        cleanups.push(() => {
          observer?.disconnect();
          gsap.killTweensOf(node);
        });
      });

      const staggerNodes = Array.from(root.querySelectorAll<HTMLElement>("[data-about-stagger]"));
      staggerNodes.forEach((group) => {
        const items = Array.from(group.querySelectorAll<HTMLElement>("[data-about-item]"));
        const targetOpacities = items.map((item) => Number.parseFloat(window.getComputedStyle(item).opacity) || 1);

        if (items.length === 0) {
          return;
        }

        let observer: IntersectionObserver | null = null;
        let hasAnimated = false;

        const animate = () => {
          if (hasAnimated) {
            return;
          }

          hasAnimated = true;
          gsap.fromTo(
            items,
            {
              autoAlpha: 0,
              y: 22,
            },
            {
              autoAlpha: (index) => targetOpacities[index] ?? 1,
              y: 0,
              duration: 0.58,
              ease: "power3.out",
              stagger: 0.05,
              clearProps: "opacity,transform,visibility",
            },
          );
        };

        const rect = group.getBoundingClientRect();
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
        if (rect.bottom > 0 && rect.top < viewportHeight * 0.96) {
          animate();
        } else {
          gsap.set(items, { autoAlpha: 0, y: 22 });
          observer = new IntersectionObserver(
            (entries) => {
              entries.forEach((entry) => {
                if (!entry.isIntersecting) {
                  return;
                }

                observer?.disconnect();
                animate();
              });
            },
            { threshold: 0, rootMargin: "0px 0px -12% 0px" },
          );
          observer.observe(group);
        }

        cleanups.push(() => {
          observer?.disconnect();
          gsap.killTweensOf(items);
        });
      });
    });

    return () => {
      cancelled = true;
      cleanups.forEach((cleanup) => cleanup());
    };
  }, [pageReady]);

  return (
    <main ref={rootRef} className="offmenu-shell min-h-screen bg-background text-foreground">
      <StudioFinityHeader
        activeHref="/about"
        links={navigationLinks}
      />

      <section className="sf-page-pad pb-28 pt-36 md:pb-32 md:pt-40">
        <div className="sf-page-content relative overflow-hidden rounded-[28px] pb-20 pt-16 md:pb-28 md:pt-20 lg:pb-32">
          <div className="relative pt-24 md:pt-32">
            <AnimatedWords
              as="h1"
              text={content.hero}
              className="about-hero-display sf-display-tight max-w-[13ch]"
              lineClassName="leading-[0.84]"
              delay={0.08}
              stagger={0.022}
              highlightWords={["Studio", "Finity"]}
              highlightClassName="text-black/32"
            />
          </div>
        </div>
      </section>

      <section className="sf-page-pad pb-28 pt-16 md:pb-32 md:pt-20">
        <div className="sf-page-content mx-auto max-w-[1040px]">
          <StudioGroundRules rules={content.rules} />
        </div>
      </section>

      <section className="sf-page-pad pb-32 pt-20 md:pb-36 md:pt-24">
        <div className="sf-page-content grid gap-18 lg:grid-cols-[1.55fr_0.8fr]">
          <div>
            <p data-about-reveal className="sf-eyebrow">
              Expertise
            </p>
            <div data-about-stagger className="about-expertise-display mt-5">
              {content.expertise.map((item) => (
                <p key={item} data-about-item>{item}</p>
              ))}
            </div>
          </div>

          <div>
            <p data-about-reveal className="sf-eyebrow">
              Industries
            </p>
            <div data-about-stagger className="sf-body-large mt-6 flex max-w-[20rem] flex-col gap-2.5 text-black/92">
              {content.industries.map((item) => (
                <p key={item} data-about-item>{item}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="sf-page-pad pb-36 pt-24 md:pb-44 md:pt-28">
        <div className="sf-page-content mx-auto max-w-[760px]">
          <p data-about-reveal className="sf-eyebrow">
            Clients
          </p>
          <div data-about-stagger className="about-clients-display mt-6">
            {content.clients.map((client) => (
              <p key={client} data-about-item>{client}</p>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
