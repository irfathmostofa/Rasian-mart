"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, AlertTriangle, Info } from "lucide-react";
import { useToastStore } from "@/app/store/useToastStore";
import { cn } from "@/lib/utils"; // optional helper if you use shadcn setup

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => {
          const icon =
            toast.type === "success" ? (
              <CheckCircle className="text-green-500 w-5 h-5" />
            ) : toast.type === "error" ? (
              <AlertTriangle className="text-red-500 w-5 h-5" />
            ) : (
              <Info className="text-blue-500 w-5 h-5" />
            );

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg shadow-md min-w-[260px] bg-white border",
                toast.type === "success" && "border-green-500",
                toast.type === "error" && "border-red-500",
                toast.type === "warning" && "border-yellow-500",
                toast.type === "info" && "border-blue-500"
              )}
            >
              {icon}
              <p className="text-sm flex-1">{toast.message}</p>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
