import { api } from '@/lib/axios';
import type { CrewSettlementSummary, SettlementDetail, SettlementMe } from '@/types/domain';

interface SettlementApiClient {
  get: <T>(url: string) => Promise<{ data: T }>;
}

export function createSettlementService(apiClient: SettlementApiClient) {
  return {
    getCrewSettlementSummary: (crewId: number) =>
      apiClient.get<CrewSettlementSummary>(`/crews/${crewId}/settlement`),

    getSettlementDetail: (settlementId: number) =>
      apiClient.get<SettlementDetail>(`/settlements/${settlementId}`),

    getSettlementMe: (settlementId: number) =>
      apiClient.get<SettlementMe>(`/settlements/${settlementId}/me`),
  };
}

const settlementService = createSettlementService(api as unknown as SettlementApiClient);

export const getCrewSettlementSummary = settlementService.getCrewSettlementSummary;

export const getSettlementDetail = settlementService.getSettlementDetail;

export const getSettlementMe = settlementService.getSettlementMe;
