"use client";

import Link, { type LinkProps } from "next/link";
import type { FocusEvent, MouseEvent, ReactNode } from "react";
import {
  shouldHandleTransitionClick,
  usePageTransition,
} from "@/components/page-transition-provider";

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
  const hrefString = typeof href === "string" ? href : href.toString();

  return (
    <Link
      {...props}
      href={href}
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
