// app/SiteLayoutClient.tsx (Client Component)
"use client";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FloatingSettings from "@/components/layout/Settings";
import FullScreenLoader from "@/components/ui/FullScreenLoader";
import { useHydrationReady } from "@/app/store/useHydration";

export default function SiteLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const hydrated = useHydrationReady(); // custom Zustand hook for hydration

  // Full screen loader while restoring Zustand state
  if (!hydrated) return <FullScreenLoader />;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4">{children}</main>
      <FloatingSettings />
      <Footer />
    </div>
  );
}
