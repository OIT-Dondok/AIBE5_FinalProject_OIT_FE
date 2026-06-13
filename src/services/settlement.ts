import { api } from '@/lib/axios';
import type { CrewSettlementSummary, SettlementDetail, SettlementMe } from '@/types/domain';

interface SettlementApiClient {
  get: (url: string) => Promise<{ data: unknown }>;
}

export function createSettlementService(apiClient: SettlementApiClient) {
  return {
    getCrewSettlementSummary: (crewId: number) =>
      apiClient.get(`/crews/${crewId}/settlement`) as Promise<{ data: CrewSettlementSummary }>,

    getSettlementDetail: (settlementId: number) =>
      apiClient.get(`/settlements/${settlementId}`) as Promise<{ data: SettlementDetail }>,

    getSettlementMe: (settlementId: number) =>
      apiClient.get(`/settlements/${settlementId}/me`) as Promise<{ data: SettlementMe }>,
  };
}

const settlementService = createSettlementService(api as unknown as SettlementApiClient);

export const getCrewSettlementSummary = settlementService.getCrewSettlementSummary;

export const getSettlementDetail = settlementService.getSettlementDetail;

export const getSettlementMe = settlementService.getSettlementMe;
