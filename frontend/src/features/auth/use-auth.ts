import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/features/auth/auth-api';
import type { LoginRequest, RegisterRequest } from '@/types';

// Query keys
export const authKeys = {
  currentUser: ['auth', 'current-user'] as const,
};

// Hook to get current user
export function useCurrentUser() {
  return useQuery({
    queryKey: authKeys.currentUser,
    queryFn: authApi.getCurrentUser,
    enabled: authApi.isAuthenticated(),
    retry: false,
  });
}

// Hook for login
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginRequest) => authApi.login(credentials),
    onSuccess: (data) => {
      queryClient.setQueryData(authKeys.currentUser, data.user);
    },
  });
}

// Hook for register
export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
    onSuccess: (data) => {
      queryClient.setQueryData(authKeys.currentUser, data.user);
    },
  });
}

// Hook for logout
export function useLogout() {
  const queryClient = useQueryClient();

  return () => {
    authApi.logout();
    queryClient.clear();
  };
}
