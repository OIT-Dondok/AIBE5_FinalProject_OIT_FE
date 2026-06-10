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

export type PointHistoryTypeParam = WalletHistoryTypeParam;

export interface PointHistoryParams {
  limit?: number;
  cursor?: string;
  type?: WalletHistoryTypeParam;
  month?: string;
}

export const getPointAccount = () => api.get<PointAccountResponse>("/points");

export const getPointHistory = (params?: PointHistoryParams) =>
  api.get<PointHistoryResponse>("/points/history", { params });

export const getWalletHistory = (params?: PointHistoryParams) =>
  api.get<WalletHistoryResponse>("/points/wallet-history", { params });

export const chargePoints = (payload: PointChargeRequest) =>
  api.post<PointChargeResponse>("/points/charges", payload);
