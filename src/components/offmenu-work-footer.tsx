"use client";

import Link from "next/link";
import type { NavLink } from "@/types/offmenu";

interface OffMenuWorkFooterProps {
  navigationLinks: NavLink[];
}

export function OffMenuWorkFooter({ navigationLinks }: OffMenuWorkFooterProps) {
  return (
    <footer className="w-full px-4 py-4 md:px-8">
      <div className="mb-12 grid grid-cols-8 gap-8 md:mb-0 md:gap-8">
        <div className="order-2 col-span-2 flex flex-row gap-0 lg:gap-4 md:order-1">
          <div className="hidden flex-col text-sm font-medium text-foreground md:flex md:gap-0">
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
                <Link key={link.label} href={link.href}>
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}
