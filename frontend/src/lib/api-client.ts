import axios, { AxiosError } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import type { APIError } from '@/types';

// Base API configuration
// ✅ Point to the new API subdomain
// Base API configuration
// ✅ Point to the new API subdomain
const BASE_URL = 'https://api.hustlefolio.live';

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
    // List of public endpoints that don't need authentication
    // These endpoints are marked as permitAll() in the backend
    const publicEndpointPatterns = [
      '/api/auth/',              // Auth endpoints (login, register)
      '/api/posts/public/',      // Public posts
      '/api/goals/public/',      // Public goals
      '/api/categories',         // Categories (GET)
      '/api/tags',               // Tags (GET)
      '/api/goal-categories',    // Goal categories (GET)
      '/api/images/',            // Images (GET)
      '/api/users/',             // User profiles (GET)
    ];

    // Check if this is a public endpoint
    const isPublicEndpoint = publicEndpointPatterns.some(pattern =>
      config.url?.includes(pattern)
    );

    console.log(`[API Debug] Request to: ${config.url}`, {
      isPublicEndpoint,
      tokenExists: !!tokenManager.get(),
      matches: publicEndpointPatterns.filter(p => config.url?.includes(p))
    });

    // Only add token for protected endpoints
    if (!isPublicEndpoint) {
      const token = tokenManager.get();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } else {
      // Explicitly remove it just in case it crept in
      delete config.headers.Authorization;
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
