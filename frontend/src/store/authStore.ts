
import { create } from 'zustand';
import { apiClient } from '../lib/api';

export interface User {
  id: string;
  email: string;
  name?: string;
  username?: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  logout: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => {
  // Read from localStorage synchronously for initial state
  let user: User | null = null;
  let token: string | null = null;
  let isAuthenticated = false;
  if (typeof window !== 'undefined') {
    const savedToken = localStorage.getItem('auth_token');
    const savedUser = localStorage.getItem('auth_user');
    if (savedToken && savedUser) {
      try {
        user = JSON.parse(savedUser);
        token = savedToken;
        isAuthenticated = !!user && !!token;
      } catch (e) {
        user = null;
        token = null;
        isAuthenticated = false;
      }
    }
  }

  return {
    user,
    token,
    isLoading: false,
    isAuthenticated,
    setUser: (user: User | null) => set((state) => ({
      user,
      isAuthenticated: !!user && !!state.token,
    })),
    setToken: (token: string | null) => set((state) => ({
      token,
      isAuthenticated: !!state.user && !!token,
    })),
    setIsLoading: (isLoading: boolean) => set(() => ({ isLoading })),
    logout: () => {
      set(() => ({ user: null, token: null, isAuthenticated: false }));
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      localStorage.removeItem('demo-token');
      localStorage.removeItem('demo-user');
    },
    login: async (email: string, password: string) => {
      set(() => ({ isLoading: true }));
      try {
        console.log("Calling apiClient.login", email);
        const data = await apiClient.login(email, password);
        console.log("apiClient.login result", data);
        set(() => ({ user: data.user, token: data.token, isAuthenticated: !!data.user && !!data.token }));
        if (data.token !== 'demo-token') {
          localStorage.setItem('auth_token', data.token);
          localStorage.setItem('auth_user', JSON.stringify(data.user));
        }
      } catch (error) {
        throw error;
      } finally {
        set(() => ({ isLoading: false }));
      }
    },
    register: async (email: string, password: string, name?: string) => {
      set(() => ({ isLoading: true }));
      try {
        const data = await apiClient.register(email, password, name ?? '');
        set(() => ({ user: data.user, token: data.token, isAuthenticated: !!data.user && !!data.token }));
        if (data.token !== 'demo-token') {
          localStorage.setItem('auth_token', data.token);
          localStorage.setItem('auth_user', JSON.stringify(data.user));
        }
      } catch (error) {
        throw error;
      } finally {
        set(() => ({ isLoading: false }));
      }
    },
  };
});
