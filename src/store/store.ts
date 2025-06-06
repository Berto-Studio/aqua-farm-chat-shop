
import { create } from "zustand";
import { persist } from "zustand/middleware";

type User = {
  id: string;
  name: string;
  email: string;
  role?: string;
};

type UserState = {
  user: User | null;
  isLoggedIn: boolean;
  setUser: (user: User) => void;
  setIsLoggedIn: (state: boolean) => void;
  logout: () => void;
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      isLoggedIn: false,
      setUser: (user) => set({ user, isLoggedIn: true }),
      setIsLoggedIn: (isLoggedIn) => set({ isLoggedIn }),
      logout: () => set({ user: null, isLoggedIn: false }),
    }),
    {
      name: "user-storage", // unique name for localStorage key
      partialize: (state) => ({ 
        user: state.user, 
        isLoggedIn: state.isLoggedIn 
      }), // only persist user and isLoggedIn
    }
  )
);
