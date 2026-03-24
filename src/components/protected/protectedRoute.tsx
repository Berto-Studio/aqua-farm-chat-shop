import { useUserStore } from "@/store/store";
import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({
  children,
  requireAdmin = false,
}: {
  children: JSX.Element;
  requireAdmin?: boolean;
}) {
  const location = useLocation();
  const user = useUserStore((state) => state.user);
  const isLoggedIn = useUserStore((state) => state.isLoggedIn);
  const isLoading = useUserStore((state) => state.isLoading);
  const hasHydrated = useUserStore((state) => state.hasHydrated);
  const authInitialized = useUserStore((state) => state.authInitialized);
  const returnTo =
    `${location.pathname}${location.search}${location.hash}` || "/";

  if (!hasHydrated || !authInitialized || isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace state={{ returnTo }} />;
  }

  if (user?.is_active === false) {
    return (
      <Navigate
        to="/verify-otp"
        replace
        state={{
          verificationType: "email",
          contactInfo: user.email || user.phone || "",
          email: user.email || "",
          phone: user.phone || user.phone_number?.toString() || "",
          returnTo,
        }}
      />
    );
  }

  if (requireAdmin) {
    const isAdminUser =
      Boolean(user?.is_admin) ||
      String(user?.user_type || "").toLowerCase() === "admin" ||
      String(user?.role || "").toLowerCase() === "admin";

    if (!isAdminUser) {
      return <Navigate to="/login" replace state={{ returnTo }} />;
    }
  }

  return children;
}
