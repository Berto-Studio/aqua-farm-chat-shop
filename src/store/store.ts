import { create } from "zustand";
import { persist } from "zustand/middleware";
import Cookies from "js-cookie";

const ACCESS_TOKEN_COOKIE = "access_token";
const REFRESH_CSRF_COOKIE = "refresh_csrf_token";
const LEGACY_REFRESH_CSRF_COOKIE = "csrf_refresh_token";
const ACCESS_TOKEN_STORAGE_KEY = "access_token";
const USER_VALIDATION_TTL_MS = 1000 * 60 * 5;

let activeUserValidation: Promise<boolean> | null = null;
let activeAuthInitialization: Promise<void> | null = null;

const normalizeUserType = (userType?: string) => {
  if (!userType) return userType;
  if (userType === "worker") return "farmer";
  if (userType === "user") return "consumer";
  return userType;
};

const getRefreshCsrfToken = () => {
  const cookieToken =
    Cookies.get(REFRESH_CSRF_COOKIE) || Cookies.get(LEGACY_REFRESH_CSRF_COOKIE);
  if (cookieToken) return cookieToken;

  try {
    return (
      localStorage.getItem(REFRESH_CSRF_COOKIE) ||
      localStorage.getItem(LEGACY_REFRESH_CSRF_COOKIE) ||
      undefined
    );
  } catch {
    return undefined;
  }
};

const getAccessToken = () => {
  const cookieToken = Cookies.get(ACCESS_TOKEN_COOKIE);
  if (cookieToken) return cookieToken;

  try {
    return localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY) || undefined;
  } catch {
    return undefined;
  }
};

const hasActiveSession = () => {
  return Boolean(getAccessToken() || getRefreshCsrfToken());
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

type ValidateUserOptions = {
  force?: boolean;
};

type UserState = {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  hasHydrated: boolean;
  authInitialized: boolean;
  lastValidatedAt: number | null;
  setUser: (user: User) => void;
  setIsLoggedIn: (state: boolean) => void;
  setLoading: (loading: boolean) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
  logout: () => void;
  checkAuthStatus: () => boolean;
  validateUser: (options?: ValidateUserOptions) => Promise<boolean>;
  initializeAuth: () => Promise<void>;
};

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoggedIn: false,
      isLoading: false,
      hasHydrated: false,
      authInitialized: false,
      lastValidatedAt: null,
      setUser: (user) =>
        set({
          user,
          isLoggedIn: true,
          isLoading: false,
          authInitialized: true,
          lastValidatedAt: Date.now(),
        }),
      setIsLoggedIn: (isLoggedIn) => set({ isLoggedIn }),
      setLoading: (isLoading) => set({ isLoading }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
      logout: () => {
        Cookies.remove(ACCESS_TOKEN_COOKIE);
        Cookies.remove(REFRESH_CSRF_COOKIE);
        Cookies.remove(LEGACY_REFRESH_CSRF_COOKIE);
        try {
          localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
          localStorage.removeItem(REFRESH_CSRF_COOKIE);
          localStorage.removeItem(LEGACY_REFRESH_CSRF_COOKIE);
        } catch {
          // Ignore storage errors in private browsing / restricted environments.
        }
        set({
          user: null,
          isLoggedIn: false,
          isLoading: false,
          authInitialized: true,
          lastValidatedAt: null,
        });
      },
      checkAuthStatus: () => {
        const { isLoggedIn } = get();
        const sessionExists = hasActiveSession();

        if (!sessionExists && isLoggedIn) {
          // No access token and no refresh CSRF means the session cannot be renewed.
          get().logout();
          return false;
        }

        return sessionExists && isLoggedIn;
      },
      validateUser: async (options?: ValidateUserOptions) => {
        const { user, logout, lastValidatedAt } = get();
        const shouldForceValidation = options?.force ?? false;

        if (!hasActiveSession()) {
          logout();
          return false;
        }

        if (
          !shouldForceValidation &&
          user &&
          lastValidatedAt &&
          Date.now() - lastValidatedAt < USER_VALIDATION_TTL_MS
        ) {
          return true;
        }

        if (activeUserValidation) {
          return activeUserValidation;
        }

        set({ isLoading: true });

        activeUserValidation = (async () => {
          try {
            const { getAuthMe } = await import("@/services/auth/me");
            const response = await getAuthMe();

            if (!response.success || !response.data) {
              logout();
              return false;
            }

            const currentUser = get().user;
            set({
              user: {
                ...currentUser,
                id: String(response.data.id),
                email: response.data.email,
                full_name: response.data.full_name,
                user_type: normalizeUserType(response.data.user_type),
                is_admin: Boolean(response.data.is_admin),
              },
              isLoggedIn: true,
              lastValidatedAt: Date.now(),
            });

            return true;
          } catch (error) {
            console.error("User validation failed:", error);
            logout();
            return false;
          } finally {
            set({ isLoading: false });
            activeUserValidation = null;
          }
        })();

        return activeUserValidation;
      },
      initializeAuth: async () => {
        const { authInitialized, hasHydrated } = get();
        if (authInitialized || !hasHydrated) {
          return;
        }

        if (activeAuthInitialization) {
          return activeAuthInitialization;
        }

        activeAuthInitialization = (async () => {
          if (!hasActiveSession()) {
            set({
              user: null,
              isLoggedIn: false,
              isLoading: false,
              authInitialized: true,
              lastValidatedAt: null,
            });
            return;
          }

          await get().validateUser({ force: true });
          set({ authInitialized: true });
        })().finally(() => {
          activeAuthInitialization = null;
        });

        return activeAuthInitialization;
      },
    }),
    {
      name: "user-storage",
      partialize: (state) => ({
        user: state.user,
        isLoggedIn: state.isLoggedIn,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error("Failed to rehydrate user store:", error);
        }
        state?.setHasHydrated(true);
      },
    }
  )
);
