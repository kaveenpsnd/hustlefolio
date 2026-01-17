import apiClient from '@/lib/api-client';
import { useQuery } from '@tanstack/react-query';
import type { DashboardDTO } from '@/types';

export const dashboardApi = {
  // Get dashboard data for user
  getDashboard: async (username: string): Promise<DashboardDTO> => {
    console.log('Dashboard API - fetching for username:', username);
    console.log('Username type:', typeof username);
    console.log('Username length:', username.length);
    console.log('Username characters:', username.split('').map((c, i) => `[${i}]=${c} (${c.charCodeAt(0)})`));
    
    const cleanUsername = username.trim();
    console.log('Clean username:', cleanUsername);
    
    const response = await apiClient.get<DashboardDTO>(`/api/goals/dashboard/${cleanUsername}`);
    return response.data;
  },
};

// React Query hook
export function useDashboard(username: string) {
  return useQuery({
    queryKey: ['dashboard', username],
    queryFn: () => dashboardApi.getDashboard(username),
    enabled: !!username,
    staleTime: 0, // Always consider data stale for immediate refetch
    gcTime: 0, // Don't cache - always fetch fresh
  });
}
