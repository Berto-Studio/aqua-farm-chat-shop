import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, ArrowRight, User, Check, Mail } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { AuthLayout } from "@/components/authentication/AuthLayout";
import Register from "@/services/auth/register";

const RegisterPage = () => {
  const [activeStage, setActiveStage] = useState<string>("1");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    accountType: "personal",
    agreeTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleRadioChange = (value: string) => {
    setFormData({
      ...formData,
      accountType: value,
    });
  };

  const validateFirstStage = () => {
    if (!formData.firstName || !formData.lastName) {
      toast({
        title: "Missing Information",
        description: "Please enter your first and last name.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const validateSecondStage = () => {
    if (!formData.email) {
      toast({
        title: "Missing Information",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return false;
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const validateThirdStage = () => {
    if (!formData.password) {
      toast({
        title: "Missing Password",
        description: "Please enter a password.",
        variant: "destructive",
      });
      return false;
    }

    if (formData.password.length < 8) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      });
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const validateFinalStage = () => {
    if (!formData.agreeTerms) {
      toast({
        title: "Terms Not Accepted",
        description: "Please agree to the terms and conditions.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleNextStage = () => {
    const currentStage = parseInt(activeStage);

    // Validate current stage
    let isValid = false;
    switch (currentStage) {
      case 1:
        isValid = validateFirstStage();
        break;
      case 2:
        isValid = validateSecondStage();
        break;
      case 3:
        isValid = validateThirdStage();
        break;
      case 4:
        isValid = validateFinalStage();
        break;
      default:
        isValid = true;
    }

    if (isValid) {
      if (currentStage < 4) {
        setActiveStage(`${currentStage + 1}`);
      } else {
        handleSubmit();
      }
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      const response = await Register({
        username: `${formData.firstName}.${formData.lastName}`.toLowerCase(), // you can refine this
        email: formData.email,
        password: formData.password,
        full_name: `${formData.firstName} ${formData.lastName}`,
        phone: "0000000000", // TODO: add phone input in UI
        user_type: formData.accountType === "personal" ? "consumer" : "farmer",
        address: "", // optional, add input if needed
        profile_image_url: "",
        date_of_birth: "2000-01-01", // TODO: add date input in UI
      });

      if (response.success) {
        toast({
          title: "Registration successful!",
          description: response.message,
        });
        navigate("/");
      } else {
        toast({
          title: "Registration failed",
          description: response.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderProgressIndicator = () => {
    const stage = parseInt(activeStage);
    const progress = (stage / 4) * 100;

    return (
      <div className="mb-8 space-y-2">
        <div className="flex justify-between text-xs text-gray-500">
          <span>Basic Info</span>
          <span>Email</span>
          <span>Security</span>
          <span>Finish</span>
        </div>
        <Progress value={progress} className="h-2 bg-gray-100" />
        <div className="flex justify-between">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`flex items-center justify-center w-8 h-8 rounded-full ${
                step <= parseInt(activeStage)
                  ? "bg-theme-green text-white"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              {step < parseInt(activeStage) ? (
                <Check className="h-4 w-4" />
              ) : (
                <span>{step}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <AuthLayout>
      <div className="flex flex-col items-center space-y-2 text-center">
        <div className="rounded-full bg-theme-green/10 w-12 h-12 flex items-center justify-center">
          <div className="rounded-full bg-theme-green w-8 h-8 animate-pulse"></div>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-theme-black">
          Create an account
        </h1>
        <p className="text-sm text-gray-500">
          Join inSpace and unlock a world of possibilities
        </p>
      </div>

      <div className="mt-8">
        {renderProgressIndicator()}

        <Tabs value={activeStage} className="space-y-6">
          <TabsContent value="1" className="animate-fadeIn space-y-6 mt-4">
            <h2 className="text-xl font-medium text-theme-black">
              Basic Information
            </h2>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-gray-700"
                >
                  First Name
                </label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  placeholder="Enter your first name"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full mt-1"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Last Name
                </label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  placeholder="Enter your last name"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full mt-1"
                  required
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="2" className="animate-fadeIn space-y-6 mt-4">
            <h2 className="text-xl font-medium text-theme-black">
              Email Address
            </h2>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <div className="mt-1 relative">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10"
                  required
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-gray-400" />
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                We'll send a verification email to this address
              </p>
            </div>
          </TabsContent>

          <TabsContent value="3" className="animate-fadeIn space-y-6 mt-4">
            <h2 className="text-xl font-medium text-theme-black">Security</h2>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <div className="mt-1 relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Use at least 8 characters with a mix of letters, numbers &
                  symbols
                </p>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  Confirm Password
                </label>
                <div className="mt-1 relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="4" className="animate-fadeIn space-y-6 mt-4">
            <h2 className="text-xl font-medium text-theme-black">
              Almost there!
            </h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Account Type
                </h3>
                <RadioGroup
                  value={formData.accountType}
                  onValueChange={handleRadioChange}
                  className="flex flex-col space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="personal" id="personal" />
                    <Label htmlFor="personal" className="cursor-pointer">
                      Personal
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="business" id="business" />
                    <Label htmlFor="business" className="cursor-pointer">
                      Business
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="educational" id="educational" />
                    <Label htmlFor="educational" className="cursor-pointer">
                      Educational
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="agreeTerms"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, agreeTerms: checked === true })
                  }
                />
                <label
                  htmlFor="agreeTerms"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I agree to the{" "}
                  <Link to="#" className="text-theme-green hover:underline">
                    terms of service
                  </Link>{" "}
                  and{" "}
                  <Link to="#" className="text-theme-green hover:underline">
                    privacy policy
                  </Link>
                </label>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between mt-8">
          {activeStage !== "1" && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setActiveStage(`${parseInt(activeStage) - 1}`)}
            >
              Back
            </Button>
          )}
          <div className={activeStage === "1" ? "w-full" : "ml-auto"}>
            <Button
              type="button"
              className="bg-green-700 hover:bg-green-600 text-white w-full md:w-auto"
              onClick={handleNextStage}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Processing...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  {activeStage === "4" ? "Complete Registration" : "Continue"}
                  {activeStage !== "4" && <ArrowRight className="h-4 w-4" />}
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          Already have an account?{" "}
          <Link to="/" className="text-theme-green hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default RegisterPage;
