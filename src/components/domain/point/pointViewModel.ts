import type {
  PointAccountResponse,
  WalletDisplayType,
  WalletHistoryItem,
} from "@/types/domain";

export type DisplayDirection = "inflow" | "outflow";

export type PointHistoryTypeFilter =
  | "charge"
  | "refund"
  | "deposit"
  | "withdrawal"
  | "settlement";

export type PointHistoryFilter = "ALL" | PointHistoryTypeFilter;
export type WalletHistoryCategory = PointHistoryTypeFilter | "unknown";
export type WalletHistoryDisplayType = WalletDisplayType | "UNKNOWN";

export const POINT_HISTORY_FILTERS: Array<{
  label: string;
  value: PointHistoryFilter;
}> = [
  { label: "전체", value: "ALL" },
  { label: "충전", value: "charge" },
  { label: "예치", value: "deposit" },
  { label: "예치 반환", value: "refund" },
  { label: "정산", value: "settlement" },
  { label: "출금", value: "withdrawal" },
];

const WALLET_DISPLAY_LABELS: Record<WalletDisplayType, string> = {
  DODIN_CHARGE: "도딘 충전",
  DODIN_DEPOSIT: "도딘 예치",
  DODIN_DEPOSIT_REFUND: "예치 반환",
  SETTLEMENT_REFUND: "정산 환급",
};

const WALLET_DISPLAY_DESCRIPTIONS: Record<WalletDisplayType, string> = {
  DODIN_CHARGE: "카드 결제",
  DODIN_DEPOSIT: "크루 보증금 예치",
  DODIN_DEPOSIT_REFUND: "크루 예치금 반환",
  SETTLEMENT_REFUND: "크루 정산 환급",
};

const WALLET_DISPLAY_DIRECTION: Record<WalletDisplayType, DisplayDirection> = {
  DODIN_CHARGE: "inflow",
  DODIN_DEPOSIT: "outflow",
  DODIN_DEPOSIT_REFUND: "inflow",
  SETTLEMENT_REFUND: "inflow",
};

const WALLET_DISPLAY_CATEGORY: Record<WalletDisplayType, WalletHistoryCategory> = {
  DODIN_CHARGE: "charge",
  DODIN_DEPOSIT: "deposit",
  DODIN_DEPOSIT_REFUND: "refund",
  SETTLEMENT_REFUND: "settlement",
};

function isWalletDisplayType(value: string): value is WalletDisplayType {
  return Object.hasOwn(WALLET_DISPLAY_LABELS, value);
}

function getStringMeta(meta: Record<string, unknown> | null | undefined, key: string) {
  const value = meta?.[key];
  return typeof value === "string" ? value : undefined;
}

function getNumberMeta(meta: Record<string, unknown> | null | undefined, key: string) {
  const value = meta?.[key];
  return typeof value === "number" ? value : undefined;
}

function getCrewContext(item: WalletHistoryItem) {
  const crewTitle = getStringMeta(item.reference_meta, "crew_title");
  if (crewTitle && crewTitle.length > 0) {
    return crewTitle;
  }

  const crewId = getNumberMeta(item.reference_meta, "crew_id");
  if (crewId != null) {
    return `크루 #${crewId}`;
  }

  return "";
}

function getWalletHistoryDescription(item: WalletHistoryItem, displayType: WalletHistoryDisplayType) {
  const crewContext = getCrewContext(item);
  if (crewContext) return crewContext;

  return displayType === "UNKNOWN" ? "도딘 내역" : WALLET_DISPLAY_DESCRIPTIONS[displayType];
}

export interface WalletSummaryMetric {
  label: string;
  value: string;
  caption: string;
  tone: "blue" | "green" | "amber" | "slate" | "red";
}

export interface WalletHistoryViewItem {
  id: string;
  label: string;
  description: string;
  displayAmount: string;
  balanceAfter: string;
  dateLabel: string;
  dateKey: string;   // "2026-06-19" — 날짜 그룹핑용
  timeLabel: string; // "17:51" — 그룹 헤더가 날짜를 대신할 때 표시
  direction: DisplayDirection;
  displayType: WalletHistoryDisplayType;
  category: WalletHistoryCategory;
}

export interface WalletViewModel {
  availableBalance: string;
  totalBalance: string;
  reservedBalance: string;
  lockedBalance: string;
  activeLockedAmount: string;
  settlementPendingAmount: string;
  settlementFailedAmount: string;
  totalPendingReserveBalance: string;
  updatedAtLabel: string;
  metrics: WalletSummaryMetric[];
  historyItems: WalletHistoryViewItem[];
}

export function getWalletHistoryTypeParam(filter: PointHistoryFilter) {
  return filter === "ALL" ? undefined : filter;
}

export const getPointHistoryTypeParam = getWalletHistoryTypeParam;

export function formatMonthLabel(value: string) {
  const match = /^(\d{4})-(\d{2})$/.exec(value);
  if (!match) return value;

  const month = Number(match[2]);
  if (!Number.isInteger(month) || month < 1 || month > 12) return value;

  return `${match[1]}년 ${month}월`;
}

function getSeoulYearMonth(date: Date) {
  const timeZone = "Asia/Seoul";
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
  }).formatToParts(date);
  const yearPart = parts.find((part) => part.type === "year");
  const monthPart = parts.find((part) => part.type === "month");

  if (!yearPart || !monthPart || !/^\d{4}$/.test(yearPart.value) || !/^\d{2}$/.test(monthPart.value)) {
    throw new Error(`Unable to resolve ${timeZone} year/month from date: ${String(date)}`);
  }

  return {
    year: Number(yearPart.value),
    month: Number(monthPart.value),
  };
}

function toMonthValue(year: number, month: number) {
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}`;
}

function getMonthSerial(value: string) {
  const match = /^(\d{4})-(\d{2})$/.exec(value);
  if (!match) {
    throw new Error(`Invalid month value: ${value}`);
  }

  const month = Number(match[2]);
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw new Error(`Invalid month value: ${value}`);
  }

  return Number(match[1]) * 12 + (month - 1);
}

export function getCurrentSeoulMonth(baseDate = new Date()) {
  const { year, month } = getSeoulYearMonth(baseDate);
  return toMonthValue(year, month);
}

export function shiftMonth(value: string, delta: number) {
  const shiftedSerial = getMonthSerial(value) + delta;
  if (shiftedSerial < 0) {
    return "0000-01";
  }

  const year = Math.floor(shiftedSerial / 12);
  const month = (shiftedSerial % 12) + 1;

  return toMonthValue(year, month);
}

export function isAfterMonth(value: string, comparison: string) {
  return getMonthSerial(value) > getMonthSerial(comparison);
}

export function getMonthStepperState(activeMonth: string, baseDate = new Date()) {
  const currentMonth = getCurrentSeoulMonth(baseDate);
  const previousMonth = shiftMonth(activeMonth, -1);
  const nextMonth = shiftMonth(activeMonth, 1);
  const canGoPrevious = previousMonth !== activeMonth;

  return {
    canGoPrevious,
    canGoNext: !isAfterMonth(nextMonth, currentMonth),
    currentMonth,
    label: formatMonthLabel(activeMonth),
    nextMonth,
    previousMonth,
  };
}

export function formatKrw(amount: number) {
  return `${new Intl.NumberFormat("ko-KR").format(amount)}원`;
}

function formatHistoryDate(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;

  return new Intl.DateTimeFormat("ko-KR", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function getKstDateKey(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Seoul",
  }).format(date);
}

function formatHistoryTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Seoul",
  }).format(date);
}

export function formatDateGroupLabel(dateKey: string): string {
  if (!dateKey) return "";
  const parts = dateKey.split("-").map(Number);
  if (parts.length < 3 || parts.some((n) => !Number.isFinite(n))) return dateKey;
  const [year, month, day] = parts;
  // UTC로 생성해 en-CA YYYY-MM-DD 파싱이 시스템 TZ 영향을 안 받도록
  const date = new Date(Date.UTC(year!, month! - 1, day!));
  return new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
    timeZone: "UTC",
  }).format(date);
}

function formatUpdatedAt(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "업데이트 불가";

  return `${new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date)} 기준`;
}

export function toWalletHistoryViewItem(item: WalletHistoryItem): WalletHistoryViewItem {
  const displayType = isWalletDisplayType(item.display_type) ? item.display_type : "UNKNOWN";
  const direction = displayType === "UNKNOWN" ? (item.amount < 0 ? "outflow" : "inflow") : WALLET_DISPLAY_DIRECTION[displayType];
  const sign = direction === "inflow" ? "+" : "-";

  return {
    id: item.wallet_event_id,
    label: displayType === "UNKNOWN" ? "도딘 내역" : WALLET_DISPLAY_LABELS[displayType],
    description: getWalletHistoryDescription(item, displayType),
    displayAmount: `${sign}${formatKrw(Math.abs(item.amount))}`,
    balanceAfter: formatKrw(item.balance_after),
    dateLabel: formatHistoryDate(item.created_at),
    dateKey: getKstDateKey(item.created_at),
    timeLabel: formatHistoryTime(item.created_at),
    direction,
    displayType,
    category: displayType === "UNKNOWN" ? "unknown" : WALLET_DISPLAY_CATEGORY[displayType],
  };
}

export function createWalletViewModel(
  account: PointAccountResponse,
  historyItems: WalletHistoryItem[],
): WalletViewModel {
  const totalPendingReserveAmount = account.reserved_balance + account.locked_balance;
  const metrics: WalletSummaryMetric[] = [
    {
      label: "총 보유 도딘",
      value: formatKrw(account.total_balance),
      caption: "내가 가진 전체 도딘 (사용 가능 + 크루 예치금)",
      tone: "blue",
    },
    {
      label: "크루 예치금",
      value: formatKrw(totalPendingReserveAmount),
      caption: "크루에 예치한 도딘 (승인 대기 중 + 정산 전까지 묶인 금액)",
      tone: "green",
    },
  ];

  return {
    availableBalance: formatKrw(account.available_balance),
    totalBalance: formatKrw(account.total_balance),
    reservedBalance: formatKrw(account.reserved_balance),
    lockedBalance: formatKrw(account.locked_balance),
    activeLockedAmount: formatKrw(account.active_locked_amount),
    settlementPendingAmount: formatKrw(account.settlement_pending_amount),
    settlementFailedAmount: formatKrw(account.settlement_failed_amount),
    totalPendingReserveBalance: formatKrw(totalPendingReserveAmount),
    updatedAtLabel: formatUpdatedAt(account.updated_at),
    metrics,
    historyItems: historyItems.map(toWalletHistoryViewItem),
  };
}
