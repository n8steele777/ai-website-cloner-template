"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { TransitionLink } from "@/components/transition-link";
import { cn } from "@/lib/utils";
import type { NavLink } from "@/types/offmenu";

const HEADER_LOGO_SRC = "/logos/SF-Logo-Dark.png";

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
}

const defaultActions: HeaderAction[] = [
  { label: "Contact", href: "mailto:hello@studio-finity.com", external: true, variant: "primary" },
];

export function StudioFinityHeader({
  links,
  activeHref,
  actions = defaultActions,
}: StudioFinityHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const visibleLinks = useMemo(() => links.filter((link) => !link.disabled), [links]);
  const menuRevealProgress = menuOpen ? 1 : 0;

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
      <header className="fixed inset-x-0 top-0 z-220 px-[14px] pt-[14px] md:px-[22px] md:pt-6">
        <div className="relative flex items-start justify-between gap-4">
          <HeaderLogoLink href="/" className="relative z-10" surface="light" />

          <nav
            aria-label="Primary"
            className="absolute left-1/2 top-[18px] hidden -translate-x-1/2 items-center gap-[11px] text-[#080807] md:flex"
          >
            {visibleLinks.map((link, index) => (
              <div key={link.href} className="flex items-center gap-[11px]">
                <DesktopNavLink
                  href={link.href}
                  active={link.href === activeHref}
                  external={link.external}
                >
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
              <HeaderActionLink key={action.label} action={action} surface="dark" />
            ))}
          </div>

          <MenuToggleButton
            expanded={menuOpen}
            onClick={() => setMenuOpen((current) => !current)}
            surface="light"
            className="md:hidden"
          />
        </div>
      </header>

      <div
        id="studio-finity-mobile-nav"
        aria-hidden={!menuOpen}
        className={cn(
          "fixed inset-0 z-240 bg-[#080807] px-[14px] pb-[20px] pt-[14px] text-white transition-[opacity,visibility,clip-path] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] md:px-[22px] md:pt-6",
          menuOpen ? "visible opacity-100" : "pointer-events-none invisible opacity-0",
        )}
        style={{
          clipPath: menuOpen
            ? "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)"
            : "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
        }}
      >
        <div
          className="flex min-h-full flex-col"
          style={{
            opacity: menuRevealProgress,
            transform: `translateY(${(1 - menuRevealProgress) * 20}px)`,
            transition:
              "transform 420ms cubic-bezier(0.22,1,0.36,1), opacity 260ms ease-out",
          }}
        >
          <div className="flex items-start justify-between gap-4">
            <HeaderLogoLink
              href="/"
              className="shrink-0"
              surface="dark"
              onClick={() => setMenuOpen(false)}
            />

            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              className="sf-oh-nav-link pt-1 text-white/88 transition-opacity duration-200 hover:opacity-100"
            >
              Close
            </button>
          </div>

          <nav aria-label="Overlay primary" className="mt-18 flex flex-col gap-5 md:mt-36 md:max-w-136 md:gap-6">
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
              <HeaderActionLink
                key={action.label}
                action={action}
                mobile
                surface="light"
                onNavigate={() => setMenuOpen(false)}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function HeaderLogoLink({
  href,
  className,
  surface,
  onClick,
}: {
  href: string;
  className?: string;
  surface: "light" | "dark";
  onClick?: () => void;
}) {
  return (
    <TransitionLink
      href={href}
      aria-label="Studio Finity home"
      className={cn("block leading-none", className)}
      onClick={onClick}
    >
      <Image
        src={HEADER_LOGO_SRC}
        alt=""
        width={168}
        height={40}
        className={cn(
          "h-[22px] w-auto md:h-7",
          surface === "dark" ? "brightness-0 invert" : null,
        )}
        priority
      />
    </TransitionLink>
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
    "sf-oh-nav-link uppercase text-[#080807] transition-opacity duration-200",
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
  surface,
}: {
  action: HeaderAction;
  mobile?: boolean;
  onNavigate?: () => void;
  surface: "dark" | "light";
}) {
  const className = cn(
    "sf-oh-pill font-oh-nav flex w-fit items-center gap-4 rounded-full px-5 py-4 text-[0.95rem] leading-none md:text-base",
    mobile ? "min-h-[54px]" : null,
    surface === "dark" ? "bg-[#080807] text-white" : "bg-[#f2f0eb] text-[#080807]",
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
          surface === "dark" ? "border-white/70" : "border-[#080807]/60",
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

function MenuToggleButton({
  expanded,
  onClick,
  surface,
  className,
}: {
  expanded: boolean;
  onClick: () => void;
  surface: "light" | "dark";
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-expanded={expanded}
      aria-controls="studio-finity-mobile-nav"
      onClick={onClick}
      className={cn(
        "sf-oh-pill sf-oh-nav-link flex items-center rounded-full px-3 py-[0.9rem]",
        surface === "dark" ? "bg-[#080807] text-white" : "bg-[#f2f0eb] text-[#080807]",
        className,
      )}
    >
      Menu
    </button>
  );
}
