"use client";

import Image from "next/image";
import { useMemo, type ReactNode } from "react";
import { useContactDialog } from "@/components/contact-dialog-provider";
import { usePageTransition } from "@/components/page-transition-provider";
import { TransitionLink } from "@/components/transition-link";
import { cn } from "@/lib/utils";
import type { NavLink } from "@/types/offmenu";

const HEADER_LOGO_SRC = "/logos/SF-Logo-Dark.png";

const headerFocusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-foreground/18 focus-visible:ring-offset-2 focus-visible:ring-offset-background";

/** sf pill + hover/active; `.sf-pill-button-compact` = h-10 nav scale between UI buttons and CTA pills */
const navPillShared =
  "sf-interactive sf-pill-button sf-pill-button-compact outline-none transition-[opacity,transform] duration-280 ease-sf-out focus-visible:!shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 active:scale-[0.98] motion-reduce:active:scale-100";

const navPillPrimary = cn(navPillShared, "sf-pill-button-primary");

const navPillSecondary = cn(navPillShared, "sf-pill-button-secondary");

/** Solid brand text — `mix-blend-difference` on a fixed bar does not composite against the page reliably here, so white+difference reads as invisible white on light heroes. */
const navTextLink = cn(
  "sf-oh-nav-link rounded-sm text-(--sf-text)",
  "inline-flex min-h-10 items-center px-2 py-1.5 touch-manipulation transition-opacity duration-280 ease-sf-out",
  "hover:opacity-80 active:opacity-65 motion-reduce:active:opacity-100",
  "aria-[current=page]:opacity-100",
  "bg-transparent border-0 shadow-none",
  headerFocusRing,
);

function isCenterHeaderLink(link: NavLink): boolean {
  const h = typeof link.href === "string" ? link.href : "";
  return (
    link.label === "About" ||
    link.label === "Works" ||
    h === "/about" ||
    h === "/work"
  );
}

export interface StudioFinityHeaderProps {
  links: NavLink[];
  activeHref?: string;
  children?: ReactNode;
  className?: string;
}

export function StudioFinityHeader({
  links,
  activeHref,
  children,
  className,
}: StudioFinityHeaderProps) {
  const { contentRef } = usePageTransition();
  const visibleLinks = useMemo(() => links.filter((link) => !link.disabled), [links]);
  const centerLinks = useMemo(() => visibleLinks.filter(isCenterHeaderLink), [visibleLinks]);
  const trailingLinks = useMemo(
    () => visibleLinks.filter((link) => !isCenterHeaderLink(link)),
    [visibleLinks],
  );

  return (
    <>
      <header className={cn("fixed inset-x-0 top-0 z-220", className)}>
        <div className="relative mx-auto flex max-w-[100vw] items-center justify-between gap-3 px-4 py-2 md:gap-4 md:px-6 md:py-4">
          <TransitionLink
            href="/"
            aria-label="Studio Finity home"
            className={cn(
              "-ms-1 relative z-20 flex min-h-10 shrink-0 items-center px-1 leading-none touch-manipulation transition-opacity duration-280 ease-sf-out active:opacity-85 md:ms-0 md:min-h-0 md:px-0",
              headerFocusRing,
            )}
          >
            <Image
              src={HEADER_LOGO_SRC}
              alt=""
              width={168}
              height={40}
              className="h-[22px] w-auto md:h-7"
              priority
            />
          </TransitionLink>
          <nav
            aria-label="Primary sections"
            className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center"
          >
            <div className="pointer-events-auto flex items-center gap-x-6 sm:gap-x-8">
              {centerLinks.map((link) => (
                <HeaderNavLink
                  key={`${typeof link.href === "string" ? link.href : "link"}-${link.label}`}
                  link={link}
                  activeHref={activeHref}
                  variant="text"
                />
              ))}
            </div>
          </nav>
          <nav
            aria-label="Primary actions"
            className="relative z-20 flex flex-wrap items-center justify-end gap-x-1.5 gap-y-1 sm:gap-x-2 md:gap-x-2"
          >
            {trailingLinks.map((link) => (
              <HeaderNavLink
                key={`${typeof link.href === "string" ? link.href : "link"}-${link.label}`}
                link={link}
                activeHref={activeHref}
                variant="pill"
              />
            ))}
          </nav>
        </div>
      </header>
      <div ref={contentRef} className="min-w-0">
        {children}
      </div>
    </>
  );
}

function HeaderNavLink({
  link,
  activeHref,
  variant,
}: {
  link: NavLink;
  activeHref?: string;
  variant: "pill" | "text";
}) {
  const { openContact } = useContactDialog();
  const safeHref = typeof link.href === "string" ? link.href : "";
  const active = safeHref === activeHref;
  const isPrimary = Boolean(link.opensContactForm);

  const className =
    variant === "text" ? navTextLink : cn(isPrimary ? navPillPrimary : navPillSecondary);

  const label = link.label;

  if (link.opensContactForm) {
    return (
      <button
        type="button"
        className={className}
        aria-haspopup="dialog"
        aria-label="Contact"
        onClick={() => openContact()}
      >
        {label}
      </button>
    );
  }

  if (link.external || safeHref.startsWith("mailto:")) {
    return (
      <a
        href={safeHref || "#"}
        target={safeHref.startsWith("http") ? "_blank" : undefined}
        rel={safeHref.startsWith("http") ? "noreferrer" : undefined}
        className={className}
      >
        {label}
      </a>
    );
  }

  return (
    <TransitionLink href={safeHref || "/"} className={className} aria-current={active ? "page" : undefined}>
      {label}
    </TransitionLink>
  );
}
