"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { StudioRule } from "@/types/offmenu";

interface StudioGroundRulesProps {
  rules: StudioRule[];
}

export function StudioGroundRules({ rules }: StudioGroundRulesProps) {
  const [activeRuleId, setActiveRuleId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const currentPositionRef = useRef({ x: 0, y: 0 });
  const targetPositionRef = useRef({ x: 0, y: 0 });
  const pointerPositionRef = useRef({ x: 0, y: 0, hasValue: false });

  const activeRule = rules.find((rule) => rule.id === activeRuleId) ?? null;

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

  if (rules.length === 0) {
    return null;
  }

  return (
    <div className="pt-2">
      <p className="text-[14px] font-normal leading-[19.6px] tracking-[0em] text-[#a6a6a7]">
        Our ground rules
      </p>

      <div
        ref={containerRef}
        className="relative mt-5"
        onMouseLeave={() => {
          setActiveRuleId(null);
        }}
        onMouseMove={(event) => {
          if (!activeRule?.reference) {
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
        <div className="space-y-[6px]">
          {rules.map((rule) => {
            const isActive = rule.id === activeRuleId;

            return (
              <button
                key={rule.id}
                type="button"
                className={cn(
                  "group flex w-full items-start gap-[10px] py-0.5 text-left transition-opacity duration-200 md:gap-[12px]",
                  isActive ? "opacity-100" : "opacity-[0.1] hover:opacity-[0.18]",
                )}
                onMouseEnter={(event) => {
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

                  const bounds = event.currentTarget.getBoundingClientRect();
                  pointerPositionRef.current = {
                    x: bounds.right,
                    y: bounds.top + bounds.height / 2,
                    hasValue: true,
                  };
                  updateCardTarget(bounds.right, bounds.top + bounds.height / 2);
                }}
                onClick={() => {
                  setActiveRuleId(rule.id);
                }}
              >
                <span className="min-w-[52px] text-[24px] font-normal leading-[1.1] tracking-[-0.04em] text-black md:min-w-[58px] md:text-[32px] md:leading-[35.2px]">
                  {rule.id}
                </span>
                <span className="text-[24px] font-normal leading-[1.1] tracking-[-0.04em] text-black md:text-[32px] md:leading-[35.2px]">
                  /
                </span>
                <span className="flex-1 text-[24px] font-normal leading-[1.1] tracking-[-0.04em] text-black md:text-[32px] md:leading-[35.2px]">
                  {rule.statement}
                </span>
              </button>
            );
          })}
        </div>

        <div
          ref={cardRef}
          className={cn(
            "pointer-events-none absolute left-0 top-0 z-10 hidden transition-opacity duration-200 ease-out lg:block",
            activeRule?.reference
              ? "opacity-100"
              : "opacity-0",
          )}
        >
          <RuleReferenceCard rule={activeRule} />
        </div>

        {activeRule?.reference ? (
          <div className="mt-6 lg:hidden">
            <RuleReferenceCard rule={activeRule} />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function RuleReferenceCard({ rule }: { rule: StudioRule | null }) {
  const reference = rule?.reference;

  if (!reference) {
    return null;
  }

  return (
    <div
      className="w-[14.5rem] overflow-hidden rounded-[12px] border border-black/8 bg-[rgba(128,128,128,0.92)] text-white shadow-[0_18px_48px_rgba(0,0,0,0.2)] backdrop-blur-[10px] transition-transform duration-300 ease-out lg:w-[15.75rem]"
      style={{
        transform: `rotate(${reference.rotation ?? -2}deg)`,
      }}
    >
      <div className="grid items-stretch grid-cols-[3.9rem_1fr] gap-2.5 p-2.5 lg:grid-cols-[4.2rem_1fr] lg:gap-3 lg:p-3">
        <div className="relative h-full min-h-[5.5rem] overflow-hidden rounded-[7px] bg-white/10 lg:min-h-[6.25rem]">
          <Image
            src={reference.image}
            alt={reference.name}
            fill
            sizes="(min-width: 1024px) 68px, 62px"
            className="object-cover"
          />
        </div>
        <div className="min-w-0 self-center">
          <p className="text-[0.76rem] font-medium leading-none tracking-[0em] text-white lg:text-[0.84rem]">
            {reference.name}
          </p>
          <p className="mt-1 text-[0.66rem] leading-[1.3] tracking-[0em] text-white/88 lg:text-[0.72rem]">
            &ldquo;{reference.quote}&rdquo;
          </p>
        </div>
      </div>
    </div>
  );
}
