import { create } from 'zustand';
import { User, AuthResponse } from '../types';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (authData: AuthResponse) => void;
  setAccessToken: (token: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
}

const STORAGE_KEY_TOKEN = 'expensetracker_token';
const STORAGE_KEY_REFRESH = 'expensetracker_refresh_token';
const STORAGE_KEY_USER = 'expensetracker_user';

const getInitialState = () => {
  try {
    const token = localStorage.getItem(STORAGE_KEY_TOKEN);
    const refreshToken = localStorage.getItem(STORAGE_KEY_REFRESH);
    const userStr = localStorage.getItem(STORAGE_KEY_USER);
    const user = userStr ? (JSON.parse(userStr) as User) : null;
    return {
      accessToken: token,
      refreshToken: refreshToken,
      user: user,
      isAuthenticated: Boolean(token),
    };
  } catch {
    return {
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
    };
  }
};

export const useAuthStore = create<AuthState>((set) => ({
  ...getInitialState(),

  login: (authData: AuthResponse) => {
    localStorage.setItem(STORAGE_KEY_TOKEN, authData.accessToken);
    if (authData.refreshToken) {
      localStorage.setItem(STORAGE_KEY_REFRESH, authData.refreshToken);
    }
    if (authData.user) {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(authData.user));
    }

    set({
      accessToken: authData.accessToken,
      refreshToken: authData.refreshToken || null,
      user: authData.user || null,
      isAuthenticated: true,
    });
  },

  setAccessToken: (token: string) => {
    localStorage.setItem(STORAGE_KEY_TOKEN, token);
    set({ accessToken: token });
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    localStorage.removeItem(STORAGE_KEY_REFRESH);
    localStorage.removeItem(STORAGE_KEY_USER);

    set({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
    });
  },

  setUser: (user: User) => {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    set({ user });
  },
}));
