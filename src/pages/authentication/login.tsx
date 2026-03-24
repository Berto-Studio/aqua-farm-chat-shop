import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { AuthLayout } from "@/components/authentication/AuthLayout";
import { useUserStore } from "@/store/store";
import logIn from "@/services/auth/login";

const Index = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const user = useUserStore((state) => state.user);
  const returnTo =
    typeof location.state?.returnTo === "string"
      ? location.state.returnTo
      : "/";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await logIn({ email, password });
      if (response.success) {
        const loggedInUser = useUserStore.getState().user || user;
        const isUnverified = loggedInUser?.is_active === false;

        toast({
          title: isUnverified ? "Verification required" : "Success",
          description: isUnverified
            ? "Please verify your email or phone number to continue."
            : "You have successfully logged in.",
          variant: "success",
        });

        if (isUnverified) {
          navigate("/verify-otp", {
            replace: true,
            state: {
              verificationType: "email",
              contactInfo:
                loggedInUser?.email || loggedInUser?.phone || "",
              email: loggedInUser?.email || "",
              phone:
                loggedInUser?.phone ||
                loggedInUser?.phone_number?.toString() ||
                "",
              returnTo,
            },
          });
          return;
        }

        console.log("Login successful, navigating...");
        navigate(returnTo, { replace: true });
      } else {
        toast({
          title: "Error",
          description: response.message || "Login failed. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again later.",
        variant: "destructive",
      });
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="flex flex-col items-center space-y-2 text-center">
        <div className="rounded-full bg-theme-green/10 w-12 h-12 flex items-center justify-center">
          <div className="rounded-full bg-theme-green w-8 h-8 animate-pulse"></div>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-theme-black">
          Welcome to Pomegrid Aqua
        </h1>
        <p className="text-sm text-gray-500">Sign in to access your account</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-6 mt-8">
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full"
            required
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <Link to="#" className="text-xs text-theme-green hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pr-10"
              required
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-primary hover:bg-primary/90 text-white"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              Signing in...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <LogIn className="h-4 w-4" />
              Login
            </span>
          )}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          Don't have an account?{" "}
          <Link
            to="/register"
            state={{ returnTo }}
            className="text-theme-green hover:underline font-medium"
          >
            Sign up
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default Index;
