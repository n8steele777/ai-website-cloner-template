"use client";

import { TransitionLink } from "@/components/transition-link";
import type { NavLink } from "@/types/offmenu";

interface OffMenuWorkFooterProps {
  navigationLinks: NavLink[];
}

export function OffMenuWorkFooter({ navigationLinks }: OffMenuWorkFooterProps) {
  return (
    <footer className="flex min-h-[28rem] w-full items-end px-4 py-4 md:px-8">
      <div className="grid w-full gap-3 text-sm font-medium md:grid-cols-5 md:gap-8">
        {navigationLinks.map((link) => {
          if (link.disabled) {
            return <span key={link.label}>{link.label}</span>;
          }

          if (link.external || link.href.startsWith("mailto:")) {
            return (
              <a
                key={link.label}
                href={link.href}
                target={link.href.startsWith("http") ? "_blank" : undefined}
                rel={link.href.startsWith("http") ? "noreferrer" : undefined}
              >
                {link.label}
              </a>
            );
          }

          return (
            <TransitionLink key={link.label} href={link.href}>
              {link.label}
            </TransitionLink>
          );
        })}
      </div>
    </footer>
  );
}
