import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { goalsApi } from './goals-api';
import { useAuth } from '@/lib/auth-context';
import type { GoalCreateRequest } from '@/types';

// Query keys
export const goalKeys = {
  all: ['goals'] as const,
  active: ['goals', 'active'] as const,
  byUser: (username: string) => ['goals', 'user', username] as const,
};

// Hook to get active goal
export function useActiveGoal() {
  return useQuery({
    queryKey: goalKeys.active,
    queryFn: goalsApi.getActiveGoal,
  });
}

// Hook to get all user goals (both active and completed)
export function useUserGoals() {
  const { user } = useAuth();
  
  console.log('useUserGoals - user:', user);
  console.log('useUserGoals - username:', user?.username);
  
  return useQuery({
    queryKey: goalKeys.byUser(user?.username || ''),
    queryFn: () => {
      console.log('useUserGoals - queryFn executing for username:', user?.username);
      return goalsApi.getUserGoals(user?.username || '');
    },
    enabled: !!user?.username,
    staleTime: 0, // Always fetch fresh data
    gcTime: 0, // Don't cache
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}

// Hook to get goal by ID
export function useGoal(goalId: number, username: string) {
  return useQuery({
    queryKey: ['goal', goalId, username],
    queryFn: () => goalsApi.getGoalById(goalId, username),
    enabled: !!goalId && !!username,
    staleTime: 0, // Always fetch fresh data
    gcTime: 0, // Don't cache
  });
}

// Hook to create goal
export function useCreateGoal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: GoalCreateRequest) => goalsApi.createGoal(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: goalKeys.active });
      queryClient.invalidateQueries({ queryKey: goalKeys.all });
    },
  });
}
