import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { api } from '../services/api';
import { AuthResponse } from '@chrono/shared';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, name: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setTokenFromOAuth: (token: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleAuthResponse = useCallback(async (response: AuthResponse) => {
    await api.setToken(response.accessToken);
    setUser(response.user);
  }, []);

  useEffect(() => {
    async function bootstrap() {
      await api.init();
      const token = await api.getToken();
      if (token) {
        try {
          const me = await api.me();
          setUser(me);
        } catch {
          await api.setToken(null);
        }
      }
      setIsLoading(false);
    }
    bootstrap();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.login(email, password);
    await handleAuthResponse(response);
  };

  const register = async (email: string, name: string, password: string) => {
    const response = await api.register(email, name, password);
    await handleAuthResponse(response);
  };

  const logout = async () => {
    await api.setToken(null);
    setUser(null);
  };

  const setTokenFromOAuth = async (token: string) => {
    await api.setToken(token);
    const me = await api.me();
    setUser(me);
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, register, logout, setTokenFromOAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}
