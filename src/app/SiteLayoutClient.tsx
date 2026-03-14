// app/SiteLayoutClient.tsx
"use client";

import { QueryClientProvider } from "@tanstack/react-query";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FloatingButtons from "@/components/layout/FloatingButtons";
import { queryClient } from "@/lib/queryClient";


export default function SiteLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4">{children}</main>
        <FloatingButtons />
        <Footer />
      </div>
    </QueryClientProvider>
  );
}