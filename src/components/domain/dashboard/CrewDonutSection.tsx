import Image from "next/image";
import { CalendarDays, ChevronRight, ShieldCheck } from "lucide-react";

import { Button } from "@/components/common/Button";
import { CATEGORY_BG, CATEGORY_EMOJI } from "@/constants/crew";
import { DELTA_TOOLTIP_TEXT, type ProjectionCopy } from "@/mocks/data/dashboard";

import {
  DashboardCard,
  InfoTooltip,
  ProgressBar,
  ProjectionTooltip,
  SegmentRing,
} from "./DashboardPrimitives";
import type { CrewDonutRowView, CrewDonutView } from "./dashboardViewModel";

export function CrewDonutSection({
  crewDonuts,
  projectionCopy,
  onOpenDaily,
  onOpenPrinciples,
}: {
  crewDonuts: CrewDonutView;
  projectionCopy: ProjectionCopy;
  onOpenDaily: (crewId: number) => void;
  onOpenPrinciples: () => void;
}) {
  const isDeltaDown = crewDonuts.deltaTrend === "down";

  return (
    <section className="flex flex-col gap-3">
      <DashboardCard className="mb-4 flex flex-col gap-5 border-primary-blue/25 bg-card/95 px-5 py-5 shadow-[0_14px_30px_rgba(122,168,219,0.16)] ring-1 ring-primary-blue/10">
        <div className="flex items-center justify-center gap-2 text-text-primary">
          <CalendarDays size={19} className="text-primary-green" />
          <span className="text-lg font-black tracking-tight">
            {crewDonuts.dateLabel}
          </span>
        </div>
        <div className="flex items-center gap-5">
          <SegmentRing segments={crewDonuts.segments} size={144} stroke={16}>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-text-secondary">
              {crewDonuts.totalLabel}
              <ProjectionTooltip copy={projectionCopy} />
            </span>
            <strong className="mt-1 text-lg font-black tracking-tight text-text-primary">
              {crewDonuts.totalAmount}
            </strong>
          </SegmentRing>
          <div className="min-w-0 flex-1">
            <p className="inline-flex items-center gap-1 text-[11px] text-text-secondary">
              오늘 변동
              <InfoTooltip ariaLabel="오늘 변동 안내">{DELTA_TOOLTIP_TEXT}</InfoTooltip>
            </p>
            <p
              className={`mt-1 inline-flex items-center gap-1 text-lg font-black ${
                isDeltaDown ? "text-red-500" : "text-primary-green"
              }`}
            >
              {crewDonuts.todayDelta}
            </p>
            <p
              className={`text-[11px] font-bold ${
                isDeltaDown ? "text-red-500" : "text-primary-green"
              }`}
            >
              {crewDonuts.todayDeltaPercent}
            </p>
            <div className="mt-3 flex flex-col gap-1.5 border-t border-text-secondary/10 pt-3">
              <p className="text-[11px] font-black text-text-primary">
                {crewDonuts.trendSummaryLabel}
              </p>
              {crewDonuts.topMoverLabel && (
                <p className="text-[11px] font-bold leading-snug text-text-secondary">
                  {crewDonuts.topMoverLabel}{" "}
                  <span className="font-black text-primary-green">
                    {crewDonuts.topMoverDelta}
                  </span>
                </p>
              )}
            </div>
          </div>
        </div>
      </DashboardCard>

      <Button
        type="button"
        variant="outline"
        fullWidth
        className="border-primary-green/25 bg-success-green/70 text-primary-green shadow-[0_6px_18px_rgba(94,155,115,0.14)] hover:bg-success-green"
        onClick={onOpenPrinciples}
      >
        <span className="flex w-full items-center justify-between gap-2">
          <span className="flex items-center gap-2 font-extrabold">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-green text-white">
              <ShieldCheck size={15} />
            </span>
            방장 운영 원칙 보기
          </span>
          <ChevronRight size={16} className="text-primary-green/70" />
        </span>
      </Button>

      <div className="flex items-center justify-between pt-1">
        <h2 className="text-sm font-black tracking-tight text-text-primary">
          크루별 현황
        </h2>
        <span className="rounded-full bg-success-green/80 px-3 py-1 text-[11px] font-extrabold text-primary-green ring-1 ring-primary-green/10">
          {crewDonuts.participantLabel}
        </span>
      </div>

      <div className="flex flex-col gap-2.5">
        {crewDonuts.crews.map((crew) => (
          <CrewRow
            key={crew.crewId}
            crew={crew}
            onSelect={() => onOpenDaily(crew.crewId)}
          />
        ))}
      </div>
    </section>
  );
}

function CrewRow({
  crew,
  onSelect,
}: {
  crew: CrewDonutRowView;
  onSelect: () => void;
}) {
  const isUp = crew.trend === "up";
  const isDown = crew.trend === "down";

  return (
    <button
      type="button"
      className="w-full rounded-card border border-white/70 bg-card p-3.5 text-left shadow-[0_2px_12px_rgba(34,34,34,0.05)] hover:border-primary-green/25 hover:bg-success-green/25"
      onClick={onSelect}
    >
      <span className="flex items-center gap-3">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl text-xl ${
            crew.imageUrl ? "" : (CATEGORY_BG[crew.category] ?? "bg-slate-100")
          }`}
        >
          {crew.imageUrl ? (
            <Image
              src={crew.imageUrl}
              alt={crew.title}
              width={40}
              height={40}
              className="h-full w-full object-cover"
              unoptimized
            />
          ) : (
            (CATEGORY_EMOJI[crew.category] ?? "📌")
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5">
            <span className="truncate text-sm font-black text-text-primary">
              {crew.title}
            </span>
            <span className="shrink-0 text-[10px] font-bold text-text-secondary">
              · 환급 비중 {crew.percent}%
            </span>
          </span>
          <ProgressBar percent={crew.percent} color={crew.color} className="mt-2" />
        </span>
        <span className="shrink-0 text-right">
          <span className="block text-sm font-black tabular-nums text-text-primary">
            {crew.amount}
          </span>
          {crew.delta && (
            <span
              className={`mt-1 inline-flex items-center gap-0.5 text-[11px] font-extrabold ${
                isUp
                  ? "text-primary-green"
                  : isDown
                    ? "text-red-500"
                    : "text-text-secondary"
              }`}
            >
              {crew.delta}
            </span>
          )}
        </span>
      </span>
      <span className="mt-3 flex items-center justify-end gap-1 text-[11px] font-black text-primary-green">
        일일 현황 보기
        <ChevronRight size={13} />
      </span>
    </button>
  );
}
