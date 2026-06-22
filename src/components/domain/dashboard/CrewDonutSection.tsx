import Image from "next/image";
import { CalendarDays, ChevronRight, ClipboardCheck } from "lucide-react";
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
  onOpenCertifications,
}: {
  crewDonuts: CrewDonutView;
  projectionCopy: ProjectionCopy;
  onOpenDaily: (crewId: number) => void;
  onOpenCertifications: () => void;
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
        <div className="flex items-center justify-around gap-4 px-2">
          <SegmentRing segments={crewDonuts.segments} size={144} stroke={16}>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-text-secondary">
              {crewDonuts.totalLabel}
              <ProjectionTooltip copy={projectionCopy} />
            </span>
            <strong className="mt-1 text-lg font-black tracking-tight text-text-primary">
              {crewDonuts.totalAmount}
            </strong>
          </SegmentRing>
          <div className="flex flex-col justify-center text-center">
            <p className="flex items-center gap-1 text-[11px] font-bold text-text-secondary justify-center">
              오늘 변동
              <InfoTooltip ariaLabel="오늘 변동 안내">{DELTA_TOOLTIP_TEXT}</InfoTooltip>
            </p>
            <p
              className={`mt-1 flex items-baseline justify-center gap-1 ${
                isDeltaDown ? "text-red-500" : "text-primary-green"
              }`}
            >
              <span className="text-xl font-black">{crewDonuts.todayDelta}</span>
              {crewDonuts.todayDeltaPercent !== "—" && (
                <span className="text-[11px] font-extrabold">
                  ({crewDonuts.todayDeltaPercent})
                </span>
              )}
            </p>
            <div className="mt-2 flex items-center justify-center gap-2 text-[11px] font-black">
              {/* 상승 크루 툴팁 */}
              <span
                tabIndex={0}
                role="button"
                aria-label={`상승 크루 ${crewDonuts.risingCrewCount}개`}
                className="group relative inline-flex items-center gap-0.5 text-primary-green cursor-help focus:outline-none focus:ring-1 focus:ring-primary-green/30 rounded px-0.5"
              >
                ▲ {crewDonuts.risingCrewCount}
                {crewDonuts.risingCrews.length > 0 && (
                  <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 hidden group-hover:block group-focus-within:block z-50 w-28 rounded-xl border border-primary-green/25 bg-success-green/95 px-2.5 py-2 text-center text-[10px] font-black text-primary-green shadow-md">
                    {crewDonuts.risingCrews.map((name, index) => (
                      <span key={`${name}-${index}`} className="block truncate leading-relaxed">
                        {name}
                      </span>
                    ))}
                  </span>
                )}
              </span>

              <span className="text-text-secondary/25 font-normal">|</span>

              {/* 하락 크루 툴팁 */}
              <span
                tabIndex={0}
                role="button"
                aria-label={`하락 크루 ${crewDonuts.fallingCrewCount}개`}
                className="group relative inline-flex items-center gap-0.5 text-red-500 cursor-help focus:outline-none focus:ring-1 focus:ring-red-500/30 rounded px-0.5"
              >
                ▼ {crewDonuts.fallingCrewCount}
                {crewDonuts.fallingCrews.length > 0 && (
                  <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 hidden group-hover:block group-focus-within:block z-50 w-28 rounded-xl border border-red-200 bg-red-50 px-2.5 py-2 text-center text-[10px] font-black text-red-600 shadow-md">
                    {crewDonuts.fallingCrews.map((name, index) => (
                      <span key={`${name}-${index}`} className="block truncate leading-relaxed">
                        {name}
                      </span>
                    ))}
                  </span>
                )}
              </span>
            </div>

            {crewDonuts.topMoverLabel && crewDonuts.topMoverCrewId != null && (
              <button
                type="button"
                onClick={() => onOpenDaily(crewDonuts.topMoverCrewId!)}
                className="mt-2.5 flex items-center justify-center gap-1 text-[10px] font-extrabold text-text-secondary/70 hover:text-primary-green active:scale-95 transition-all text-left"
              >
                <span className="opacity-75">최대 변동</span>
                {crewDonuts.topMoverColor && (
                  <span
                    className="inline-block h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: crewDonuts.topMoverColor }}
                  />
                )}
                <span className="text-text-primary/90 underline decoration-dotted truncate max-w-[85px]" title={crewDonuts.topMoverLabel.replace("최대 변동 ", "")}>
                  {crewDonuts.topMoverLabel.replace("최대 변동 ", "")}
                </span>
                <ChevronRight size={10} className="opacity-50" />
              </button>
            )}
          </div>
        </div>

        {/* 범례 (Legend) 영역 */}
        <div className="border-t border-text-secondary/10 pt-3 flex flex-wrap justify-center gap-x-3 gap-y-1.5">
          {crewDonuts.segments.map((seg) => (
            <div
              key={seg.label}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-text-secondary"
            >
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: seg.color }}
              />
              <span className="truncate max-w-[85px]" title={seg.label}>
                {seg.label}
              </span>
            </div>
          ))}
        </div>
      </DashboardCard>

      <button
        type="button"
        className="w-full flex items-center justify-between gap-3 rounded-card border border-primary-green/20 bg-success-green/40 p-4 text-left shadow-[0_4px_16px_rgba(94,155,115,0.08)] hover:border-primary-green/30 hover:bg-success-green/60 transition-all active:scale-[0.99]"
        onClick={onOpenCertifications}
      >
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold text-primary-green/90">
            검증 결과와 반려 사유가 궁금하신가요?
          </p>
          <p className="mt-1 text-sm font-black text-primary-green flex items-center gap-1.5">
            <ClipboardCheck size={15} className="text-primary-green" />
            전체 인증 이력 보러가기
          </p>
        </div>
        <ChevronRight size={16} className="text-primary-green/80 shrink-0" />
      </button>

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
      className="w-full rounded-card border border-white/70 bg-card p-4 text-left shadow-[0_2px_12px_rgba(34,34,34,0.04)] hover:border-primary-green/25 hover:bg-success-green/15 transition-all duration-200"
      onClick={onSelect}
    >
      <span className="flex items-center gap-3.5">
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl text-xl ${
            crew.imageUrl ? "" : (CATEGORY_BG[crew.category] ?? "bg-slate-100")
          }`}
        >
          {crew.imageUrl ? (
            <Image
              src={crew.imageUrl}
              alt={crew.title}
              width={44}
              height={44}
              className="h-full w-full object-cover"
              unoptimized
            />
          ) : (
            (CATEGORY_EMOJI[crew.category] ?? "📌")
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-baseline gap-1.5">
            <span className="truncate text-[14px] font-black text-text-primary">
              {crew.title}
            </span>
            <span className="shrink-0 text-[10px] font-bold text-text-secondary/80">
              {crew.percent}% 비중
            </span>
          </span>
          <ProgressBar percent={crew.percent} color={crew.color} className="mt-2" />
        </span>
        <span className="shrink-0 text-right">
          <span className="block text-[15px] font-black tabular-nums text-text-primary">
            {crew.amount}
          </span>
          {crew.delta && (
            <span
              className={`mt-0.5 inline-flex items-center gap-0.5 text-[11px] font-extrabold ${
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
      <span className="mt-3 flex items-center justify-end gap-1 text-[11px] font-bold text-primary-green/90">
        일일 현황 보기
        <ChevronRight size={12} />
      </span>
    </button>
  );
}
