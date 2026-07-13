import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AdminUser } from '../types';
import api from '../lib/api';

interface AuthState {
  user: AdminUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      login: async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password });
        localStorage.setItem('exotic_admin_token', data.access_token);
        localStorage.setItem('exotic_admin_refresh', data.refresh_token);
        await get().checkAuth();
      },

      logout: () => {
        localStorage.removeItem('exotic_admin_token');
        localStorage.removeItem('exotic_admin_refresh');
        set({ user: null, isAuthenticated: false });
      },

      checkAuth: async () => {
        const token = localStorage.getItem('exotic_admin_token');
        if (!token) {
          set({ user: null, isAuthenticated: false });
          return;
        }
        try {
          const { data } = await api.get('/auth/me');
          set({ user: data, isAuthenticated: true });
        } catch {
          set({ user: null, isAuthenticated: false });
        }
      },
    }),
    {
      name: 'exotic-auth',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
