import { create } from 'zustand';
import { User, AuthResponse } from '../types';

interface AuthState {
  accessToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (authData: AuthResponse) => void;
  setAccessToken: (token: string | null) => void;
  logout: () => void;
  setUser: (user: User) => void;
}

const STORAGE_KEY_USER = 'expensetracker_user';

const getInitialState = () => {
  // Clean up legacy insecure storage tokens if present from previous sessions
  try {
    localStorage.removeItem('expensetracker_token');
    localStorage.removeItem('expensetracker_refresh_token');
    const userStr = localStorage.getItem(STORAGE_KEY_USER);
    const user = userStr ? (JSON.parse(userStr) as User) : null;
    return {
      accessToken: null, // Keep access token strictly in-memory
      user: user,
      isAuthenticated: Boolean(user),
    };
  } catch {
    return {
      accessToken: null,
      user: null,
      isAuthenticated: false,
    };
  }
};

export const useAuthStore = create<AuthState>((set) => ({
  ...getInitialState(),

  login: (authData: AuthResponse) => {
    if (authData.user) {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(authData.user));
    }

    set({
      accessToken: authData.accessToken,
      user: authData.user || null,
      isAuthenticated: true,
    });
  },

  setAccessToken: (token: string | null) => {
    set({
      accessToken: token,
      isAuthenticated: Boolean(token || localStorage.getItem(STORAGE_KEY_USER)),
    });
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEY_USER);
    localStorage.removeItem('expensetracker_token');
    localStorage.removeItem('expensetracker_refresh_token');

    set({
      accessToken: null,
      user: null,
      isAuthenticated: false,
    });
  },

  setUser: (user: User) => {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    set({ user, isAuthenticated: true });
  },
}));
