"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Eye, EyeOff, CheckCircle2, XCircle, Shield } from "lucide-react";
import api from "@/lib/api";

interface FormErrors {
  password?: string;
  confirmPassword?: string;
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || ""; // get email from query
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState("");

  // Password strength calculation
  useEffect(() => {
    const pwd = formData.password;
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
    if (/\d/.test(pwd)) strength++;
    if (/[^a-zA-Z0-9]/.test(pwd)) strength++;
    setPasswordStrength(strength);
  }, [formData.password]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 8)
      newErrors.password = "Password must be at least 8 characters";
    else if (!/(?=.*[a-z])(?=.*[A-Z])/.test(formData.password))
      newErrors.password =
        "Password must contain uppercase and lowercase letters";
    else if (!/(?=.*\d)/.test(formData.password))
      newErrors.password = "Password must contain at least one number";

    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (apiError) setApiError("");
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setApiError("");

    try {
      const response = await api.post("/users/update-customer-password", {
        email,
        password_hash: formData.password,
      });

      if (response?.data?.success) {
        setSuccess(true);

        // Redirect to login after 2s
        setTimeout(() => {
          router.push("/account/login");
        }, 2000);
      } else {
        setApiError(response?.data?.message || "Something went wrong");
      }
    } catch (err: any) {
      setApiError(err?.response?.data?.message || "Failed to reset password");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStrengthColor = () => {
    if (passwordStrength === 0) return "bg-gray-200";
    if (passwordStrength <= 1) return "bg-red-500";
    if (passwordStrength === 2) return "bg-yellow-500";
    if (passwordStrength === 3) return "bg-blue-500";
    return "bg-green-500";
  };

  const getStrengthText = () => {
    if (passwordStrength === 0) return "";
    if (passwordStrength <= 1) return "Weak";
    if (passwordStrength === 2) return "Fair";
    if (passwordStrength === 3) return "Good";
    return "Strong";
  };

  const passwordRequirements = [
    { met: formData.password.length >= 8, text: "At least 8 characters" },
    {
      met: /(?=.*[a-z])(?=.*[A-Z])/.test(formData.password),
      text: "Upper & lowercase letters",
    },
    { met: /(?=.*\d)/.test(formData.password), text: "At least one number" },
    {
      met: /(?=.*[^a-zA-Z0-9])/.test(formData.password),
      text: "Special character (recommended)",
    },
  ];

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-gray-50 py-6">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-md"
      >
        <Card className="border-0 rounded-2xl overflow-hidden shadow-2xl py-0">
          <CardHeader className="bg-primary/90 text-white text-center py-6">
            <div className="flex items-center justify-center mb-4">
              {success ? (
                <CheckCircle2 className="w-16 h-16 text-white" />
              ) : (
                <Shield className="w-16 h-16 text-white" />
              )}
            </div>
            <CardTitle className="text-2xl font-bold">
              {success ? "Password Reset!" : "Reset Password"}
            </CardTitle>
            <p className="text-sm text-white/80 mt-2">
              {success
                ? "Your password has been changed successfully"
                : "Create a strong and secure password"}
            </p>
          </CardHeader>

          <CardContent className="p-6">
            {!success ? (
              <>
                <div className="space-y-4">
                  {/* New Password */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Enter new password"
                        value={formData.password}
                        onChange={handleChange}
                        className={`pl-9 pr-9 ${
                          errors.password ? "border-red-500" : ""
                        }`}
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    {/* Password Strength */}
                    {formData.password && (
                      <div className="mt-2">
                        <div className="flex gap-1 h-1">
                          {[...Array(4)].map((_, i) => (
                            <div
                              key={i}
                              className={`flex-1 rounded-full transition-colors ${
                                i < passwordStrength
                                  ? getStrengthColor()
                                  : "bg-gray-200"
                              }`}
                            />
                          ))}
                        </div>
                        {getStrengthText() && (
                          <p className="text-xs mt-1 ml-1 text-gray-600">
                            Strength:{" "}
                            <span className="font-medium">
                              {getStrengthText()}
                            </span>
                          </p>
                        )}
                      </div>
                    )}

                    {errors.password && (
                      <p className="text-xs text-red-500 mt-1 ml-1">
                        {errors.password}
                      </p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        placeholder="Confirm new password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={`pl-9 pr-9 ${
                          errors.confirmPassword ? "border-red-500" : ""
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    {formData.confirmPassword &&
                      !errors.confirmPassword &&
                      formData.password === formData.confirmPassword && (
                        <div className="flex items-center gap-1 mt-1 ml-1">
                          <CheckCircle2 className="w-3 h-3 text-green-500" />
                          <p className="text-xs text-green-500">
                            Passwords match
                          </p>
                        </div>
                      )}

                    {errors.confirmPassword && (
                      <p className="text-xs text-red-500 mt-1 ml-1">
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>

                  {/* Password Requirements */}
                  {formData.password && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-xs font-semibold text-gray-700 mb-2">
                        Password Requirements:
                      </h4>
                      <ul className="space-y-1">
                        {passwordRequirements.map((req, index) => (
                          <li
                            key={index}
                            className="flex items-center gap-2 text-xs"
                          >
                            {req.met ? (
                              <CheckCircle2 className="w-3 h-3 text-green-500 flex-shrink-0" />
                            ) : (
                              <XCircle className="w-3 h-3 text-gray-300 flex-shrink-0" />
                            )}
                            <span
                              className={
                                req.met ? "text-green-700" : "text-gray-500"
                              }
                            >
                              {req.text}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* API error */}
                  {apiError && (
                    <p className="text-xs text-red-500 mt-2 text-center">
                      {apiError}
                    </p>
                  )}

                  {/* Submit Button */}
                  <Button
                    onClick={handleSubmit}
                    disabled={
                      isSubmitting ||
                      !formData.password ||
                      !formData.confirmPassword
                    }
                    className="w-full bg-primary hover:bg-primary/90 transition mt-6"
                  >
                    {isSubmitting ? "Resetting Password..." : "Reset Password"}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="text-center mb-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-green-800">
                      Your password has been successfully reset. You can now
                      login with your new password.
                    </p>
                  </div>
                  <p className="text-sm text-gray-600">
                    Redirecting you to login page...
                  </p>
                </div>
                <div className="flex justify-center">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              </>
            )}

            {!success && (
              <div className="text-center mt-6 pt-6 border-t">
                <Link
                  href="/account/login"
                  className="text-sm text-gray-600 hover:text-primary transition"
                >
                  Remember your password?{" "}
                  <span className="font-semibold">Login</span>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
