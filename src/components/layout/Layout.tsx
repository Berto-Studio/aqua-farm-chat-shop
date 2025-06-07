
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useEffect } from "react";
import { useUserStore } from "@/store/store";

export default function Layout() {
  const { checkAuthStatus } = useUserStore();

  useEffect(() => {
    // Check if user is still authenticated on app startup
    checkAuthStatus();
  }, [checkAuthStatus]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
