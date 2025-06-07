
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useEffect } from "react";
import { getUsers } from "@/services/users/getUsers";
import { useUserStore } from "@/store/store";

export default function Layout() {
  const { isLoggedIn, user } = useUserStore();

  const fetchUserData = async () => {
    try {
      const response = await getUsers();
      const { success, data } = response;
      if (success && data && data.length > 0) {
        useUserStore.getState().setUser(data[0]);
      } else {
        console.log("No user data available or fetch failed");
      }
    } catch (error) {
      console.log("Error fetching user data, continuing with existing user state");
    }
  };

  useEffect(() => {
    // Only fetch user data if logged in and no user data exists
    if (isLoggedIn && !user) {
      fetchUserData();
    }
  }, [isLoggedIn, user]);

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
