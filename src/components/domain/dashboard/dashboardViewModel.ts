import type { CrewCategory, GlobalDashboardResponse } from "@/types/domain";

// 크루별 자동 색 — 도넛 세그먼트와 크루 행 프로그래스바에 공용으로 사용
export const CREW_COLOR_PALETTE = [
  "#5E9B73",
  "#7AA8DB",
  "#A38DB9",
  "#E59A6F",
  "#B8AE99",
  "#D9A93D",
  "#7FB271",
  "#9F95D4",
] as const;

export function crewColor(index: number): string {
  return CREW_COLOR_PALETTE[index % CREW_COLOR_PALETTE.length];
}

// ─── 포맷 헬퍼 ────────────────────────────────────────────────────────────────

// 금액. null이면 아직 집계 전 상태
export function formatWon(amount: number | null): string {
  if (amount == null) return "집계 전";
  return `${amount.toLocaleString("ko-KR")}원`;
}

// 부호 있는 금액 변동. 음수는 toLocaleString이 '-'를 붙이므로 양수에만 '+' 부여
export function formatSignedWon(amount: number | null): string {
  if (amount == null) return "—";
  const prefix = amount > 0 ? "+" : "";
  return `${prefix}${amount.toLocaleString("ko-KR")}원`;
}

// string decimal 비율 → 부호 있는 퍼센트
export function formatSignedPercent(ratio: string): string {
  const n = Number(ratio);
  if (!Number.isFinite(n)) return "—";
  const pct = n * 100;
  const prefix = pct > 0 ? "+" : "";
  return `${prefix}${pct.toFixed(1)}%`;
}

export type Trend = "up" | "down" | "flat";

function deltaTrend(amount: number | null): Trend {
  if (amount == null || amount === 0) return "flat";
  return amount > 0 ? "up" : "down";
}

// ─── 전역 대시보드 뷰모델 (GET /api/dashboard → CrewDonutSection) ───────────

export interface CrewDonutSegmentView {
  label: string;
  value: number;
  color: string;
}

export interface CrewDonutRowView {
  crewId: number;
  title: string;
  category: CrewCategory;
  imageUrl: string | null;
  color: string;
  percent: number; // 전체 예상 환급금 대비 비중
  amount: string;
  delta: string | null; // 변동액. 데이터 없으면 null
  trend: Trend;
}

export interface CrewDonutView {
  dateLabel: string;
  totalLabel: string;
  totalAmount: string;
  todayDelta: string;
  todayDeltaPercent: string;
  deltaTrend: Trend;
  trendSummaryLabel: string;
  topMoverLabel: string | null;
  topMoverDelta: string | null;
  participantLabel: string;
  segments: CrewDonutSegmentView[];
  crews: CrewDonutRowView[];
}

export function mapGlobalDashboard(
  res: GlobalDashboardResponse,
  dateLabel: string,
): CrewDonutView {
  const total = res.total_expected_refund_amount;

  const crews: CrewDonutRowView[] = res.crews.map((crew, index) => {
    const amount = crew.expected_refund_amount;
    const percent =
      total > 0 && amount != null ? Math.round((amount / total) * 100) : 0;

    return {
      crewId: crew.crew_id,
      title: crew.crew_name,
      category: crew.category,
      imageUrl: crew.image_url,
      color: crewColor(index),
      percent,
      amount: formatWon(amount),
      delta: crew.today_delta_amount == null ? null : formatSignedWon(crew.today_delta_amount),
      trend: deltaTrend(crew.today_delta_amount),
    };
  });

  const segments: CrewDonutSegmentView[] = res.crews.map((crew, index) => ({
    label: crew.crew_name,
    value: crew.expected_refund_amount ?? 0,
    color: crewColor(index),
  }));

  return {
    dateLabel,
    totalLabel: "예상 합계",
    totalAmount: formatWon(total),
    todayDelta: formatSignedWon(res.today_delta_amount),
    todayDeltaPercent: formatSignedPercent(res.today_delta_ratio),
    deltaTrend: deltaTrend(res.today_delta_amount),
    trendSummaryLabel: `상승 ${res.rising_crew_count} · 하락 ${res.falling_crew_count}`,
    topMoverLabel: res.max_delta_crew ? `최대 변동 ${res.max_delta_crew.crew_name}` : null,
    topMoverDelta: res.max_delta_crew
      ? formatSignedWon(res.max_delta_crew.today_delta_amount)
      : null,
    participantLabel: `참여 크루 ${res.crews.length}`,
    segments,
    crews,
  };
}
