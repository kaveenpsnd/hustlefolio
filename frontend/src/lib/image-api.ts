import apiClient from '@/lib/api-client';
import type { ImageUploadResponse } from '@/types';

export const imageApi = {
  // Upload image (for Editor.js)
  uploadImage: async (file: File): Promise<ImageUploadResponse> => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      console.log('Uploading image:', file.name);

      const response = await apiClient.post<ImageUploadResponse>(
        '/api/images/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log('Upload response:', response);
      console.log('Upload response data:', response.data);
      
      return response.data;
    } catch (error: any) {
      console.error('Image upload error:', error);
      console.error('Error response:', error.response);
      throw error;
    }
  },
};
