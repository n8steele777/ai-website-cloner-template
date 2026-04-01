"use client";

import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";
import { TransitionLink } from "@/components/transition-link";
import { cn } from "@/lib/utils";
import type { NavLink } from "@/types/offmenu";

const MINI_ACTION_OFFSET = 46;
const MINI_MENU_OFFSET = 50;
const MINI_MOBILE_OFFSET = 48;

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
  const overlayCloseProgress = menuOpen ? 1 : 0;

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
      {overlay ? (
        <>
          <header className="absolute inset-x-0 top-0 z-[220] px-[14px] pt-[14px] md:px-[22px] md:pt-6">
            <div className="relative flex items-start justify-between gap-4">
              <TransitionLink
                href="/"
                aria-label="Studio Finity home"
                className="sf-nav-wordmark sf-oh-wordmark relative z-10 whitespace-nowrap text-white"
              >
                Studio Finity
              </TransitionLink>

              <nav
                aria-label="Primary"
                className="absolute left-1/2 top-[18px] hidden -translate-x-1/2 items-center gap-[11px] text-white md:flex"
              >
                {visibleLinks.map((link, index) => (
                  <div key={link.href} className="flex items-center gap-[11px]">
                    <DesktopNavLink
                      href={link.href}
                      active={link.href === activeHref}
                      external={link.external}
                      tone="light"
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
            className="pointer-events-none fixed right-[14px] top-[14px] z-[224] flex items-start justify-end md:right-[22px] md:top-6"
            style={buildMiniControlStyle(menuOpen)}
          >
            <div className="hidden items-center gap-2 md:flex">
              <div style={buildMiniRevealStyle(MINI_ACTION_OFFSET)}>
                {actions.map((action) => (
                  <HeaderActionLink key={action.label} action={action} surface="dark" />
                ))}
              </div>
              <div style={buildMiniRevealStyle(MINI_MENU_OFFSET)}>
                <MenuToggleButton
                  expanded={menuOpen}
                  onClick={() => setMenuOpen((current) => !current)}
                  surface="light"
                />
              </div>
            </div>

            <div className="md:hidden" style={buildMiniRevealStyle(MINI_MOBILE_OFFSET)}>
              <MenuToggleButton
                expanded={menuOpen}
                onClick={() => setMenuOpen((current) => !current)}
                surface="light"
              />
            </div>
          </div>
        </>
      ) : (
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
                  <DesktopNavLink
                    href={link.href}
                    active={link.href === activeHref}
                    external={link.external}
                    tone="dark"
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
      )}

      <div
        id="studio-finity-mobile-nav"
        aria-hidden={!menuOpen}
        className={cn(
          "fixed inset-0 z-[240] bg-[#080807] px-[14px] pb-[20px] pt-[14px] text-white transition-[opacity,visibility,clip-path] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] md:px-[22px] md:pt-6",
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
            opacity: overlayCloseProgress,
            transform: `translateY(${(1 - overlayCloseProgress) * 20}px)`,
            transition:
              "transform 420ms cubic-bezier(0.22,1,0.36,1), opacity 260ms ease-out",
          }}
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
              className="sf-oh-nav-link pt-1 text-white/88 transition-opacity duration-200 hover:opacity-100"
            >
              Close
            </button>
          </div>

          <nav aria-label="Overlay primary" className="mt-[4.5rem] flex flex-col gap-5 md:mt-[9rem] md:max-w-[34rem] md:gap-6">
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

function DesktopNavLink({
  href,
  active,
  children,
  external,
  tone,
}: {
  href: string;
  active?: boolean;
  children: string;
  external?: boolean;
  tone: "light" | "dark";
}) {
  const className = cn(
    "sf-oh-nav-link uppercase transition-opacity duration-200",
    tone === "light" ? "text-white" : "text-[#080807]",
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

function buildMiniRevealStyle(offset: number) {
  return {
    opacity: "var(--sf-oh-mini-progress, 0)",
    transform: `translateY(calc((1 - var(--sf-oh-mini-progress, 0)) * ${offset}px))`,
    transition:
      "transform 180ms cubic-bezier(0.22,1,0.36,1), opacity 180ms cubic-bezier(0.22,1,0.36,1)",
  } as const;
}

function buildMiniControlStyle(menuOpen: boolean): CSSProperties {
  return {
    pointerEvents: menuOpen ? "auto" : ("var(--sf-oh-mini-pointer, none)" as CSSProperties["pointerEvents"]),
  };
}
