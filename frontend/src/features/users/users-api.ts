import apiClient from '@/lib/api-client';
import type { 
  UserProfileResponse, 
  UpdateProfileRequest, 
  ChangePasswordRequest 
} from '@/types';

export const userApi = {
  // Get current user's profile
  getCurrentProfile: async (): Promise<UserProfileResponse> => {
    const response = await apiClient.get<UserProfileResponse>('/api/users/me');
    return response.data;
  },

  // Get user profile by username (public view)
  getUserProfile: async (username: string): Promise<UserProfileResponse> => {
    const response = await apiClient.get<UserProfileResponse>(`/api/users/${username}`);
    return response.data;
  },

  // Update current user's profile
  updateProfile: async (data: UpdateProfileRequest): Promise<UserProfileResponse> => {
    const response = await apiClient.put<UserProfileResponse>('/api/users/me', data);
    return response.data;
  },

  // Update profile picture
  updateProfilePicture: async (profilePictureUrl: string): Promise<UserProfileResponse> => {
    const response = await apiClient.put<UserProfileResponse>('/api/users/me/profile-picture', {
      profilePictureUrl
    });
    return response.data;
  },

  // Upload profile picture file
  uploadProfilePicture: async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      console.log('Uploading profile picture:', file.name);

      const response = await apiClient.post<{ url: string }>(
        '/api/profile/upload-picture',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log('Profile picture upload response:', response.data);
      return response.data.url;
    } catch (error: any) {
      console.error('Profile picture upload error:', error);
      throw error;
    }
  },

  // Change password
  changePassword: async (data: ChangePasswordRequest): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>('/api/users/me/change-password', data);
    return response.data;
  },

  // Delete account
  deleteAccount: async (): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>('/api/users/me');
    return response.data;
  },
};
