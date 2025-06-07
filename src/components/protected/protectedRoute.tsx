import { useUserStore } from "@/store/store";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({
  children,
}: {
  children: JSX.Element;
}) {
  const { isLoggedIn } = useUserStore();

  return isLoggedIn ? children : <Navigate to="/login" replace />;
}
