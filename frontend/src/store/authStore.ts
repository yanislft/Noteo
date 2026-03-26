import { create } from 'zustand';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  hydrated: boolean;
  setAuth: (user: User, token: string) => void;
  setUser: (user: User) => void;
  setHydrated: () => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  hydrated: false,
  setAuth: (user, token) => {
    localStorage.setItem('token', token);
    set({ user, token, hydrated: true });
  },
  setUser: (user) => set({ user }),
  setHydrated: () => set({ hydrated: true }),
  clearAuth: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, hydrated: true });
  },
}));
