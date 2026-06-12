import { api } from '@/lib/axios';
import type { CrewSettlementSummary, SettlementDetail } from '@/types/domain';

export const getCrewSettlementSummary = (crewId: number) => {
  return api.get<CrewSettlementSummary>(`/crews/${crewId}/settlement`);
};

export const getSettlementDetail = (settlementId: number) => {
  return api.get<SettlementDetail>(`/settlements/${settlementId}`);
};
