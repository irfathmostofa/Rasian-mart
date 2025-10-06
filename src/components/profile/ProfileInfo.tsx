"use client";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, Phone, Lock } from "lucide-react";
import { useAppStore } from "@/app/store/useAppStore";
import { useState } from "react";
import { Button } from "../ui/button";

export default function ProfileInfo() {
  const { user, setUser } = useAppStore();
  const [password, setPassword] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    console.log("Saved user info:", user);
    // TODO: API call to update profile
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-bold">Profile Information</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              name="full_name"
              value={user?.full_name}
              onChange={handleChange}
              placeholder="Full Name"
              className="pl-9"
            />
          </div>
          <div className="flex-1 relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              name="email"
              value={user?.email}
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
              value={user?.phone}
              onChange={handleChange}
              placeholder="Phone"
              className="pl-9"
            />
          </div>
          <div className="flex-1 relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
  );
}
