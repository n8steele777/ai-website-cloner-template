"use client";

import Image from "next/image";
import { useMemo, type ReactNode } from "react";
import { useContactDialog } from "@/components/contact-dialog-provider";
import { TransitionLink } from "@/components/transition-link";
import { cn } from "@/lib/utils";
import type { NavLink } from "@/types/offmenu";

const HEADER_LOGO_SRC = "/logos/SF-Logo-Dark.png";

const headerFocusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-foreground/18 focus-visible:ring-offset-2 focus-visible:ring-offset-background";

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
  const visibleLinks = useMemo(() => links.filter((link) => !link.disabled), [links]);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-220 border-b border-border/40 bg-background/95 backdrop-blur-sm",
          className,
        )}
      >
        <div className="mx-auto flex max-w-[100vw] items-center justify-between gap-3 px-4 py-2 md:gap-4 md:px-6 md:py-4">
          <TransitionLink
            href="/"
            aria-label="Studio Finity home"
            className={cn(
              "-ms-1 flex min-h-11 shrink-0 items-center px-1 leading-none touch-manipulation transition-opacity duration-280 ease-sf-out active:opacity-85 md:ms-0 md:min-h-0 md:px-0",
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
            aria-label="Primary"
            className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1 sm:gap-x-5 sm:gap-y-2 md:gap-x-7"
          >
            {visibleLinks.map((link) => (
              <HeaderNavLink key={`${link.href}-${link.label}`} link={link} activeHref={activeHref} />
            ))}
          </nav>
        </div>
      </header>
      {children}
    </>
  );
}

function HeaderNavLink({ link, activeHref }: { link: NavLink; activeHref?: string }) {
  const { openContact } = useContactDialog();
  const active = link.href === activeHref;
  const className = cn(
    "inline-flex min-h-11 items-center rounded-sm text-sm font-medium tracking-[0.01em] text-foreground transition-colors duration-280 ease-sf-out touch-manipulation md:min-h-0",
    headerFocusRing,
    active ? "text-foreground" : "text-(--sf-text-muted) hover:text-foreground active:text-foreground/90",
    "px-0.5 sm:px-1 md:px-0",
  );

  if (link.opensContactForm) {
    return (
      <button
        type="button"
        className={className}
        aria-haspopup="dialog"
        onClick={() => openContact()}
      >
        {link.label}
      </button>
    );
  }

  if (link.external || link.href.startsWith("mailto:")) {
    return (
      <a
        href={link.href}
        target={link.href.startsWith("http") ? "_blank" : undefined}
        rel={link.href.startsWith("http") ? "noreferrer" : undefined}
        className={className}
      >
        {link.label}
      </a>
    );
  }

  return (
    <TransitionLink href={link.href} className={className} aria-current={active ? "page" : undefined}>
      {link.label}
    </TransitionLink>
  );
}
