import Link from "next/link";
import { ArrowDown, ArrowUp, CheckCircle2, ChevronRight, Clock3, Info, Users } from "lucide-react";

import { DELTA_TOOLTIP_TEXT, type ProjectionCopy } from "@/mocks/data/dashboard";

import {
  DashboardCard,
  InfoTooltip,
  ProjectionTooltip,
  SegmentRing,
  type TooltipAlign,
} from "./DashboardPrimitives";
import { ReportSuspicionCallout } from "./ReportSuspicionCallout";
import type {
  CrewDashboardSegmentView,
  CrewDashboardView,
  Trend,
} from "./dashboardViewModel";

export function DailyDashboardSection({
  dashboard,
  projectionCopy,
  reportNotice,
  reportActionLabel,
}: {
  dashboard: CrewDashboardView;
  projectionCopy: ProjectionCopy;
  reportNotice: string;
  reportActionLabel: string;
}) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <h2 className="min-w-0 truncate text-sm font-black text-text-primary">
          {dashboard.crewName}
        </h2>
        <span className="shrink-0 rounded-full bg-success-green px-3 py-1 text-[11px] font-extrabold text-primary-green">
          {dashboard.ddayLabel}
        </span>
        {dashboard.todayDeltaLabel && (
          <span className="ml-auto inline-flex shrink-0 items-center gap-1 text-[11px]">
            <span className="font-bold text-text-secondary">오늘 변동</span>
            <span
              className={`font-extrabold ${
                dashboard.todayDeltaTrend === "up"
                  ? "text-primary-green"
                  : dashboard.todayDeltaTrend === "down"
                    ? "text-red-500"
                    : "text-text-secondary"
              }`}
            >
              {dashboard.todayDeltaLabel}
            </span>
            <InfoTooltip ariaLabel="오늘 변동 안내" placement="bottom" align="right">
              {DELTA_TOOLTIP_TEXT}
            </InfoTooltip>
          </span>
        )}
      </div>

      <DashboardCard className="mb-1 flex items-center gap-5 border-primary-green/25 bg-card/95 px-5 py-6 shadow-[0_14px_30px_rgba(94,155,115,0.16)] ring-1 ring-primary-green/10">
        <SegmentRing segments={dashboard.segments} size={144} stroke={16}>
          <span className="text-[10px] font-bold text-text-secondary">
            {dashboard.myShareLabel}
          </span>
          <strong className="mt-1 text-2xl font-black tracking-tight text-primary-green">
            {dashboard.mySharePercent}
          </strong>
        </SegmentRing>

        <div className="min-w-0 flex-1 max-h-[110px] overflow-y-auto pr-1 space-y-1.5 scrollbar-thin">
          {dashboard.segments.map((segment) => (
            <LegendRow key={segment.id} segment={segment} />
          ))}
        </div>
      </DashboardCard>

      {dashboard.updatedAtLabel && (
        <p className="-mt-0.5 inline-flex items-center gap-1 px-1 text-[11px] text-text-secondary">
          <Clock3 size={12} />
          마지막 업데이트 {dashboard.updatedAtLabel}
        </p>
      )}

      {dashboard.notice && (
        <NoticeBanner
          message={dashboard.notice}
          settlementHref={
            dashboard.showSettlementLink
              ? `/crews/${dashboard.crewId}/settlement`
              : null
          }
        />
      )}

      <div className="grid grid-cols-2 gap-2.5">
        <MetricCard
          label="예상 환급금"
          showTooltip
          projectionCopy={projectionCopy}
          tooltipAlign="left"
        >
          <strong className="mt-3 text-xl font-black tracking-tight text-text-primary">
            {dashboard.expectedRefund}
          </strong>
          <DepositCompareText
            prefix={dashboard.depositComparePrefix}
            pnlLabel={dashboard.depositPnlLabel}
            trend={dashboard.depositPnlTrend}
          />
        </MetricCard>

        <MetricCard label="현재 순위">
          <RankValue label={dashboard.rankLabel} />
          <DeltaText label={dashboard.rankDeltaLabel} trend={dashboard.rankTrend} withArrow />
        </MetricCard>
      </div>

      <DashboardCard className="flex items-center gap-3 bg-card/95">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-green/10 text-primary-green">
          <CheckCircle2 size={19} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-black text-text-primary">나의 성공 횟수</p>
          <p className="mt-0.5 text-[11px] text-text-secondary">
            직전 정산 배치 기준 확정 성공
          </p>
        </div>
        <strong className="shrink-0 text-xl font-black tracking-tight text-primary-green">
          {dashboard.successCount}
        </strong>
      </DashboardCard>

      {dashboard.nextSettlementTime && (
        <DashboardCard className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-blue/10 text-primary-blue">
            <Clock3 size={19} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-black text-text-primary">다음 정산</p>
            <p className="mt-0.5 text-[11px] text-text-secondary">
              {dashboard.nextSettlementTime}
            </p>
          </div>
        </DashboardCard>
      )}

      <Link
        href={`/crews/${dashboard.crewId}`}
        className="w-full flex items-center justify-between gap-3 rounded-card border border-primary-blue/20 bg-primary-blue/5 p-4 text-left shadow-[0_4px_16px_rgba(76,115,217,0.08)] hover:border-primary-blue/30 hover:bg-primary-blue/10 transition-all active:scale-[0.99]"
      >
        <p className="min-w-0 flex-1 text-sm font-black text-primary-blue flex items-center gap-1.5">
          <Users size={15} className="shrink-0 text-primary-blue" />
          크루 페이지 보러가기
        </p>
        <ChevronRight size={16} className="shrink-0 text-primary-blue/80" />
      </Link>

      <ReportSuspicionCallout notice={reportNotice} actionLabel={reportActionLabel} />
    </section>
  );
}

function LegendRow({ segment }: { segment: CrewDashboardSegmentView }) {
  return (
    <div className="flex items-center gap-2 text-[10px] md:text-[11px] leading-none py-0.5">
      <span
        className="h-1.5 w-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: segment.color }}
      />
      <span
        className={`min-w-0 flex-1 truncate ${segment.isMe ? "font-black text-text-primary" : "font-medium text-text-secondary"}`}
      >
        {segment.label}
      </span>
      <span
        className={`shrink-0 tabular-nums ${segment.isMe ? "font-black text-text-primary" : "font-bold text-text-secondary/90"}`}
      >
        {segment.valueLabel}
      </span>
    </div>
  );
}

function MetricCard({
  label,
  showTooltip = false,
  projectionCopy,
  tooltipAlign,
  children,
}: {
  label: string;
  showTooltip?: boolean;
  projectionCopy?: ProjectionCopy;
  tooltipAlign?: TooltipAlign;
  children: React.ReactNode;
}) {
  return (
    <DashboardCard className="min-h-28 flex flex-col justify-between bg-card/95 p-3.5 shadow-[0_2px_10px_rgba(34,34,34,0.03)] border-slate-100">
      <p className="inline-flex items-center gap-1 text-[11px] font-bold text-text-secondary/90">
        {label}
        {showTooltip && projectionCopy && (
          <ProjectionTooltip copy={projectionCopy} align={tooltipAlign} />
        )}
      </p>
      {children}
    </DashboardCard>
  );
}

function RankValue({ label }: { label: string }) {
  if (label === "—") {
    return (
      <strong className="mt-3 text-xl font-black tracking-tight text-text-primary">
        —
      </strong>
    );
  }

  const [rankValue, rankTotal] = label.split(" / ");
  return (
    <strong className="mt-3 flex items-baseline gap-1.5 tracking-tight">
      <span className="text-2xl font-black text-primary-blue">{rankValue}</span>
      {rankTotal && (
        <span className="text-sm font-extrabold text-text-secondary">/ {rankTotal}</span>
      )}
    </strong>
  );
}

function DeltaText({
  label,
  trend,
  withArrow = false,
}: {
  label: string | null;
  trend: Trend;
  withArrow?: boolean;
}) {
  if (!label) return <span className="mt-2 h-[16px]" />;

  const color =
    trend === "up"
      ? "text-primary-green"
      : trend === "down"
        ? "text-red-500"
        : "text-text-secondary";

  return (
    <span className={`mt-2 inline-flex items-center gap-1 text-[11px] font-extrabold ${color}`}>
      {withArrow && trend === "up" && <ArrowUp size={12} />}
      {withArrow && trend === "down" && <ArrowDown size={12} />}
      {label}
    </span>
  );
}

// 예상 환급금 카드 보조줄 — "보증금 N원 대비 +M원". prefix null이면 카드 높이 유지용 빈 placeholder
function DepositCompareText({
  prefix,
  pnlLabel,
  trend,
}: {
  prefix: string | null;
  pnlLabel: string;
  trend: Trend;
}) {
  if (!prefix) return <span className="mt-2 h-[16px]" />;

  const color =
    trend === "up"
      ? "text-primary-green"
      : trend === "down"
        ? "text-red-500"
        : "text-text-secondary";

  return (
    <p className="mt-2 text-[11px] font-bold leading-snug text-text-secondary">
      {prefix}{" "}
      <span className={`font-extrabold ${color}`}>{pnlLabel}</span>
    </p>
  );
}

function NoticeBanner({
  message,
  settlementHref,
}: {
  message: string;
  settlementHref: string | null;
}) {
  return (
    <DashboardCard className="flex items-start gap-2.5 border-primary-blue/20 bg-primary-blue/5">
      <Info size={16} className="mt-0.5 shrink-0 text-primary-blue" />
      <div className="min-w-0 flex-1">
        <p className="text-[12px] font-medium leading-relaxed text-text-secondary">
          {message}
        </p>
        {settlementHref && (
          <Link
            href={settlementHref}
            className="mt-1.5 inline-flex text-[12px] font-black text-primary-blue hover:underline"
          >
            정산 상세 보기 →
          </Link>
        )}
      </div>
    </DashboardCard>
  );
}
