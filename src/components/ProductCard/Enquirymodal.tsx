// components/ProductCard/EnquiryModal.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Send,
  Phone,
  Mail,
  User,
  MessageSquare,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import api from "@/lib/api";
import { useToastStore } from "@/app/store/useToastStore";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface EnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: number;
    name: string;
    code?: string;
    images?: { url: string; is_primary: boolean }[] | null;
    selling_price?: string | number;
    regular_price?: string | number;
  };
}

interface FormState {
  name: string;
  phone: string;
  email: string;
  quantity: string;
  message: string;
}

const EMPTY_FORM: FormState = {
  name: "",
  phone: "",
  email: "",
  quantity: "1",
  message: "",
};

// ─── Component ────────────────────────────────────────────────────────────────

export function EnquiryModal({ isOpen, onClose, product }: EnquiryModalProps) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { showToast } = useToastStore();
  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setForm({
        ...EMPTY_FORM,
        message: `Hello, I'm interested in ${product.name} and would like more information.`,
      });
      setErrors({});
      setSubmitted(false);
    }
  }, [isOpen, product.name]);

  // Keyboard: Escape to close
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  // Body scroll lock
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const primaryImage =
    product.images?.find((i) => i.is_primary)?.url ??
    product.images?.[0]?.url ??
    null;

  const validate = (): boolean => {
    const e: Partial<FormState> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.phone.trim()) e.phone = "Phone is required";
    else if (!/^[+\d\s\-()]{7,15}$/.test(form.phone.trim()))
      e.phone = "Enter a valid phone number";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Enter a valid email";
    const qty = parseInt(form.quantity);
    if (!form.quantity || isNaN(qty) || qty < 1)
      e.quantity = "Enter a valid quantity";
    if (!form.message.trim()) e.message = "Message is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await api.post("/product/product-enquiries", {
        product_id: product.id,
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || undefined,
        quantity: parseInt(form.quantity) || 1,
        message: form.message.trim(),
      });

      if (res.data.success) {
        showToast(res.data.message || "Enquiry sent successfully", "success");
      }
      setSubmitted(true);
    } catch (err) {
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  const field = (
    key: keyof FormState,
    label: string,
    Icon: React.ElementType,
    type = "text",
    placeholder = "",
    required = false,
  ) => (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          type={type}
          value={form[key]}
          onChange={(e) => {
            setForm((f) => ({ ...f, [key]: e.target.value }));
            setErrors((er) => ({ ...er, [key]: undefined }));
          }}
          placeholder={placeholder}
          className={`w-full pl-9 pr-3 py-2.5 text-sm border rounded-lg outline-none transition-all ${
            errors[key]
              ? "border-red-400 bg-red-50 focus:ring-2 focus:ring-red-200"
              : "border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/15"
          }`}
        />
      </div>
      {errors[key] && (
        <p className="text-red-500 text-[11px] mt-1">{errors[key]}</p>
      )}
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl pointer-events-auto overflow-hidden"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-gray-900 leading-tight">
                      Product Enquiry
                    </h2>
                    <p className="text-[11px] text-gray-500 leading-tight">
                      We'll get back to you shortly
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                  aria-label="Close"
                >
                  <X className="w-3.5 h-3.5 text-gray-600" />
                </button>
              </div>

              {submitted ? (
                // ── Success state ──────────────────────────────────────────
                <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 15 }}
                    className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mb-4"
                  >
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                  </motion.div>
                  <h3 className="text-base font-bold text-gray-900 mb-1.5">
                    Enquiry Sent!
                  </h3>
                  <p className="text-sm text-gray-500 max-w-xs mb-6">
                    Thank you for your interest in{" "}
                    <span className="font-medium text-gray-700">
                      {product.name}
                    </span>
                    . We'll contact you soon.
                  </p>
                  <button
                    onClick={onClose}
                    className="px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
                  >
                    Done
                  </button>
                </div>
              ) : (
                // ── Form ───────────────────────────────────────────────────
                <form onSubmit={handleSubmit} noValidate>
                  {/* Product snippet */}
                  <div className="flex items-center gap-3 px-5 py-3 bg-gray-50 border-b border-gray-100">
                    {primaryImage && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={primaryImage}
                        alt={product.name}
                        className="w-12 h-12 rounded-lg object-cover border border-gray-200 shrink-0"
                      />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800 line-clamp-1">
                        {product.name}
                      </p>
                      {product.code && (
                        <p className="text-[11px] text-gray-400">
                          SKU: {product.code}
                        </p>
                      )}
                      {product.selling_price && (
                        <p className="text-sm font-bold text-primary">
                          ৳{Number(product.selling_price).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Fields */}
                  <div className="px-5 py-4 space-y-3.5 max-h-[55vh] overflow-y-auto">
                    {field(
                      "name",
                      "Your Name",
                      User,
                      "text",
                      "Enter your full name",
                      true,
                    )}
                    {field(
                      "phone",
                      "Phone Number",
                      Phone,
                      "tel",
                      "+880 1X XX XXX XXX",
                      true,
                    )}
                    {field(
                      "email",
                      "Email",
                      Mail,
                      "email",
                      "your@email.com (optional)",
                    )}

                    {/* Quantity */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                        Quantity<span className="text-red-400 ml-0.5">*</span>
                      </label>
                      <div className="flex items-center gap-0">
                        <button
                          type="button"
                          onClick={() =>
                            setForm((f) => ({
                              ...f,
                              quantity: String(
                                Math.max(1, parseInt(f.quantity || "1") - 1),
                              ),
                            }))
                          }
                          className="w-9 h-10 border border-r-0 border-gray-200 rounded-l-lg flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors text-lg font-medium"
                        >
                          −
                        </button>
                        <input
                          type="number"
                          min={1}
                          value={form.quantity}
                          onChange={(e) => {
                            setForm((f) => ({
                              ...f,
                              quantity: e.target.value,
                            }));
                            setErrors((er) => ({ ...er, quantity: undefined }));
                          }}
                          className={`w-16 h-10 border text-center text-sm outline-none transition-all ${
                            errors.quantity
                              ? "border-red-400 bg-red-50"
                              : "border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/15"
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setForm((f) => ({
                              ...f,
                              quantity: String(parseInt(f.quantity || "1") + 1),
                            }))
                          }
                          className="w-9 h-10 border border-l-0 border-gray-200 rounded-r-lg flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors text-lg font-medium"
                        >
                          +
                        </button>
                      </div>
                      {errors.quantity && (
                        <p className="text-red-500 text-[11px] mt-1">
                          {errors.quantity}
                        </p>
                      )}
                    </div>

                    {/* Message field separately for textarea */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                        Message<span className="text-red-400 ml-0.5">*</span>
                      </label>
                      <textarea
                        value={form.message}
                        onChange={(e) => {
                          setForm((f) => ({ ...f, message: e.target.value }));
                          setErrors((er) => ({ ...er, message: undefined }));
                        }}
                        rows={3}
                        placeholder="Tell us about your requirements…"
                        className={`w-full px-3 py-2.5 text-sm border rounded-lg outline-none resize-none transition-all ${
                          errors.message
                            ? "border-red-400 bg-red-50 focus:ring-2 focus:ring-red-200"
                            : "border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/15"
                        }`}
                      />
                      {errors.message && (
                        <p className="text-red-500 text-[11px] mt-1">
                          {errors.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="px-5 py-4 border-t border-gray-100 flex gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Sending…
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" /> Send Enquiry
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
