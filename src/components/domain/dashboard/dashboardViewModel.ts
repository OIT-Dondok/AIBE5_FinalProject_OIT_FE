import type {
  CrewCategory,
  DashboardResponse,
  GlobalDashboardResponse,
  ProjectionNotice,
} from "@/types/domain";

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

// ─── 크루 상세 뷰모델 (GET /api/crews/{crewId}/dashboard → DailyDashboardSection) ─

// string decimal 지분율 → 퍼센트 문자열. null이면 "—"
function formatRatioPercent(ratio: string | null): string {
  if (ratio == null) return "—";
  const n = Number(ratio);
  if (!Number.isFinite(n)) return "—";
  return `${(n * 100).toFixed(1)}%`;
}

// SegmentRing/LegendRow용 숫자 퍼센트 (null → 0)
function ratioToPercentValue(ratio: string | null): number {
  if (ratio == null) return 0;
  const n = Number(ratio);
  if (!Number.isFinite(n)) return 0;
  return Number((n * 100).toFixed(1));
}

// days_until_end → D-day 라벨 (당일 0 → "D-DAY", 종료 후 null → "종료")
function formatDday(days: number | null): string {
  if (days == null) return "종료";
  if (days <= 0) return "D-DAY";
  return `D-${days}`;
}

function formatRankDelta(delta: number | null): { label: string | null; trend: Trend } {
  if (delta == null) return { label: null, trend: "flat" };
  if (delta > 0) return { label: `${delta}단계 상승`, trend: "up" };
  if (delta < 0) return { label: `${Math.abs(delta)}단계 하락`, trend: "down" };
  return { label: "유지", trend: "flat" };
}

// next_settlement_at → "오전 12시 · N시간 뒤". null이면 null
function formatNextSettlement(iso: string | null): string | null {
  if (!iso) return null;
  const target = new Date(iso);
  if (Number.isNaN(target.getTime())) return null;

  const hour24 = target.getHours();
  const ampm = hour24 < 12 ? "오전" : "오후";
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;

  const diffHours = Math.round((target.getTime() - Date.now()) / 3_600_000);
  const relative = diffHours <= 0 ? "곧" : `${diffHours}시간 뒤`;

  return `${ampm} ${hour12}시 · ${relative}`;
}

// projection_notice → 안내 문구. 일반 LIVE(ESTIMATED_NOT_FINAL)는 툴팁으로 충분하므로 null
function noticeMessage(notice: ProjectionNotice): string | null {
  switch (notice) {
    case "NOT_STARTED":
      return "아직 정산 배치가 실행되지 않아 예상 성과가 집계되기 전이에요.";
    case "NOT_PROVIDED":
      return "현재 크루 상태에서는 예상 대시보드를 제공하지 않아요.";
    case "SETTLEMENT_RESULT_AVAILABLE":
      return "최종 정산이 완료됐어요. 정산 상세에서 확정 결과를 확인하세요.";
    case "INSUFFICIENT_PROJECTION_INPUT":
      return "예상 계산에 필요한 정보가 부족해 일부 값을 표시하지 못했어요.";
    case "ESTIMATED_NOT_FINAL":
    default:
      return null;
  }
}

export interface CrewDashboardSegmentView {
  label: string;
  value: number; // 링 그라데이션용 숫자 (null → 0)
  valueLabel: string; // 범례 표시용 ("23.5%" 또는 집계 전 "—")
  color: string;
  isMe: boolean;
}

export interface CrewDashboardView {
  crewId: number;
  crewName: string;
  ddayLabel: string;
  myShareLabel: string;
  mySharePercent: string;
  segments: CrewDashboardSegmentView[];
  successCount: string;
  expectedRefund: string;
  expectedRefundDelta: string | null;
  expectedRefundTrend: Trend;
  rankLabel: string;
  rankDeltaLabel: string | null;
  rankTrend: Trend;
  nextSettlementTime: string | null;
  notice: string | null;
  // SETTLEMENT_RESULT_AVAILABLE일 때 정산 상세(/crews/{crewId}/settlement) 유도
  showSettlementLink: boolean;
}

export function mapCrewDashboard(res: DashboardResponse): CrewDashboardView {
  const me = res.participants.find((p) => p.is_me) ?? null;
  const rankDelta = formatRankDelta(res.rank_delta);

  return {
    crewId: res.crew_id,
    crewName: res.crew_name,
    ddayLabel: formatDday(res.days_until_end),
    myShareLabel: "나의 지분율",
    mySharePercent: formatRatioPercent(me?.share_ratio ?? null),
    segments: res.participants.map((p, index) => ({
      label: p.nickname,
      value: ratioToPercentValue(p.share_ratio),
      valueLabel: formatRatioPercent(p.share_ratio),
      color: crewColor(index),
      isMe: p.is_me,
    })),
    successCount: res.my_success_count == null ? "—" : `${res.my_success_count}회`,
    expectedRefund: formatWon(res.my_expected_refund_amount),
    expectedRefundDelta:
      res.my_expected_refund_delta_amount == null
        ? null
        : formatSignedWon(res.my_expected_refund_delta_amount),
    expectedRefundTrend: deltaTrend(res.my_expected_refund_delta_amount),
    // rank가 null(예: 배치 전)이어도 rank_total이 있으면 "전체 N명"은 표시
    rankLabel:
      res.rank_total != null
        ? `${res.rank != null ? `${res.rank}위` : "—"} / ${res.rank_total}명`
        : "—",
    rankDeltaLabel: rankDelta.label,
    rankTrend: rankDelta.trend,
    nextSettlementTime: formatNextSettlement(res.next_settlement_at),
    notice: noticeMessage(res.projection_notice),
    showSettlementLink:
      res.projection_notice === "SETTLEMENT_RESULT_AVAILABLE" &&
      res.settlement_id != null,
  };
}
