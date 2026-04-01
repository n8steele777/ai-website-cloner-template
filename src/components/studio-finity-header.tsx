"use client";

import { useEffect, useMemo, useState } from "react";
import { TransitionLink } from "@/components/transition-link";
import { cn } from "@/lib/utils";
import type { NavLink } from "@/types/offmenu";

interface HeaderAction {
  label: string;
  href: string;
  external?: boolean;
  variant?: "primary" | "secondary" | "ghost";
}

interface StudioFinityHeaderProps {
  links: NavLink[];
  activeHref?: string;
  actions?: HeaderAction[];
  overlay?: boolean;
}

const defaultActions: HeaderAction[] = [
  { label: "Contact", href: "mailto:hello@studio-finity.com", external: true, variant: "primary" },
];

export function StudioFinityHeader({
  links,
  activeHref,
  actions = defaultActions,
  overlay = false,
}: StudioFinityHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const visibleLinks = useMemo(() => links.filter((link) => !link.disabled), [links]);
  const toneClass = overlay ? "text-white" : "text-[#080807]";

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const previousOverflow = document.documentElement.style.overflow;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    document.documentElement.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.documentElement.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-[220] px-[14px] pt-[14px] md:px-[22px] md:pt-6">
        <div className="relative flex items-start justify-between gap-4">
          <TransitionLink
            href="/"
            aria-label="Studio Finity home"
            className={cn(
              "sf-nav-wordmark sf-oh-wordmark relative z-10 whitespace-nowrap",
              toneClass,
            )}
          >
            Studio Finity
          </TransitionLink>

          <nav
            aria-label="Primary"
            className={cn(
              "absolute left-1/2 top-[18px] hidden -translate-x-1/2 items-center gap-[11px] md:flex",
              toneClass,
            )}
          >
            {visibleLinks.map((link, index) => (
              <div key={link.href} className="flex items-center gap-[11px]">
                <DesktopNavLink href={link.href} active={link.href === activeHref} external={link.external}>
                  {link.label}
                </DesktopNavLink>
                {index < visibleLinks.length - 1 ? (
                  <span aria-hidden="true" className="sf-oh-nav-link opacity-90">
                    ,
                  </span>
                ) : null}
              </div>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            {actions.map((action) => (
              <HeaderActionLink key={action.label} action={action} />
            ))}
          </div>

          <button
            type="button"
            aria-expanded={menuOpen}
            aria-controls="studio-finity-mobile-nav"
            onClick={() => setMenuOpen(true)}
            className="sf-oh-pill sf-oh-nav-link flex items-center rounded-full bg-[#f2f0eb] px-3 py-[0.9rem] text-[#080807] md:hidden"
          >
            Menu
          </button>
        </div>
      </header>

      <div
        id="studio-finity-mobile-nav"
        aria-hidden={!menuOpen}
        className={cn(
          "fixed inset-0 z-[230] bg-[#080807] px-[14px] pb-[20px] pt-[14px] text-white transition-[opacity,visibility] duration-300 md:hidden",
          menuOpen ? "visible opacity-100" : "pointer-events-none invisible opacity-0",
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <TransitionLink
            href="/"
            aria-label="Studio Finity home"
            className="sf-nav-wordmark sf-oh-wordmark whitespace-nowrap"
            onClick={() => setMenuOpen(false)}
          >
            Studio Finity
          </TransitionLink>

          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            className="sf-oh-nav-link pt-1 text-white/88"
          >
            Close
          </button>
        </div>

        <nav aria-label="Mobile primary" className="mt-[4.5rem] flex flex-col gap-5">
          {visibleLinks.map((link) => (
            <OverlayNavLink
              key={link.href}
              href={link.href}
              active={link.href === activeHref}
              external={link.external}
              onNavigate={() => setMenuOpen(false)}
            >
              {link.label}
            </OverlayNavLink>
          ))}
        </nav>

        <div className="mt-10 flex flex-col gap-3">
          {actions.map((action) => (
            <HeaderActionLink key={action.label} action={action} mobile onNavigate={() => setMenuOpen(false)} />
          ))}
        </div>
      </div>
    </>
  );
}

function DesktopNavLink({
  href,
  active,
  children,
  external,
}: {
  href: string;
  active?: boolean;
  children: string;
  external?: boolean;
}) {
  const className = cn(
    "sf-oh-nav-link uppercase transition-opacity duration-200",
    active ? "opacity-100" : "opacity-[0.86] hover:opacity-100",
  );

  if (external || href.startsWith("mailto:")) {
    return (
      <a
        href={href}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel={href.startsWith("http") ? "noreferrer" : undefined}
        className={className}
      >
        {children}
      </a>
    );
  }

  return (
    <TransitionLink href={href} className={className} aria-current={active ? "page" : undefined}>
      {children}
    </TransitionLink>
  );
}

function OverlayNavLink({
  href,
  active,
  children,
  external,
  onNavigate,
}: {
  href: string;
  active?: boolean;
  children: string;
  external?: boolean;
  onNavigate?: () => void;
}) {
  const className = cn(
    "sf-display-overlay sf-oh-wordmark text-white transition-opacity duration-200",
    active ? "opacity-100" : "opacity-[0.86] hover:opacity-100",
  );

  if (external || href.startsWith("mailto:")) {
    return (
      <a
        href={href}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel={href.startsWith("http") ? "noreferrer" : undefined}
        className={className}
        onClick={onNavigate}
      >
        {children}
      </a>
    );
  }

  return (
    <TransitionLink
      href={href}
      className={className}
      aria-current={active ? "page" : undefined}
      onClick={onNavigate}
    >
      {children}
    </TransitionLink>
  );
}

function HeaderActionLink({
  action,
  mobile = false,
  onNavigate,
}: {
  action: HeaderAction;
  mobile?: boolean;
  onNavigate?: () => void;
}) {
  const className = cn(
    "sf-oh-pill font-oh-nav flex w-fit items-center gap-4 rounded-full px-5 py-4 text-[0.95rem] leading-none md:text-base",
    mobile ? "min-h-[54px] bg-[#f2f0eb] text-[#080807]" : "bg-[#080807] text-white",
  );
  const content = (
    <>
      <span className="font-oh-nav font-medium tracking-[0em]">
        {action.label}
      </span>
      <span
        aria-hidden="true"
        className={cn(
          "h-2.5 w-2.5 rounded-full border",
          mobile ? "border-[#080807]/60" : "border-white/70",
        )}
      />
    </>
  );

  if (action.external || action.href.startsWith("mailto:")) {
    return (
      <a
        href={action.href}
        target={action.href.startsWith("http") ? "_blank" : undefined}
        rel={action.href.startsWith("http") ? "noreferrer" : undefined}
        className={className}
        onClick={onNavigate}
      >
        {content}
      </a>
    );
  }

  return (
    <TransitionLink href={action.href} className={className} onClick={onNavigate}>
      {content}
    </TransitionLink>
  );
}
