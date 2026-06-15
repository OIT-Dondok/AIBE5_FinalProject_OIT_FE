import { api } from '@/lib/axios';
import type { MissionLogCreateResponse } from '@/types/domain';

export const createMissionLog = (params: {
  crew_id: number;
  image_s3_key: string;
  caption: string;
}) => api.post<MissionLogCreateResponse>('/mission-logs', params);
