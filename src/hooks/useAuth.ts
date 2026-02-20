import { useUserStore } from "@/store/store";

export const useAuth = () => {
  const user = useUserStore((state) => state.user);
  const isLoggedIn = useUserStore((state) => state.isLoggedIn);
  const isLoading = useUserStore((state) => state.isLoading);
  const logout = useUserStore((state) => state.logout);
  const checkAuthStatus = useUserStore((state) => state.checkAuthStatus);
  const validateUser = useUserStore((state) => state.validateUser);

  const isAuthenticated = () => {
    return checkAuthStatus();
  };

  return {
    user,
    isLoggedIn,
    isLoading,
    isAuthenticated,
    logout,
    validateUser,
  };
};
