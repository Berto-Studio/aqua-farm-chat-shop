
import { useEffect } from "react";
import { useUserStore } from "@/store/store";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

export const useAuth = () => {
  const { user, isLoggedIn, isLoading, setUser, logout, checkAuthStatus, validateUser } = useUserStore();
  const navigate = useNavigate();

  // Auto-logout if token is missing but user is marked as logged in
  useEffect(() => {
    const token = Cookies.get("access_token");
    if (isLoggedIn && !token) {
      logout();
      navigate("/login");
    }
  }, [isLoggedIn, logout, navigate]);

  // Validate user on mount
  useEffect(() => {
    const validateOnMount = async () => {
      if (isLoggedIn && user) {
        const isValid = await validateUser();
        if (!isValid) {
          navigate("/login");
        }
      }
    };

    validateOnMount();
  }, [isLoggedIn, user, validateUser, navigate]);

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
