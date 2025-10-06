"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, ArrowLeft, Send, CheckCircle2 } from "lucide-react";
import api from "@/lib/api";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [apiError, setApiError] = useState("");
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async () => {
    setError("");
    setApiError("");

    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post("/auth/send-otp", {
        email,
        type: "forgot",
      });

      if (response?.data?.success) {
        setEmailSent(true);

        // Redirect to OTP page after 2s
        setTimeout(() => {
          router.push(
            `/account/verify-otp?email=${encodeURIComponent(email)}&type=forgot`
          );
        }, 2000);
      } else {
        setApiError(
          response?.data?.message || "Something went wrong. Try again."
        );
      }
    } catch (err: any) {
      setApiError(
        err?.response?.data?.message || "Failed to send reset code. Try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && email && !isSubmitting) {
      handleSubmit();
    }
  };

  return (
    <div className="flex items-center justify-center ">
      {" "}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-md"
      >
        <Card className="border-0 rounded-2xl overflow-hidden backdrop-blur-lg shadow-2xl py-0">
          <CardHeader className="bg-primary/90 text-white text-center py-6">
            <div className="flex items-center justify-center mb-4">
              {emailSent ? (
                <CheckCircle2 className="w-16 h-16 text-white" />
              ) : (
                <Mail className="w-16 h-16 text-white" />
              )}
            </div>
            <CardTitle className="text-2xl font-bold">
              {emailSent ? "Check Your Email" : "Forgot Password?"}
            </CardTitle>
            <p className="text-sm text-white/80 mt-2">
              {emailSent
                ? "We've sent a verification code to your email"
                : "No worries! We'll send you reset instructions"}
            </p>
          </CardHeader>

          <CardContent className="p-6">
            {!emailSent ? (
              <>
                <p className="text-sm text-gray-600 text-center mb-6">
                  Enter your email address and we'll send you a verification
                  code to reset your password.
                </p>

                {/* Email Input */}
                <div className="mb-4">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError("");
                      }}
                      onKeyPress={handleKeyPress}
                      className={`pl-9 ${error ? "border-red-500" : ""}`}
                      autoFocus
                    />
                  </div>
                  {(error || apiError) && (
                    <p className="text-xs text-red-500 mt-1 ml-1">
                      {error || apiError}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !email}
                  className="w-full bg-primary hover:bg-primary/90 transition mb-4"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Reset Code
                    </>
                  )}
                </Button>

                {/* Information Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h4 className="text-sm font-semibold text-blue-800 mb-2">
                    What happens next?
                  </h4>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">•</span>
                      <span>
                        We'll send a 6-digit verification code to your email
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">•</span>
                      <span>Enter the code on the next page</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">•</span>
                      <span>Create a new password for your account</span>
                    </li>
                  </ul>
                </div>
              </>
            ) : (
              <>
                {/* Success Message */}
                <div className="text-center mb-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-green-800">
                      Verification code has been sent to{" "}
                      <strong>{email}</strong>
                    </p>
                  </div>
                  <p className="text-sm text-gray-600">
                    Redirecting you to verification page...
                  </p>
                </div>

                {/* Loading Spinner */}
                <div className="flex justify-center">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              </>
            )}

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="h-px flex-1 bg-gray-200" />
              <span className="text-xs text-gray-500">OR</span>
              <div className="h-px flex-1 bg-gray-200" />
            </div>

            {/* Back to Login */}
            <Link href="/account/login">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Login
              </Button>
            </Link>

            {/* Sign Up Link */}
            <div className="text-center text-sm text-gray-600 mt-6">
              Don't have an account?{" "}
              <Link
                href="/account/signup"
                className="text-primary font-semibold hover:underline"
              >
                Sign Up
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
