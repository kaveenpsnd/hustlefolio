import { useQuery } from '@tanstack/react-query';
import { userApi } from '../users/users-api';
import { postsApi } from '../posts/posts-api';
import apiClient from '@/lib/api-client';

// Query keys
export const publicProfileKeys = {
  user: (username: string) => ['public-profile', username] as const,
  posts: (username: string) => ['public-posts', username] as const,
  dashboard: (username: string) => ['public-dashboard', username] as const,
};

// Get public user profile
export function usePublicProfile(username: string) {
  return useQuery({
    queryKey: publicProfileKeys.user(username),
    queryFn: () => userApi.getUserProfile(username),
    enabled: !!username,
  });
}

// Get public user posts
export function usePublicPosts(username: string) {
  return useQuery({
    queryKey: publicProfileKeys.posts(username),
    queryFn: () => postsApi.getPostsByUser(username),
    enabled: !!username,
  });
}

// Get user dashboard data (goals, streaks, etc)
export function usePublicDashboard(username: string) {
  return useQuery({
    queryKey: publicProfileKeys.dashboard(username),
    queryFn: async () => {
      const response = await apiClient.get(`/api/goals/dashboard/${username}`);
      return response.data;
    },
    enabled: !!username,
  });
}
