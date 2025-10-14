"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, Phone } from "lucide-react";
import { Button } from "../ui/button";
import api from "@/lib/api";
import { useUserStore } from "@/app/store/useUserStore";

export default function ProfileInfo() {
  const { user, fetchUser } = useUserStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Ensure all required fields are present and trimmed
      const payload = {
        full_name: formData.full_name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
      };

      const response = await api.post(
        `/users/update-customer/${user.id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.data.success) {
        fetchUser();
        setIsEditing(false);
      } else {
        console.error("API error:", response.data.message || "Unknown error");
      }
    } catch (error: any) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold">
            Profile Information
          </CardTitle>
          {!isEditing && (
            <>
              {" "}
              <Button
                onClick={() => setIsEditing(true)}
                className="self-start bg-primary hover:bg-primary/90"
              >
                Edit
              </Button>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {!isEditing ? (
          <>
            <div>
              <strong>Full Name:</strong> {user?.full_name}
            </div>
            <div>
              <strong>Email:</strong> {user?.email}
            </div>
            <div>
              <strong>Phone:</strong> {user?.phone}
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="Full Name"
                  className="pl-9"
                />
              </div>
              <div className="flex-1 relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email"
                  className="pl-9"
                />
              </div>
            </div>
            <div className="flex-1 relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Phone"
                className="pl-9"
              />
            </div>

            <div className="flex gap-2 self-end">
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="bg-primary hover:bg-primary/90"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
