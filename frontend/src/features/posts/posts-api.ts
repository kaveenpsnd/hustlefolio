import { apiClient } from '@/lib/api-client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  Post,
  PostCreateRequest,
  PostUpdateRequest,
} from '@/types';

export const postsApi = {
  // Get all posts (public)
  getAllPosts: async (): Promise<Post[]> => {
    const response = await apiClient.get<Post[]>('/api/posts');
    return response.data;
  },
  
  // Get all posts sorted by latest (public)
  getPublicPosts: async (): Promise<Post[]> => {
    const response = await apiClient.get<Post[]>('/api/posts/public/latest');
    return response.data;
  },

  // Get post by ID
  getPostById: async (id: number): Promise<Post> => {
    const response = await apiClient.get<Post>(`/api/posts/${id}`);
    const post = response.data;
    
    // Parse content if it's a string
    if (typeof post.content === 'string' && post.content.trim().startsWith('{')) {
      try {
        post.content = JSON.parse(post.content);
      } catch (parseError) {
        // If parsing fails, create a default EditorJS structure
        post.content = {
          blocks: [{
            type: 'paragraph',
            data: { text: 'Content unavailable' }
          }]
        };
      }
    } else if (typeof post.content === 'string') {
      // Content is not JSON, wrap it in EditorJS format
      post.content = {
        blocks: [{
          type: 'paragraph',
          data: { text: post.content }
        }]
      };
    }
    return post;
  },

  // Get post by slug
  getPostBySlug: async (slug: string): Promise<Post> => {
    const response = await apiClient.get<Post>(`/api/posts/slug/${slug}`);
    return response.data;
  },

  // Get posts by user
  getPostsByUser: async (username: string): Promise<Post[]> => {
    const response = await apiClient.get<Post[]>(`/api/posts/user/${username}`);
    return response.data;
  },

  // Get posts by goal ID
  getPostsByGoal: async (goalId: number): Promise<Post[]> => {
    const response = await apiClient.get<Post[]>(`/api/posts/goal/${goalId}`);
    return response.data;
  },  
  // Get posts by category ID
  getPostsByCategoryId: async (categoryId: number): Promise<Post[]> => {
    const response = await apiClient.get<Post[]>(`/api/posts/category/${categoryId}`);
    return response.data;
  },
  // Create new post (requires active goal)
  createPost: async (data: PostCreateRequest): Promise<Post> => {
    console.log('Creating post with data:', data);
    console.log('Content type before stringify:', typeof data.content);
    console.log('Content value before stringify:', data.content);
    
    // Backend expects content as JSON string
    const contentString = JSON.stringify(data.content);
    console.log('Content after stringify - type:', typeof contentString);
    console.log('Content after stringify - length:', contentString.length);
    console.log('Content after stringify - first 100 chars:', contentString.substring(0, 100));
    
    const postPayload = {
      title: data.title,
      content: contentString,
      goalId: data.goalId,
      featuredImage: data.featuredImage,
      // authorUsername will be set by backend from JWT token
    };
    
    console.log('Final payload to backend:', postPayload);
    console.log('Payload.content type:', typeof postPayload.content);
    const response = await apiClient.post<Post>('/api/posts', postPayload);
    return response.data;
  },

  // Update post
  updatePost: async (id: number, data: PostUpdateRequest): Promise<Post> => {
    const response = await apiClient.put<Post>(`/api/posts/${id}`, data);
    return response.data;
  },

  // Delete post
  deletePost: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/posts/${id}`);
  },
};

// React Query hooks
export function usePost(id: number) {
  return useQuery({
    queryKey: ['post', id],
    queryFn: () => postsApi.getPostById(id),
    enabled: !!id,
  });
}

export function useUserPosts(username: string) {
  return useQuery({
    queryKey: ['posts', 'user', username],
    queryFn: () => postsApi.getPostsByUser(username),
    enabled: !!username,
    retry: 1,
    staleTime: 30000,
  });
}

export function useGoalPosts(goalId: number) {
  return useQuery({
    queryKey: ['posts', 'goal', goalId],
    queryFn: () => postsApi.getPostsByGoal(goalId),
    enabled: !!goalId,
    retry: 1,
    staleTime: 30000,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: postsApi.createPost,
    onSuccess: () => {
      // Invalidate posts
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      
      // Invalidate all dashboard queries (will match any username)
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      
      // Invalidate all goals queries to refresh streak data
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['goal'] });
      
      // Force immediate refetch of critical data
      queryClient.refetchQueries({ queryKey: ['dashboard'] });
      queryClient.refetchQueries({ queryKey: ['goals'] });
    },
  });
}

export function useUpdatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: PostUpdateRequest }) => 
      postsApi.updatePost(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['post'] });
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: postsApi.deletePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
