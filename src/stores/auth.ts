import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '@/lib/api';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: true,

      login: async (email: string, password: string) => {
        const response = await api.post('/auth/login', { email, password });
        const { user, token } = response.data;
        
        localStorage.setItem('token', token);
        set({ user, token, isLoading: false });
      },

      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null });
        window.location.href = '/login';
      },

      checkAuth: async () => {
        const token = localStorage.getItem('token');
        if (!token) {
          set({ isLoading: false });
          return;
        }

        try {
          const response = await api.get('/auth/me');
          set({ user: response.data, token, isLoading: false });
        } catch {
          localStorage.removeItem('token');
          set({ user: null, token: null, isLoading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);
