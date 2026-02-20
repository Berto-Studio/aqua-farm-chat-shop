import { useEffect } from "react";
import { useUserStore } from "@/store/store";

export default function AuthBootstrap() {
  const hasHydrated = useUserStore((state) => state.hasHydrated);
  const authInitialized = useUserStore((state) => state.authInitialized);
  const initializeAuth = useUserStore((state) => state.initializeAuth);

  useEffect(() => {
    if (!hasHydrated || authInitialized) {
      return;
    }

    void initializeAuth();
  }, [hasHydrated, authInitialized, initializeAuth]);

  return null;
}
