import type {
  PointAccountResponse,
  PointHistoryItem,
  PointTransactionType,
} from "@/types/domain";

export type DisplayDirection = "inflow" | "outflow";

export const POINT_TRANSACTION_DISPLAY_DIRECTION: Record<PointTransactionType, DisplayDirection> = {
  POINT_CHARGE: "inflow",
  CREW_DEPOSIT_RESERVE: "outflow",
  CREW_RESERVE_RELEASE: "inflow",
  CREW_SETTLEMENT_REFUND: "inflow",
  POINT_WITHDRAWAL: "outflow",
};

const POINT_TRANSACTION_LABELS: Record<PointTransactionType, string> = {
  POINT_CHARGE: "도딘 충전",
  CREW_DEPOSIT_RESERVE: "도딘 예치",
  CREW_RESERVE_RELEASE: "예치 반환",
  CREW_SETTLEMENT_REFUND: "정산 환급",
  POINT_WITHDRAWAL: "도딘 출금",
};

const POINT_TRANSACTION_DESCRIPTIONS: Record<PointTransactionType, string> = {
  POINT_CHARGE: "카드 결제",
  CREW_DEPOSIT_RESERVE: "크루 보증금 예치",
  CREW_RESERVE_RELEASE: "크루 예치금 반환",
  CREW_SETTLEMENT_REFUND: "크루 정산 환급",
  POINT_WITHDRAWAL: "도딘 출금 미지원",
};

function getCrewContext(item: PointHistoryItem) {
  const meta = item.reference_meta;
  if (meta?.crew_title && meta.crew_title.length > 0) {
    return meta.crew_title;
  }
  if (meta?.crew_id != null) {
    return `크루 #${meta.crew_id}`;
  }
  return "";
}

function getCrewTransactionDescription(item: PointHistoryItem) {
  const crewContext = getCrewContext(item);
  if (!crewContext) return POINT_TRANSACTION_DESCRIPTIONS[item.transaction_type];

  switch (item.transaction_type) {
    case "CREW_DEPOSIT_RESERVE":
      return crewContext;
    case "CREW_RESERVE_RELEASE":
      return crewContext;
    case "CREW_SETTLEMENT_REFUND":
      return crewContext;
    default:
      return POINT_TRANSACTION_DESCRIPTIONS[item.transaction_type];
  }
}

export interface WalletSummaryMetric {
  label: string;
  value: string;
  caption: string;
  tone: "blue" | "green" | "amber" | "slate";
}

export interface WalletHistoryViewItem {
  id: number;
  label: string;
  description: string;
  displayAmount: string;
  balanceAfter: string;
  dateLabel: string;
  direction: DisplayDirection;
  transactionType: PointTransactionType;
}

export interface WalletViewModel {
  availableBalance: string;
  totalBalance: string;
  reservedBalance: string;
  lockedBalance: string;
  activeLockedAmount: string;
  settlementPendingAmount: string;
  totalPendingReserveBalance: string;
  updatedAtLabel: string;
  metrics: WalletSummaryMetric[];
  historyItems: WalletHistoryViewItem[];
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
  if (Number.isNaN(date.getTime())) return "방금 전 갱신";

  return `${new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date)} 기준`;
}

export function toWalletHistoryViewItem(item: PointHistoryItem): WalletHistoryViewItem {
  const direction = POINT_TRANSACTION_DISPLAY_DIRECTION[item.transaction_type];
  const sign = direction === "inflow" ? "+" : "-";

  return {
    id: item.point_history_id,
    label: POINT_TRANSACTION_LABELS[item.transaction_type],
    description: getCrewTransactionDescription(item),
    displayAmount: `${sign}${formatKrw(Math.abs(item.amount))}`,
    balanceAfter: formatKrw(item.balance_after),
    dateLabel: formatHistoryDate(item.created_at),
    direction,
    transactionType: item.transaction_type,
  };
}

export function createWalletViewModel(
  account: PointAccountResponse,
  historyItems: PointHistoryItem[],
): WalletViewModel {
  const totalPendingReserveAmount = account.reserved_balance + account.active_locked_amount;

  return {
    availableBalance: formatKrw(account.available_balance),
    totalBalance: formatKrw(account.total_balance),
    reservedBalance: formatKrw(account.reserved_balance),
    lockedBalance: formatKrw(account.locked_balance),
    activeLockedAmount: formatKrw(account.active_locked_amount),
    settlementPendingAmount: formatKrw(account.settlement_pending_amount),
    totalPendingReserveBalance: formatKrw(totalPendingReserveAmount),
    updatedAtLabel: formatUpdatedAt(account.updated_at),
    metrics: [
      {
        label: "총 잔액",
        value: formatKrw(account.total_balance),
        caption: "현재 지갑의 전체 잔액",
        tone: "blue",
      },
      {
        label: "예치중",
        value: formatKrw(totalPendingReserveAmount),
        caption:
          "크루 참여용으로 묶인 금액이에요. 신청 대기(취소 가능) + 승인 후 진행 중 보증금을 합산한 값입니다.",
        tone: "green",
      },
      {
        label: "환급 처리중",
        value: formatKrw(account.settlement_pending_amount),
        caption: "정산 확정 전, 환급 처리 대기 중인 금액",
        tone: "amber",
      },
    ],
    historyItems: historyItems.map(toWalletHistoryViewItem),
  };
}
