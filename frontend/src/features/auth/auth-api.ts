import apiClient, { tokenManager } from '@/lib/api-client';
import type { 
  AuthResponse, 
  LoginRequest, 
  RegisterRequest, 
  User 
} from '@/types';

export const authApi = {
  // Login user
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    console.log('Login API call to:', '/api/auth/login');
    const response = await apiClient.post<{ token: string; username: string }>('/api/auth/login', credentials);
    console.log('Login API response:', response.data);
    tokenManager.set(response.data.token);
    
    // Construct user object from response
    const user: User = {
      id: 0, // Will be extracted from token
      username: response.data.username,
      email: '', // Not provided by backend
      createdAt: new Date().toISOString(),
    };
    
    console.log('Constructed user:', user);
    return {
      token: response.data.token,
      username: response.data.username,
      user,
    };
  },

  // Register new user
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    console.log('Register API call to:', '/api/auth/register', 'with data:', { username: data.username, email: data.email });
    const response = await apiClient.post<{ token: string; username: string }>('/api/auth/register', data);
    console.log('Register API response:', response.data);
    tokenManager.set(response.data.token);
    
    // Construct user object from response
    const user: User = {
      id: 0, // Will be extracted from token
      username: response.data.username,
      email: data.email,
      createdAt: new Date().toISOString(),
    };
    
    console.log('Constructed user:', user);
    return {
      token: response.data.token,
      username: response.data.username,
      user,
    };
  },

  // Get current user profile
  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<User>('/api/auth/me');
    return response.data;
  },

  // Logout
  logout: (): void => {
    tokenManager.clear();
    window.location.href = '/login';
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return tokenManager.get() !== null;
  },
};
