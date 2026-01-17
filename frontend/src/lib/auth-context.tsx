import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { tokenManager } from '@/lib/api-client';
import type { User } from '@/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Function to extract user from token
  const getUserFromToken = useCallback(() => {
    const token = tokenManager.get();
    if (!token) return null;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('JWT Payload:', payload);
      console.log('JWT Payload keys:', Object.keys(payload));
      console.log('JWT sub:', payload.sub);
      console.log('JWT username:', payload.username);
      
      const username = payload.sub || payload.username || '';
      console.log('Extracted username:', username);
      console.log('Username type:', typeof username);
      console.log('Username length:', username?.length);
      
      if (username) {
        return {
          id: payload.userId || payload.id || 0,
          username: username,
          email: payload.email || '',
          createdAt: new Date().toISOString(),
        };
      }
    } catch (error) {
      console.error('Failed to decode token:', error);
      tokenManager.clear();
    }
    return null;
  }, []);

  useEffect(() => {
    // Check if user is logged in on mount
    const userData = getUserFromToken();
    if (userData) {
      console.log('Setting user from token:', userData);
      setUser(userData);
    } else {
      console.log('No valid user found in token');
    }
    setIsLoading(false);
  }, [getUserFromToken]);

  const login = useCallback((userData: User) => {
    console.log('AuthContext login called with:', userData);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    tokenManager.clear();
  }, []);

  // Check authentication based on both user state AND token existence
  const isAuthenticated = !!user || !!tokenManager.get();

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
