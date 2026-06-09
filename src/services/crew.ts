import { api } from '@/lib/axios';
import type { CrewListResponse, CrewDetail, CreateCrewRequest } from '@/types/domain';

export const getCrews = (params?: {
  status?: string;
  category?: string;
  keyword?: string;
  cursor?: string;
  limit?: number;
}) => {
  return api.get<CrewListResponse>('/crews', { params });
};

export const getCrew = (crewId: number) => {
  return api.get<CrewDetail>(`/crews/${crewId}`);
};

export const createCrew = (crewData: CreateCrewRequest) => {
  return api.post('/crews', crewData);
};
