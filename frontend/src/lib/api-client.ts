import axios, { AxiosError } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import type { APIError } from '@/types';

// Base API configuration
const BASE_URL = '/api';

// Create axios instance
export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Token management
const TOKEN_KEY = 'streak_auth_token';

export const tokenManager = {
  get: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },
  set: (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
  },
  clear: (): void => {
    localStorage.removeItem(TOKEN_KEY);
  },
};

// Request interceptor - Inject JWT token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Don't add token to auth endpoints (login/register)
    const isAuthEndpoint = config.url?.includes('/api/auth/login') || 
                          config.url?.includes('/api/auth/register');
    
    if (!isAuthEndpoint) {
      const token = tokenManager.get();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle 401/403 errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<APIError>) => {
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });

    // Handle authentication errors - but only for actual auth failures
    // Don't clear token for 404 or other errors
    if (error.response?.status === 401) {
      console.error('401 Unauthorized - clearing token and redirecting to login');
      tokenManager.clear();
      
      // Only redirect if not already on login/register page
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
      }
    } else if (error.response?.status === 403) {
      console.error('403 Forbidden - access denied');
      // Don't clear token for 403 - user might be authenticated but not authorized
    }

    // Return the original error to preserve response data
    return Promise.reject(error);
  }
);

export default apiClient;
