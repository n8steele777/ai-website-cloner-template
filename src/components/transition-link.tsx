"use client";

import Link, { type LinkProps } from "next/link";
import type { FocusEvent, MouseEvent, ReactNode } from "react";
import {
  shouldHandleTransitionClick,
  usePageTransition,
} from "@/components/page-transition-provider";

function linkHrefToString(href: LinkProps["href"]): string {
  if (typeof href === "string") {
    return href;
  }
  if (href && typeof href === "object") {
    const o = href as {
      pathname?: string;
      search?: string;
      hash?: string;
    };
    const pathname = typeof o.pathname === "string" ? o.pathname : "";
    if (pathname.length > 0) {
      const search = typeof o.search === "string" ? o.search : "";
      const hash = typeof o.hash === "string" ? o.hash : "";
      return `${pathname}${search}${hash}`;
    }
  }
  return "/";
}

interface TransitionLinkProps extends LinkProps {
  children: ReactNode;
  className?: string;
  "aria-current"?: "page";
  "aria-label"?: string;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
  onFocus?: (event: FocusEvent<HTMLAnchorElement>) => void;
  onMouseEnter?: (event: MouseEvent<HTMLAnchorElement>) => void;
}

export function TransitionLink({
  children,
  className,
  href,
  onClick,
  onFocus,
  onMouseEnter,
  ...props
}: TransitionLinkProps) {
  const { canTransitionHref, navigateWithTransition, prefetchHref } = usePageTransition();
  /** Next.js Link calls path logic on `href`; null/undefined throws (e.g. `.startsWith`). */
  const hrefForLink = href == null ? "/" : href;
  const hrefString = linkHrefToString(hrefForLink);

  return (
    <Link
      {...props}
      href={hrefForLink}
      className={className}
      onClick={(event) => {
        onClick?.(event);

        if (shouldHandleTransitionClick(hrefString, event, canTransitionHref)) {
          event.preventDefault();
          navigateWithTransition(hrefString);
        }
      }}
      onFocus={(event) => {
        onFocus?.(event);
        prefetchHref(hrefString);
      }}
      onMouseEnter={(event) => {
        onMouseEnter?.(event);
        prefetchHref(hrefString);
      }}
    >
      {children}
    </Link>
  );
}
