
import { useEffect } from "react";
import { useUserStore } from "@/store/store";
import Cookies from "js-cookie";

export const useAuth = () => {
  const { user, isLoggedIn, isLoading, setUser, logout, checkAuthStatus } = useUserStore();

  // Auto-logout if token is missing but user is marked as logged in
  useEffect(() => {
    const token = Cookies.get("access_token");
    if (isLoggedIn && !token) {
      logout();
    }
  }, [isLoggedIn, logout]);

  const isAuthenticated = () => {
    return checkAuthStatus();
  };

  return {
    user,
    isLoggedIn,
    isLoading,
    isAuthenticated,
    logout,
  };
};
