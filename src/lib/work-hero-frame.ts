/**
 * Pixel geometry for {@link OffMenuWorkHero} — keep in sync with
 * `top-20 md:top-21`, `inset-x-4`, `bottom-4`, `rounded-3xl` (work index tiles).
 */

export const WORK_HERO_MD_MEDIA = "(min-width: 768px)";

/** If computed style cannot be read (SSR / parse failure). */
const WORK_INDEX_CARD_BORDER_RADIUS_FALLBACK_PX = 26;

let radiusCache: { px: number; rootFontSize: number } | null = null;

function parseCssLengthToPx(value: string, rootFontSizePx: number): number {
  const token = value.trim().split(/\s+/)[0] ?? "";
  if (!token) {
    return Number.NaN;
  }
  const pxMatch = token.match(/^([\d.]+)px$/i);
  if (pxMatch) {
    return parseFloat(pxMatch[1]);
  }
  const remMatch = token.match(/^([\d.]+)rem$/i);
  if (remMatch) {
    return parseFloat(remMatch[1]) * rootFontSizePx;
  }
  return Number.NaN;
}

/**
 * Resolved `border-radius` for `var(--radius-3xl)` (same as Tailwind `rounded-3xl` on cards/hero).
 * Reading from the browser avoids hard-coding `calc(0.75rem * 2.2)` ≈ 26.4px vs 26px drift.
 */
export function getWorkIndexCardBorderRadiusPx(): number {
  if (typeof document === "undefined") {
    return WORK_INDEX_CARD_BORDER_RADIUS_FALLBACK_PX;
  }

  const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  if (radiusCache?.rootFontSize === rootFontSize) {
    return radiusCache.px;
  }

  const probe = document.createElement("div");
  probe.setAttribute("aria-hidden", "true");
  probe.style.cssText =
    "position:fixed;left:0;top:0;width:20px;height:20px;opacity:0;pointer-events:none;border-radius:var(--radius-3xl);";
  document.body.appendChild(probe);
  const raw = getComputedStyle(probe).borderTopLeftRadius;
  probe.remove();

  const px = parseCssLengthToPx(raw, rootFontSize);
  const resolved =
    Number.isFinite(px) && px > 0 ? Math.round(px * 1000) / 1000 : WORK_INDEX_CARD_BORDER_RADIUS_FALLBACK_PX;

  radiusCache = { rootFontSize, px: resolved };
  return resolved;
}

export interface WorkHeroTargetRect {
  borderRadius: number;
  height: number;
  left: number;
  top: number;
  width: number;
}

export function getWorkHeroTargetRect(): WorkHeroTargetRect {
  const isMd = window.matchMedia(WORK_HERO_MD_MEDIA).matches;
  const insetX = 16;
  const bottomInset = 16;
  // Match header + breathing room under nav; spacing scale: 20→5rem, 21→5.25rem @ 16px root.
  const topInset = isMd ? 84 : 80;
  const width = Math.round(document.documentElement.clientWidth - insetX * 2);
  const height = Math.round(window.innerHeight - topInset - bottomInset);

  return {
    borderRadius: getWorkIndexCardBorderRadiusPx(),
    height,
    left: insetX,
    top: topInset,
    width,
  };
}
