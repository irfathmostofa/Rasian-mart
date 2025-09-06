import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/app/globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FloatingSettings from "@/components/layout/Settings";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Rasian Mart | All You Need in One Place",
  description:
    "Shop groceries, electronics, fashion, and more with fast delivery from Rasian Mart.",
  keywords: [
    "ecommerce",
    "online shopping",
    "groceries",
    "fashion",
    "electronics",
    "rasian mart",
  ],
  openGraph: {
    title: "Rasian Mart",
    description: "Shop smarter with Rasian Mart - your one-stop online store.",
    url: "https://rasianmart.com",
    siteName: "Rasian Mart",
    images: [
      {
        url: "/images/og-banner.png",
        width: 1200,
        height: 630,
        alt: "Rasian Mart Online Store",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} bg-gray-50 text-gray-900`}>
        <div className="flex min-h-screen flex-col">
          <Header />

          <main className="flex-1 container mx-auto px-4 py-6">{children}</main>
          <FloatingSettings />
          <Footer />
        </div>
      </body>
    </html>
  );
}
