import type { Metadata } from "next";
import { Inter } from "next/font/google";
import QueryProvider from "@/providers/QueryProvider";
import { CartProvider } from "@/providers/CartProvider";
import LenisProvider from "@/providers/LenisProvider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FoodHub - Premium Food Delivery",
  description: "A modern food marketplace platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} antialiased`}
      suppressHydrationWarning
    >
      <body className="flex flex-col font-sans min-h-screen" suppressHydrationWarning>
        <QueryProvider>
          <CartProvider>
            <LenisProvider>
              {children}
            </LenisProvider>
            <Toaster position="top-center" richColors />
          </CartProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
