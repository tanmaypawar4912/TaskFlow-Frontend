import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { User } from '../types';
import { getCurrentUser, googleLoginUser, loginUser, logoutUser, registerUser, updateProfile } from '../services/authService';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (data: { email: string; password: string }) => Promise<void>;
  register: (data: { name: string; email: string; password: string }) => Promise<void>;
  googleLogin: (credential: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  saveProfile: (data: { name: string; avatar?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try { setUser(await getCurrentUser()); }
    catch { setUser(null); }
  }, []);

  useEffect(() => { refreshUser().finally(() => setLoading(false)); }, [refreshUser]);

  const login = async (data: { email: string; password: string }) => {
    const result = await loginUser(data);
    if (!result.success || !result.data) throw new Error(result.message || 'Login failed');
    setUser(result.data.user);
  };

  const register = async (data: { name: string; email: string; password: string }) => {
    const result = await registerUser(data);
    if (!result.success || !result.data) throw new Error(result.message || 'Registration failed');
    setUser(result.data.user);
  };

  const googleLogin = async (credential: string) => {
    const result = await googleLoginUser(credential);
    if (!result.success || !result.data) throw new Error(result.message || 'Google sign-in failed');
    setUser(result.data.user);
  };

  const logout = async () => { try { await logoutUser(); } finally { setUser(null); } };

  const saveProfile = async (data: { name: string; avatar?: string }) => {
    const updated = await updateProfile(data);
    setUser(updated);
  };

  const value = useMemo(() => ({ user, loading, isAuthenticated: Boolean(user), login, register, googleLogin, logout, refreshUser, saveProfile }), [user, loading, refreshUser]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
