"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Check, X } from "lucide-react";

import type { HostPrinciplesMock } from "@/mocks/data/dashboard";

import { DashboardCard } from "./DashboardPrimitives";

export function PrinciplesModal({
  principles,
  onClose,
}: {
  principles: HostPrinciplesMock;
  onClose: () => void;
}) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/30 px-3 pb-3 backdrop-blur-[2px]"
      role="presentation"
      onClick={onClose}
    >
      <section
        aria-label="방장 운영 원칙"
        aria-modal="true"
        className="max-h-[86vh] w-full max-w-[430px] overflow-y-auto rounded-t-[28px] bg-background px-5 pb-14 pt-0 shadow-[0_-14px_38px_rgba(34,34,34,0.18)]"
        role="dialog"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 z-10 -mx-5 mb-3 flex items-center justify-center bg-background/80 px-5 pb-3 pt-4 backdrop-blur-xl before:pointer-events-none before:absolute before:inset-x-0 before:bottom-[-18px] before:h-[18px] before:bg-gradient-to-b before:from-background/80 before:to-background/0 before:content-['']">
          <span className="h-1.5 w-10 rounded-full bg-text-secondary/20" />
          <button
            type="button"
            aria-label="방장 운영 원칙 닫기"
            className="absolute right-5 top-0.5 rounded-full p-2 text-text-secondary hover:bg-text-secondary/10 hover:text-text-primary"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>
        <PrinciplesSection principles={principles} />
      </section>
    </div>
  );
}

function PrinciplesSection({ principles }: { principles: HostPrinciplesMock }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xl font-black tracking-tight text-text-primary">
        {principles.title}
      </h2>
      <p className="text-xs font-medium leading-relaxed text-text-secondary">
        모든 크루의 방장이 공통으로 지키는 운영 원칙이에요.
      </p>

      <DashboardCard className="p-0 overflow-hidden">
        {principles.principles.map((principle, index) => (
          <div
            key={principle.title}
            className={`flex w-full items-start gap-3 px-4 py-3.5 text-left hover:bg-success-green/30 ${
              index ? "border-t border-text-secondary/10" : ""
            }`}
          >
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-success-green text-primary-green">
              <Check size={15} strokeWidth={3} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-black leading-snug text-text-primary">
                {principle.title}
              </p>
              <p className="mt-1 text-[11px] font-medium leading-relaxed text-text-secondary">
                {principle.description}
              </p>
            </div>
          </div>
        ))}
      </DashboardCard>

      <Link
        href="/guide"
        className="flex items-center justify-between rounded-2xl border border-text-secondary/10 bg-card/95 px-4 py-3.5 text-sm font-bold text-text-primary hover:bg-success-green/30"
      >
        자세히 알아보기 · 서비스 가이드
        <ArrowRight size={16} className="text-text-secondary" />
      </Link>
    </section>
  );
}
