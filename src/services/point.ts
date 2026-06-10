import { api } from "@/lib/axios";
import type {
  PointAccountResponse,
  PointChargeRequest,
  PointChargeResponse,
  PointHistoryResponse,
  WalletHistoryResponse,
} from "@/types/domain";

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
}

interface PointApiClient {
  get: (url: string, config?: unknown) => Promise<{ data: unknown }>;
  post: (url: string, payload?: unknown) => Promise<{ data: unknown }>;
}

const WALLET_HISTORY_MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

function assertValidWalletHistoryMonth(month: string | undefined) {
  if (month == null) return;
  if (WALLET_HISTORY_MONTH_PATTERN.test(month)) return;

  throw new Error(`wallet history month must be YYYY-MM with month 01-12: ${month}`);
}

export function createPointService(apiClient: PointApiClient) {
  return {
    getPointAccount: () => apiClient.get("/points") as Promise<{ data: PointAccountResponse }>,

    getPointHistory: (params?: PointHistoryParams) =>
      apiClient.get("/points/history", { params }) as Promise<{ data: PointHistoryResponse }>,

    getWalletHistory: (params?: PointHistoryParams) => {
      assertValidWalletHistoryMonth(params?.month);
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

export const chargePoints = pointService.chargePoints;
