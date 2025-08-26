import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, Phone, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AuthLayout } from "@/components/authentication/AuthLayout";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

const OtpVerification = () => {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Get verification type and contact info from navigation state
  const verificationType = location.state?.verificationType || "email";
  const contactInfo = location.state?.contactInfo || "";

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter the complete 6-digit verification code.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Simulate OTP verification API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For demo purposes, accept any 6-digit code
      toast({
        title: "Email verified successfully!",
        description: "Your account has been created and verified. You can now sign in.",
      });

      // Navigate to login page after successful verification
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      toast({
        title: "Verification failed",
        description: "Invalid verification code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    
    try {
      // Simulate resend API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Code resent",
        description: `A new verification code has been sent to your ${verificationType}.`,
      });
    } catch (error) {
      toast({
        title: "Failed to resend",
        description: "Please try again in a few moments.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthLayout>
      <div className="flex flex-col items-center space-y-4 text-center">
        <div className="rounded-full bg-primary/10 w-16 h-16 flex items-center justify-center">
          {verificationType === "email" ? (
            <Mail className="h-8 w-8 text-primary" />
          ) : (
            <Phone className="h-8 w-8 text-primary" />
          )}
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Verify Your {verificationType === "email" ? "Email" : "Phone Number"}
          </h1>
          <p className="text-sm text-muted-foreground max-w-md">
            We've sent a 6-digit verification code to{" "}
            <span className="font-medium text-foreground">{contactInfo}</span>
          </p>
        </div>
      </div>

      <div className="mt-8 space-y-6">
        <div className="space-y-4">
          <label className="block text-sm font-medium text-foreground text-center">
            Enter verification code
          </label>
          
          <div className="flex justify-center">
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={(value) => setOtp(value)}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>
          
          <p className="text-xs text-muted-foreground text-center">
            Didn't receive the code?{" "}
            <button
              type="button"
              onClick={handleResendCode}
              disabled={isResending}
              className="text-primary hover:underline font-medium"
            >
              {isResending ? "Resending..." : "Resend code"}
            </button>
          </p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={handleVerifyOtp}
            disabled={isLoading || otp.length !== 6}
            className="w-full"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Verifying...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Verify & Continue
              </span>
            )}
          </Button>

          <Button
            variant="outline"
            onClick={() => navigate("/register")}
            className="w-full"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Registration
          </Button>
        </div>
      </div>

      <div className="mt-6 text-center">
        <p className="text-xs text-muted-foreground">
          By verifying, you agree to our terms of service and privacy policy
        </p>
      </div>
    </AuthLayout>
  );
};

export default OtpVerification;