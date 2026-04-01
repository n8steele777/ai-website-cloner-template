"use client";

import Image from "next/image";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { StudioRule } from "@/types/offmenu";

interface StudioGroundRulesProps {
  rules: StudioRule[];
}

const MOBILE_MAX_WIDTH_QUERY = "(max-width: 1023px)";

export function StudioGroundRules({ rules }: StudioGroundRulesProps) {
  const [activeRuleId, setActiveRuleId] = useState<string | null>(null);
  const [isMobileLayout, setIsMobileLayout] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const currentPositionRef = useRef({ x: 0, y: 0 });
  const targetPositionRef = useRef({ x: 0, y: 0 });
  const pointerPositionRef = useRef({ x: 0, y: 0, hasValue: false });
  const activeRuleIdRef = useRef<string | null>(null);

  const activeRule = rules.find((rule) => rule.id === activeRuleId) ?? null;

  useLayoutEffect(() => {
    activeRuleIdRef.current = activeRuleId;
  }, [activeRuleId]);

  const updateCardTarget = (clientX: number, clientY: number) => {
    const container = containerRef.current;
    const card = cardRef.current;

    if (!container) {
      return;
    }

    const bounds = container.getBoundingClientRect();
    const cardHeight = card?.offsetHeight ?? 0;
    const offsetX = 20;
    const offsetY = 18;

    targetPositionRef.current = {
      x: clientX - bounds.left + offsetX,
      y: clientY - bounds.top - cardHeight - offsetY,
    };
  };

  /** Mobile: absolutely positioned card below (or above) active row — no document reflow. */
  const updateCardBelowOrAboveRow = (ruleId: string) => {
    const container = containerRef.current;
    const card = cardRef.current;

    if (!container || !card) {
      return;
    }

    const row = container.querySelector<HTMLElement>(
      `[data-ground-rule][data-rule-id="${ruleId}"]`,
    );
    if (!row) {
      return;
    }

    const bounds = container.getBoundingClientRect();
    const rowRect = row.getBoundingClientRect();
    const cardWidth = card.offsetWidth;
    const cardHeight = card.offsetHeight;
    const gap = 10;

    let x = rowRect.left - bounds.left + (rowRect.width - cardWidth) / 2;
    const yBelow = rowRect.bottom - bounds.top + gap;
    const yAbove = rowRect.top - bounds.top - cardHeight - gap;

    const pad = 6;
    const fitsBelow = yBelow + cardHeight <= bounds.height - pad;
    const fitsAbove = yAbove >= pad;

    let y = yBelow;
    if (!fitsBelow && fitsAbove) {
      y = yAbove;
    } else if (!fitsBelow && !fitsAbove) {
      y = Math.max(pad, Math.min(yBelow, bounds.height - cardHeight - pad));
    }

    x = Math.max(pad, Math.min(x, bounds.width - cardWidth - pad));
    y = Math.max(pad, Math.min(y, bounds.height - cardHeight - pad));

    targetPositionRef.current = { x, y };
  };

  useEffect(() => {
    let frameId = 0;

    const animate = () => {
      const current = currentPositionRef.current;
      const target = targetPositionRef.current;

      current.x += (target.x - current.x) * 0.12;
      current.y += (target.y - current.y) * 0.12;

      if (cardRef.current) {
        cardRef.current.style.transform = `translate3d(${current.x}px, ${current.y}px, 0)`;
      }

      frameId = window.requestAnimationFrame(animate);
    };

    frameId = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, []);

  useEffect(() => {
    if (!activeRule?.reference || !pointerPositionRef.current.hasValue) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      updateCardTarget(pointerPositionRef.current.x, pointerPositionRef.current.y);
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [activeRule?.id, activeRule?.reference]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const media = window.matchMedia(MOBILE_MAX_WIDTH_QUERY);
    const apply = () => {
      setIsMobileLayout(media.matches);
    };
    apply();
    media.addEventListener("change", apply);
    return () => {
      media.removeEventListener("change", apply);
    };
  }, []);

  useEffect(() => {
    if (!isMobileLayout || rules.length === 0) {
      return;
    }

    const syncScrollSelectionAndCard = () => {
      const container = containerRef.current;
      if (!container) {
        return;
      }

      const rows = container.querySelectorAll<HTMLElement>("[data-ground-rule]");
      if (rows.length === 0) {
        return;
      }

      const viewportMid = window.innerHeight / 2;
      let bestId: string | null = null;
      let bestDistance = Infinity;

      rows.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const rowMid = rect.top + rect.height / 2;
        const distance = Math.abs(rowMid - viewportMid);
        if (distance < bestDistance) {
          bestDistance = distance;
          bestId = el.dataset.ruleId ?? null;
        }
      });

      if (bestId !== null) {
        setActiveRuleId(bestId);
        updateCardBelowOrAboveRow(bestId);
      }
    };

    syncScrollSelectionAndCard();

    const opts: AddEventListenerOptions = { passive: true };
    window.addEventListener("scroll", syncScrollSelectionAndCard, opts);
    window.addEventListener("resize", syncScrollSelectionAndCard);

    const card = cardRef.current;
    let resizeObserver: ResizeObserver | null = null;
    if (card && typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => {
        const id = activeRuleIdRef.current;
        if (id) {
          updateCardBelowOrAboveRow(id);
        }
      });
      resizeObserver.observe(card);
    }

    return () => {
      window.removeEventListener("scroll", syncScrollSelectionAndCard);
      window.removeEventListener("resize", syncScrollSelectionAndCard);
      resizeObserver?.disconnect();
    };
  }, [isMobileLayout, rules.length]);

  useEffect(() => {
    if (!isMobileLayout || !activeRuleId || !activeRule?.reference) {
      return;
    }

    const id = requestAnimationFrame(() => {
      updateCardBelowOrAboveRow(activeRuleId);
    });
    return () => {
      window.cancelAnimationFrame(id);
    };
  }, [isMobileLayout, activeRuleId, activeRule?.reference]);

  if (rules.length === 0) {
    return null;
  }

  return (
    <div className="pt-2">
      <p
        data-about-reveal
        className="sf-eyebrow text-(--sf-text-subtle)"
      >
        OUR GROUND RULES
      </p>

      <div
        ref={containerRef}
        data-about-stagger
        className="relative mt-5 max-lg:pb-32"
        onMouseLeave={() => {
          if (!isMobileLayout) {
            setActiveRuleId(null);
          }
        }}
        onMouseMove={(event) => {
          if (isMobileLayout || !activeRule?.reference) {
            return;
          }

          pointerPositionRef.current = {
            x: event.clientX,
            y: event.clientY,
            hasValue: true,
          };
          updateCardTarget(event.clientX, event.clientY);
        }}
      >
        <div className="space-y-1.5 max-lg:space-y-1 md:space-y-1.5">
          {rules.map((rule) => {
            const isActive = rule.id === activeRuleId;

            return (
              <button
                key={rule.id}
                type="button"
                data-about-item
                data-ground-rule
                data-rule-id={rule.id}
                className={cn(
                  "group flex w-full min-w-0 items-center gap-2 text-left transition-[color,opacity] duration-280 ease-sf-out",
                  "min-h-11 py-2.5 max-lg:touch-manipulation lg:min-h-0 lg:py-0.5",
                  "md:items-start md:gap-[12px]",
                  isActive
                    ? "lg:[&_.sf-section-list]:text-foreground"
                    : "max-lg:active:opacity-90 lg:[&_.sf-section-list]:text-(--sf-text-muted) lg:hover:[&_.sf-section-list]:text-foreground",
                )}
                onMouseEnter={(event) => {
                  if (isMobileLayout) {
                    return;
                  }
                  pointerPositionRef.current = {
                    x: event.clientX,
                    y: event.clientY,
                    hasValue: true,
                  };
                  setActiveRuleId(rule.id);
                  updateCardTarget(event.clientX, event.clientY);
                }}
                onFocus={(event) => {
                  setActiveRuleId(rule.id);

                  if (isMobileLayout) {
                    requestAnimationFrame(() => {
                      updateCardBelowOrAboveRow(rule.id);
                    });
                    return;
                  }

                  const bounds = event.currentTarget.getBoundingClientRect();
                  pointerPositionRef.current = {
                    x: bounds.right,
                    y: bounds.top + bounds.height / 2,
                    hasValue: true,
                  };
                  updateCardTarget(bounds.right, bounds.top + bounds.height / 2);
                }}
                onClick={() => {
                  if (isMobileLayout) {
                    return;
                  }
                  setActiveRuleId(rule.id);
                }}
              >
                <span
                  className={cn(
                    "sf-section-list sf-ground-rules-row-text shrink-0 tabular-nums",
                    "min-w-6 max-lg:min-w-7 md:min-w-[50px]",
                  )}
                >
                  {rule.id}
                </span>
                <span className="sf-section-list sf-ground-rules-row-text shrink-0">
                  /
                </span>
                <span
                  className={cn(
                    "sf-section-list sf-ground-rules-row-text min-w-0 flex-1",
                    "max-lg:truncate max-lg:whitespace-nowrap",
                  )}
                >
                  {rule.statement}
                </span>
              </button>
            );
          })}
        </div>

        <div
          ref={cardRef}
          className={cn(
            "pointer-events-none absolute left-0 top-0 z-10 block w-max max-w-[min(100%,18rem)] transition-opacity duration-280 ease-sf-out lg:max-w-none",
            activeRule?.reference
              ? "opacity-100"
              : "opacity-0",
          )}
        >
          <RuleReferenceCard rule={activeRule} />
        </div>
      </div>
    </div>
  );
}

function RuleReferenceCard({
  rule,
  className,
}: {
  rule: StudioRule | null;
  className?: string;
}) {
  const reference = rule?.reference;

  if (!reference) {
    return null;
  }

  return (
    <div
      className={cn(
        "w-58 overflow-hidden rounded-[12px] border border-border bg-foreground/80 text-primary-foreground shadow-(--sf-shadow-rule-card) backdrop-blur-[10px] transition-transform duration-380 ease-sf-out lg:w-63",
        className,
      )}
      style={{
        transform: `rotate(${reference.rotation ?? -2}deg)`,
      }}
    >
      <div className="grid items-stretch grid-cols-[3.9rem_1fr] gap-2.5 p-2.5 lg:grid-cols-[4.2rem_1fr] lg:gap-3 lg:p-3">
        <div className="relative h-full min-h-22 overflow-hidden rounded-[7px] bg-white/10 lg:min-h-25">
          <Image
            src={reference.image}
            alt={reference.name}
            fill
            sizes="(min-width: 1024px) 68px, 62px"
            className="object-cover"
          />
        </div>
        <div className="min-w-0 self-center">
          <p className="sf-rule-card-title">
            {reference.name}
          </p>
          <p className="sf-rule-card-copy mt-1">
            &ldquo;{reference.quote}&rdquo;
          </p>
        </div>
      </div>
    </div>
  );
}
