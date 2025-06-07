import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useEffect } from "react";
import { getUsers } from "@/services/users/getUsers";
import { useUserStore } from "@/store/store";

export default function Layout() {
  const { isLoggedIn } = useUserStore();

  const fetchUserData = async () => {
    try {
      const response = await getUsers();
      const { success, data } = response;
      if (response.success) {
        useUserStore.getState().setUser(data[0]);
      } else {
        console.error("Failed to fetch users:", response.message);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };
  useEffect(() => {
    if (isLoggedIn) {
      fetchUserData();
    }
  }, [isLoggedIn]);

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
