import apiClient from '@/lib/api-client';

export interface Category {
  id: number;
  name: string;
  description: string;
  slug: string;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
}

export interface GoalCategory {
  id: number;
  name: string;
  description: string;
  slug: string;
}

export const categoriesApi = {
  // Get all post categories
  getPostCategories: async (): Promise<Category[]> => {
    const response = await apiClient.get<Category[]>('/api/categories');
    return response.data;
  },

  // Get all tags
  getTags: async (): Promise<Tag[]> => {
    const response = await apiClient.get<Tag[]>('/api/tags');
    return response.data;
  },

  // Get all goal categories
  getGoalCategories: async (): Promise<GoalCategory[]> => {
    const response = await apiClient.get<GoalCategory[]>('/api/goal-categories');
    return response.data;
  },
};
