import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'user' | 'admin';
  phone_verified?: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isDarkMode: boolean;
  setSession: (user: User, token: string) => void;
  clearSession: () => void;
  setDarkMode: (isDark: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isDarkMode: false,
      setSession: (user, token) => set({ user, token, isAuthenticated: true }),
      clearSession: () => set({ user: null, token: null, isAuthenticated: false }),
      setDarkMode: (isDark) => set({ isDarkMode: isDark }),
    }),
    {
      name: 'survexa-auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
