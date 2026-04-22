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
import {
  Trash2,
  Plus,
  MapPin,
  Home,
  Loader2,
  Edit2,
  Check,
  Star,
} from "lucide-react";
import api from "@/lib/api";
import { useUserStore } from "@/app/store/useUserStore";

interface Address {
  id?: number;
  label: string;
  address_line: string;
  postal_code: string;
  city?: string;
  area?: string;
  is_default?: boolean;
}

export default function AddressManager() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [newAddress, setNewAddress] = useState<Address>({
    label: "",
    address_line: "",
    postal_code: "",
    city: "",
    area: "",
    is_default: false,
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const { user } = useUserStore();

  // Fetch Addresses
  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await api.get("/users/get-customer-address", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAddresses(res?.data.data || []);
    } catch (err) {
      console.error("Failed to fetch addresses:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchAddresses();
    }
  }, [user?.id, refreshKey]);

  // Set as default address and update all others
  const setAsDefault = async (id: number) => {
    if (saving) return;

    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      if (!token) return;

      // First, update all addresses to is_default = false
      const updatePromises = addresses.map(async (addr) => {
        if (addr.id !== id && addr.is_default) {
          return api.post(
            `/users/update-customer-address/${addr.id}`,
            { is_default: false },
            { headers: { Authorization: `Bearer ${token}` } },
          );
        }
        return null;
      });

      await Promise.all(updatePromises.filter((p) => p !== null));

      // Then set the selected address as default
      await api.post(
        `/users/update-customer-address/${id}`,
        { is_default: true },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      // Refresh the list to show updated default status
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.error("Failed to set default address:", err);
      alert("Failed to set default address. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Add or Update Address
  const handleSaveAddress = async () => {
    if (!newAddress.label || !newAddress.address_line) {
      alert("Please fill in all required fields");
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const payload = {
        ...newAddress,
        customer_id: user?.id,
      };

      if (editingId) {
        // Update existing address
        await api.post(`/users/update-customer-address/${editingId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // If setting this address as default, update all other addresses
        if (newAddress.is_default) {
          const updatePromises = addresses
            .filter((addr) => addr.id !== editingId && addr.is_default)
            .map((addr) =>
              api.post(
                `/users/update-customer-address/${addr.id}`,
                { is_default: false },
                { headers: { Authorization: `Bearer ${token}` } },
              ),
            );

          await Promise.all(updatePromises);
        }
      } else {
        // Create new address
        const response = await api.post(
          "/users/create-customer-address",
          payload,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        const newAddressId = response.data?.data?.id;

        // If setting this address as default, update all existing addresses
        if (newAddress.is_default && addresses.length > 0) {
          const updatePromises = addresses
            .filter((addr) => addr.is_default)
            .map((addr) =>
              api.post(
                `/users/update-customer-address/${addr.id}`,
                { is_default: false },
                { headers: { Authorization: `Bearer ${token}` } },
              ),
            );

          await Promise.all(updatePromises);
        }

        // If this is the first address, automatically set as default
        if (addresses.length === 0) {
          if (newAddressId) {
            await api.post(
              `/users/update-customer-address/${newAddressId}`,
              { is_default: true },
              { headers: { Authorization: `Bearer ${token}` } },
            );
          }
        }
      }

      // Reset form and refresh
      resetForm();
      setRefreshKey((prev) => prev + 1);
      setOpen(false);
    } catch (err) {
      console.error("Failed to save address:", err);
      alert("Failed to save address. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Edit Address
  const handleEdit = (address: Address) => {
    setNewAddress({
      label: address.label,
      address_line: address.address_line,
      postal_code: address.postal_code || "",
      city: address.city || "",
      area: address.area || "",
      is_default: address.is_default || false,
    });
    setEditingId(address.id || null);
    setOpen(true);
  };

  // Delete Address
  const handleDelete = async (id?: number) => {
    if (!id) return;

    if (!confirm("Are you sure you want to delete this address?")) return;

    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      if (!token) return;

      // Check if deleting the default address
      const isDeletingDefault = addresses.find(
        (addr) => addr.id === id,
      )?.is_default;

      await api.post(
        `/users/delete-customer-address`,
        { id: id },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      // If deleted address was default and there are other addresses, set the first one as default
      if (isDeletingDefault && addresses.length > 1) {
        const remainingAddress = addresses.find((addr) => addr.id !== id);
        if (remainingAddress?.id) {
          await api.post(
            `/users/update-customer-address/${remainingAddress.id}`,
            { is_default: true },
            { headers: { Authorization: `Bearer ${token}` } },
          );
        }
      }

      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.error("Failed to delete address:", err);
      alert("Failed to delete address. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setNewAddress({
      label: "",
      address_line: "",
      postal_code: "",
      city: "",
      area: "",
      is_default: false,
    });
    setEditingId(null);
  };

  // Close Dialog and Reset Form
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      resetForm();
    }
  };

  // Loader
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
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <MapPin className="w-5 h-5 text-primary" /> Manage Addresses
          </CardTitle>
          <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2 bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4" /> Add Address
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingId ? "Edit Address" : "Add New Address"}
                </DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-3">
                <Input
                  placeholder="Label (Home, Work, etc.) *"
                  value={newAddress.label}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, label: e.target.value })
                  }
                />
                <Input
                  placeholder="Address Line *"
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

                {/* Set as Default Checkbox */}
                <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <input
                    type="checkbox"
                    id="is_default"
                    checked={newAddress.is_default || false}
                    onChange={(e) =>
                      setNewAddress({
                        ...newAddress,
                        is_default: e.target.checked,
                      })
                    }
                    disabled={addresses.length === 0 && !editingId}
                  />
                  <label
                    htmlFor="is_default"
                    className={`flex items-center gap-2 cursor-pointer flex-1 ${
                      addresses.length === 0 && !editingId ? "opacity-50" : ""
                    }`}
                  >
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-medium">
                      Set as default address
                      {addresses.length === 0 &&
                        !editingId &&
                        " (First address will be auto-set as default)"}
                    </span>
                  </label>
                </div>

                <Button
                  onClick={handleSaveAddress}
                  disabled={saving}
                  className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                    </>
                  ) : editingId ? (
                    <>
                      <Check className="w-4 h-4" /> Update Address
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
            <p className="text-sm text-gray-500 italic text-center py-8">
              No addresses added yet. Click "Add Address" to add one.
            </p>
          ) : (
            <div className="space-y-3">
              {addresses.map((addr, index) => (
                <motion.div
                  key={addr.id || index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`flex justify-between items-start p-3 border rounded-lg transition ${
                    addr.is_default
                      ? "bg-blue-50 border-blue-300 shadow-sm"
                      : "bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  <div className="flex-1">
                    <p className="font-semibold flex items-center gap-2">
                      <Home className="w-4 h-4 text-primary" /> {addr.label}
                      {addr.is_default && (
                        <span className="flex items-center gap-1 text-xs bg-blue-200 text-blue-700 px-2 py-1 rounded-full">
                          <Star className="w-3 h-3" /> Default
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-gray-600">{addr.address_line}</p>
                    <p className="text-xs text-gray-500">
                      {addr.city && `${addr.city}, `}
                      {addr.area && `${addr.area}, `}
                      {addr.postal_code}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    {!addr.is_default && (
                      <Button
                        onClick={() => setAsDefault(addr.id!)}
                        size="sm"
                        variant="outline"
                        className="text-yellow-600 hover:text-yellow-700"
                        disabled={saving}
                      >
                        <Star className="w-3 h-3 mr-1" /> Set Default
                      </Button>
                    )}
                    <Button
                      onClick={() => handleEdit(addr)}
                      size="icon"
                      variant="ghost"
                      className="text-blue-500 hover:text-blue-600"
                      disabled={saving}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => handleDelete(addr.id)}
                      size="icon"
                      variant="ghost"
                      className="text-red-500 hover:text-red-600"
                      disabled={saving}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
