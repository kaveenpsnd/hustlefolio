import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from './users-api';
import type { UpdateProfileRequest, ChangePasswordRequest } from '@/types';

// Query Keys
export const userKeys = {
  all: ['users'] as const,
  currentProfile: () => [...userKeys.all, 'me'] as const,
  profile: (username: string) => [...userKeys.all, username] as const,
};

// Get current user's profile
export function useCurrentProfile() {
  return useQuery({
    queryKey: userKeys.currentProfile(),
    queryFn: userApi.getCurrentProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Get user profile by username
export function useUserProfile(username: string) {
  return useQuery({
    queryKey: userKeys.profile(username),
    queryFn: () => userApi.getUserProfile(username),
    enabled: !!username,
    staleTime: 5 * 60 * 1000,
  });
}

// Update profile mutation
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => userApi.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.currentProfile() });
    },
  });
}

// Upload and update profile picture
export function useUpdateProfilePicture() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (file: File) => {
      // First upload the file
      const url = await userApi.uploadProfilePicture(file);
      // Then update the user profile with the URL
      return userApi.updateProfilePicture(url);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.currentProfile() });
    },
  });
}

// Change password mutation
export function useChangePassword() {
  return useMutation({
    mutationFn: (data: ChangePasswordRequest) => userApi.changePassword(data),
  });
}

// Delete account mutation
export function useDeleteAccount() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: userApi.deleteAccount,
    onSuccess: () => {
      queryClient.clear(); // Clear all cached data
    },
  });
}
