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

export interface MonthFilterOption {
  label: string;
  value?: string;
}

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
  tone: "blue" | "green" | "amber" | "slate";
}

export interface WalletHistoryViewItem {
  id: string;
  label: string;
  description: string;
  displayAmount: string;
  balanceAfter: string;
  dateLabel: string;
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

export function formatMonthLabel(value?: string) {
  if (!value) return "전체 기간";

  const match = /^(\d{4})-(\d{2})$/.exec(value);
  if (!match) return value;

  const month = Number(match[2]);
  if (!Number.isInteger(month) || month < 1 || month > 12) return value;

  return `${match[1]}년 ${month}월`;
}

function getSeoulYearMonth(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(date);

  return {
    year: Number(parts.find((part) => part.type === "year")?.value),
    month: Number(parts.find((part) => part.type === "month")?.value),
  };
}

export function buildRecentMonthOptions(baseDate: Date, count = 12): MonthFilterOption[] {
  const { year: baseYear, month: baseMonth } = getSeoulYearMonth(baseDate);
  const months = Array.from({ length: count }, (_, index) => {
    const monthIndex = baseMonth - 1 - index;
    const year = baseYear + Math.floor(monthIndex / 12);
    const month = ((monthIndex % 12) + 12) % 12 + 1;
    const value = `${year}-${String(month).padStart(2, "0")}`;

    return {
      label: formatMonthLabel(value),
      value,
    };
  });

  return [{ label: formatMonthLabel(), value: undefined }, ...months];
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
    direction,
    displayType,
    category: displayType === "UNKNOWN" ? "unknown" : WALLET_DISPLAY_CATEGORY[displayType],
  };
}

export function createWalletViewModel(
  account: PointAccountResponse,
  historyItems: WalletHistoryItem[],
): WalletViewModel {
  const totalPendingReserveAmount = account.reserved_balance + account.active_locked_amount;

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
    metrics: [
      {
        label: "총 도딘",
        value: formatKrw(account.total_balance),
        caption: "지금까지의 전체 도딘",
        tone: "blue",
      },
      {
        label: "예치 대기",
        value: formatKrw(totalPendingReserveAmount),
        caption: "입금 대기 + 진행중 크루 예치금",
        tone: "green",
      },
      {
        label: "정산 예정",
        value: formatKrw(account.settlement_pending_amount),
        caption: "정상 처리/재시도 중인 정산 환급 예정액",
        tone: "amber",
      },
      {
        label: "정산 확인 필요",
        value: formatKrw(account.settlement_failed_amount),
        caption: "지급 실패 후 복구가 필요한 정산 환급액",
        tone: "amber",
      },
    ],
    historyItems: historyItems.map(toWalletHistoryViewItem),
  };
}
