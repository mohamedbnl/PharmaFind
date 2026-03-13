'use client';
import { createContext, useState, useEffect, useCallback } from 'react';
import { api, setAccessToken, clearTokens } from '@/lib/api';

interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  licenseNumber: string;
  role: string;
  isVerified: boolean;
}

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  licenseNumber: string;
}

export const AuthContext = createContext<AuthState>({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount, attempt to restore session via refresh token
  useEffect(() => {
    const restore = async () => {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) { setIsLoading(false); return; }
      try {
        const { data } = await api.post('/auth/refresh', { refreshToken });
        setAccessToken(data.data.accessToken);
        localStorage.setItem('refresh_token', data.data.refreshToken);
        const me = await api.get('/auth/me');
        setUser(me.data.data);
      } catch {
        clearTokens();
      } finally {
        setIsLoading(false);
      }
    };
    restore();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    setAccessToken(data.data.accessToken);
    localStorage.setItem('refresh_token', data.data.refreshToken);
    setUser(data.data.user);
  }, []);

  const register = useCallback(async (input: RegisterData) => {
    const { data } = await api.post('/auth/register', input);
    setAccessToken(data.data.accessToken);
    localStorage.setItem('refresh_token', data.data.refreshToken);
    setUser(data.data.user);
  }, []);

  const logout = useCallback(async () => {
    try { await api.post('/auth/logout'); } catch { /* ignore */ }
    clearTokens();
    if (typeof window !== 'undefined') localStorage.removeItem('pharmacyId');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!user, isLoading, user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
