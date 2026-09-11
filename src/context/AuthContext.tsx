import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { UserProfile } from '../types.ts';
import { api } from '../services/api.ts';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  isAdmin: boolean;
  isConfigured: boolean;
  adminEmail: string | null;
  checkAuthStatus: () => Promise<void>;
  setupAdmin: (email: string, pass: string, confirmPass: string) => Promise<{ recoveryCode: string }>;
  login: (u: string, p: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'aitechhub_admin_token';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem(TOKEN_KEY) || localStorage.getItem('novatech_admin_token')
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isConfigured, setIsConfigured] = useState<boolean>(false);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);

  const checkAuthStatus = async () => {
    try {
      const status = await api.getAuthStatus();
      setIsConfigured(status.isConfigured);
      setAdminEmail(status.adminEmail || null);
    } catch (err) {
      console.error('Failed to check auth status', err);
    }
  };

  useEffect(() => {
    async function init() {
      await checkAuthStatus();
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const data = await api.getMe(token);
        setUser(data.user);
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, [token]);

  const setupAdmin = async (email: string, pass: string, confirmPass: string) => {
    const res = await api.setupAdmin(email, pass, confirmPass);
    setUser(res.user);
    setToken(res.token);
    setIsConfigured(true);
    setAdminEmail(res.user.email);
    localStorage.setItem(TOKEN_KEY, res.token);
    return { recoveryCode: res.recoveryCode };
  };

  const login = async (username: string, pass: string) => {
    const res = await api.login(username, pass);
    setUser(res.user);
    setToken(res.token);
    setIsConfigured(true);
    localStorage.setItem(TOKEN_KEY, res.token);
  };

  const logout = async () => {
    if (token) {
      try {
        await api.logout(token);
      } catch (e) {
        console.error('Logout error', e);
      }
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem(TOKEN_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAdmin: !!user && user.role === 'admin',
        isConfigured,
        adminEmail,
        checkAuthStatus,
        setupAdmin,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
