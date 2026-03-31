"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useMemo, useState, type SVGProps } from "react";
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
}

const defaultActions: HeaderAction[] = [
  { label: "Contact", href: "mailto:christian@offmenu.design", external: true, variant: "ghost" },
  { label: "View work", href: "/work", variant: "primary" },
];

export function StudioFinityHeader({ links, activeHref, actions = defaultActions }: StudioFinityHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const visibleLinks = useMemo(() => links.filter((link) => !link.disabled), [links]);

  return (
    <>
      <header className="sticky top-0 z-[200] hidden h-[105px] w-full items-center justify-between gap-[72px] px-3 py-6 text-[var(--sf-text)] md:flex md:px-8">
        <div className="relative z-20 flex min-w-0 items-center gap-1">
          <Link
            href="/"
            aria-label="Studio Finity home"
            className="hidden h-[54px] w-[54px] shrink-0 items-center justify-center rounded-full border bg-[var(--sf-surface)] lg:flex"
          >
            <img src="/logos/SF-Logo-Dark.png" alt="STUDIO FINITY logo" className="h-auto w-[22px]" />
          </Link>

          <button
            type="button"
            aria-expanded={menuOpen}
            aria-label="Toggle navigation"
            className="relative z-20 flex h-[54px] min-w-[140px] items-center justify-center gap-2 rounded-full border bg-[var(--sf-surface)] px-4 text-[14px] font-medium tracking-[-0.02em] xl:hidden"
            onClick={() => setMenuOpen((current) => !current)}
          >
            <span className="max-w-[12ch] truncate">{menuOpen ? "Close" : "Menu"}</span>
            <ChevronDownIcon
              className={cn("h-4 w-4 transition-transform duration-300", menuOpen && "rotate-180")}
            />
          </button>

          <div className="hidden h-[54px] items-center gap-6 rounded-full border bg-[var(--sf-surface)] px-8 text-[14px] font-medium tracking-[-0.02em] xl:flex">
            {visibleLinks.map((link) => {
              const current = activeHref ? link.href === activeHref : false;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={cn(
                    "transition-colors hover:text-[var(--sf-text)]",
                    current ? "text-[var(--sf-text)]" : "text-[var(--sf-text-muted)]",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-1">
          {actions.map((action) => (
            <TopNavActionLink key={action.label} action={action} />
          ))}
        </div>
      </header>

      <div className="px-4 pt-3 md:hidden">
        <div className="flex items-center justify-between gap-2">
          <Link
            href="/"
            aria-label="Studio Finity home"
            className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-full border bg-[var(--sf-surface)]"
          >
            <img src="/logos/SF-Logo-Dark.png" alt="STUDIO FINITY logo" className="h-auto w-5" />
          </Link>
          <button
            type="button"
            aria-expanded={menuOpen}
            aria-label="Toggle navigation"
            className="flex h-[48px] flex-1 items-center justify-center gap-2 rounded-full border bg-[var(--sf-surface)] px-4 text-[13px] font-medium tracking-[-0.02em]"
            onClick={() => setMenuOpen((current) => !current)}
          >
            {menuOpen ? "Close" : "Menu"}
            <ChevronDownIcon
              className={cn("h-4 w-4 transition-transform duration-300", menuOpen && "rotate-180")}
            />
          </button>
          <TopNavActionLink action={actions[1] ?? defaultActions[1]!} compact />
        </div>
        {menuOpen ? (
          <div className="mt-2 rounded-[24px] border bg-[var(--sf-surface)] p-4">
            <div className="flex flex-col gap-3 text-[14px] tracking-[-0.02em]">
              {visibleLinks.map((link) => (
                <Link key={link.label} href={link.href} className="text-[var(--sf-text-muted)]">
                  {link.label}
                </Link>
              ))}
              <a href={(actions[0] ?? defaultActions[0]!).href} className="text-[var(--sf-text-muted)]">
                {(actions[0] ?? defaultActions[0]!).label}
              </a>
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}

function TopNavActionLink({ action, compact = false }: { action: HeaderAction; compact?: boolean }) {
  const className = cn(
    "relative inline-flex select-none items-center justify-center gap-x-1 rounded-full border border-transparent transition-all duration-200",
    action.variant === "primary"
      ? "bg-[var(--sf-inverse-bg)] text-[var(--sf-inverse-text)] hover:opacity-90"
      : "text-[var(--sf-text)] hover:bg-black/[0.04]",
    compact
      ? "h-[48px] min-w-[48px] px-4 py-3 text-[13px] font-medium tracking-[-0.02em]"
      : "h-12 px-6 py-4 text-[15px] font-medium tracking-[-0.02em]",
  );

  const label = compact ? "Work" : action.label;

  if (action.external || action.href.startsWith("mailto:")) {
    return (
      <a
        href={action.href}
        target={action.href.startsWith("http") ? "_blank" : undefined}
        rel={action.href.startsWith("http") ? "noreferrer" : undefined}
        className={className}
      >
        {label}
      </a>
    );
  }

  return (
    <Link href={action.href} className={className}>
      {label}
    </Link>
  );
}

function ChevronDownIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M4.25 9.25 12 17l7.75-7.75"
      />
    </svg>
  );
}
