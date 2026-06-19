import { api } from "@/lib/axios";
import type {
  PointAccountResponse,
  PointChargeRequest,
  PointChargeResponse,
  PointHistoryResponse,
  WalletHistoryResponse,
} from "@/types/domain";
import { compareYmd } from "@/utils/date";

export type WalletHistoryTypeParam =
  | "charge"
  | "refund"
  | "deposit"
  | "withdrawal"
  | "settlement";

export interface PointHistoryParams {
  limit?: number;
  cursor?: string;
  type?: WalletHistoryTypeParam;
  /** Wallet history month filter in YYYY-MM format, e.g. 2026-06. */
  month?: string;
  /** Wallet history range start in YYYY-MM-DD format. */
  from?: string;
  /** Wallet history range end in YYYY-MM-DD format. */
  to?: string;
}

export interface WalletHistoryMonthParams extends Omit<PointHistoryParams, "month"> {
  month: string;
}

interface PointApiClient {
  get: (url: string, config?: unknown) => Promise<{ data: unknown }>;
  post: (url: string, payload?: unknown) => Promise<{ data: unknown }>;
}

const WALLET_HISTORY_MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;
const WALLET_HISTORY_YMD_PATTERN = /^\d{4}-(0[1-9]|1[0-2])-\d{2}$/;

function assertValidWalletHistoryMonth(month: string | undefined) {
  if (month == null) return;
  if (WALLET_HISTORY_MONTH_PATTERN.test(month)) return;

  throw new Error(`wallet history month must be YYYY-MM with month 01-12: ${month}`);
}

function assertWalletHistoryMonthRequired(month: string | undefined) {
  if (!month) {
    throw new Error("wallet history month is required for wallet-history list page");
  }

  assertValidWalletHistoryMonth(month);
}

function assertValidWalletHistoryRange(from: string | undefined, to: string | undefined) {
  if (from == null && to == null) return;

  if (!from || !to) {
    throw new Error("wallet history range requires both from and to");
  }
  if (!WALLET_HISTORY_YMD_PATTERN.test(from) || !WALLET_HISTORY_YMD_PATTERN.test(to)) {
    throw new Error(`wallet history range must be YYYY-MM-DD: from=${from}, to=${to}`);
  }
  if (compareYmd(from, to) >= 0) {
    throw new Error(`wallet history range must satisfy from < to: from=${from}, to=${to}`);
  }
}

function assertWalletHistoryParams(params: PointHistoryParams | undefined) {
  assertValidWalletHistoryMonth(params?.month);
  assertValidWalletHistoryRange(params?.from, params?.to);

  if (params?.month && (params.from || params.to)) {
    throw new Error("wallet history month cannot be combined with from/to range");
  }
}

export function createPointService(apiClient: PointApiClient) {
  return {
    getPointAccount: () => apiClient.get("/points") as Promise<{ data: PointAccountResponse }>,

    getPointHistory: (params?: PointHistoryParams) =>
      apiClient.get("/points/history", { params }) as Promise<{ data: PointHistoryResponse }>,

    getWalletHistory: (params?: PointHistoryParams) => {
      assertWalletHistoryParams(params);
      return apiClient.get("/points/wallet-history", { params }) as Promise<{ data: WalletHistoryResponse }>;
    },

    getWalletHistoryByMonth: (params: WalletHistoryMonthParams) => {
      assertWalletHistoryMonthRequired(params.month);
      return apiClient.get("/points/wallet-history", { params }) as Promise<{ data: WalletHistoryResponse }>;
    },

    chargePoints: (payload: PointChargeRequest) =>
      apiClient.post("/points/charges", payload) as Promise<{ data: PointChargeResponse }>,
  };
}

const pointService = createPointService(api as unknown as PointApiClient);

export const getPointAccount = pointService.getPointAccount;

export const getPointHistory = pointService.getPointHistory;

export const getWalletHistory = pointService.getWalletHistory;
export const getWalletHistoryByMonth = pointService.getWalletHistoryByMonth;

export const chargePoints = pointService.chargePoints;
