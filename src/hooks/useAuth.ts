
import { useEffect } from "react";
import { useUserStore } from "@/store/store";
import { useNavigate } from "react-router-dom";

export const useAuth = () => {
  const { user, isLoggedIn, isLoading, logout, checkAuthStatus, validateUser } =
    useUserStore();
  const navigate = useNavigate();

  // Validate persisted auth state and try refresh flow via auth/me on mount.
  useEffect(() => {
    const validateOnMount = async () => {
      if (!isLoggedIn) return;

      const isValid = await validateUser();
      if (!isValid) {
        navigate("/login");
      }
    };

    validateOnMount();
  }, [isLoggedIn, validateUser, navigate]);

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
