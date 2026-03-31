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
  const heroParts = content.hero.split("Studio Finity");
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
              clearProps: "filter",
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
              autoAlpha: 1,
              y: 0,
              duration: 0.58,
              ease: "power3.out",
              stagger: 0.05,
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

      <section className="px-4 pb-16 pt-28 md:px-10 md:pt-32 lg:px-14">
        <div className="relative overflow-hidden rounded-[28px] px-4 pb-10 pt-6 md:px-8 md:pb-16 md:pt-10 lg:px-10 lg:pb-20">
          <div className="relative pt-14 md:pt-20">
            <AnimatedWords
              as="h1"
              text={`${heroParts[0]}${heroParts[1] ? `\nStudio Finity${heroParts[1]}` : ""}`}
              className="max-w-[13ch] text-[2.45rem] font-medium leading-[0.92] tracking-[-0.04em] md:text-[4.5rem] lg:text-[6rem]"
              lineClassName="leading-[0.92]"
              delay={0.08}
              stagger={0.022}
            />
          </div>
        </div>
      </section>

      <section className="px-4 pb-22 md:px-10 lg:px-14">
        <div className="max-w-[1180px] px-4 md:px-8 lg:px-10">
          <p data-about-reveal className="text-[1.05rem] font-medium tracking-[0em] text-black/34">
            {content.introLabel}
          </p>
          <AnimatedWords
            as="p"
            text={`${content.intro}\nBased in ${content.location.replace(/^Based in /, "")}`}
            className="mt-3 max-w-[20ch] text-[2.15rem] font-medium leading-[0.95] tracking-[-0.04em] md:text-[3.45rem] lg:text-[4.25rem]"
            lineClassName="leading-[0.95]"
            delay={0.14}
            stagger={0.02}
            triggerOnView
          />
        </div>
      </section>

      <section className="px-4 pb-28 md:px-10 lg:px-14">
        <div className="mx-auto max-w-[1040px] px-4 md:px-8 lg:px-10">
          <StudioGroundRules rules={content.rules} />
        </div>
      </section>

      <section className="px-4 pb-28 md:px-10 lg:px-14">
        <div className="grid gap-14 px-4 md:px-8 lg:grid-cols-[1.55fr_0.8fr] lg:px-10">
          <div>
            <p data-about-reveal className="text-[1.05rem] font-medium tracking-[0em] text-black/34">
              Expertise
            </p>
            <div data-about-stagger className="mt-4 flex flex-col text-[2.45rem] font-medium leading-[0.9] tracking-[-0.04em] md:text-[4.6rem] lg:text-[5rem]">
              {content.expertise.map((item) => (
                <p key={item} data-about-item>{item}</p>
              ))}
            </div>
          </div>

          <div>
            <p data-about-reveal className="text-[1.05rem] font-medium tracking-[0em] text-black/34">
              Industries
            </p>
            <div data-about-stagger className="mt-4 flex max-w-[20rem] flex-col gap-1.5 text-[1.05rem] leading-[1.2] tracking-[0em] text-black/92 md:text-[1.25rem]">
              {content.industries.map((item) => (
                <p key={item} data-about-item>{item}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-28 md:px-10 lg:px-14">
        <div className="mx-auto max-w-[760px] px-4 md:px-8 lg:px-10">
          <p data-about-reveal className="text-[1.05rem] font-medium tracking-[0em] text-black/34">
            Clients
          </p>
          <div data-about-stagger className="mt-4 flex flex-col text-[2.45rem] font-medium leading-[0.92] tracking-[-0.04em] md:text-[4.4rem] lg:text-[4.95rem]">
            {content.clients.map((client) => (
              <p key={client} data-about-item>{client}</p>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
