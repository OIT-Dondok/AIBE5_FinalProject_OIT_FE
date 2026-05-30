import { ArrowUp, Clock3 } from "lucide-react";

import type {
  DailyDashboardMock,
  DashboardMetric,
  HostPrinciplesMock,
  ProjectionCopy,
  ShareSegment,
} from "@/mocks/data/dashboard";

import {
  DashboardCard,
  ProgressBar,
  ProjectionTooltip,
  SegmentRing,
} from "./DashboardPrimitives";
import { ReportSuspicionCallout } from "./ReportSuspicionCallout";

export function DailyDashboardSection({
  daily,
  principles,
  projectionCopy,
}: {
  daily: DailyDashboardMock;
  principles: HostPrinciplesMock;
  projectionCopy: ProjectionCopy;
}) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-black text-text-primary">
          {daily.crewName}
        </h2>
        <span className="rounded-full bg-success-green px-3 py-1 text-[11px] font-extrabold text-primary-green">
          {daily.dayLabel}
        </span>
      </div>

      <DashboardCard className="mb-4 flex items-center gap-5 border-primary-green/25 bg-card/95 px-5 py-6 shadow-[0_14px_30px_rgba(94,155,115,0.16)] ring-1 ring-primary-green/10">
        <SegmentRing segments={daily.shareSegments} size={144} stroke={16}>
          <span className="text-[10px] font-bold text-text-secondary">
            {daily.myShareLabel}
          </span>
          <strong className="mt-1 text-2xl font-black tracking-tight text-primary-green">
            {daily.mySharePercent}
          </strong>
        </SegmentRing>

        <div className="min-w-0 flex-1 space-y-2">
          {daily.shareSegments.map((segment) => (
            <LegendRow key={segment.label} segment={segment} />
          ))}
        </div>
      </DashboardCard>

      <div className="grid grid-cols-2 gap-2.5">
        {daily.metrics.map((metric) => (
          <MetricCard
            key={metric.label}
            metric={metric}
            projectionCopy={projectionCopy}
          />
        ))}
      </div>

      <DashboardCard className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-blue/10 text-primary-blue">
          <Clock3 size={19} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-black text-text-primary">
            {daily.nextSettlement.label}
          </p>
          <p className="mt-0.5 text-[11px] text-text-secondary">
            {daily.nextSettlement.timeLabel}
          </p>
        </div>
        <ProgressBar
          percent={daily.nextSettlement.progressPercent}
          tone="blue"
          className="w-20"
        />
      </DashboardCard>

      <ReportSuspicionCallout
        notice={principles.reportNotice}
        actionLabel={principles.reportActionLabel}
      />
    </section>
  );
}

function LegendRow({ segment }: { segment: ShareSegment }) {
  return (
    <div className="flex items-center gap-2 text-[11px]">
      <span
        className="h-2 w-2 shrink-0 rounded-sm"
        style={{ backgroundColor: segment.color }}
      />
      <span
        className={`min-w-0 flex-1 truncate ${segment.isMe ? "font-black" : "font-medium"}`}
      >
        {segment.label}
      </span>
      <span className="font-black tabular-nums text-text-primary">
        {segment.value}%
      </span>
    </div>
  );
}

function MetricCard({
  metric,
  projectionCopy,
}: {
  metric: DashboardMetric;
  projectionCopy: ProjectionCopy;
}) {
  const isUp = metric.trend === "up";
  const isRankMetric = metric.label === "현재 순위";
  const [rankValue, rankTotal] = metric.value.split(" / ");

  return (
    <DashboardCard className="min-h-28 flex flex-col justify-between bg-card/95">
      <p className="inline-flex items-center gap-1 text-[11px] font-black text-text-secondary">
        {metric.label}
        {metric.label === "예상 환급금" && (
          <ProjectionTooltip copy={projectionCopy} />
        )}
      </p>
      {isRankMetric ? (
        <strong className="mt-3 flex items-baseline gap-1.5 tracking-tight">
          <span className="text-2xl font-black text-primary-blue">
            {rankValue}
          </span>
          <span className="text-sm font-extrabold text-text-secondary">
            / {rankTotal}
          </span>
        </strong>
      ) : (
        <strong className="mt-3 text-xl font-black tracking-tight text-text-primary">
          {metric.value}
        </strong>
      )}
      <span
        className={`mt-2 inline-flex items-center gap-1 text-[11px] font-extrabold ${
          isUp ? "text-primary-green" : "text-text-secondary"
        }`}
      >
        {isRankMetric && isUp && <ArrowUp size={12} />}
        {metric.detail}
      </span>
    </DashboardCard>
  );
}
