"use client";

import { useEffect } from "react";
import {
  Check,
  Clock3,
  ShieldCheck,
  X,
} from "lucide-react";

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
  const totalPrincipleCount = principles.principles.length;

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xl font-black tracking-tight text-text-primary">
        {principles.title}
      </h2>

      <DashboardCard className="flex items-center gap-3 border-primary-green/20 bg-card/95 shadow-[0_10px_24px_rgba(94,155,115,0.10)] ring-1 ring-primary-green/10">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary-green text-lg font-black text-white shadow-inner">
          {principles.hostInitial}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-base font-black text-text-primary">
            {principles.hostName}
          </p>
          <p className="mt-1 inline-flex items-center gap-1 text-[11px] font-extrabold text-primary-green">
            <ShieldCheck size={13} />
            운영 원칙 {totalPrincipleCount}개
          </p>
        </div>
      </DashboardCard>

      <DashboardCard className="p-0 overflow-hidden">
        {principles.principles.map((principle, index) => (
          <div
            key={principle}
            className={`flex w-full items-start gap-3 px-4 py-3.5 text-left hover:bg-success-green/30 ${
              index ? "border-t border-text-secondary/10" : ""
            }`}
          >
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-success-green text-primary-green">
              <Check size={15} strokeWidth={3} />
            </span>
            <span className="text-sm font-bold leading-snug text-text-primary">
              {principle}
            </span>
          </div>
        ))}
      </DashboardCard>

      <DashboardCard className="flex flex-col gap-3 bg-card/95">
        <div className="flex items-center gap-2 text-text-primary">
          <Clock3 size={15} className="text-primary-blue" />
          <h3 className="text-sm font-black tracking-tight">
            {principles.graceTitle}
          </h3>
        </div>
        <p className="text-xs font-medium leading-relaxed text-text-secondary">
          {principles.graceDescription}
        </p>
        <div className="rounded-2xl border border-white/70 bg-background/70 px-3 py-3">
          <div className="flex flex-col gap-2.5">
            {principles.graceItems.map((item) => (
              <div key={item.title} className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-blue" />
                <p className="text-[11px] font-medium leading-relaxed text-text-secondary">
                  <b className="font-black text-text-primary">{item.title}</b> · {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </DashboardCard>
      </section>
  );
}
