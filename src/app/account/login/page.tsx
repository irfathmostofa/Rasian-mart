"use client";
import { useRouter } from "next/navigation";

// Inside your component

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Mail,
  Lock,
  Sun,
  Moon,
  Github,
  Chrome,
  Facebook,
  FacebookIcon,
} from "lucide-react";

export default function LoginPage() {
  const [greeting, setGreeting] = useState("Welcome");
  const router = useRouter();
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning 🌞");
    else if (hour < 18) setGreeting("Good Afternoon 🌤️");
    else setGreeting("Good Evening 🌙");
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background overlay */}
      {/* <div className="absolute inset-0">
        <img
          src="https://picsum.photos/1920/1080?blur=10"
          alt="Background"
          className="w-full h-full object-cover opacity-30"
        />
      </div> */}

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-md px-4"
      >
        <Card className="shadow-2xl border-0 rounded-2xl overflow-hidden backdrop-blur-lg py-0">
          <CardHeader className="bg-primary/90 text-white text-center py-6">
            <CardTitle className="text-2xl font-bold">{greeting}</CardTitle>
            <p className="text-sm text-white/80 mt-2">
              Login to continue shopping at{" "}
              <span className="font-semibold">RasianMart</span>
            </p>
          </CardHeader>

          <CardContent className="p-6 space-y-5">
            {/* Email */}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="email"
                placeholder="Enter your email"
                className="pl-9"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="password"
                placeholder="Enter your password"
                className="pl-9"
              />
            </div>

            {/* Login Button */}

            <Button
              className="w-full bg-primary hover:bg-primary/90 transition"
              onClick={() => {
                router.push("/profile");
              }}
            >
              Login
            </Button>

            {/* <Button>Login</Button> */}

            {/* Social Login */}
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-gray-200" />
              <span className="text-xs text-gray-500">OR</span>
              <div className="h-px flex-1 bg-gray-200" />
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 flex items-center gap-2"
              >
                Google
              </Button>
              <Button
                variant="outline"
                className="flex-1 flex items-center gap-2"
              >
                Facebook
              </Button>
            </div>

            {/* Footer */}
            <div className="text-center text-sm text-gray-600">
              Don’t have an account?{" "}
              <Link
                href="/signup"
                className="text-primary font-semibold hover:underline"
              >
                Sign Up
              </Link>
            </div>

            <div className="text-center">
              <Link
                href="/forgot-password"
                className="text-xs text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
