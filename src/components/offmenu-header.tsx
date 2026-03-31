"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { MenuGridIcon, OffMenuLogo } from "@/components/icons";
import { cn } from "@/lib/utils";
import type { NavLink, ThemeMode } from "@/types/offmenu";

interface OffMenuHeaderProps {
  activeHref: string;
  eyebrow?: string;
  navigationLinks: NavLink[];
  resourceLinks: NavLink[];
  themeMode: ThemeMode;
  onToggleTheme: () => void;
  variant?: "default" | "work";
}

export function OffMenuHeader({
  activeHref,
  navigationLinks,
  resourceLinks,
  themeMode,
  onToggleTheme,
}: OffMenuHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const moonRef = useRef<SVGCircleElement>(null);
  const menuRef = useRef<HTMLElement>(null);
  const previousScrollYRef = useRef(0);

  const navLinks = useMemo(
    () => navigationLinks.filter((link) => link.label.toLowerCase() !== "about"),
    [navigationLinks],
  );

  useEffect(() => {
    const target = moonRef.current;

    if (!target) {
      return;
    }

    gsap.to(target, {
      attr: {
        cx: themeMode === "dark" ? 15 : 28,
        cy: themeMode === "dark" ? 5 : -4,
      },
      duration: 0.5,
      ease: "power4.out",
    });
  }, [themeMode]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const onPointerDown = (event: MouseEvent) => {
      const menu = menuRef.current;

      if (!menu || menu.contains(event.target as Node)) {
        return;
      }

      setMenuOpen(false);
    };

    const onScroll = () => {
      if (Math.abs(window.scrollY - previousScrollYRef.current) > 1000) {
        setMenuOpen(false);
      }
    };

    previousScrollYRef.current = window.scrollY;

    document.addEventListener("click", onPointerDown);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      document.removeEventListener("click", onPointerDown);
      window.removeEventListener("scroll", onScroll);
    };
  }, [menuOpen]);

  return (
    <header className="fixed left-0 right-0 top-0 z-50 p-4">
      <div className="relative flex items-center justify-between">
        <Link href="/" aria-label="Off Menu home" className="block">
          <OffMenuLogo className="h-10 w-auto" />
        </Link>

        <div className="nav-container absolute right-0 top-1/2 h-10 -translate-y-1/2">
          <nav ref={menuRef} className="nav relative group/nav">
            <div className="nav-wrapper relative z-[1] flex flex-col">
              <div className="nav-toggle-wrapper relative flex w-full items-center justify-end">
                <button
                  type="button"
                  aria-label="Toggle theme"
                  onClick={onToggleTheme}
                  className="group/theme-toggle z-50 flex h-10 w-10 cursor-pointer items-center justify-center text-foreground"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
                    <defs>
                      <mask id="offmenu-moon-mask-live">
                        <rect x="0" y="0" width="20" height="20" fill="white" />
                        <circle
                          ref={moonRef}
                          r="7"
                          fill="black"
                          cx="28"
                          cy="-4"
                          className={cn(
                            "transition-transform duration-300 ease-in-out",
                            themeMode === "dark"
                              ? "group-hover/theme-toggle:translate-x-[13px] group-hover/theme-toggle:-translate-y-[9px]"
                              : "group-hover/theme-toggle:-translate-x-[13px] group-hover/theme-toggle:translate-y-[9px]",
                          )}
                        />
                      </mask>
                    </defs>
                    <circle
                      cx="10"
                      cy="10"
                      r="7"
                      fill="currentColor"
                      mask="url(#offmenu-moon-mask-live)"
                    />
                  </svg>
                </button>

                <button
                  type="button"
                  aria-label="Toggle navigation"
                  aria-expanded={menuOpen}
                  onClick={() => setMenuOpen((current) => !current)}
                  className="nav-toggle group/nav-toggle relative flex h-10 w-10 cursor-pointer items-center justify-center"
                >
                  <MenuGridIcon className="hm h-6 w-6 text-foreground" />
                </button>
              </div>

              <div
                className={cn(
                  "nav-menu-wrapper grid overflow-hidden",
                  menuOpen ? "grid-rows-[1fr] opacity-100 blur-0" : "grid-rows-[0fr] opacity-0 blur-xs",
                )}
                style={{
                  transition: menuOpen
                    ? "opacity 400ms ease-in-out, grid-template-rows 400ms ease-in-out, filter 200ms ease-in-out"
                    : "opacity 100ms ease-in-out, grid-template-rows 200ms ease-in-out, filter 0ms ease-in-out",
                  transitionDelay: menuOpen ? "300ms, 200ms, 200ms" : "0ms, 200ms, 0ms",
                }}
              >
                <div className="nav-menu-inner overflow-hidden text-foreground">
                  <div className="flex min-w-64 flex-col gap-2 overflow-hidden p-2">
                    <div className="group/links flex flex-col gap-0 text-2xl leading-none font-medium text-foreground [&_a]:pb-1 [&_a]:transition-colors [&_a]:duration-100 [&:has(a:not(.current):hover)_a:not(.current):not(:hover)]:text-foreground/50">
                      {navLinks.map((link) => (
                        <HeaderMenuLink
                          key={link.label}
                          active={link.href === activeHref}
                          link={link}
                          onSelect={() => setMenuOpen(false)}
                        />
                      ))}
                    </div>

                    <div className="divider h-4 w-full shrink-0">
                      <div className="divider-line h-1/2 w-full border-b border-foreground/10" />
                    </div>

                    <div className="flex flex-col gap-1 text-sm leading-none font-medium tracking-[0.01em] text-foreground">
                      <span className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-foreground/50">
                        Resources
                      </span>
                      <div className="group/resources flex flex-col gap-0 [&_a]:pb-1.5 [&_a]:transition-colors [&_a]:duration-200 hover:[&_a]:text-foreground/50 hover:[&_a:hover]:text-foreground">
                        {resourceLinks.map((link) => (
                          <HeaderMenuLink
                            key={link.label}
                            compact
                            link={link}
                            onSelect={() => setMenuOpen(false)}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              className={cn(
                "nav-menu-bg absolute right-0 top-0 z-0 origin-top-right pointer-events-none",
                menuOpen ? "h-full w-full opacity-100" : "h-10 w-10 opacity-0",
              )}
              style={{
                transition: "opacity 200ms ease-in-out, width 300ms ease-in-out, height 200ms ease-in-out, filter 200ms ease-in-out",
                transitionDelay: menuOpen ? "0ms, 0ms, 200ms, 0ms" : "200ms, 200ms, 0ms, 0ms",
              }}
            >
              <div className="nav-menu-bg-inner absolute -inset-1.5 rounded-xl bg-background transition-colors duration-200" />
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}

interface HeaderMenuLinkProps {
  active?: boolean;
  compact?: boolean;
  link: NavLink;
  onSelect: () => void;
}

function HeaderMenuLink({
  active = false,
  compact = false,
  link,
  onSelect,
}: HeaderMenuLinkProps) {
  const className = cn(
    compact ? "" : "",
    active ? "current opacity-50 pointer-events-none" : "",
    link.disabled ? "cursor-not-allowed text-foreground/40" : "",
  );

  if (link.disabled) {
    return <span className={className}>{link.label}</span>;
  }

  if (link.external || link.href.startsWith("mailto:")) {
    return (
      <a
        href={link.href}
        target={link.href.startsWith("http") ? "_blank" : undefined}
        rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
        className={className}
        onClick={onSelect}
      >
        {link.label}
      </a>
    );
  }

  return (
    <Link href={link.href} className={className} onClick={onSelect}>
      {link.label}
    </Link>
  );
}
