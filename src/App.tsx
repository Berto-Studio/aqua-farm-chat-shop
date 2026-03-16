import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Layout from "./components/layout/Layout";
import AdminLayout from "./components/admin/AdminLayout";
import AuthBootstrap from "./components/auth/AuthBootstrap";
import Index from "./pages/Index";
import Chat from "./pages/Chat";
import ProductDetail from "./pages/products/ProductDetail";
import AboutUs from "./pages/AboutUs";
import ContactUs from "./pages/ContactUs";
import Services from "./pages/Services";
import Settings from "./pages/Settings";
import Cart from "./pages/payment/payment";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminServices from "./pages/admin/AdminServices";
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

const queryClient = new QueryClient();

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
          <AuthBootstrap />
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
              <Route path="products/:productId" element={<AdminProductDetails />} />
              <Route path="products/:productId/edit" element={<AdminProductEdit />} />
              <Route path="services" element={<AdminServices />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="orders/:orderId" element={<AdminOrderDetails />} />
              <Route path="users" element={<AdminCustomers />} />
              <Route path="users/:userId" element={<AdminCustomerDetails />} />
              <Route path="users/:userId/message" element={<AdminCustomerMessage />} />
              <Route path="customers" element={<AdminCustomers />} />
              <Route path="customers/:customerId" element={<AdminCustomerDetails />} />
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
