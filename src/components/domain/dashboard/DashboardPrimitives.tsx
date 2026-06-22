import type { CSSProperties, ReactNode } from "react";
import { useId } from "react";

import type { ProjectionCopy, ShareSegment } from "@/mocks/data/dashboard";

export function DashboardCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <article
      className={`rounded-card border border-white/70 bg-card p-4 shadow-[0_2px_12px_rgba(34,34,34,0.05)] ${className}`}
    >
      {children}
    </article>
  );
}

// 툴팁 말풍선이 열리는 방향/정렬. 화면·헤더 경계에 가려지지 않도록 호출부에서 지정.
export type TooltipPlacement = "top" | "bottom";
export type TooltipAlign = "center" | "left" | "right";

// 물음표(?) 버튼 + 말풍선 툴팁 공용 primitive. 내용은 children으로 임의 구성.
// placement: 말풍선이 위/아래 중 어디로 열릴지 (상단 sticky 헤더에 가리면 "bottom").
// align: 말풍선 가로 정렬 (좌/우 끝에서 화면 밖으로 잘리면 "left"/"right").
export function InfoTooltip({
  children,
  ariaLabel = "안내",
  placement = "top",
  align = "center",
}: {
  children: ReactNode;
  ariaLabel?: string;
  placement?: TooltipPlacement;
  align?: TooltipAlign;
}) {
  const tooltipId = useId();

  const vertical = placement === "bottom" ? "top-full mt-2" : "bottom-full mb-2";
  const horizontal =
    align === "left"
      ? "left-0"
      : align === "right"
        ? "right-0"
        : "left-1/2 -translate-x-1/2";

  return (
    <span className="group relative inline-flex align-middle">
      <button
        type="button"
        aria-label={ariaLabel}
        aria-describedby={tooltipId}
        className="flex h-4 w-4 items-center justify-center rounded-full bg-text-secondary/20 text-[10px] font-black text-text-primary hover:bg-primary-blue/20 hover:text-primary-blue focus:outline-none focus:ring-2 focus:ring-primary-blue/20"
      >
        ?
      </button>
      <span
        id={tooltipId}
        role="tooltip"
        className={`pointer-events-none absolute z-50 w-52 rounded-xl bg-text-primary px-3 py-2 text-left text-[11px] font-bold leading-relaxed text-white opacity-0 shadow-[0_8px_24px_rgba(34,34,34,0.18)] group-hover:opacity-100 group-focus-within:opacity-100 ${vertical} ${horizontal}`}
      >
        {children}
      </span>
    </span>
  );
}

export function ProjectionTooltip({
  copy,
  placement,
  align,
}: {
  copy: ProjectionCopy;
  placement?: TooltipPlacement;
  align?: TooltipAlign;
}) {
  return (
    <InfoTooltip ariaLabel="예상 정산 안내" placement={placement} align={align}>
      <b className="mb-1 block text-white">{copy.eyebrow}</b>
      {copy.description} {copy.footnote}
    </InfoTooltip>
  );
}

export function SegmentRing({
  segments,
  size,
  stroke,
  children,
}: {
  segments: ShareSegment[];
  size: number;
  stroke: number;
  children: ReactNode;
}) {
  const background = createConicGradient(segments);
  const inset = stroke;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <div className="absolute inset-0 rounded-full" style={{ background }} />
      <div className="absolute rounded-full bg-card" style={{ inset }} />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {children}
      </div>
    </div>
  );
}

export function ProgressBar({
  percent,
  tone = "green",
  color,
  className = "",
}: {
  percent: number;
  tone?: "green" | "blue";
  color?: string;
  className?: string;
}) {
  const barStyle: CSSProperties = {
    width: `${Math.max(0, Math.min(percent, 100))}%`,
    backgroundColor: color,
  };

  return (
    <div
      className={`h-1.5 overflow-hidden rounded-full bg-background ${className}`}
    >
      <div
        className={`h-full rounded-full ${tone === "blue" ? "bg-primary-blue" : "bg-primary-green"}`}
        style={barStyle}
      />
    </div>
  );
}

function createConicGradient(segments: ShareSegment[]) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);

  // 세그먼트가 없거나 모든 값이 0(예: 정산 배치 전이라 지분율 미집계)이면 회색 빈 링
  if (segments.length === 0 || total <= 0) {
    return "conic-gradient(#e0e0e0 0% 100%)";
  }

  let cursor = 0;

  const stops = segments.map((segment) => {
    const start = cursor;
    const end = cursor + (segment.value / total) * 100;
    cursor = end;

    return `${segment.color} ${start.toFixed(2)}% ${end.toFixed(2)}%`;
  });

  return `conic-gradient(${stops.join(", ")})`;
}
