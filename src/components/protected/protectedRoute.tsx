import { useUserStore } from "@/store/store";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({
  children,
}: {
  children: JSX.Element;
}) {
  const isLoggedIn = useUserStore((state) => state.isLoggedIn);
  const isLoading = useUserStore((state) => state.isLoading);
  const hasHydrated = useUserStore((state) => state.hasHydrated);
  const authInitialized = useUserStore((state) => state.authInitialized);

  if (!hasHydrated || !authInitialized || isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
      </div>
    );
  }

  return isLoggedIn ? children : <Navigate to="/login" replace />;
}
