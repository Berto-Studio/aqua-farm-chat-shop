import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Layout from "./components/layout/Layout";
import ScrollToTop from "./components/layout/ScrollToTop";
import AdminLayout from "./components/admin/AdminLayout";
import AuthBootstrap from "./components/auth/AuthBootstrap";
import AuthRequiredDialog from "./components/auth/AuthRequiredDialog";
import Index from "./pages/Index";
import Chat from "./pages/Chat";
import ProductDetail from "./pages/products/ProductDetail";
import AboutUs from "./pages/AboutUs";
import ContactUs from "./pages/ContactUs";
import Services from "./pages/Services";
import Cart from "./pages/payment/payment";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminServices from "./pages/admin/AdminServices";
import AdminServiceCreate from "./pages/admin/AdminServiceCreate";
import AdminServiceDetails from "./pages/admin/AdminServiceDetails";
import AdminServiceEdit from "./pages/admin/AdminServiceEdit";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminChat from "./pages/admin/AdminChat";
import AdminProductDetails from "./pages/admin/AdminProductDetails";
import AdminProductEdit from "./pages/admin/AdminProductEdit";
import AdminOrderDetails from "./pages/admin/AdminOrderDetails";
import AdminCustomerDetails from "./pages/admin/AdminCustomerDetails";
import AdminCustomerMessage from "./pages/admin/AdminCustomerMessage";
import NotFound from "./pages/NotFound";
import Register from "./pages/authentication/register";
import Login from "./pages/authentication/login";
import ProtectedRoute from "./components/protected/protectedRoute";
import Profile from "./pages/Profile";
import Products from "./pages/products/products";
import FarmerRegister from "./pages/farmers/FarmerRegister";
import FarmerDashboard from "./pages/farmers/FarmerDashboard";
import OtpVerification from "./pages/authentication/OtpVerification";
import PaymentProccess from "./pages/payment/payment";
import Settings from "./pages/settings/settings";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        const message =
          error instanceof Error ? error.message.toLowerCase() : "";

        if (
          message.includes("failed to reach api") ||
          message.includes("could not reach the backend") ||
          message.includes("session expired")
        ) {
          return false;
        }

        return failureCount < 1;
      },
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      storageKey="fishfarm-theme"
    >
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <AuthBootstrap />
          <AuthRequiredDialog />
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Index />} />
              <Route path="products" element={<Products />} />
              <Route path="products/:id" element={<ProductDetail />} />
              <Route path="services" element={<Services />} />
              <Route path="about" element={<AboutUs />} />
              <Route path="contact" element={<ContactUs />} />
              <Route path="cart" element={<PaymentProccess />} />

              <Route
                path="profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="chat"
                element={
                  <ProtectedRoute>
                    <Chat />
                  </ProtectedRoute>
                }
              />
              <Route
                path="chat/:conversationId"
                element={
                  <ProtectedRoute>
                    <Chat />
                  </ProtectedRoute>
                }
              />

              {/* Farmer Routes */}
              <Route path="/farmer-register" element={<FarmerRegister />} />
              <Route
                path="/farmer-dashboard"
                element={
                  <ProtectedRoute>
                    <FarmerDashboard />
                  </ProtectedRoute>
                }
              />
            </Route>

            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route
                path="products/:productId"
                element={<AdminProductDetails />}
              />
              <Route
                path="products/:productId/edit"
                element={<AdminProductEdit />}
              />
              <Route path="services" element={<AdminServices />} />
              <Route path="services/new" element={<AdminServiceCreate />} />
              <Route
                path="services/:serviceId"
                element={<AdminServiceDetails />}
              />
              <Route
                path="services/:serviceId/edit"
                element={<AdminServiceEdit />}
              />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="orders/:orderId" element={<AdminOrderDetails />} />
              <Route path="payments" element={<AdminPayments />} />
              <Route path="users" element={<AdminCustomers />} />
              <Route path="users/:userId" element={<AdminCustomerDetails />} />
              <Route
                path="users/:userId/message"
                element={<AdminCustomerMessage />}
              />
              <Route path="customers" element={<AdminCustomers />} />
              <Route
                path="customers/:customerId"
                element={<AdminCustomerDetails />}
              />
              <Route
                path="customers/:customerId/message"
                element={<AdminCustomerMessage />}
              />
              <Route path="analytics" element={<AdminAnalytics />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="chat" element={<AdminChat />} />
              <Route path="chat/:conversationId" element={<AdminChat />} />
            </Route>

            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-otp" element={<OtpVerification />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
