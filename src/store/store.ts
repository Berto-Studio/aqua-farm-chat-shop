
import { create } from "zustand";
import { persist } from "zustand/middleware";
import Cookies from "js-cookie";

type User = {
  id: string;
  full_name?: string;
  email?: string;
  role?: string;
  is_active?: boolean;
  username?: string;
  user_type?: string;
  phone?: number;
  address?: string;
  image_url?: string;
  is_admin?: boolean;
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
  validateUser: () => Promise<boolean>;
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
      validateUser: async () => {
        const { user, logout } = get();
        const token = Cookies.get("access_token");
        
        if (!token || !user?.id) {
          logout();
          return false;
        }

        try {
          const { GetUser } = await import("@/services/user");
          const response = await GetUser(user.id);
          
          if (!response.success) {
            logout();
            return false;
          }
          
          return true;
        } catch (error) {
          console.error("User validation failed:", error);
          logout();
          return false;
        }
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
