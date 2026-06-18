import { api } from '@/lib/axios';
import type { DashboardResponse, GlobalDashboardResponse } from '@/types/domain';

interface DashboardApiClient {
  get: <T>(url: string) => Promise<{ data: T }>;
}

export function createDashboardService(apiClient: DashboardApiClient) {
  return {
    // GET /api/dashboard — 참여 중인 전체 크루 집계
    getDashboard: () => apiClient.get<GlobalDashboardResponse>('/dashboard'),

    // GET /api/crews/{crewId}/dashboard — 특정 크루에서의 내 상세
    getCrewDashboard: (crewId: number) =>
      apiClient.get<DashboardResponse>(`/crews/${crewId}/dashboard`),
  };
}

const dashboardService = createDashboardService(api as unknown as DashboardApiClient);

export const getDashboard = dashboardService.getDashboard;

export const getCrewDashboard = dashboardService.getCrewDashboard;
