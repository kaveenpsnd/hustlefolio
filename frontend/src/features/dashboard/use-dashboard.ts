import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from './dashboard-api';

// Query keys
export const dashboardKeys = {
  byUsername: (username: string) => ['dashboard', username] as const,
};

// Hook to get dashboard data
export function useDashboard(username: string) {
  return useQuery({
    queryKey: dashboardKeys.byUsername(username),
    queryFn: () => dashboardApi.getDashboard(username),
    enabled: !!username,
    staleTime: 0, // Always consider data stale for immediate refetch
    gcTime: 0, // Don't cache - always fetch fresh
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}
