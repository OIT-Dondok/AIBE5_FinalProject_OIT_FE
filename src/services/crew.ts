import { api } from '@/lib/axios';
import type {
  CrewListResponse,
  CrewDetail,
  CreateCrewRequest,
  ParticipantApplyResponse,
  ParticipantCancelResponse,
  CrewMembersResponse,
} from '@/types/domain';

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

export const joinCrew = (crewId: number) => {
  return api.post<ParticipantApplyResponse>(`/crews/${crewId}/participants`);
};

export const cancelJoinCrew = (crewId: number) => {
  return api.delete<ParticipantCancelResponse>(`/crews/${crewId}/participants/me`);
};

export const getCrewMembers = (crewId: number, cursor?: string) => {
  return api.get<CrewMembersResponse>(`/crews/${crewId}/member`, {
    params: cursor ? { cursor } : undefined,
  });
};
