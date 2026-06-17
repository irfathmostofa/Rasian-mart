// app/layout.tsx (Server Component)
import { Inter } from "next/font/google";
import SiteLayoutClient from "./SiteLayoutClient";
import ToastContainer from "@/components/ui/ToastContainer";
import "@/app/globals.css";
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Inventory Mart | All You Need in One Place",
  description:
    "Shop groceries, electronics, fashion, and more with fast delivery from Inventory Mart.",
  keywords: [
    "ecommerce",
    "online shopping",
    "groceries",
    "fashion",
    "electronics",
    "rasian mart",
  ],
  openGraph: {
    title: "Inventory Mart",
    description:
      "Shop smarter with Inventory Mart - your one-stop online store.",
    url: "https://Inventorymart.com",
    siteName: "Inventory Mart",
    images: [
      {
        url: "/images/og-banner.png",
        width: 1200,
        height: 630,
        alt: "Inventory Mart Online Store",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} bg-gray-50 text-gray-900`}>
        {/* Wrap client component here */}
        <SiteLayoutClient>
          {children}
          <ToastContainer />
        </SiteLayoutClient>
      </body>
    </html>
  );
}
