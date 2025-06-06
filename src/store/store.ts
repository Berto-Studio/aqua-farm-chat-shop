import { create } from "zustand";

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

export const useUserStore = create<UserState>((set) => ({
  user: null,
  isLoggedIn: false,
  setUser: (user) => set({ user, isLoggedIn: true }),
  setIsLoggedIn: (isLoggedIn) => set({ isLoggedIn }),
  logout: () => set({ user: null, isLoggedIn: false }),
}));
