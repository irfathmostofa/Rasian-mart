"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Mail,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";
import api from "@/lib/api";

// Loading component
function OTPVerifyLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
          <div className="bg-primary/90 text-white text-center py-6">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-white/20 animate-pulse" />
            </div>
            <div className="h-8 w-48 bg-white/20 rounded-lg mx-auto animate-pulse" />
            <div className="h-4 w-64 bg-white/20 rounded-lg mx-auto mt-2 animate-pulse" />
          </div>
          <div className="p-6 space-y-4">
            <div className="flex gap-2 justify-center">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse"
                />
              ))}
            </div>
            <div className="h-10 bg-gray-200 rounded-lg animate-pulse" />
            <div className="h-10 bg-gray-200 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Main OTP verification form component
function OTPVerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [timer, setTimer] = useState(120);
  const [canResend, setCanResend] = useState(false);
  const [email, setEmail] = useState("");
  const [verificationType, setVerificationType] = useState<"signup" | "forgot">(
    "signup",
  );
  const [isClient, setIsClient] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Handle client-side mounting
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      const emailParam = searchParams.get("email");
      const typeParam = searchParams.get("type");
      setEmail(emailParam || "");
      setVerificationType(typeParam === "forgot" ? "forgot" : "signup");

      // Focus first input after params are loaded
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [searchParams, isClient]);

  useEffect(() => {
    if (timer > 0 && !success) {
      const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    } else if (timer === 0) setCanResend(true);
  }, [timer, success]);

  // Redirect if no email on client side
  useEffect(() => {
    if (isClient && !email) {
      router.push("/account/login");
    }
  }, [email, router, isClient]);

  const handleChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0)
      inputRefs.current[index - 1]?.focus();
    if (e.key === "Enter" && otp.every((digit) => digit !== "")) handleVerify();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;
    const newOtp = pastedData.split("");
    setOtp([...newOtp, ...Array(6 - newOtp.length).fill("")]);
    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleVerify = async () => {
    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }

    setIsVerifying(true);
    setError("");

    try {
      await api.post("/auth/verify-otp", {
        email,
        otp: otpValue,
        type: verificationType,
      });

      setSuccess(true);

      setTimeout(async () => {
        if (verificationType === "forgot") {
          router.push(
            `/account/reset-password?email=${encodeURIComponent(email)}`,
          );
        } else {
          // Get pending user data from sessionStorage
          const pendingUserRaw = sessionStorage.getItem("pendingUser");
          if (pendingUserRaw) {
            const pendingUser = JSON.parse(pendingUserRaw);
            const payload = {
              full_name: pendingUser.full_name,
              email: pendingUser.email,
              phone: pendingUser.phone,
              password_hash: pendingUser.password_hash,
            };
            await api.post("/users/create-customer", payload);
            // Remove pendingUser from sessionStorage
            sessionStorage.removeItem("pendingUser");
          }
          router.push("/profile");
        }
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid OTP. Please try again.");
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setTimer(120);
    setCanResend(false);
    setOtp(["", "", "", "", "", ""]);
    setError("");

    try {
      await api.post("/auth/resend-otp", { email, type: verificationType });

      const tempSuccess = document.createElement("div");
      tempSuccess.className =
        "fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-in fade-in slide-in-from-top-2 duration-300";
      tempSuccess.textContent = "OTP resent successfully!";
      document.body.appendChild(tempSuccess);
      setTimeout(() => tempSuccess.remove(), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to resend OTP");
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const maskEmail = (email: string) => {
    if (!email || !email.includes("@")) return email;
    const [localPart, domain] = email.split("@");
    if (!localPart || !domain) return email;

    if (localPart.length <= 2) {
      const maskedLocal = localPart[0] + "*".repeat(localPart.length - 1);
      return `${maskedLocal}@${domain}`;
    }

    const maskedLocal = localPart[0] + "***" + localPart[localPart.length - 1];
    return `${maskedLocal}@${domain}`;
  };

  // Don't render anything until client-side hydration is complete
  if (!isClient) {
    return <OTPVerifyLoading />;
  }

  // Don't render form while redirecting
  if (!email) {
    return null;
  }

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-gray-50 py-6">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-md"
      >
        <Card className="border-0 rounded-2xl overflow-hidden backdrop-blur-lg shadow-2xl">
          <CardHeader className="bg-primary/90 text-white text-center py-6">
            <div className="flex items-center justify-center mb-4">
              {success ? (
                <CheckCircle2 className="w-16 h-16 text-white" />
              ) : (
                <Mail className="w-16 h-16 text-white" />
              )}
            </div>
            <CardTitle className="text-2xl font-bold">
              {success ? "Verified!" : "Verify OTP"}
            </CardTitle>
            <p className="text-sm text-white/80 mt-2">
              {success
                ? "Your account has been verified successfully"
                : `Enter the 6-digit code sent to ${maskEmail(email)}`}
            </p>
          </CardHeader>

          <CardContent className="p-6">
            {!success && (
              <>
                <div
                  className="flex gap-2 justify-center mb-6"
                  onPaste={handlePaste}
                >
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => {
                        inputRefs.current[index] = el;
                      }}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className={`w-12 h-12 text-center text-xl font-bold border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition ${
                        error ? "border-red-500" : "border-gray-300"
                      } ${digit ? "border-primary" : ""}`}
                      disabled={isVerifying}
                    />
                  ))}
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-lg"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>{error}</span>
                  </motion.div>
                )}

                <div className="text-center mb-6">
                  {timer > 0 ? (
                    <p className="text-sm text-gray-600">
                      Code expires in{" "}
                      <span className="font-bold text-primary">
                        {formatTime(timer)}
                      </span>
                    </p>
                  ) : (
                    <p className="text-sm text-red-500 font-medium">
                      OTP has expired
                    </p>
                  )}
                </div>

                <Button
                  onClick={handleVerify}
                  disabled={isVerifying || otp.some((d) => !d)}
                  className="w-full bg-primary hover:bg-primary/90 transition mb-4"
                >
                  {isVerifying ? "Verifying..." : "Verify OTP"}
                </Button>

                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">
                    Didn't receive the code?
                  </p>
                  <Button
                    variant="ghost"
                    onClick={handleResend}
                    disabled={!canResend || isVerifying}
                    className={`text-primary hover:text-primary/80 ${
                      !canResend ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Resend OTP
                  </Button>
                </div>
              </>
            )}

            {success && (
              <div className="text-center">
                <p className="text-gray-600 mb-6">
                  Redirecting you to your account...
                </p>
                <div className="flex justify-center">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              </div>
            )}

            <div className="text-center mt-6 pt-6 border-t">
              <Link
                href={
                  verificationType === "forgot"
                    ? "/account/forgot-password"
                    : "/account/signup"
                }
                className="text-sm text-gray-600 hover:text-primary transition flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to{" "}
                {verificationType === "forgot" ? "Forgot Password" : "Sign Up"}
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

// Main page component with Suspense
export default function OTPVerifyPage() {
  return (
    <Suspense fallback={<OTPVerifyLoading />}>
      <OTPVerifyForm />
    </Suspense>
  );
}
