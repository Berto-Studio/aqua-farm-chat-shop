
import { create } from "zustand";
import { persist } from "zustand/middleware";
import Cookies from "js-cookie";

type User = {
  id: string;
  name: string;
  email: string;
  role?: string;
};

type UserState = {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  setUser: (user: User) => void;
  setIsLoggedIn: (state: boolean) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
  checkAuthStatus: () => boolean;
};

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoggedIn: false,
      isLoading: false,
      setUser: (user) => set({ user, isLoggedIn: true, isLoading: false }),
      setIsLoggedIn: (isLoggedIn) => set({ isLoggedIn }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: () => {
        Cookies.remove("access_token");
        set({ user: null, isLoggedIn: false, isLoading: false });
      },
      checkAuthStatus: () => {
        const token = Cookies.get("access_token");
        const { isLoggedIn } = get();
        
        if (!token && isLoggedIn) {
          // Token expired but store shows logged in - logout
          get().logout();
          return false;
        }
        
        return !!token && isLoggedIn;
      },
    }),
    {
      name: "user-storage",
      partialize: (state) => ({
        user: state.user,
        isLoggedIn: state.isLoggedIn,
      }),
    }
  )
);
