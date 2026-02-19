import { create } from "zustand";
import { persist } from "zustand/middleware";
import Cookies from "js-cookie";

const normalizeUserType = (userType?: string) => {
  if (!userType) return userType;
  if (userType === "worker") return "farmer";
  if (userType === "user") return "consumer";
  return userType;
};

type User = {
  id: string;
  full_name?: string;
  email?: string;
  role?: string;
  is_active?: boolean;
  username?: string;
  user_type?: string;
  phone_number?: number;
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
        Cookies.remove("refresh_csrf_token");
        try {
          localStorage.removeItem("refresh_csrf_token");
        } catch {
          // Ignore storage errors in private browsing / restricted environments.
        }
        set({ user: null, isLoggedIn: false, isLoading: false });
      },
      checkAuthStatus: () => {
        const token = Cookies.get("access_token");
        const refreshCsrfToken =
          Cookies.get("refresh_csrf_token") ||
          (() => {
            try {
              return localStorage.getItem("refresh_csrf_token");
            } catch {
              return null;
            }
          })();
        const { isLoggedIn } = get();

        if (!token && !refreshCsrfToken && isLoggedIn) {
          // No access token and no refresh CSRF means the session cannot be renewed.
          get().logout();
          return false;
        }

        return isLoggedIn;
      },
      validateUser: async () => {
        const { user, logout } = get();

        try {
          const { getAuthMe } = await import("@/services/auth/me");
          const response = await getAuthMe();

          if (!response.success || !response.data) {
            logout();
            return false;
          }

          set({
            user: {
              ...user,
              id: String(response.data.id),
              email: response.data.email,
              full_name: response.data.full_name,
              user_type: normalizeUserType(response.data.user_type),
              is_admin: Boolean(response.data.is_admin),
            },
            isLoggedIn: true,
          });

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
