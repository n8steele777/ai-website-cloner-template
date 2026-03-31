"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { StudioFinityHeader } from "@/components/studio-finity-header";
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
  const rootRef = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!rootRef.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const ctx = gsap.context(() => {
      const heroElements = Array.from(
        heroRef.current?.querySelectorAll<HTMLElement>("[data-about-hero]") ?? [],
      );
      const blocks = Array.from(
        rootRef.current?.querySelectorAll<HTMLElement>("[data-about-block]") ?? [],
      );

      gsap.fromTo(
        heroElements,
        { y: 28, opacity: 0, filter: "blur(10px)" },
        {
          y: 0,
          opacity: 1,
          filter: "blur(0px)",
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.08,
          clearProps: "transform,opacity,filter",
        },
      );

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) {
              return;
            }

            observer.unobserve(entry.target);

            gsap.fromTo(
              entry.target,
              { y: 32, opacity: 0, filter: "blur(12px)" },
              {
                y: 0,
                opacity: 1,
                filter: "blur(0px)",
                duration: 0.78,
                ease: "power3.out",
                clearProps: "transform,opacity,filter",
              },
            );
          });
        },
        {
          rootMargin: "0px 0px -14% 0px",
          threshold: 0.18,
        },
      );

      blocks.forEach((block) => {
        observer.observe(block);
      });

      return () => {
        observer.disconnect();
      };
    }, rootRef);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <main ref={rootRef} className="offmenu-shell min-h-screen bg-background text-foreground">
      <StudioFinityHeader
        activeHref="/about"
        links={navigationLinks}
      />

      <section className="px-6 pb-16 pt-28 md:px-12 md:pt-32 lg:px-20">
        <div ref={heroRef} className="max-w-6xl">
          <p
            data-about-hero
            className="text-[11px] font-medium uppercase tracking-[0.28em] text-foreground/45"
          >
            About
          </p>
          <h1
            data-about-hero
            className="mt-6 max-w-5xl text-4xl font-medium leading-[0.98] tracking-tight md:text-6xl lg:text-7xl"
          >
            {content.hero}
          </h1>
        </div>
      </section>

      <section className="px-6 pb-20 md:px-12 lg:px-20">
        <div
          data-about-block
          className="grid gap-8 border-t border-foreground/10 pt-8 md:grid-cols-[10rem_1fr]"
        >
          <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-foreground/45">
            {content.introLabel}
          </p>
          <div className="max-w-4xl">
            <p className="text-2xl font-medium leading-tight md:text-3xl">{content.intro}</p>
            <p className="mt-5 text-lg text-foreground/58">{content.location}</p>
          </div>
        </div>
      </section>

      <section className="px-6 pb-20 md:px-12 lg:px-20">
        <div
          data-about-block
          className="grid gap-8 border-t border-foreground/10 pt-8 md:grid-cols-[10rem_1fr]"
        >
          <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-foreground/45">
            Ground Rules
          </p>
          <div className="grid gap-x-10 gap-y-4 md:grid-cols-2">
            {content.rules.map((rule) => (
              <div key={rule.id} className="flex gap-4 border-b border-foreground/8 pb-4">
                <span className="w-10 shrink-0 text-[11px] font-medium uppercase tracking-[0.28em] text-foreground/42">
                  {rule.id}
                </span>
                <p className="text-lg font-medium leading-tight">{rule.statement}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 pb-24 md:px-12 lg:px-20">
        <div className="grid gap-14 border-t border-foreground/10 pt-8 lg:grid-cols-3">
          <div data-about-block>
            <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-foreground/45">
              Expertise
            </p>
            <div className="mt-6 flex flex-col gap-2 text-3xl font-medium tracking-tight">
              {content.expertise.map((item) => (
                <p key={item}>{item}</p>
              ))}
            </div>
          </div>

          <div data-about-block>
            <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-foreground/45">
              Industries
            </p>
            <div className="mt-6 flex flex-col gap-2 text-lg text-foreground/78">
              {content.industries.map((item) => (
                <p key={item}>{item}</p>
              ))}
            </div>
          </div>

          <div data-about-block>
            <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-foreground/45">
              Clients
            </p>
            <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-3 text-lg font-medium">
              {content.clients.map((client) => (
                <p key={client}>{client}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 pb-28 md:px-12 lg:px-20">
        <div data-about-block className="border-t border-foreground/10 pt-10">
          <p className="max-w-3xl text-3xl font-medium leading-tight md:text-5xl">
            Distinct brands. Elevated digital experiences. Sharp storytelling.
          </p>
          <a
            href="mailto:christian@offmenu.design"
            className="mt-8 inline-flex rounded-full bg-foreground px-8 py-4 text-base font-medium text-background transition-opacity hover:opacity-80"
          >
            Start a conversation
          </a>
        </div>
      </section>
    </main>
  );
}
