"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, MapPin, Home, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { useUserStore } from "@/app/store/useUserStore";

interface Address {
  id?: number;
  label: string;
  address_line: string;
  postal_code: string;
  city?: string;
  area?: string;
}

export default function AddressManager() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [newAddress, setNewAddress] = useState<Address>({
    label: "",
    address_line: "",
    postal_code: "",
    city: "",
    area: "",
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [update, setUpdate] = useState(0);
  const { user } = useUserStore();
  const fetchAddresses = async () => {
    if (!user?.id) {
      setAddresses([]);
      return;
    }
    try {
      setLoading(true);
      const res = await api.get(`/users/get-customer-address/${user.id}`);
      setAddresses(res?.data.data || []);
    } catch (err) {
      console.error("Failed to fetch addresses:", err);
    } finally {
      setLoading(false);
    }
  };
  // 🔹 Fetch Addresses
  useEffect(() => {
    fetchAddresses();
  }, [user, update]);

  // 🔹 Add New Address
  const handleAddAddress = async () => {
    if (!newAddress.label || !newAddress.address_line) return;
    setSaving(true);
    try {
      await api.post("/users/create-customer-address", {
        ...newAddress,
        customer_id: user?.id,
      });
      setUpdate(update + 1);
      setNewAddress({
        label: "",
        address_line: "",
        postal_code: "",
        city: "",
        area: "",
      });
      setOpen(false);
    } catch (err) {
      console.error("Failed to add address:", err);
    } finally {
      setSaving(false);
    }
  };

  // 🔹 Delete Address
  const handleDelete = async (id?: number) => {
    if (!id) return;
    try {
      await api.post(`/users/delete-customer-address`, {
        data: { id: id },
      });
      setUpdate(update + 1);
    } catch (err) {
      console.error("Failed to delete address:", err);
    }
  };

  // 🔹 Loader
  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <span className="ml-2 text-gray-600">Loading addresses...</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border-none shadow-md">
        <CardHeader className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <MapPin className="w-5 h-5 text-primary" /> Manage Addresses
          </CardTitle>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2 bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4" /> Add
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Address</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-3">
                <Input
                  placeholder="Label (Home, Work, etc.)"
                  value={newAddress.label}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, label: e.target.value })
                  }
                />
                <Input
                  placeholder="Address Line"
                  value={newAddress.address_line}
                  onChange={(e) =>
                    setNewAddress({
                      ...newAddress,
                      address_line: e.target.value,
                    })
                  }
                />
                <div className="flex gap-2">
                  <Input
                    placeholder="City"
                    value={newAddress.city}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, city: e.target.value })
                    }
                  />
                  <Input
                    placeholder="Area"
                    value={newAddress.area}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, area: e.target.value })
                    }
                  />
                </div>
                <Input
                  placeholder="Postal Code"
                  value={newAddress.postal_code}
                  onChange={(e) =>
                    setNewAddress({
                      ...newAddress,
                      postal_code: e.target.value,
                    })
                  }
                />

                <Button
                  onClick={handleAddAddress}
                  disabled={saving}
                  className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" /> Save Address
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          {addresses.length === 0 ? (
            <p className="text-sm text-gray-500 italic text-center">
              No addresses added yet.
            </p>
          ) : (
            <div className="space-y-3">
              {addresses.map((addr, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-between items-start p-3 border rounded-lg bg-gray-50 hover:bg-gray-100 transition"
                >
                  <div>
                    <p className="font-semibold flex items-center gap-1">
                      <Home className="w-4 h-4 text-primary" /> {addr.label}
                    </p>
                    <p className="text-sm text-gray-600">{addr.address_line}</p>
                    <p className="text-xs text-gray-500">
                      {addr.city && `${addr.city}, `}
                      {addr.area && `${addr.area}, `}
                      {addr.postal_code}
                    </p>
                  </div>
                  <Button
                    onClick={() => handleDelete(addr.id)}
                    size="icon"
                    variant="ghost"
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
