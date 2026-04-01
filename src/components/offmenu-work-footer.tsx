"use client";

import { useContactDialog } from "@/components/contact-dialog-provider";
import { TransitionLink } from "@/components/transition-link";
import type { NavLink } from "@/types/offmenu";

interface OffMenuWorkFooterProps {
  navigationLinks: NavLink[];
}

export function OffMenuWorkFooter({ navigationLinks }: OffMenuWorkFooterProps) {
  const { openContact } = useContactDialog();

  return (
    <footer className="flex min-h-56 w-full items-end px-4 py-6 md:min-h-72 md:px-8">
      <div className="sf-caption-strong grid w-full gap-3 md:grid-cols-5 md:gap-8">
        {navigationLinks.map((link) => {
          if (link.disabled) {
            return <span key={link.label}>{link.label}</span>;
          }

          if (link.opensContactForm) {
            return (
              <button
                key={link.label}
                type="button"
                className="sf-caption-strong cursor-pointer text-left transition-opacity duration-280 ease-sf-out hover:opacity-80"
                onClick={() => openContact()}
              >
                {link.label}
              </button>
            );
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
