"use client";

/* eslint-disable @next/next/no-img-element */

import { useMemo } from "react";
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
  const visibleLinks = useMemo(() => links.filter((link) => !link.disabled), [links]);
  const navButtons = useMemo<HeaderAction[]>(
    () =>
      visibleLinks.map((link) => ({
        label: link.label,
        href: link.href,
        external: link.external,
        variant: "secondary",
      })),
    [visibleLinks],
  );
  const allActions = [...navButtons, ...actions];

  return (
    <>
      <header
        className={cn(
          "hidden h-[105px] w-full items-center justify-between gap-[72px] px-3 py-6 text-[var(--sf-text)] md:flex md:px-8",
          overlay ? "fixed inset-x-0 top-0 z-[200]" : "sticky top-0 z-[200]",
        )}
      >
        <div className="relative z-20 flex min-w-0 items-center gap-1">
          <TransitionLink
            href="/"
            aria-label="Studio Finity home"
            className="sf-interactive hidden min-h-[48px] min-w-[48px] shrink-0 items-center justify-center rounded-full p-2 lg:flex"
          >
            <img src="/logos/SF-Logo-Dark.png" alt="STUDIO FINITY logo" className="h-auto w-[28px]" />
          </TransitionLink>
        </div>

        <div className="flex items-center gap-1">
          {allActions.map((action) => (
            <TopNavActionLink key={action.label} action={action} active={action.href === activeHref} />
          ))}
        </div>
      </header>

      <div
        className={cn(
          "md:hidden",
          overlay ? "fixed inset-x-0 top-0 z-[200] px-4 pt-3" : "px-4 pt-3",
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <TransitionLink
            href="/"
            aria-label="Studio Finity home"
            className="sf-interactive flex min-h-[48px] min-w-[48px] shrink-0 items-center justify-center rounded-full p-2"
          >
            <img src="/logos/SF-Logo-Dark.png" alt="STUDIO FINITY logo" className="h-auto w-6" />
          </TransitionLink>

          <div className="flex items-center gap-2 overflow-x-auto">
            {allActions.map((action) => (
              <TopNavActionLink
                key={action.label}
                action={action}
                active={action.href === activeHref}
                compact
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function TopNavActionLink({
  action,
  active = false,
  compact = false,
}: {
  action: HeaderAction;
  active?: boolean;
  compact?: boolean;
}) {
  const className = cn(
    "sf-interactive sf-pill-button relative select-none gap-x-1",
    action.variant === "primary"
      ? "sf-pill-button-primary"
      : "sf-pill-button-secondary",
    active && action.variant !== "primary"
      ? "border-[var(--sf-border-strong)] bg-black/[0.05] text-[var(--sf-text)]"
      : null,
    compact
      ? "px-4 py-3 text-[13px]"
      : "px-6 py-4 text-[15px]",
  );

  const label = action.label;
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
    <TransitionLink href={action.href} className={className} aria-current={active ? "page" : undefined}>
      {label}
    </TransitionLink>
  );
}
