import { api } from '@/lib/axios';
import type {
  CrewListResponse,
  CrewDetail,
  CreateCrewRequest,
  ParticipantApplyResponse,
  ParticipantCancelResponse,
  CrewMembersResponse,
  CrewNotice,
  CrewNoticesResponse,
  NoticeReactionResponse,
  NoticeComment,
  NoticeCommentsResponse,
  MyCrewsResponse,
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
  return api.get<CrewMembersResponse>(`/crews/${crewId}/members`, {
    params: cursor ? { cursor } : undefined,
  });
};

export const getCrewNotices = (crewId: number, cursor?: string) => {
  return api.get<CrewNoticesResponse>(`/crews/${crewId}/notices`, {
    params: cursor ? { cursor } : undefined,
  });
};

export const createCrewNotice = (crewId: number, data: { title: string; content: string }) => {
  return api.post(`/crews/${crewId}/notices`, data);
};

export const updateCrewNotice = (
  crewId: number,
  noticeId: number,
  data: { title?: string; content?: string },
) => {
  return api.patch(`/crews/${crewId}/notices/${noticeId}`, data);
};

export const deleteCrewNotice = (crewId: number, noticeId: number) => {
  return api.delete(`/crews/${crewId}/notices/${noticeId}`);
};

export const addNoticeReaction = (crewId: number, noticeId: number, reactionType: string) => {
  return api.post<NoticeReactionResponse>(
    `/crews/${crewId}/notices/${noticeId}/reactions`,
    { reaction_type: reactionType },
  );
};

export const removeNoticeReaction = (crewId: number, noticeId: number, reactionType: string) => {
  return api.delete<NoticeReactionResponse>(
    `/crews/${crewId}/notices/${noticeId}/reactions/me`,
    { params: { reaction_type: reactionType } },
  );
};

export const getCrewNoticeDetail = (crewId: number, noticeId: number) =>
  api.get<CrewNotice>(`/crews/${crewId}/notices/${noticeId}`);

export const getNoticeComments = (crewId: number, noticeId: number, cursor?: string) =>
  api.get<NoticeCommentsResponse>(`/crews/${crewId}/notices/${noticeId}/comments`, {
    params: cursor ? { cursor } : undefined,
  });

export const createNoticeComment = (crewId: number, noticeId: number, data: { content: string }) =>
  api.post<NoticeComment>(`/crews/${crewId}/notices/${noticeId}/comments`, data);

export const getMyCrew = (role?: 'ALL' | 'HOST' | 'MEMBER', cursor?: string, signal?: AbortSignal) => {
  return api.get<MyCrewsResponse>('/me/crews', {
    params: {
      ...(role && role !== 'ALL' ? { role } : {}),
      ...(cursor ? { cursor } : {}),
    },
    signal,
  });
};

export const getMyLockedCrews = (signal?: AbortSignal) =>
  api.get<MyCrewsResponse>('/me/crews', { params: { my_status: 'LOCKED' }, signal });
