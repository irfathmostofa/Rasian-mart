"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Edit2, User, Mail, Phone, Lock, LogOut } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function UserProfile() {
  const [user, setUser] = useState({
    name: "John Doe",
    email: "john@example.com",
    phone: "123-456-7890",
  });

  const [greeting, setGreeting] = useState("Welcome");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning 🌞");
    else if (hour < 18) setGreeting("Good Afternoon 🌤️");
    else setGreeting("Good Evening 🌙");
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    console.log("Saved user info:", user);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row p-6 gap-6">
      {/* Sidebar */}
      <motion.div
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="md:w-1/4 flex flex-col gap-4"
      >
        <Card className="p-4 flex flex-col items-center text-center">
          <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-primary mb-3">
            <img
              src="https://picsum.photos/100"
              alt="User Avatar"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 right-0 bg-primary rounded-full p-1 cursor-pointer">
              <Edit2 className="w-4 h-4 text-white" />
            </div>
          </div>
          <h2 className="font-bold text-lg">{user.name}</h2>
          <p className="text-sm text-gray-500">{user.email}</p>
        </Card>

        <Card className="p-4 flex flex-col gap-2">
          <Button
            className="w-full flex items-center justify-center gap-2"
            variant="outline"
          >
            <LogOut className="w-4 h-4" /> Logout
          </Button>
        </Card>
      </motion.div>

      {/* Main Content */}
      <motion.div
        initial={{ x: 50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="md:w-3/4 flex flex-col gap-6"
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold">
              {greeting}, {user.name}!
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {/* User Info Form */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  name="name"
                  value={user.name}
                  onChange={handleChange}
                  placeholder="Full Name"
                  className="pl-9"
                />
              </div>
              <div className="flex-1 relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  name="email"
                  value={user.email}
                  onChange={handleChange}
                  placeholder="Email"
                  className="pl-9"
                />
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  name="phone"
                  value={user.phone}
                  onChange={handleChange}
                  placeholder="Phone"
                  className="pl-9"
                />
              </div>
              <div className="flex-1 relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="password"
                  placeholder="New Password"
                  className="pl-9"
                />
              </div>
            </div>
            <Button
              onClick={handleSave}
              className="self-end bg-primary hover:bg-primary/90"
            >
              Save Changes
            </Button>
          </CardContent>
        </Card>

        {/* Orders Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-bold">
              Your Recent Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((order) => (
                <Card key={order} className="p-4 bg-gray-100 rounded-lg">
                  <p className="font-semibold">Order #{1000 + order}</p>
                  <p className="text-sm text-gray-500">Status: Delivered</p>
                  <p className="text-sm text-gray-500">
                    Total: $ {Math.floor(Math.random() * 100 + 20)}
                  </p>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
