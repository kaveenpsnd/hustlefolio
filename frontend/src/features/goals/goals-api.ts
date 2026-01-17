import apiClient from '@/lib/api-client';
import type {
  Goal,
  GoalCreateRequest,
} from '@/types';

export const goalsApi = {
  // Get all goals for current user (both active and completed)
  getUserGoals: async (username: string): Promise<Goal[]> => {
    console.log('getUserGoals - fetching for username:', username);
    // Fetch the full dashboard which includes both active and completed goals
    const response = await apiClient.get<any>(`/api/goals/dashboard/${username}`);
    console.log('getUserGoals - response:', response.data);
    // Combine active and completed goals
    const allGoals = [...(response.data.activeGoals || []), ...(response.data.completedGoals || [])];
    console.log('getUserGoals - count:', allGoals.length);
    return allGoals;
  },
  
  // Get all public goals sorted by latest
  getPublicGoals: async (): Promise<Goal[]> => {
    const response = await apiClient.get<Goal[]>('/api/goals/public/latest');
    return response.data;
  },

  // Get active goal (legacy - might not be used)
  getActiveGoal: async (): Promise<Goal | null> => {
    const response = await apiClient.get<Goal>('/api/goals/active');
    return response.data;
  },

  // Create new goal
  createGoal: async (data: GoalCreateRequest): Promise<Goal> => {
    const response = await apiClient.post<Goal>('/api/goals', data);
    return response.data;
  },

  // Update goal
  updateGoal: async (id: number, data: Partial<GoalCreateRequest>): Promise<Goal> => {
    const response = await apiClient.put<Goal>(`/api/goals/${id}`, data);
    return response.data;
  },

  // Complete goal
  completeGoal: async (id: number): Promise<Goal> => {
    const response = await apiClient.post<Goal>(`/api/goals/${id}/complete`);
    return response.data;
  },

  // Delete goal
  deleteGoal: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/goals/${id}`);
  },

  // Get goal by ID
  getGoalById: async (goalId: number, username: string): Promise<Goal> => {
    const response = await apiClient.get<Goal>(`/api/goals/${goalId}/${username}`);
    return response.data;
  },
};
